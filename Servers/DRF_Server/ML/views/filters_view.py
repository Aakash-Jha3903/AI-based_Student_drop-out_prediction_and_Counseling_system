# ML/views/filters_view.py (for dropdowns)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..services.mongo import col_states, col_districts, col_talukas, col_cities, col_schools

def map_id_name(rows, id_key="_id", name_key="name"):
    return [{"_id": str(r[id_key]), "name": r.get(name_key)} for r in rows]

@api_view(["GET"])
def states(request):
    rows = list(col_states().find({}, {"name":1}))
    return Response(map_id_name(rows))

@api_view(["GET"])
def districts(request):
    state = request.GET.get("state")
    q = {"state": state} if state else {}
    rows = list(col_districts().find(q, {"district":1}))
    return Response([{"_id": str(r["_id"]), "name": r.get("district")} for r in rows])

@api_view(["GET"])
def talukas(request):
    district = request.GET.get("district")
    q = {"district": district} if district else {}
    rows = list(col_talukas().find(q, {"taluka":1}))
    return Response([{"_id": str(r["_id"]), "name": r.get("taluka")} for r in rows])

@api_view(["GET"])
def cities(request):
    district = request.GET.get("district")
    taluka = request.GET.get("taluka")
    q = {}
    if district: q["district"] = district
    if taluka:   q["taluka"] = taluka
    rows = list(col_cities().find(q, {"city":1}))
    return Response([{"_id": str(r["_id"]), "name": r.get("city")} for r in rows])

@api_view(["GET"])
def schools(request):
    q = {}
    for key in ("State","District","Taluka","City"):
        v = request.GET.get(key.lower())
        if v: q[key] = v
    rows = list(col_schools().find(q, {"Name":1}))
    return Response([{"_id": str(r["_id"]), "name": r.get("Name")} for r in rows])
