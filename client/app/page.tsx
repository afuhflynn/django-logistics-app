"use client";

import { MapPin, Navigation, Clock, RouteIcon } from "lucide-react";
import MapView from "@/components/map-view";
import LocationSelector from "@/components/location-selector";
import RouteDetails from "@/components/route-details";
import NavigationPanel from "@/components/navigation-panel";
import { useAppStore } from "@/lib/store";

export default function RoutePlanningApp() {
  const { error, routeData, isCalculating } = useAppStore();

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
              <h1 className="text-xl font-bold text-foreground">
                Logistics Route Planner
              </h1>
              <p className="text-sm text-muted-foreground">
                Advanced Route Planning with HOS Compliance
              </p>
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

              <LocationSelector />

              {error && (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>

            {/* Route Details and Navigation */}
            {routeData && (
              <div className="flex-1 overflow-y-auto">
                <RouteDetails />
                {/* Ensure instructions are passed correctly
}
                */}
                {routeData.routes && routeData.routes.length > 0 && (
                  <NavigationPanel />
                )}
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
          <MapView />
        </main>
      </div>
    </div>
  );
}
