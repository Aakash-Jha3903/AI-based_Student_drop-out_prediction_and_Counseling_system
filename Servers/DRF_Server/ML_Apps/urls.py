from django.urls import path
from .views_prediction import PredictSchoolView
from .views_prediction_state import PredictStateView 
from .views_prediction_region import PredictDistrictView, PredictTalukaView, PredictCityView

urlpatterns = [
    path("predict/school/", PredictSchoolView.as_view(), name="predict-school"),
    path("predict/state/", PredictStateView.as_view(), name="predict-state"),

    path("predict/district/", PredictDistrictView.as_view(), name="predict-district"),
    path("predict/taluka/", PredictTalukaView.as_view(), name="predict-taluka"),
    path("predict/city/", PredictCityView.as_view(), name="predict-city"),
]
