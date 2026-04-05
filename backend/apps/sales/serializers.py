from rest_framework import serializers

from .models import Bill, Purchase, UserCoreography


class UserCoreographySerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de UserCoreography

    class Meta:
        model = UserCoreography
        fields = "__all__"


class BillSerializer(serializers.ModelSerializer):
    # TODO: ajustar campos y validaciones de Bill

    class Meta:
        model = Bill
        fields = "__all__"


class PurchaseSerializer(serializers.ModelSerializer):
    # TODO: incluir items y datos de facturación si es necesario

    class Meta:
        model = Purchase
        fields = "__all__"

