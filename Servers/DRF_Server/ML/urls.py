from django.urls import path
from .views.health_view import health
from .views.filters_view import states, districts, talukas, cities, schools
from .views.predict_view import predict_dropout

urlpatterns = [
    path("health/", health),
    path("filters/states/", states),
    path("filters/districts/", districts),
    path("filters/talukas/", talukas),
    path("filters/cities/", cities),
    path("filters/schools/", schools),
    path("predict/", predict_dropout),
]
