"use client"

import { Clock, Route, Gauge, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RouteData } from "@/lib/types"

interface RouteDetailsProps {
  routeData: RouteData
}

export default function RouteDetails({ routeData }: RouteDetailsProps) {
  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371
    return miles >= 1 ? `${miles.toFixed(1)} mi` : `${meters.toFixed(0)} m`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const routeHours = routeData.duration / 3600

  return (
    <div className="border-b border-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Route Summary</h3>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border bg-card/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Route className="h-4 w-4" />
              Distance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-lg font-bold text-foreground">{formatDistance(routeData.distance)}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-lg font-bold text-foreground">{formatDuration(routeData.duration)}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Avg Speed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-lg font-bold text-foreground">
              {Math.round((routeData.distance / routeData.duration) * 2.23694)} mph
            </p>
          </CardContent>
        </Card>
      </div>

      {typeof routeData.cycleHours === "number" && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">HOS Compliance (70-hour/8-day)</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-foreground">Cycle Hours Used</span>
              <span className="font-semibold text-foreground">{routeData.cycleHours.toFixed(1)}h</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-foreground">Route Duration</span>
              <span className="font-semibold text-foreground">{routeHours.toFixed(1)}h</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-foreground">Hours Remaining</span>
              <span className="font-semibold text-foreground">{routeData.hoursRemaining?.toFixed(1)}h</span>
            </div>

            {routeData.canCompleteRoute ? (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-500">Route Compliant</p>
                  <p className="text-xs text-green-500/80">You have enough hours to complete this route</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-500">Hours Exceeded</p>
                  <p className="text-xs text-amber-500/80">This route exceeds your available hours. Rest required.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
