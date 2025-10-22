export interface TripData {
  currentLocation: string
  pickupLocation: string
  dropoffLocation: string
  currentCycleUsed: number
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface RouteCoordinates {
  current: Coordinates
  pickup: Coordinates
  dropoff: Coordinates
}

export interface FuelStop {
  coordinates: Coordinates
  distance: number
}

export interface RouteSegment {
  from: string
  to: string
  distance: number
  duration: number
}

export interface LogEntry {
  activity: string
  duration: number
  type: "driving" | "rest" | "pickup" | "dropoff" | "fuel"
}

export interface RouteResult {
  coordinates: RouteCoordinates
  totalDistance: number
  totalHours: number
  hoursRemaining: number
  fuelStops: FuelStop[]
  segments: RouteSegment[]
  logEntries: LogEntry[]
}

// Simulated geocoding - maps city names to approximate coordinates
const cityCoordinates: Record<string, Coordinates> = {
  "chicago, il": { lat: 41.8781, lng: -87.6298 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  "denver, co": { lat: 39.7392, lng: -104.9903 },
  denver: { lat: 39.7392, lng: -104.9903 },
  "los angeles, ca": { lat: 34.0522, lng: -118.2437 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "new york, ny": { lat: 40.7128, lng: -74.006 },
  "new york": { lat: 40.7128, lng: -74.006 },
  "miami, fl": { lat: 25.7617, lng: -80.1918 },
  miami: { lat: 25.7617, lng: -80.1918 },
  "seattle, wa": { lat: 47.6062, lng: -122.3321 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  "dallas, tx": { lat: 32.7767, lng: -96.797 },
  dallas: { lat: 32.7767, lng: -96.797 },
  "atlanta, ga": { lat: 33.749, lng: -84.388 },
  atlanta: { lat: 33.749, lng: -84.388 },
  "phoenix, az": { lat: 33.4484, lng: -112.074 },
  phoenix: { lat: 33.4484, lng: -112.074 },
  "boston, ma": { lat: 42.3601, lng: -71.0589 },
  boston: { lat: 42.3601, lng: -71.0589 },
}

function geocode(location: string): Coordinates {
  const normalized = location.toLowerCase().trim()
  return cityCoordinates[normalized] || { lat: 39.8283, lng: -98.5795 } // Default to center of US
}

function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  // Haversine formula for distance calculation
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function calculateFuelStops(start: Coordinates, end: Coordinates, distance: number): FuelStop[] {
  const stops: FuelStop[] = []
  const fuelStopInterval = 1000 // miles
  const numStops = Math.floor(distance / fuelStopInterval)

  for (let i = 1; i <= numStops; i++) {
    const ratio = i / (numStops + 1)
    const stopCoord: Coordinates = {
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    }
    stops.push({
      coordinates: stopCoord,
      distance: i * fuelStopInterval,
    })
  }

  return stops
}

export function calculateRoute(tripData: TripData): RouteResult {
  const { currentLocation, pickupLocation, dropoffLocation, currentCycleUsed } = tripData

  // Geocode locations
  const currentCoord = geocode(currentLocation)
  const pickupCoord = geocode(pickupLocation)
  const dropoffCoord = geocode(dropoffLocation)

  // Calculate distances
  const distanceToPickup = calculateDistance(currentCoord, pickupCoord)
  const distanceToDropoff = calculateDistance(pickupCoord, dropoffCoord)
  const totalDistance = distanceToPickup + distanceToDropoff

  // Calculate driving hours (assuming average speed of 55 mph)
  const avgSpeed = 55
  const drivingHoursToPickup = distanceToPickup / avgSpeed
  const drivingHoursToDropoff = distanceToDropoff / avgSpeed

  // Calculate fuel stops
  const fuelStopsToPickup = calculateFuelStops(currentCoord, pickupCoord, distanceToPickup)
  const fuelStopsToDropoff = calculateFuelStops(pickupCoord, dropoffCoord, distanceToDropoff)
  const allFuelStops = [...fuelStopsToPickup, ...fuelStopsToDropoff]

  // Calculate rest periods (10-hour break after 11 hours of driving)
  const maxDrivingHours = 11
  const restPeriodHours = 10
  const pickupDropoffHours = 1

  // Build log entries
  const logEntries: LogEntry[] = []
  let remainingDrivingHours = drivingHoursToPickup
  let totalHours = 0

  // Drive to pickup
  while (remainingDrivingHours > 0) {
    const drivingSegment = Math.min(remainingDrivingHours, maxDrivingHours)
    logEntries.push({
      activity: "Driving to pickup",
      duration: drivingSegment,
      type: "driving",
    })
    totalHours += drivingSegment
    remainingDrivingHours -= drivingSegment

    if (remainingDrivingHours > 0) {
      logEntries.push({
        activity: "Rest period",
        duration: restPeriodHours,
        type: "rest",
      })
      totalHours += restPeriodHours
    }
  }

  // Pickup
  logEntries.push({
    activity: "Pickup cargo",
    duration: pickupDropoffHours,
    type: "pickup",
  })
  totalHours += pickupDropoffHours

  // Drive to dropoff
  remainingDrivingHours = drivingHoursToDropoff
  while (remainingDrivingHours > 0) {
    const drivingSegment = Math.min(remainingDrivingHours, maxDrivingHours)
    logEntries.push({
      activity: "Driving to dropoff",
      duration: drivingSegment,
      type: "driving",
    })
    totalHours += drivingSegment
    remainingDrivingHours -= drivingSegment

    if (remainingDrivingHours > 0) {
      logEntries.push({
        activity: "Rest period",
        duration: restPeriodHours,
        type: "rest",
      })
      totalHours += restPeriodHours
    }
  }

  // Dropoff
  logEntries.push({
    activity: "Dropoff cargo",
    duration: pickupDropoffHours,
    type: "dropoff",
  })
  totalHours += pickupDropoffHours

  // Calculate hours remaining (70-hour/8-day rule)
  const maxCycleHours = 70
  const totalDrivingHours = logEntries.filter((e) => e.type === "driving").reduce((sum, e) => sum + e.duration, 0)
  const hoursRemaining = maxCycleHours - currentCycleUsed - totalDrivingHours

  return {
    coordinates: {
      current: currentCoord,
      pickup: pickupCoord,
      dropoff: dropoffCoord,
    },
    totalDistance,
    totalHours,
    hoursRemaining,
    fuelStops: allFuelStops,
    segments: [
      {
        from: currentLocation,
        to: pickupLocation,
        distance: distanceToPickup,
        duration: drivingHoursToPickup,
      },
      {
        from: pickupLocation,
        to: dropoffLocation,
        distance: distanceToDropoff,
        duration: drivingHoursToDropoff,
      },
    ],
    logEntries,
  }
}
