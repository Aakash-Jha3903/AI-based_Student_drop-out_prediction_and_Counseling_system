# ML_Apps/views_prediction_region.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .summary import generate_gemini_insights

from .pymongo_client import get_db
from .prediction_region_pipeline import (
    resolve_district_oid, predict_for_district,
    resolve_taluka_oid, predict_for_taluka,
    resolve_city_oid, predict_for_city,
)

class PredictDistrictView(APIView):
    def post(self, request):
        if "district_id" in request.data:
            return Response({"detail": "Do not send ObjectId. Use district_name."}, status=400)
        district_name = request.data.get("district_name")
        if not district_name:
            return Response({"detail": "district_name is required"}, status=400)
        denom = int(request.data.get("fees_months_denom", 12))
        with_gemini = bool(request.data.get("with_gemini", False))
        try:
            db = get_db()
            oid = resolve_district_oid(db, district_name)
            payload = predict_for_district(db, oid, fees_months_denom=denom)
            if with_gemini and payload.get("results"):
                insights, g_status = generate_gemini_insights(payload["results"], school_label=district_name)
                payload["gemini"] = {"status": g_status, "insights": insights or ""}
            return Response(payload, 200)
        except Exception as e:
            return Response({"detail": str(e)}, 500)

class PredictTalukaView(APIView):
    def post(self, request):
        if "taluka_id" in request.data:
            return Response({"detail": "Do not send ObjectId. Use taluka_name."}, status=400)
        taluka_name = request.data.get("taluka_name")
        if not taluka_name:
            return Response({"detail": "taluka_name is required"}, status=400)
        denom = int(request.data.get("fees_months_denom", 12))
        with_gemini = bool(request.data.get("with_gemini", False))
        try:
            db = get_db()
            oid = resolve_taluka_oid(db, taluka_name)
            payload = predict_for_taluka(db, oid, fees_months_denom=denom)
            if with_gemini and payload.get("results"):
                insights, g_status = generate_gemini_insights(payload["results"], school_label=taluka_name)
                payload["gemini"] = {"status": g_status, "insights": insights or ""}
            return Response(payload, 200)
        except Exception as e:
            return Response({"detail": str(e)}, 500)

class PredictCityView(APIView):
    def post(self, request):
        if "city_id" in request.data:
            return Response({"detail": "Do not send ObjectId. Use city_name."}, status=400)
        city_name = request.data.get("city_name")
        if not city_name:
            return Response({"detail": "city_name is required"}, status=400)
        denom = int(request.data.get("fees_months_denom", 12))
        with_gemini = bool(request.data.get("with_gemini", False))
        try:
            db = get_db()
            oid = resolve_city_oid(db, city_name)
            payload = predict_for_city(db, oid, fees_months_denom=denom)
            if with_gemini and payload.get("results"):
                insights, g_status = generate_gemini_insights(payload["results"], school_label=city_name)
                payload["gemini"] = {"status": g_status, "insights": insights or ""}
            return Response(payload, 200)
        except Exception as e:
            return Response({"detail": str(e)}, 500)
