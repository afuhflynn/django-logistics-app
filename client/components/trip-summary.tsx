"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Fuel, MapPin, TrendingUp } from "lucide-react"
import type { RouteResult } from "@/lib/route-calculator"

interface TripSummaryProps {
  routeData: RouteResult
}

export default function TripSummary({ routeData }: TripSummaryProps) {
  const stats = [
    {
      label: "Total Distance",
      value: `${routeData.totalDistance.toFixed(0)} mi`,
      icon: MapPin,
      color: "text-primary",
    },
    {
      label: "Total Trip Hours",
      value: `${routeData.totalHours.toFixed(1)} hrs`,
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Fuel Stops",
      value: routeData.fuelStops.length,
      icon: Fuel,
      color: "text-secondary",
    },
    {
      label: "Hours Remaining",
      value: `${routeData.hoursRemaining.toFixed(1)} hrs`,
      icon: TrendingUp,
      color: routeData.hoursRemaining < 10 ? "text-destructive" : "text-accent",
    },
  ]

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Trip Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Upcoming Stops */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Upcoming Stops</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Pickup Location</p>
                <p className="text-xs text-muted-foreground">
                  {routeData.segments[0].distance.toFixed(0)} miles • {routeData.segments[0].duration.toFixed(1)} hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Dropoff Location</p>
                <p className="text-xs text-muted-foreground">
                  {routeData.segments[1].distance.toFixed(0)} miles • {routeData.segments[1].duration.toFixed(1)} hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
