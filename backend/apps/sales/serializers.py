from rest_framework import serializers

from .models import Bill, Purchase, UserCoreography


class CoreographyMiniSerializer(serializers.Serializer):
    coreography_id = serializers.IntegerField()
    c_name = serializers.CharField()


class UserCoreographyForPurchaseSerializer(serializers.ModelSerializer):
    coreography = CoreographyMiniSerializer(read_only=True)

    class Meta:
        model = UserCoreography
        fields = ["coreography", "purchase_id"]


class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = [
            "bill_id", "total_amount", "payment_method",
            "email_address", "titular_name", "document_number",
            "details", "creation_date",
        ]


class PurchaseHistorySerializer(serializers.ModelSerializer):
    bills = BillSerializer(many=True, read_only=True)
    items = UserCoreographyForPurchaseSerializer(
        source="user_coreographies", many=True, read_only=True
    )

    class Meta:
        model = Purchase
        fields = [
            "purchase_id", "cart", "purchase_date",
            "transaction_id", "bills", "items",
        ]


class CreatePurchaseSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=["pse", "card"])
    email_address = serializers.EmailField()
    titular_name = serializers.CharField(max_length=100)
    document_number = serializers.CharField(max_length=50)
    details = serializers.CharField(required=False, allow_blank=True, max_length=300)
