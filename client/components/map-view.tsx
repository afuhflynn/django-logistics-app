"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Navigation, Layers } from "lucide-react";
import { Location, MapLibreGL } from "@/lib/types";
import { useLocation } from "@/lib/use-location";
import { useAppStore } from "@/lib/store";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const routeLayerAdded = useRef<boolean>(false); // This ref is used, but perhaps not strictly needed if layers are always re-added/updated.
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [maplibregl, setMaplibregl] = useState<MapLibreGL | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");

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
    // Check if maplibregl is already available (e.g., from a previous component instance or a global script)
    if ((window as any).maplibregl) {
      setMaplibregl((window as any).maplibregl);
      return;
    }

    // Append CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";
    document.head.appendChild(link);

    // Append JS
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

    // Cleanup function
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
  }, []); // Empty dependency array means this runs once on mount

  // Initialize map
  useEffect(() => {
    // Only proceed if map container is ready, map hasn't been initialized yet, and maplibregl is loaded
    if (!mapContainer.current || map.current || !maplibregl) {
      return;
    }

    const defaultLat = 3.848; // Example default latitude (e.g., Yaoundé, Cameroon)
    const defaultLng = 11.5021; // Example default longitude

    // Determine initial center based on user's location or defaults
    const centerLat = isValidCoords(location) ? location.lat : defaultLat;
    const centerLng = isValidCoords(location) ? location.lng : defaultLng;

    try {
      const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY; // Replace with your actual MapTiler API key
      const styleUrl =
        mapStyle === "streets"
          ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
          : `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [centerLng, centerLat], // MapLibre uses [lng, lat]
        zoom: 12,
        attributionControl: true, // Show attribution
      });

      // Add navigation controls
      const nav = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });
      map.current.addControl(nav, "top-right");

      // Add geolocate control
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true, // Show user's location on the map
        showUserHeading: true, // Show user's heading if available
      });
      map.current.addControl(geolocate, "top-right");

      // Event listener for map load
      map.current.on("load", () => {
        setMapLoaded(true);
        console.log("Map loaded successfully");
        // No need for setMapStyle(prev => prev) as the route/marker effect's dependencies will handle updates.
      });

      // Event listener for map errors
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

    // Cleanup function to remove map when component unmounts
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [maplibregl, location]); // Re-initialize if maplibregl or initial user location changes

  // Effect to handle map style changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return; // Ensure map is initialized and loaded

    const apiKey =
      process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "get_your_own_key";
    const newStyleUrl =
      mapStyle === "streets"
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
        : `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`;

    // Get current map style info (often includes an ID or name)
    const currentMapStyle = map.current.getStyle();
    const currentStyleId = currentMapStyle?.id; // MapTiler styles often have an 'id' property in their JSON

    // Determine if the current map style matches the desired style to prevent unnecessary reloads
    const isCurrentStyleStreets = currentStyleId?.includes("streets-v2");
    const isCurrentStyleSatellite = currentStyleId?.includes("hybrid");

    const styleNeedsChange =
      (mapStyle === "streets" && !isCurrentStyleStreets) ||
      (mapStyle === "satellite" && !isCurrentStyleSatellite);

    if (styleNeedsChange) {
      console.log(`Changing map style to: ${mapStyle}`);
      map.current.setStyle(newStyleUrl);
      // When setStyle is called, all custom layers (like our route) are removed.
      // So, we must flag that the route layer needs to be re-added.
      routeLayerAdded.current = false;
      // After setStyle, the map will trigger a 'styledata' event (and then 'data' and 'render').
      // The subsequent effect for markers/route will rely on mapLoaded still being true and
      // map.current.isStyleLoaded() becoming true internally after setStyle.
      // We don't need to change `mapLoaded` state here, as the map object is still present.
    }
  }, [mapStyle, mapLoaded]); // Re-run if mapStyle or mapLoaded changes

  // Add/update markers and route
  useEffect(() => {
    // Crucial check: ensure map is initialized, loaded, maplibregl is available, AND its style is fully loaded
    if (
      !map.current ||
      !mapLoaded ||
      !maplibregl ||
      !map.current.isStyleLoaded()
    ) {
      console.log("Skipping route/marker update: map not fully ready.", {
        mapReady: !!map.current,
        mapLoaded,
        maplibreglReady: !!maplibregl,
        styleLoaded: map.current ? map.current.isStyleLoaded() : false,
      });
      return;
    }

    console.log("Map is ready for markers/route. Attempting to update...");

    const removeExistingRouteAndMarkers = () => {
      // Remove route layer if it exists
      if (map.current.getLayer("route")) {
        console.log("Removing existing route layer.");
        map.current.removeLayer("route");
      }
      // Remove route source if it exists
      if (map.current.getSource("route")) {
        console.log("Removing existing route source.");
        map.current.removeSource("route");
      }
      routeLayerAdded.current = false; // Reset the flag

      // Remove previous custom markers
      if (map.current.markers) {
        // `map.current.markers` is your custom array
        console.log(
          `Removing ${map.current.markers.length} existing custom markers.`
        );
        map.current.markers.forEach((m: any) => m.remove()); // Call MapLibre's remove method
      }
      map.current.markers = []; // Clear your custom array
    };

    removeExistingRouteAndMarkers(); // Clear everything before adding new

    const addMarker = (loc: Location, color: string, label: string) => {
      if (!isValidCoords(loc)) {
        console.warn(`Skipping invalid marker: ${label}`, loc);
        return;
      }

      const el = document.createElement("div");
      el.className = `custom-marker ${label
        .toLowerCase()
        .replace(" ", "-")}-marker`; // Add specific class for easier debugging
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        z-index: 100; /* Increased z-index */
      `;

      const markerLabelContent = document.createElement("div");
      markerLabelContent.textContent =
        label === "Start" ? "A" : label === "End" ? "B" : "P"; // 'P' for pickup
      markerLabelContent.style.cssText = `
        color: white;
        font-size: 12px;
        font-weight: bold;
      `;
      el.appendChild(markerLabelContent);

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(
        `<div style="padding: 4px 8px; font-size: 14px; color: #333;">${label}: ${
          loc.name || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
        }</div>`
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(map.current);

      map.current.markers.push(marker);
      console.log(
        `Added marker: ${label} at [${loc.lng}, ${loc.lat}] with color ${color}`
      );
    };

    const addUserLocationMarker = (loc: Location) => {
      if (!isValidCoords(loc)) {
        console.warn("Skipping invalid user location marker.", loc);
        return;
      }

      // Dynamically add pulse animation style if not already present
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
        `;
        document.head.appendChild(style);
        console.log("Added pulse animation style to document head.");
      }

      const container = document.createElement("div");
      container.className = "user-location-marker-container"; // Added class for debugging
      container.style.cssText = `
        position: relative;
        width: 60px;
        height: 60px;
        z-index: 200; /* Highest z-index for user location */
      `;

      const outerRing = document.createElement("div");
      outerRing.style.cssText = `
        position: absolute;
        width: 60px;
        height: 60px;
        background-color: rgba(34, 197, 94, 0.3); /* green-500 with opacity */
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      `;

      const middleRing = document.createElement("div");
      middleRing.style.cssText = `
        position: absolute;
        width: 40px;
        height: 40px;
        background-color: rgba(34, 197, 94, 0.5); /* green-500 with more opacity */
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;

      const innerDot = document.createElement("div");
      innerDot.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: #22c55e; /* green-500 */
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10; /* Relative z-index within container */
      `;

      const label = document.createElement("div");
      label.style.cssText = `
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #22c55e;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 20; /* Relative z-index within container */
      `;
      label.textContent = "You are here";

      const arrow = document.createElement("div");
      arrow.style.cssText = `
        position: absolute;
        top: -8px; /* Position it to connect to the label */
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #22c55e; /* green-500 */
        z-index: 19; /* Relative z-index within container */
      `;

      container.appendChild(outerRing);
      container.appendChild(middleRing);
      container.appendChild(innerDot);
      container.appendChild(label);
      container.appendChild(arrow);

      const marker = new maplibregl.Marker({
        element: container,
        anchor: "center",
      })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map.current);

      map.current.markers.push(marker);
      console.log(`Added user location marker at [${loc.lng}, ${loc.lat}]`);
    };

    // Add markers based on valid locations
    if (isValidCoords(location)) {
      addUserLocationMarker(location);
    }
    if (isValidCoords(startLocation)) {
      addMarker(startLocation as Location, "#3b82f6", "Start"); // Blue for start
    }
    if (isValidCoords(endLocation)) {
      addMarker(endLocation as Location, "#ef4444", "End"); // Red for end
    }
    if (isValidCoords(pickupLocation)) {
      addMarker(pickupLocation as Location, "#f97316", "Pickup"); // Orange for pickup
    }

    // ... (rest of the route and fitBounds logic)
  }, [
    mapLoaded,
    maplibregl,
    location,
    startLocation,
    endLocation,
    pickupLocation,
    routeData,
    mapStyle,
  ]);

  // Handler to recenter map to user's location
  const handleRecenter = () => {
    if (map.current && isValidCoords(location)) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 14, // A slightly closer zoom for recentering
        duration: 1000,
      });
    }
  };

  // Handler to toggle map style
  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === "streets" ? "satellite" : "streets"));
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-md">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Controls */}
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

      {/* Loading/Calculating Overlays */}
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

      {/* Map Legend */}
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
