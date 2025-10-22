from django.urls import path
from . import views

urlpatterns = [
    path("search-location/", views.search_location, name="search-location"),
    path("calculate-route/", views.calculate_route, name="calculate-route"),
]
