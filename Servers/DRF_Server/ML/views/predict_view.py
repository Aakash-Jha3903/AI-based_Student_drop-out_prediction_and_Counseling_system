# ML/views/predict_view.py (main pipeline)
from typing import List
from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..serializers.predict_serializers import PredictIn
from ..serializers.filters_serializers import StudentPredictOut
from ..services.repositories import geo_filters, find_students, fees_unpaid_lookup, marks_average_lookup
from ..services.ml_engine import predict

@api_view(["POST"])
def predict_dropout(request):
    inp = PredictIn(data=request.data)
    inp.is_valid(raise_exception=True)
    filters = geo_filters(**{k: inp.validated_data.get(k) for k in
                             ["state","district","taluka","city","school"]})
    limit = inp.validated_data.get("limit")

    # 1) Get students
    students = find_students(filters, limit=limit)

    # 2) Join fees + marks
    sids: List[ObjectId] = [s["_id"] for s in students]
    fees_map = fees_unpaid_lookup(sids)     # {sid: months}
    marks_map = marks_average_lookup(sids)  # {sid: avg}

    # 3) Attach features & predict
    out_rows = []
    for s in students:
        sid = str(s["_id"])
        s["_unpaid_months"] = fees_map.get(sid)
        s["_avg_marks"] = marks_map.get(sid)
        pred = predict(s)
        out_rows.append({**{
            "_id": sid,
            "Name": s.get("Name"),
            "Email": s.get("Email"),
            "Standard": s.get("Standard"),
            "AttendancePercentage": s.get("AttendancePercentage"),
            "isRepeated": s.get("isRepeated"),
            "is_active": s.get("is_active"),
            "_unpaid_months": s.get("_unpaid_months"),
            "_avg_marks": s.get("_avg_marks"),
        }, **pred})

    # 4) Validate/shape output
    serializer = StudentPredictOut(data=out_rows, many=True)
    serializer.is_valid(raise_exception=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
