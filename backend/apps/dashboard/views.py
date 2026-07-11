from decimal import Decimal

from django.db import connection, models
from django.db.utils import DatabaseError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.sales.models import Bill, Purchase, UserCoreography
from apps.users.models import Profesor

from .permissions import IsAdminOrDirector, IsCliente, IsProfesor


EMPTY_RESPONSE = {
    "total_revenue": 0,
    "total_users": 0,
    "total_choreographies": 0,
    "sales_this_month": 0,
    "revenue_this_month": 0,
    "new_users_this_month": 0,
    "sales_by_month": [],
    "users_by_month": [],
    "top_choreographies": [],
    "users_by_role": {},
    "purchased_choreographies_count": 0,
    "total_spent": 0,
    "purchase_count": 0,
    "owned_choreographies": [],
    "recent_purchases": [],
    "my_choreographies_count": 0,
    "total_sales": 0,
    "total_revenue": 0,
    "choreographies": [],
}


class AdminDashboardView(APIView):
    permission_classes = [IsAdminOrDirector]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        COALESCE((SELECT SUM(b.total_amount)
                            FROM bill b
                            JOIN purchase p ON b.purchase_id = p.purchase_id
                            JOIN shopping_cart sc ON p.cart_id = sc.cart_id
                            WHERE sc.s_status = 'completed'), 0) AS total_revenue,
                        (SELECT COUNT(*) FROM users) AS total_users,
                        (SELECT COUNT(*) FROM coreography WHERE status = 'active') AS total_choreographies,
                        COALESCE((SELECT COUNT(*)
                            FROM purchase p
                            JOIN shopping_cart sc ON p.cart_id = sc.cart_id
                            WHERE sc.s_status = 'completed'
                            AND p.purchase_date >= date_trunc('month', CURRENT_DATE)), 0) AS sales_this_month,
                        COALESCE((SELECT SUM(b.total_amount)
                            FROM bill b
                            JOIN purchase p ON b.purchase_id = p.purchase_id
                            JOIN shopping_cart sc ON p.cart_id = sc.cart_id
                            WHERE sc.s_status = 'completed'
                            AND p.purchase_date >= date_trunc('month', CURRENT_DATE)), 0) AS revenue_this_month,
                        COALESCE((SELECT COUNT(*)
                            FROM users
                            WHERE creation_date >= date_trunc('month', CURRENT_DATE)), 0) AS new_users_this_month
                """)
                row = cursor.fetchone()

                cursor.execute("""
                    SELECT
                        TO_CHAR(p.purchase_date, 'YYYY-MM') AS month,
                        COUNT(*) AS count,
                        COALESCE(SUM(b.total_amount), 0) AS revenue
                    FROM purchase p
                    JOIN shopping_cart sc ON p.cart_id = sc.cart_id
                    JOIN bill b ON p.purchase_id = b.purchase_id
                    WHERE sc.s_status = 'completed'
                    AND p.purchase_date >= (CURRENT_DATE - INTERVAL '12 months')
                    GROUP BY month
                    ORDER BY month
                """)
                sales_by_month_rows = cursor.fetchall()

                cursor.execute("""
                    SELECT
                        TO_CHAR(creation_date, 'YYYY-MM') AS month,
                        COUNT(*) AS count
                    FROM users
                    WHERE creation_date >= (CURRENT_DATE - INTERVAL '12 months')
                    GROUP BY month
                    ORDER BY month
                """)
                users_by_month_rows = cursor.fetchall()

                cursor.execute("""
                    SELECT
                        coreography_id, c_name, times_sold, price,
                        (times_sold * price) AS revenue
                    FROM coreography
                    WHERE status = 'active'
                    ORDER BY times_sold DESC
                    LIMIT 5
                """)
                top_choreography_rows = cursor.fetchall()

                cursor.execute("""
                    SELECT u_type, COUNT(*) AS count
                    FROM users
                    WHERE is_active = TRUE
                    GROUP BY u_type
                """)
                users_by_role_rows = cursor.fetchall()

            data = {
                "total_revenue": row[0],
                "total_users": row[1],
                "total_choreographies": row[2],
                "sales_this_month": row[3],
                "revenue_this_month": row[4],
                "new_users_this_month": row[5],
                "sales_by_month": [
                    {"month": r[0], "count": r[1], "revenue": r[2]}
                    for r in sales_by_month_rows
                ],
                "users_by_month": [
                    {"month": r[0], "count": r[1]}
                    for r in users_by_month_rows
                ],
                "top_choreographies": [
                    {
                        "coreography_id": r[0],
                        "c_name": r[1],
                        "times_sold": r[2],
                        "price": r[3],
                        "revenue": r[4],
                    }
                    for r in top_choreography_rows
                ],
                "users_by_role": {r[0]: r[1] for r in users_by_role_rows},
            }

            return Response(data, status=status.HTTP_200_OK)
        except DatabaseError:
            return Response(
                {**EMPTY_RESPONSE, "detail": "Error al consultar la base de datos."},
                status=status.HTTP_200_OK,
            )


class ProfesorDashboardView(APIView):
    permission_classes = [IsProfesor]

    def get(self, request):
        try:
            profesor = Profesor.objects.filter(user=request.user).first()
            if not profesor:
                return Response(
                    {"detail": "Perfil de profesor no encontrado."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            profesor_id = profesor.user_id

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        COUNT(*) AS total_choreographies,
                        COALESCE(SUM(times_sold), 0) AS total_sales,
                        COALESCE(SUM(times_sold * price), 0) AS total_revenue
                    FROM coreography
                    WHERE profesor_id = %s AND status = 'active'
                """, [profesor_id])
                summary = cursor.fetchone()

                cursor.execute("""
                    SELECT coreography_id, c_name, times_sold, price,
                           (times_sold * price) AS revenue
                    FROM coreography
                    WHERE profesor_id = %s AND status = 'active'
                    ORDER BY times_sold DESC
                """, [profesor_id])
                choreography_rows = cursor.fetchall()

                cursor.execute("""
                    SELECT
                        TO_CHAR(p.purchase_date, 'YYYY-MM') AS month,
                        COUNT(DISTINCT p.purchase_id) AS count,
                        COALESCE(SUM(ci.unit_price), 0) AS revenue
                    FROM purchase p
                    JOIN shopping_cart sc ON p.cart_id = sc.cart_id
                    JOIN cart_item ci ON sc.cart_id = ci.cart_id
                    JOIN coreography c ON ci.coreography_id = c.coreography_id
                    WHERE sc.s_status = 'completed'
                    AND c.profesor_id = %s
                    AND p.purchase_date >= (CURRENT_DATE - INTERVAL '12 months')
                    GROUP BY month
                    ORDER BY month
                """, [profesor_id])
                sales_by_month_rows = cursor.fetchall()

            data = {
                "my_choreographies_count": summary[0],
                "total_sales": summary[1],
                "total_revenue": summary[2] or Decimal("0.00"),
                "choreographies": [
                    {
                        "coreography_id": r[0],
                        "c_name": r[1],
                        "times_sold": r[2],
                        "price": r[3],
                        "revenue": r[4],
                    }
                    for r in choreography_rows
                ],
                "sales_by_month": [
                    {"month": r[0], "count": r[1], "revenue": r[2]}
                    for r in sales_by_month_rows
                ],
            }

            return Response(data, status=status.HTTP_200_OK)
        except DatabaseError:
            return Response(
                {**EMPTY_RESPONSE, "detail": "Error al consultar la base de datos."},
                status=status.HTTP_200_OK,
            )


