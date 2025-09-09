# ML/services/mongo.py
import os
from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None

def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI, appname="Dropout-DRF")
    return _client

def get_db():
    global _db
    if _db is None:
        _db = get_client()[settings.MONGODB_DB]
    return _db

# Expose typed collection helpers (names from your schemas):
def col_students():
    return get_db()["students"]  # fields: SchoolID[], attendance, reasons… :contentReference[oaicite:12]{index=12}

def col_schools():
    return get_db()["schools"]   # fields: Medium, State/District/Taluka/City… :contentReference[oaicite:13]{index=13}

def col_marks():
    return get_db()["Marks"]     # Students[].marks map per student :contentReference[oaicite:14]{index=14}

def col_fees():
    return get_db()["fees"]      # Students[].No_unpaid_Month per student :contentReference[oaicite:15]{index=15}

def col_reasons():
    return get_db()["reasons"]   # resources list :contentReference[oaicite:16]{index=16}

def col_states():
    return get_db()["states"]    # :contentReference[oaicite:17]{index=17}

def col_districts():
    return get_db()["districts"] # :contentReference[oaicite:18]{index=18}

def col_talukas():
    return get_db()["talukas"]   # :contentReference[oaicite:19]{index=19}

def col_cities():
    return get_db()["cities"]    # :contentReference[oaicite:20]{index=20}

def col_users():
    return get_db()["users"]     # scoping by Role/geo/school :contentReference[oaicite:21]{index=21}
