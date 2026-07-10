from rest_framework import serializers


class MonthlySerializer(serializers.Serializer):
    month = serializers.CharField()
    count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2, required=False)


class TopChoreographySerializer(serializers.Serializer):
    coreography_id = serializers.IntegerField()
    c_name = serializers.CharField()
    times_sold = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)


class ProfesorChoreographySerializer(serializers.Serializer):
    coreography_id = serializers.IntegerField()
    c_name = serializers.CharField()
    times_sold = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)


class AdminDashboardSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_users = serializers.IntegerField()
    total_choreographies = serializers.IntegerField()
    sales_this_month = serializers.IntegerField()
    revenue_this_month = serializers.DecimalField(max_digits=14, decimal_places=2)
    new_users_this_month = serializers.IntegerField()
    sales_by_month = MonthlySerializer(many=True)
    users_by_month = serializers.ListField(child=serializers.DictField())
    top_choreographies = TopChoreographySerializer(many=True)
    users_by_role = serializers.DictField(child=serializers.IntegerField())


class ProfesorDashboardSerializer(serializers.Serializer):
    my_choreographies_count = serializers.IntegerField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    choreographies = ProfesorChoreographySerializer(many=True)
    sales_by_month = MonthlySerializer(many=True)


class ClienteDashboardSerializer(serializers.Serializer):
    purchased_choreographies_count = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=14, decimal_places=2)
    purchase_count = serializers.IntegerField()
    owned_choreographies = serializers.ListField(child=serializers.DictField())
    recent_purchases = serializers.ListField(child=serializers.DictField())
