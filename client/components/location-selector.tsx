"use client"

import { useState } from "react"
import { MapPin, Navigation2, X, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { searchLocation } from "@/app/actions"
import type { Location } from "@/lib/types"

interface LocationSelectorProps {
  startLocation: Location | null
  endLocation: Location | null
  onStartLocationChange: (location: Location | null) => void
  onEndLocationChange: (location: Location | null) => void
  onCalculateRoute: () => void
  onClearRoute: () => void
  isCalculating: boolean
  cycleHours: number
  onCycleHoursChange: (hours: number) => void
}

export default function LocationSelector({
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  onCalculateRoute,
  onClearRoute,
  isCalculating,
  cycleHours,
  onCycleHoursChange,
}: LocationSelectorProps) {
  const [startQuery, setStartQuery] = useState("")
  const [endQuery, setEndQuery] = useState("")
  const [startSuggestions, setStartSuggestions] = useState<Location[]>([])
  const [endSuggestions, setEndSuggestions] = useState<Location[]>([])
  const [isSearchingStart, setIsSearchingStart] = useState(false)
  const [isSearchingEnd, setIsSearchingEnd] = useState(false)

  const handleStartSearch = async (query: string) => {
    setStartQuery(query)

    if (query.length < 3) {
      setStartSuggestions([])
      return
    }

    setIsSearchingStart(true)
    try {
      const results = await searchLocation(query)
      setStartSuggestions(results)
    } catch (error) {
      console.error("[v0] Start location search error:", error)
    } finally {
      setIsSearchingStart(false)
    }
  }

  const handleEndSearch = async (query: string) => {
    setEndQuery(query)

    if (query.length < 3) {
      setEndSuggestions([])
      return
    }

    setIsSearchingEnd(true)
    try {
      const results = await searchLocation(query)
      setEndSuggestions(results)
    } catch (error) {
      console.error("[v0] End location search error:", error)
    } finally {
      setIsSearchingEnd(false)
    }
  }

  const selectStartLocation = (location: Location) => {
    onStartLocationChange(location)
    setStartQuery(location.name)
    setStartSuggestions([])
  }

  const selectEndLocation = (location: Location) => {
    onEndLocationChange(location)
    setEndQuery(location.name)
    setEndSuggestions([])
  }

  const clearStart = () => {
    onStartLocationChange(null)
    setStartQuery("")
    setStartSuggestions([])
  }

  const clearEnd = () => {
    onEndLocationChange(null)
    setEndQuery("")
    setEndSuggestions([])
  }

  return (
    <div className="space-y-4">
      {/* Start Location */}
      <div className="space-y-2">
        <Label htmlFor="start" className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
            <MapPin className="h-4 w-4 text-accent-foreground" />
          </div>
          Current Location
        </Label>
        <div className="relative">
          <Input
            id="start"
            type="text"
            placeholder="Enter city, address, or place..."
            value={startQuery}
            onChange={(e) => handleStartSearch(e.target.value)}
            className="pr-8"
          />
          {startQuery && (
            <button
              onClick={clearStart}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearchingStart && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {startSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
              {startSuggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => selectStartLocation(location)}
                  className="w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent last:border-b-0"
                >
                  <div className="font-medium text-foreground">{location.name}</div>
                  {location.address && <div className="text-xs text-muted-foreground">{location.address}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pickup Location */}
      <div className="space-y-2">
        <Label htmlFor="pickup" className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          Pickup Location
        </Label>
        <div className="relative">
          <Input
            id="pickup"
            type="text"
            placeholder="Enter pickup location..."
            value={startQuery}
            onChange={(e) => handleStartSearch(e.target.value)}
            className="pr-8"
          />
          {startQuery && (
            <button
              onClick={clearStart}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearchingStart && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {startSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
              {startSuggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => selectStartLocation(location)}
                  className="w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent last:border-b-0"
                >
                  <div className="font-medium text-foreground">{location.name}</div>
                  {location.address && <div className="text-xs text-muted-foreground">{location.address}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* End Location */}
      <div className="space-y-2">
        <Label htmlFor="end" className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive">
            <Navigation2 className="h-4 w-4 text-destructive-foreground" />
          </div>
          Drop-off Location
        </Label>
        <div className="relative">
          <Input
            id="end"
            type="text"
            placeholder="Enter city, address, or place..."
            value={endQuery}
            onChange={(e) => handleEndSearch(e.target.value)}
            className="pr-8"
          />
          {endQuery && (
            <button
              onClick={clearEnd}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isSearchingEnd && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {endSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
              {endSuggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => selectEndLocation(location)}
                  className="w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent last:border-b-0"
                >
                  <div className="font-medium text-foreground">{location.name}</div>
                  {location.address && <div className="text-xs text-muted-foreground">{location.address}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cycle Hours */}
      <div className="space-y-2">
        <Label htmlFor="cycleHours" className="flex items-center gap-2 text-sm font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
            <Clock className="h-4 w-4 text-white" />
          </div>
          Current Cycle Usage (Hours)
        </Label>
        <Input
          id="cycleHours"
          type="number"
          min="0"
          max="70"
          step="0.5"
          placeholder="Enter hours used in current cycle..."
          value={cycleHours || ""}
          onChange={(e) => onCycleHoursChange(Number.parseFloat(e.target.value) || 0)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Enter hours already used in your 70-hour/8-day cycle (0-70 hours)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={onCalculateRoute}
          disabled={!startLocation || !endLocation || isCalculating}
          className="flex-1"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation2 className="mr-2 h-4 w-4" />
              Calculate Route
            </>
          )}
        </Button>
        <Button onClick={onClearRoute} variant="outline" disabled={!startLocation && !endLocation}>
          Clear
        </Button>
      </div>
    </div>
  )
}
