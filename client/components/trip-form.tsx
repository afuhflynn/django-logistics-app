"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Package, Clock } from "lucide-react"
import type { TripData } from "@/lib/route-calculator"

interface TripFormProps {
  onSubmit: (data: TripData) => void
  isCalculating: boolean
}

export default function TripForm({ onSubmit, isCalculating }: TripFormProps) {
  const [formData, setFormData] = useState<TripData>({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    currentCycleUsed: 0,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TripData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TripData, string>> = {}

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = "Current location is required"
    }
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = "Pickup location is required"
    }
    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = "Dropoff location is required"
    }
    if (formData.currentCycleUsed < 0 || formData.currentCycleUsed > 70) {
      newErrors.currentCycleUsed = "Hours must be between 0 and 70"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof TripData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Plan Your Trip</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter trip details to calculate route and compliance logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Location */}
          <div className="space-y-2">
            <Label htmlFor="currentLocation" className="flex items-center gap-2 text-foreground">
              <Navigation className="h-4 w-4 text-primary" />
              Current Location
            </Label>
            <Input
              id="currentLocation"
              placeholder="e.g., Chicago, IL"
              value={formData.currentLocation}
              onChange={(e) => handleChange("currentLocation", e.target.value)}
              className={errors.currentLocation ? "border-destructive" : ""}
            />
            {errors.currentLocation && <p className="text-sm text-destructive">{errors.currentLocation}</p>}
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <Label htmlFor="pickupLocation" className="flex items-center gap-2 text-foreground">
              <Package className="h-4 w-4 text-accent" />
              Pickup Location
            </Label>
            <Input
              id="pickupLocation"
              placeholder="e.g., Denver, CO"
              value={formData.pickupLocation}
              onChange={(e) => handleChange("pickupLocation", e.target.value)}
              className={errors.pickupLocation ? "border-destructive" : ""}
            />
            {errors.pickupLocation && <p className="text-sm text-destructive">{errors.pickupLocation}</p>}
          </div>

          {/* Dropoff Location */}
          <div className="space-y-2">
            <Label htmlFor="dropoffLocation" className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-secondary" />
              Dropoff Location
            </Label>
            <Input
              id="dropoffLocation"
              placeholder="e.g., Los Angeles, CA"
              value={formData.dropoffLocation}
              onChange={(e) => handleChange("dropoffLocation", e.target.value)}
              className={errors.dropoffLocation ? "border-destructive" : ""}
            />
            {errors.dropoffLocation && <p className="text-sm text-destructive">{errors.dropoffLocation}</p>}
          </div>

          {/* Current Cycle Used */}
          <div className="space-y-2">
            <Label htmlFor="currentCycleUsed" className="flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Current Cycle Used (hours)
            </Label>
            <Input
              id="currentCycleUsed"
              type="number"
              min="0"
              max="70"
              step="0.5"
              placeholder="0"
              value={formData.currentCycleUsed}
              onChange={(e) => handleChange("currentCycleUsed", Number.parseFloat(e.target.value) || 0)}
              className={errors.currentCycleUsed ? "border-destructive" : ""}
            />
            {errors.currentCycleUsed && <p className="text-sm text-destructive">{errors.currentCycleUsed}</p>}
            <p className="text-xs text-muted-foreground">Maximum 70 hours over 8 days</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating Route..." : "Calculate Route"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
