from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
import requests
import os

MAPTILER_API_KEY = os.getenv("MAPTILER_API_KEY")
OPEN_ROUTE_API_KEY = os.getenv("OPEN_ROUTE_API_KEY")


@api_view(["POST"])
def search_location(request):
    query = request.data.get("query")
    if not query:
        return Response({"error": "Query is required"}, status=400)

    url = f"https://api.maptiler.com/geocoding/{query}.json?key={MAPTILER_API_KEY}&limit=5"
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()

        locations = [
            {
                "name": feature.get("text") or feature.get("place_name"),
                "address": feature.get("place_name"),
                "lat": feature["center"][1],
                "lng": feature["center"][0],
            }
            for feature in data.get("features", [])
        ]
        return Response({"locations": locations})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
def calculate_route(request):
    """Calculate a driving route using OpenRouteService."""
    start = request.data.get("start")
    end = request.data.get("end")
    pickup = request.data.get("pickup")

    if not start or not end:
        return Response(
            {"error": "Both start and end locations are required"},
            status=400,
        )

    start_coords = f"{start["lng"]},{start["lat"]}"
    pickup_coords = f"{pickup["lng"]},{pickup["lat"]}"
    end_coords = f"{end["lng"]},{end["lat"]}"
    # OpenRouteService v2 directions endpoint (POST with JSON body)
    requestBody = {
        "coordinates": [
            start_coords.split(","),
            end_coords.split(","),
            pickup_coords.split(","),
        ]
    }
    headers = {
        "Authorization": f"Bearer {OPEN_ROUTE_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    url = f"https://api.openrouteservice.org/v2/directions/driving-car"

    try:
        resp = requests.post(url, timeout=10, headers=headers, json=requestBody)
        # resp.raise_for_status()
        routeData = resp.json()
        # print(routeData)

        return Response(routeData)

        # Extract the first feature from the GeoJSON response
        # if routeData.get("features") and len(routeData["features"]) > 0:
        #     feature = routeData["features"][0]
        #     return Response(
        #         {
        #             "type": "Feature",
        #             "properties": feature.get("properties", {}),
        #             "geometry": feature.get("geometry", {}),
        #         }
        #     )
        # else:
        #     return Response({"error": "No route found"}, status=400)

    except requests.exceptions.HTTPError as e:
        error_detail = "Route calculation failed"
        if e.response is not None:
            try:
                error_data = e.response.json()
                error_detail = error_data.get("error", {}).get("message", str(e))
            except:
                error_detail = e.response.text or str(e)

        print(f"HTTP Error: {e}")
        print(f"Error detail: {error_detail}")
        return Response({"error": error_detail}, status=502)

    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return Response(
            {"error": "Failed to connect to routing service"},
            status=502,
        )

    except Exception as e:
        print(f"Unexpected error: {e}")
        return Response(
            {"error": "An unexpected error occurred"},
            status=500,
        )