class ClienteDashboardView(APIView):
    permission_classes = [IsCliente]

    def get(self, request):
        try:
            user = request.user

            owned = UserCoreography.objects.filter(
                user=user
            ).select_related("coreography").order_by("-coreography__creation_date")

            purchases = Purchase.objects.filter(
                cart__user=user
            ).select_related("cart").prefetch_related(
                "bills"
            ).order_by("-purchase_date", "-purchase_id")

            total_spent = Bill.objects.filter(
                purchase__cart__user=user
            ).aggregate(total=models.Sum("total_amount"))["total"] or Decimal("0.00")

            owned_choreographies = [
                {
                    "coreography_id": uc.coreography_id,
                    "c_name": uc.coreography.c_name,
                    "c_description": uc.coreography.c_description,
                    "image_url": uc.coreography.image_url,
                    "song_genre": uc.coreography.song_genre,
                    "dificulty_level": uc.coreography.dificulty_level,
                    "price": str(uc.coreography.price),
                }
                for uc in owned
                if uc.coreography
            ]

            recent_purchases = []
            for p in purchases:
                bills = list(p.bills.all())
                items = [
                    {
                        "coreography_id": ci.coreography_id,
                        "coreography_name": ci.coreography.c_name,
                        "unit_price": str(ci.unit_price),
                    }
                    for ci in p.cart.items.select_related("coreography").all()
                    if ci.coreography
                ]
                recent_purchases.append({
                    "purchase_id": p.purchase_id,
                    "purchase_date": p.purchase_date,
                    "total_amount": str(bills[0].total_amount) if bills else "0.00",
                    "payment_method": bills[0].payment_method if bills else None,
                    "items": items,
                })

            data = {
                "purchased_choreographies_count": owned.count(),
                "total_spent": total_spent,
                "purchase_count": purchases.count(),
                "owned_choreographies": owned_choreographies,
                "recent_purchases": recent_purchases,
            }

            return Response(data, status=status.HTTP_200_OK)
        except DatabaseError:
            return Response(
                {**EMPTY_RESPONSE, "detail": "Error al consultar la base de datos."},
                status=status.HTTP_200_OK,
            )
