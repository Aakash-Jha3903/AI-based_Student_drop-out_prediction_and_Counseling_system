from rest_framework import serializers
from .filters_serializers import GeoFilterIn, StudentPredictOut

class PredictIn(GeoFilterIn):
    limit = serializers.IntegerField(required=False, min_value=1, max_value=1000, default=200)
