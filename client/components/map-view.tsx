"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Location, RouteData } from "@/lib/types"

interface MapViewProps {
  startLocation: Location | null
  endLocation: Location | null
  routeData: RouteData | null
  isCalculating: boolean
}

// Type definitions for MapLibre GL
type MapLibreGL = {
  Map: any
  Marker: any
  LngLatBounds: any
}

export default function MapView({ startLocation, endLocation, routeData, isCalculating }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [maplibregl, setMaplibregl] = useState<MapLibreGL | null>(null)

  useEffect(() => {
    // Check if already loaded
    if ((window as any).maplibregl) {
      setMaplibregl((window as any).maplibregl)
      return
    }

    // Load CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css"
    document.head.appendChild(link)

    // Load JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"
    script.async = true
    script.onload = () => {
      console.log("[v0] MapLibre GL loaded from CDN")
      setMaplibregl((window as any).maplibregl)
    }
    script.onerror = () => {
      console.error("[v0] Failed to load MapLibre GL from CDN")
      setMapError("Failed to load map library")
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !maplibregl) return

    const initMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "get_your_own_key"

        map.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
          center: [-98.5795, 39.8283], // Center of USA
          zoom: 4,
        })

        map.current.on("load", () => {
          console.log("[v0] Map loaded successfully")
          setMapLoaded(true)
        })

        map.current.on("error", (e: any) => {
          console.error("[v0] Map error:", e)
          setMapError("Failed to load map. Please check your API key.")
        })
      } catch (error) {
        console.error("[v0] Map initialization error:", error)
        setMapError("Failed to initialize map")
      }
    }

    initMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [maplibregl])

  // Update markers and route
  useEffect(() => {
    if (!map.current || !mapLoaded || !maplibregl) return

    // Clear existing markers and route
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route")
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route")
    }

    // Remove existing markers
    const markers = document.querySelectorAll(".maplibregl-marker")
    markers.forEach((marker) => marker.remove())

    // Add start marker
    if (startLocation) {
      const el = document.createElement("div")
      el.className = "marker-start"
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      `

      new maplibregl.Marker({ element: el }).setLngLat([startLocation.lng, startLocation.lat]).addTo(map.current)
    }

    // Add end marker
    if (endLocation) {
      const el = document.createElement("div")
      el.className = "marker-end"
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      `

      new maplibregl.Marker({ element: el }).setLngLat([endLocation.lng, endLocation.lat]).addTo(map.current)
    }

    // Draw route if available
    if (routeData && routeData.geometry) {
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeData.geometry,
        },
      })

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
      })

      // Fit map to route bounds
      const coordinates = routeData.geometry.coordinates
      const bounds = coordinates.reduce(
        (bounds: any, coord: number[]) => {
          return bounds.extend(coord as [number, number])
        },
        new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]),
      )

      map.current.fitBounds(bounds, {
        padding: 50,
      })
    } else if (startLocation && endLocation) {
      // Fit to both markers
      const bounds = new maplibregl.LngLatBounds()
      bounds.extend([startLocation.lng, startLocation.lat])
      bounds.extend([endLocation.lng, endLocation.lat])

      map.current.fitBounds(bounds, {
        padding: 100,
      })
    } else if (startLocation) {
      map.current.flyTo({
        center: [startLocation.lng, startLocation.lat],
        zoom: 12,
      })
    } else if (endLocation) {
      map.current.flyTo({
        center: [endLocation.lng, endLocation.lat],
        zoom: 12,
      })
    }
  }, [startLocation, endLocation, routeData, mapLoaded, maplibregl])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {isCalculating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-card p-6 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Calculating optimal route...</p>
          </div>
        </div>
      )}

      {!mapLoaded && !isCalculating && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive">{mapError}</p>
          </div>
        </div>
      )}
    </div>
  )
}
