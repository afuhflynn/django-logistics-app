"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapIcon, Loader2 } from "lucide-react"
import type { RouteResult } from "@/lib/route-calculator"

interface RouteMapProps {
  routeData: RouteResult | null
  isCalculating: boolean
}

export default function RouteMap({ routeData, isCalculating }: RouteMapProps) {
  // Convert lat/lng to SVG coordinates (simplified projection)
  const latLngToSVG = (lat: number, lng: number) => {
    // US bounds approximately: lat 24-49, lng -125 to -66
    const x = ((lng + 125) / 59) * 800
    const y = ((49 - lat) / 25) * 500
    return { x, y }
  }

  const renderMap = () => {
    if (!routeData) return null

    const { coordinates, fuelStops } = routeData

    const currentPos = latLngToSVG(coordinates.current[0], coordinates.current[1])
    const pickupPos = latLngToSVG(coordinates.pickup[0], coordinates.pickup[1])
    const dropoffPos = latLngToSVG(coordinates.dropoff[0], coordinates.dropoff[1])

    return (
      <svg viewBox="0 0 800 500" className="h-full w-full rounded-lg bg-muted/50">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid)" />

        {/* Route lines */}
        <line
          x1={currentPos.x}
          y1={currentPos.y}
          x2={pickupPos.x}
          y2={pickupPos.y}
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeOpacity="0.6"
          strokeDasharray="5,5"
        />
        <line
          x1={pickupPos.x}
          y1={pickupPos.y}
          x2={dropoffPos.x}
          y2={dropoffPos.y}
          stroke="hsl(var(--chart-2))"
          strokeWidth="3"
          strokeOpacity="0.7"
        />

        {/* Fuel stop markers */}
        {fuelStops.map((stop, index) => {
          const pos = latLngToSVG(stop.coordinates[0], stop.coordinates[1])
          return (
            <g key={index}>
              <circle cx={pos.x} cy={pos.y} r="6" fill="hsl(var(--chart-3))" stroke="white" strokeWidth="2" />
              <title>
                Fuel Stop {index + 1} - {stop.distance.toFixed(0)} miles
              </title>
            </g>
          )
        })}

        {/* Current location marker */}
        <g>
          <circle cx={currentPos.x} cy={currentPos.y} r="8" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />
          <text
            x={currentPos.x}
            y={currentPos.y - 15}
            textAnchor="middle"
            className="fill-foreground text-xs font-medium"
          >
            Current
          </text>
          <title>Current Location</title>
        </g>

        {/* Pickup location marker */}
        <g>
          <circle cx={pickupPos.x} cy={pickupPos.y} r="10" fill="hsl(var(--chart-1))" stroke="white" strokeWidth="2" />
          <text
            x={pickupPos.x}
            y={pickupPos.y - 18}
            textAnchor="middle"
            className="fill-foreground text-xs font-medium"
          >
            Pickup
          </text>
          <title>Pickup Location</title>
        </g>

        {/* Dropoff location marker */}
        <g>
          <circle
            cx={dropoffPos.x}
            cy={dropoffPos.y}
            r="10"
            fill="hsl(var(--chart-2))"
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={dropoffPos.x}
            y={dropoffPos.y - 18}
            textAnchor="middle"
            className="fill-foreground text-xs font-medium"
          >
            Dropoff
          </text>
          <title>Dropoff Location</title>
        </g>
      </svg>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapIcon className="h-5 w-5 text-primary" />
          Route Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCalculating ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Calculating route...</p>
            </div>
          </div>
        ) : !routeData ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted">
            <p className="text-muted-foreground">Enter trip details to view route</p>
          </div>
        ) : (
          <div className="h-[400px] w-full">{renderMap()}</div>
        )}
      </CardContent>
    </Card>
  )
}
