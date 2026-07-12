from decimal import Decimal, InvalidOperation

import stripe
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.cart.models import ShoppingCart

from .models import Bill, Purchase, UserCoreography

from .serializers import CreatePurchaseSerializer, PurchaseHistorySerializer


    queryset = Purchase.objects.all()

    def _require_authenticated_user(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Se requiere autenticacion."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return None

    def _get_staged_checkout(self, request):
        session = getattr(request, "session", None)
        if session is None:
            return {}
        return session.get("sales_checkout", {})

    def _set_staged_checkout(self, request, staged_data):
        session = getattr(request, "session", None)
        if session is not None:
            session["sales_checkout"] = staged_data

    def _serialize_bill(self, bill):
        if not bill:
            return None
        return {
            "id": bill.bill_id,
            "total_amount": str(bill.total_amount),
            "payment_method": bill.payment_method,
            "email_address": bill.email_address,
            "titular_name": bill.titular_name,
            "document_number": bill.document_number,
            "details": bill.details,
            "creation_date": bill.creation_date,
        }

    def _serialize_purchase(self, purchase):
        bills_relation = getattr(purchase, "bills", None)
        bills = list(bills_relation.all()) if bills_relation and hasattr(bills_relation, "all") else []

        cart_items = []
        cart_relation = getattr(purchase, "cart", None)
        items_relation = getattr(cart_relation, "items", None)
        if items_relation and hasattr(items_relation, "select_related"):
            items_queryset = items_relation.select_related("coreography")
            if hasattr(items_queryset, "all"):
                cart_items = [
                    {
                        "id": cart_item.cart_item_id,
                        "coreography_id": cart_item.coreography_id,
                        "coreography_name": cart_item.coreography.c_name,
                        "unit_price": str(cart_item.unit_price),
                    }
                    for cart_item in items_queryset.all()
                ]

        coreographies = []
        coreographies_relation = getattr(purchase, "user_coreographies", None)
        if coreographies_relation and hasattr(coreographies_relation, "select_related"):
            coreographies_queryset = coreographies_relation.select_related("coreography")
            if hasattr(coreographies_queryset, "all"):
                coreographies = [
                    {
                        "id": user_coreography.coreography_id,
                        "name": user_coreography.coreography.c_name,
                        "price": str(user_coreography.coreography.price),
                        "genre": user_coreography.coreography.song_genre,
                        "difficulty": user_coreography.coreography.dificulty_level,
                    }
                    for user_coreography in coreographies_queryset.all()
                ]

        return {
            "purchase_id": purchase.purchase_id,
            "purchase_date": purchase.purchase_date,
            "transaction_id": purchase.transaction_id,
            "cart_id": purchase.cart_id,
            "total_amount": str(bills[0].total_amount) if bills else None,
            "payment_method": bills[0].payment_method if bills else None,
            "items": cart_items,
            "coreographies": coreographies,
            "bills": [self._serialize_bill(bill) for bill in bills],
        }

    def _get_cart_for_user(self, user, cart_id=None):
        queryset = ShoppingCart.objects.select_related("user").prefetch_related(
            "items__coreography"
        )

        if cart_id:
            cart = queryset.filter(cart_id=cart_id).first()
        else:
            cart = queryset.filter(user=user, s_status="active").order_by("-cart_id").first()

        if not cart:
            return None

        cart_user_id = getattr(getattr(cart, "user", None), "id", None) or getattr(cart, "user_id", None)
        user_id = getattr(user, "id", None)
        if cart_user_id is not None and user_id is not None and cart_user_id != user_id:
            return None

        return cart

    def _calculate_cart_total(self, cart):
        items_relation = getattr(cart, "items", None)
        if not items_relation or not hasattr(items_relation, "select_related"):
            return Decimal("0")

        items_queryset = items_relation.select_related("coreography")
        total = Decimal("0")
        for item in items_queryset.all():
            total += Decimal(str(item.unit_price))
        return total

    def _finalize_purchase(self, *, user, cart, payment_intent_id, payment_method, billing_data):
        items_relation = getattr(cart, "items", None)
        if not items_relation or not hasattr(items_relation, "select_related"):
            raise ValueError("El carrito no contiene items validos.")

        items_queryset = items_relation.select_related("coreography")
        cart_items = list(items_queryset.all())
        if not cart_items:
            raise ValueError("El carrito no contiene items.")

        total_amount = sum((Decimal(str(item.unit_price)) for item in cart_items), Decimal("0"))
        bill_payment_method = billing_data.get("payment_method") or billing_data.get("bill_payment_method")
        if bill_payment_method not in {"pse", "card"}:
            bill_payment_method = "card"

        with transaction.atomic():
            purchase, _ = Purchase.objects.get_or_create(
                transaction_id=payment_intent_id,
                defaults={"cart": cart, "purchase_date": timezone.now()},
            )

            purchase_fields_to_update = []
            if purchase.cart_id != cart.cart_id:
                purchase.cart = cart
                purchase_fields_to_update.append("cart")
            if not purchase.purchase_date:
                purchase.purchase_date = timezone.now()
                purchase_fields_to_update.append("purchase_date")
            if purchase_fields_to_update:
                purchase.save(update_fields=purchase_fields_to_update)

            for cart_item in cart_items:
                UserCoreography.objects.update_or_create(
                    user=user,
                    coreography=cart_item.coreography,
                    defaults={"purchase": purchase},
                )

                cart_item.coreography.times_sold = (cart_item.coreography.times_sold or 0) + 1
                cart_item.coreography.save(update_fields=["times_sold"])

            bill, _ = Bill.objects.get_or_create(
                purchase=purchase,
                defaults={
                    "total_amount": total_amount,
                    "payment_method": bill_payment_method,
                    "email_address": billing_data["email_address"],
                    "titular_name": billing_data["titular_name"],
                    "document_number": billing_data["document_number"],
                    "details": billing_data.get("details", ""),
                },
            )

            bill_fields_to_update = []
            if bill.total_amount != total_amount:
                bill.total_amount = total_amount
                bill_fields_to_update.append("total_amount")
            if bill.payment_method != bill_payment_method:
                bill.payment_method = bill_payment_method
                bill_fields_to_update.append("payment_method")
            if bill.email_address != billing_data["email_address"]:
                bill.email_address = billing_data["email_address"]
                bill_fields_to_update.append("email_address")
            if bill.titular_name != billing_data["titular_name"]:
                bill.titular_name = billing_data["titular_name"]
                bill_fields_to_update.append("titular_name")
            if bill.document_number != billing_data["document_number"]:
                bill.document_number = billing_data["document_number"]
                bill_fields_to_update.append("document_number")
            if (bill.details or "") != billing_data.get("details", ""):
                bill.details = billing_data.get("details", "")
                bill_fields_to_update.append("details")
            if bill_fields_to_update:
                bill.save(update_fields=list(set(bill_fields_to_update)))

            if getattr(cart, "s_status", None) != "completed":
                cart.s_status = "completed"
                cart.save(update_fields=["s_status"])

        return purchase, bill, total_amount

    def list(self, request, *args, **kwargs):
        auth_response = self._require_authenticated_user(request)
        if auth_response:
            return auth_response

        purchases = (
            Purchase.objects.filter(cart__user=request.user)
            .select_related("cart")
            .prefetch_related("bills", "user_coreographies__coreography", "cart__items__coreography")
            .order_by("-purchase_date", "-purchase_id")
        )
        serialized_purchases = [self._serialize_purchase(purchase) for purchase in purchases]

        return Response(
            {"count": len(serialized_purchases), "results": serialized_purchases},
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        return self.confirm_payment(request)

    def retrieve(self, request, *args, **kwargs):
        auth_response = self._require_authenticated_user(request)
        if auth_response:
            return auth_response

        purchase = (
            Purchase.objects.filter(purchase_id=kwargs.get("pk"), cart__user=request.user)
            .select_related("cart")
            .prefetch_related("bills", "user_coreographies__coreography", "cart__items__coreography")
            .first()
        )

        if not purchase:
            return Response(
                {"detail": "La venta no existe o no pertenece al usuario autenticado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(self._serialize_purchase(purchase), status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="confirm-items")
    def confirm_items(self, request):
        auth_response = self._require_authenticated_user(request)
        if auth_response:
            return auth_response

        cart_id = request.data.get("cart_id") or request.query_params.get("cart_id")
        cart = self._get_cart_for_user(request.user, cart_id=cart_id)
        if not cart:
            return Response(
                {"detail": "No se encontro un carrito valido para confirmar."},
                status=status.HTTP_404_NOT_FOUND,
            )

        items_relation = getattr(cart, "items", None)
        if not items_relation or not hasattr(items_relation, "select_related"):
            return Response(
                {"detail": "El carrito no tiene items para confirmar."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items_queryset = items_relation.select_related("coreography")
        items = list(items_queryset.all())
        if not items:
            return Response(
                {"detail": "El carrito no contiene items."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = self._calculate_cart_total(cart)
        staged_data = {
            "cart_id": cart.cart_id,
            "items": [
                {
                    "id": item.cart_item_id,
                    "coreography_id": item.coreography_id,
                    "coreography_name": item.coreography.c_name,
                    "unit_price": str(item.unit_price),
                }
                for item in items
            ],
            "total_amount": str(total_amount),
        }
        self._set_staged_checkout(request, staged_data)

        return Response(
            {
                "detail": "Los ítems del carrito fueron confirmados.",
                "cart_id": cart.cart_id,
                "items": staged_data["items"],
                "total_amount": staged_data["total_amount"],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="confirm-billing")
    def confirm_billing(self, request):
        auth_response = self._require_authenticated_user(request)
        if auth_response:
            return auth_response

        cart_id = request.data.get("cart_id") or self._get_staged_checkout(request).get("cart_id")
        if not cart_id:
            return Response(
                {"detail": "El carrito es requerido para confirmar la facturación."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email_address = request.data.get("email_address")
        titular_name = request.data.get("titular_name")
        document_number = request.data.get("document_number")
        details = request.data.get("details", "")

        if not email_address or not titular_name or not document_number:
            return Response(
                {
                    "detail": (
                        "El correo, el nombre del titular y el numero de documento son requeridos."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        staged_data = self._get_staged_checkout(request)
        staged_data.update(
            {
                "cart_id": cart_id,
                "billing": {
                    "email_address": email_address,
                    "titular_name": titular_name,
                    "document_number": document_number,
                    "details": details,
                },
            }
        )
        self._set_staged_checkout(request, staged_data)

        return Response(
            {
                "detail": "Los datos de facturación fueron confirmados.",
                "cart_id": cart_id,
                "billing": staged_data["billing"],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="confirm-payment")
    def confirm_payment(self, request):
        auth_response = self._require_authenticated_user(request)
        if auth_response:
            return auth_response

        staged_data = self._get_staged_checkout(request)
        cart_id = request.data.get("cart_id") or staged_data.get("cart_id")
        cart = self._get_cart_for_user(request.user, cart_id=cart_id)
        if not cart:
            return Response(
                {"detail": "No se encontro un carrito valido para procesar el pago."},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount = request.data.get("amount") or staged_data.get("total_amount")
        if amount is None:
            amount = self._calculate_cart_total(cart)

        payment_method = request.data.get("payment_method")
        currency = request.data.get("currency") or staged_data.get("currency") or "usd"

        billing_data = staged_data.get("billing", {}).copy()
        billing_data.update(
            {
                "email_address": request.data.get("email_address") or billing_data.get("email_address"),
                "titular_name": request.data.get("titular_name") or billing_data.get("titular_name"),
                "document_number": request.data.get("document_number") or billing_data.get("document_number"),
                "details": request.data.get("details", billing_data.get("details", "")),
            }
        )

        if not amount or not payment_method:
            return Response(
                {"detail": "El monto y el método de pago son requeridos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not billing_data.get("email_address")
            or not billing_data.get("titular_name")
            or not billing_data.get("document_number")
        ):
            return Response(
                {"detail": "La información de facturación es requerida para finalizar la venta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stripe_secret_key = getattr(settings, "STRIPE_SECRET_KEY", None)
        if not stripe_secret_key:
            return Response(
                {"detail": "Stripe no está configurado en el entorno."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        stripe.api_key = stripe_secret_key

        try:
            amount_value = int(Decimal(str(amount)))
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {"detail": "El monto no es valido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_value,
                currency=currency,
                payment_method=payment_method,
                confirm=True,
                automatic_payment_methods={
                    "enabled": True,
                    "allow_redirects": "never",
                },
            )
        except stripe.error.CardError as exc:
            return Response(
                {"detail": f"El pago fue rechazado: {exc.user_message}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except stripe.error.StripeError:
            return Response(
                {"detail": "Ocurrió un error al procesar el pago."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if intent.status != "succeeded":
            return Response(
                {"detail": f"El pago no se completó. Estado: {intent.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            purchase, bill, total_amount = self._finalize_purchase(
                user=request.user,
                cart=cart,
                payment_intent_id=intent.id,
                payment_method=payment_method,
                billing_data=billing_data,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": "El pago se procesó con éxito.",
                "payment_intent_id": intent.id,
                "status": intent.status,
                "purchase": self._serialize_purchase(purchase),
                "bill": self._serialize_bill(bill),
                "total_amount": str(total_amount),
            },
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        user = request.user
        purchase = Purchase.objects.filter(
            purchase_id=pk, cart__user=user
        ).select_related("cart").prefetch_related(
            "bills", "user_coreographies__coreography"
        ).first()
        if not purchase:
            return Response(
                {"detail": "Compra no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PurchaseHistorySerializer(purchase)
        return Response(serializer.data)
