# ML/services/repositories.py
from typing import Dict, Any, List, Optional
from bson import ObjectId
from .mongo import (
    col_students, col_schools, col_marks, col_fees,
    col_states, col_districts, col_talukas, col_cities
)

def to_oid(v: str) -> ObjectId:
    return ObjectId(v) if isinstance(v, str) else v

def geo_filters(state=None, district=None, taluka=None, city=None, school=None) -> Dict[str, Any]:
    filt: Dict[str, Any] = {}
    if state:   filt["State"]   = to_oid(state)
    if district:filt["District"]= to_oid(district)
    if taluka:  filt["Taluka"]  = to_oid(taluka)
    if city:    filt["City"]    = to_oid(city)
    if school:  filt["SchoolID"]= {"$in": [to_oid(school)]}  # Student has array of SchoolID :contentReference[oaicite:22]{index=22}
    return filt

def find_students(filters: Dict[str, Any], limit=200) -> List[Dict[str, Any]]:
    proj = {
        "Name": 1, "Email": 1, "Standard": 1,
        "AttendancePercentage": 1, "isRepeated": 1, "is_active": 1,
        "SchoolID": 1
    }
    return list(col_students().find(filters, proj).limit(limit))



def fees_unpaid_lookup(student_ids: List[ObjectId]) -> Dict[str, int]:
    """
    Build {studentId: No_unpaid_Month} using fees.Students[].student_id
    """
    pipe = [
        {"$unwind": "$Students"},
        {"$match": {"Students.student_id": {"$in": student_ids}}},
        {"$project": {
            "_id": 0,
            "sid": "$Students.student_id",
            "months": "$Students.No_unpaid_Month"
        }},
        {"$group": {"_id": "$sid", "months": {"$max": "$months"}}}
    ]
    rows = list(col_fees().aggregate(pipe))
    return {str(r["_id"]): r["months"] for r in rows}



def marks_average_lookup(student_ids: List[ObjectId]) -> Dict[str, float]:
    """
    Build {studentId: avgMarks} from Marks.Students[].marks (map)
    """
    pipe = [
        {"$unwind": "$Students"},
        {"$match": {"Students.Student1": {"$in": student_ids}}},
        {"$project": {
            "_id": 0,
            "sid": "$Students.Student1",
            "marksArr": {"$objectToArray": "$Students.marks"}
        }},
        {"$project": {
            "sid": 1,
            "scores": {"$map": {
                "input": "$marksArr",
                "as": "m",
                "in": "$$m.v"
            }}
        }},
        {"$project": {
            "sid": 1,
            "avg": {"$cond": [
                {"$gt": [{"$size": "$scores"}, 0]},
                {"$avg": "$scores"},
                None
            ]}
        }},
        {"$group": {"_id": "$sid", "avg": {"$max": "$avg"}}}
    ]
    rows = list(col_marks().aggregate(pipe))
    return {str(r["_id"]): (float(r["avg"]) if r["avg"] is not None else None) for r in rows}
