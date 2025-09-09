# ML/serializers/filters_serializers.py

from rest_framework import serializers

class GeoFilterIn(serializers.Serializer):
    state = serializers.CharField(required=False)
    district = serializers.CharField(required=False)
    taluka = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    school = serializers.CharField(required=False)

class StudentPredictOut(serializers.Serializer):
    _id = serializers.CharField()
    Name = serializers.CharField(allow_null=True)
    Email = serializers.EmailField(allow_null=True)
    Standard = serializers.IntegerField(allow_null=True)
    AttendancePercentage = serializers.FloatField(allow_null=True)
    isRepeated = serializers.BooleanField(allow_null=True)
    is_active = serializers.IntegerField(allow_null=True)
    _unpaid_months = serializers.IntegerField(allow_null=True)
    _avg_marks = serializers.FloatField(allow_null=True)
    risk_score = serializers.FloatField()
    risk_band = serializers.CharField()
