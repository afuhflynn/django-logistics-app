"use client"

import { useState } from "react"
import { MapPin, Navigation, Clock, RouteIcon } from "lucide-react"
import MapView from "@/components/map-view"
import LocationSelector from "@/components/location-selector"
import RouteDetails from "@/components/route-details"
import NavigationPanel from "@/components/navigation-panel"
import { calculateRoute } from "@/app/actions"
import type { RouteData, Location } from "@/lib/types"

export default function RoutePlanningApp() {
  const [startLocation, setStartLocation] = useState<Location | null>(null)
  const [endLocation, setEndLocation] = useState<Location | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cycleHours, setCycleHours] = useState<number>(0)

  const handleCalculateRoute = async () => {
    if (!startLocation || !endLocation) {
      setError("Please select both pickup and drop-off locations")
      return
    }

    if (cycleHours < 0 || cycleHours > 70) {
      setError("Cycle hours must be between 0 and 70")
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const result = await calculateRoute(startLocation, endLocation)

      if (result.error) {
        setError(result.error)
        setRouteData(null)
      } else if (result.data) {
        const hoursRemaining = 70 - cycleHours
        const routeHours = result.data.duration / 3600

        setRouteData({
          ...result.data,
          cycleHours,
          hoursRemaining,
          canCompleteRoute: routeHours <= hoursRemaining,
        })
      }
    } catch (err) {
      setError("Failed to calculate route. Please try again.")
      console.error("[v0] Route calculation error:", err)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClearRoute = () => {
    setStartLocation(null)
    setEndLocation(null)
    setRouteData(null)
    setError(null)
    setCycleHours(0)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <RouteIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Logistics Route Planner</h1>
              <p className="text-sm text-muted-foreground">Advanced Route Planning with HOS Compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Powered by MapTiler</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <aside className="w-full border-r border-border bg-card md:w-96">
          <div className="flex h-full flex-col">
            {/* Location Selection */}
            <div className="border-b border-border p-4">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Navigation className="h-5 w-5" />
                Plan Your Route
              </h2>

              <LocationSelector
                startLocation={startLocation}
                endLocation={endLocation}
                onStartLocationChange={setStartLocation}
                onEndLocationChange={setEndLocation}
                onCalculateRoute={handleCalculateRoute}
                onClearRoute={handleClearRoute}
                isCalculating={isCalculating}
                cycleHours={cycleHours}
                onCycleHoursChange={setCycleHours}
              />

              {error && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* Route Details */}
            {routeData && (
              <div className="flex-1 overflow-y-auto">
                <RouteDetails routeData={routeData} />
                <NavigationPanel instructions={routeData.instructions} />
              </div>
            )}

            {!routeData && !isCalculating && (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Enter locations and cycle hours to calculate your route
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Side - Map */}
        <main className="flex-1">
          <MapView
            startLocation={startLocation}
            endLocation={endLocation}
            routeData={routeData}
            isCalculating={isCalculating}
          />
        </main>
      </div>
    </div>
  )
}
