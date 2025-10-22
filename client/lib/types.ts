// src/lib/types.ts

export interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface Step {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: number[];
  exit_number?: number; // For roundabouts
}

export interface Segment {
  distance: number;
  duration: number;
  steps: Step[];
}

export interface RouteSummary {
  distance: number;
  duration: number;
}

export interface Geometry {
  coordinates: [number, number][]; // Array of [lng, lat]
  // Other geometry properties if present
}

export interface Route {
  summary: RouteSummary;
  segments: Segment[];
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  geometry: Geometry;
}

// This will be the structure you receive after processing the API response
export interface RouteData {
  bbox?: number[];
  routes?: Route[];
  distance: number;
  duration: number;
  instructions: Instruction[];
  metadata?: {
    attribution: string;
    service: string;
    timestamp: number;
    query: {
      coordinates: number[][];
      profile: string;
      profileName: string;
      format: string;
    };
    engine: {
      version: string;
      build_date: string;
      graph_date: string;
      osm_date: string;
    };
  };
  geometry: Geometry;
  cycleHours: number;
  hoursRemaining: number;
  canCompleteRoute: boolean;
}

// For the NavigationPanel
export type Instruction = {
  type: {
    text: string;
    digit: number;
  };
  text: string;
  distance: number;
  duration: number;
  name: string;
};

// This is the structure of a single route object within the 'routes' array from your API
export interface ApiRoute {
  summary: RouteSummary;
  segments: Segment[];
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  geometry: Geometry;
}

export type NavigationInstruction = Step;

export interface MapViewProps {
  startLocation: Location | null;
  pickupLocation: Location | null;
  endLocation: Location | null;
  routeData: RouteData | null;
  apiResponse: RouteData; // This prop seems unused in the component logic. Consider removing if not needed.
  isCalculating: boolean;
}

export type MapLibreGL = {
  Map: any;
  Marker: any;
  LngLatBounds: any;
  NavigationControl: any;
  GeolocateControl: any;
  Popup: any;
};
