"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Navigation, Layers } from "lucide-react";
import { Location, MapLibreGL } from "@/lib/types";
import { useLocation } from "@/lib/use-location";
import { useAppStore } from "@/lib/store";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [maplibregl, setMaplibregl] = useState<MapLibreGL | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [styleLoaded, setStyleLoaded] = useState(false);

  const { location } = useLocation();
  const {
    startLocation,
    endLocation,
    pickupLocation,
    routeData,
    isCalculating,
  } = useAppStore();

  const isValidCoords = (loc: Location | null | undefined) =>
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng) &&
    loc.lat >= -90 &&
    loc.lat <= 90 &&
    loc.lng >= -180 &&
    loc.lng <= 180;

  // Load MapLibre GL
  useEffect(() => {
    if ((window as any).maplibregl) {
      setMaplibregl((window as any).maplibregl);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => {
      setMaplibregl((window as any).maplibregl);
    };
    script.onerror = () => {
      setMapError("Failed to load map library");
    };
    document.head.appendChild(script);

    return () => {
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      } catch (e) {
        console.warn("Error removing maplibre-gl resources:", e);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !maplibregl) {
      return;
    }

    const defaultLat = 3.848;
    const defaultLng = 11.5021;

    const centerLat = isValidCoords(location) ? location.lat : defaultLat;
    const centerLng = isValidCoords(location) ? location.lng : defaultLng;

    try {
      const apiKey =
        process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "get_your_own_key";
      const styleUrl =
        mapStyle === "streets"
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
          : `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [centerLng, centerLat],
        zoom: 12,
        attributionControl: true,
      });

      map.current.markers = [];

      const nav = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });
      map.current.addControl(nav, "top-right");

      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate, "top-right");

      // Wait for style to be fully loaded
      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setStyleLoaded(true);
      });

      map.current.on("error", (e: any) => {
        console.error("Map error:", e);
        if (e.error?.message?.includes("key")) {
          setMapError(
            "Invalid API key. Please set NEXT_PUBLIC_MAPTILER_API_KEY"
          );
        } else {
          setMapError("Failed to load map");
        }
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [maplibregl, location]);

  // Effect to handle map style changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const apiKey =
      process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "get_your_own_key";
    const newStyleUrl =
      mapStyle === "streets"
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
        : `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`;

    const currentMapStyle = map.current.getStyle();
    const currentStyleId = currentMapStyle?.id;

    const isCurrentStyleStreets = currentStyleId?.includes("streets-v2");
    const isCurrentStyleSatellite = currentStyleId?.includes("hybrid");

    const styleNeedsChange =
      (mapStyle === "streets" && !isCurrentStyleStreets) ||
      (mapStyle === "satellite" && !isCurrentStyleSatellite);

    if (styleNeedsChange) {
      console.log(`Changing map style to: ${mapStyle}`);
      setStyleLoaded(false);

      const onStyleData = () => {
        if (map.current.isStyleLoaded()) {
          map.current.off("styledata", onStyleData);
          console.log("Style fully loaded, ready for markers");
          setTimeout(() => setStyleLoaded(true), 100);
        }
      };

      map.current.on("styledata", onStyleData);
      map.current.setStyle(newStyleUrl);
    }
  }, [mapStyle, mapLoaded]);

  // Add pulse animation style
  useEffect(() => {
    if (!document.getElementById("pulse-animation-style")) {
      const style = document.createElement("style");
      style.id = "pulse-animation-style";
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
        }
        .maplibregl-marker {
          z-index: 10 !important;
        }
        .user-location-marker-container {
          z-index: 100 !important;
        }
        .maplibregl-popup {
          z-index: 110 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Add/update markers and route
  useEffect(() => {
    if (!map.current || !mapLoaded || !maplibregl || !styleLoaded) {
      console.log("Skipping route/marker update: map not fully ready.", {
        mapReady: !!map.current,
        mapLoaded,
        maplibreglReady: !!maplibregl,
        styleLoaded,
      });
      return;
    }

    console.log("Map is ready for markers/route. Updating...");

    // Remove existing markers and routes
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    if (map.current.markers && Array.isArray(map.current.markers)) {
      console.log(`Removing ${map.current.markers.length} existing markers.`);
      map.current.markers.forEach((m: any) => {
        try {
          m.remove();
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      });
    }
    map.current.markers = [];

    // Helper function to add standard markers
    const addMarker = (loc: Location, color: string, label: string) => {
      if (!isValidCoords(loc)) {
        console.warn(`Skipping invalid marker: ${label}`, loc);
        return;
      }

      try {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.cursor = "pointer";

        const markerText =
          label === "Start" ? "A" : label === "End" ? "B" : "P";

        el.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 18px;
          ">
            ${markerText}
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: true,
        }).setHTML(
          `<div style="padding: 8px 12px; font-size: 14px; color: #333;">
            <strong>${label}</strong><br/>
            ${loc.name || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
          </div>`
        );

        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(popup)
          .addTo(map.current);

        map.current.markers.push(marker);
        console.log(`✓ Added ${label} marker at [${loc.lng}, ${loc.lat}]`);
      } catch (error) {
        console.error(`✗ Failed to add ${label} marker:`, error);
      }
    };

    // Helper function to add user location marker
    const addUserLocationMarker = (loc: Location) => {
      if (!isValidCoords(loc)) {
        console.warn("Skipping invalid user location marker.", loc);
        return;
      }

      try {
        const container = document.createElement("div");
        container.className = "user-location-marker-container";
        container.style.width = "80px";
        container.style.height = "80px";
        container.style.position = "relative";

        container.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px;">
            <div style="
              position: absolute;
              width: 60px;
              height: 60px;
              background-color: rgba(34, 197, 94, 0.3);
              border-radius: 50%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              background-color: rgba(34, 197, 94, 0.5);
              border-radius: 50%;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
            <div style="
              position: absolute;
              width: 20px;
              height: 20px;
              background-color: #22c55e;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
          </div>
          <div style="
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            background-color: #22c55e;
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            pointer-events: none;
          ">You are here</div>
          <div style="
            position: absolute;
            bottom: calc(100% - 5px);
            left: 50%;
            transform: translateX(-50%) translateY(-5px);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #22c55e;
            pointer-events: none;
          "></div>
        `;

        const popup = new maplibregl.Popup({
          offset: 40,
          closeButton: true,
        }).setHTML(
          `<div style="padding: 8px 12px; font-size: 14px; color: #333;">
            <strong>Your Location</strong><br/>
            ${loc.name || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
          </div>`
        );

        const marker = new maplibregl.Marker({
          element: container,
          anchor: "center",
        })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(popup)
          .addTo(map.current);

        map.current.markers.push(marker);
        console.log(`✓ Added user location marker at [${loc.lng}, ${loc.lat}]`);
      } catch (error) {
        console.error("✗ Failed to add user location marker:", error);
      }
    };

    // Add markers
    console.log("Adding markers for locations:", {
      location: location ? `${location.lat}, ${location.lng}` : "null",
      startLocation: startLocation
        ? `${startLocation.lat}, ${startLocation.lng}`
        : "null",
      endLocation: endLocation
        ? `${endLocation.lat}, ${endLocation.lng}`
        : "null",
      pickupLocation: pickupLocation
        ? `${pickupLocation.lat}, ${pickupLocation.lng}`
        : "null",
    });

    if (isValidCoords(location)) {
      addUserLocationMarker(location);
    }
    if (isValidCoords(startLocation)) {
      addMarker(startLocation as Location, "#3b82f6", "Start");
    }
    if (isValidCoords(endLocation)) {
      addMarker(endLocation as Location, "#ef4444", "End");
    }
    if (isValidCoords(pickupLocation)) {
      addMarker(pickupLocation as Location, "#f97316", "Pickup");
    }

    console.log(`Total markers added: ${map.current.markers.length}`);

    // Verify markers in DOM
    setTimeout(() => {
      const allMarkers = document.querySelectorAll(".maplibregl-marker");
      console.log(`Markers in DOM: ${allMarkers.length}`);
    }, 200);

    // Add route
    if (
      routeData &&
      routeData.geometry &&
      routeData.geometry.coordinates &&
      routeData.geometry.coordinates.length > 0
    ) {
      console.log(
        "Adding route with",
        routeData.geometry.coordinates.length,
        "coordinates"
      );

      try {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeData.geometry.coordinates,
            },
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 5,
            "line-opacity": 0.8,
          },
        });

        console.log("Route added successfully");
      } catch (error) {
        console.error("Error adding route:", error);
      }
    }

    // Fit bounds
    const bounds = new maplibregl.LngLatBounds();
    let hasValidBounds = false;

    [location, startLocation, endLocation, pickupLocation].forEach((loc) => {
      if (isValidCoords(loc)) {
        bounds.extend([loc.lng, loc.lat]);
        hasValidBounds = true;
      }
    });

    if (
      routeData &&
      routeData.geometry &&
      routeData.geometry.coordinates &&
      routeData.geometry.coordinates.length > 0
    ) {
      routeData.geometry.coordinates.forEach((coord) => {
        bounds.extend(coord);
        hasValidBounds = true;
      });
    }

    if (hasValidBounds) {
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 15,
          duration: 1000,
        });
        console.log("Map bounds fitted successfully");
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [
    mapLoaded,
    styleLoaded,
    maplibregl,
    location,
    startLocation,
    endLocation,
    pickupLocation,
    routeData,
  ]);

  const handleRecenter = () => {
    if (map.current && isValidCoords(location)) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 14,
        duration: 1000,
      });
    }
  };

  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === "streets" ? "satellite" : "streets"));
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
      <div ref={mapContainer} className="h-full w-full" />

      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <button
          onClick={toggleMapStyle}
          className="bg-white hover:bg-gray-100 p-2.5 rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          title="Toggle map style"
        >
          <Layers className="h-5 w-5 text-gray-700" />
        </button>

        <button
          onClick={handleRecenter}
          className="bg-white hover:bg-gray-100 p-2.5 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={!isValidCoords(location)}
          title="Recenter to your location"
        >
          <Navigation className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {isCalculating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-800">
              Calculating route...
            </span>
          </div>
        </div>
      )}

      {!mapLoaded && !isCalculating && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg max-w-md text-center shadow-lg">
            <p className="text-sm text-red-700 font-medium">{mapError}</p>
            <p className="text-xs text-red-500 mt-2">
              Please check your internet connection and try again.
            </p>
          </div>
        </div>
      )}

      {mapLoaded &&
        !mapError &&
        (startLocation || endLocation || pickupLocation || location) && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10 border border-gray-100">
            <div className="text-xs font-semibold mb-2 text-gray-700 border-b pb-1">
              Map Legend
            </div>
            <div className="flex flex-col gap-2">
              {location && isValidCoords(location) && (
                <div className="flex items-center gap-2 bg-green-50 px-2 py-1.5 rounded-md border border-green-200">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="absolute w-5 h-5 bg-green-500/30 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"></div>
                  </div>
                  <span className="text-xs font-bold text-green-700">
                    Your Current Location
                  </span>
                </div>
              )}
              {startLocation && isValidCoords(startLocation) && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center text-xs font-bold text-white">
                    A
                  </div>
                  <span className="text-xs text-gray-600">Start Point</span>
                </div>
              )}
              {endLocation && isValidCoords(endLocation) && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow flex items-center justify-center text-xs font-bold text-white">
                    B
                  </div>
                  <span className="text-xs text-gray-600">Destination</span>
                </div>
              )}
              {pickupLocation && isValidCoords(pickupLocation) && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow flex items-center justify-center text-xs font-bold text-white">
                    P
                  </div>
                  <span className="text-xs text-gray-600">Pickup Point</span>
                </div>
              )}
              {routeData &&
                routeData.geometry?.coordinates &&
                routeData.geometry.coordinates.length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-2 py-1.5 rounded-md border border-blue-200">
                    <div className="w-4 h-1 bg-blue-500 rounded"></div>
                    <span className="text-xs font-bold text-blue-700">
                      Calculated Route Path
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}
    </div>
  );
}
