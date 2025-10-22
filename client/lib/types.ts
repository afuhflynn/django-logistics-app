export interface Location {
  name: string
  address?: string
  lat: number
  lng: number
}

export interface Instruction {
  text: string
  type: string
  distance: number
}

export interface RouteData {
  distance: number
  duration: number
  geometry: {
    type: string
    coordinates: number[][]
  }
  instructions: Instruction[]
  cycleHours?: number
  hoursRemaining?: number
  canCompleteRoute?: boolean
}
