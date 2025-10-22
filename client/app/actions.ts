"use server"

import type { Location, RouteData } from "@/lib/types"

const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY || "get_your_own_key"

export async function searchLocation(query: string): Promise<Location[]> {
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&limit=5`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to search location")
    }

    const data = await response.json()

    return data.features.map((feature: any) => ({
      name: feature.text || feature.place_name,
      address: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
    }))
  } catch (error) {
    console.error("Location search error:", error)
    return []
  }
}

export async function calculateRoute(start: Location, end: Location): Promise<{ data?: RouteData; error?: string }> {
  try {
    const response = await fetch(
      `https://api.maptiler.com/navigation/driving/${start.lng},${start.lat};${end.lng},${end.lat}.json?key=${MAPTILER_API_KEY}&steps=true&overview=full`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to calculate route")
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      return { error: "No route found between these locations" }
    }

    const route = data.routes[0]

    // Extract turn-by-turn instructions
    const instructions = route.legs[0].steps.map((step: any) => ({
      text: step.maneuver.instruction || "Continue",
      type: step.maneuver.type || "continue",
      distance: step.distance || 0,
    }))

    return {
      data: {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        instructions,
      },
    }
  } catch (error) {
    console.error("Route calculation error:", error)
    return { error: "Failed to calculate route. Please try again." }
  }
}
