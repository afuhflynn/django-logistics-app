import { create } from "zustand";
import { ApiRoute, Instruction, Location, RouteData } from "./types";
import { privateAxios } from "./private-axios";
import { getInstructionTypeString } from "./helpers";

interface StoreTypes {
  startLocation: Location | null;
  setStartLocation: (startLocation: Location | null) => void;
  pickupLocation: Location | null;
  setPickupLocation: (pickupLocation: Location | null) => void;
  endLocation: Location | null;
  setEndLocation: (endLocation: Location | null) => void;

  routeData: RouteData | null;
  setRouteData: (routeData: RouteData | null) => void;
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  cycleHours: number;
  setCycleHours: (cycleHours: number) => void;
  handleCalculateRoute: () => Promise<void>;
  handleClearRoute: () => void;
  handleSearch: (
    query: string
  ) => Promise<{ locations: Location[] } | undefined>;
}

export const useAppStore = create<StoreTypes>((set, get) => ({
  startLocation: null,
  setStartLocation(startLocation) {
    set({ startLocation });
  },
  pickupLocation: null,
  setPickupLocation(pickupLocation) {
    set({ pickupLocation });
  },
  endLocation: null,
  setEndLocation(endLocation) {
    set({ endLocation });
  },
  routeData: null,
  setRouteData(routeData) {
    set({ routeData });
  },
  isCalculating: false,
  setIsCalculating(value) {
    set({ isCalculating: value });
  },
  loading: false,
  setLoading(loading) {
    set({ loading });
  },
  error: null,
  setError(error) {
    set({ error });
  },
  cycleHours: 0,
  setCycleHours(cycleHours) {
    set({ cycleHours });
  },

  handleCalculateRoute: async () => {
    const {
      startLocation,
      endLocation,
      setError,
      cycleHours,
      setIsCalculating,
      pickupLocation,
      setRouteData,
    } = get();
    if (!startLocation || !endLocation) {
      setError("Please select both pickup and drop-off locations");
      return;
    }

    if (cycleHours < 0 || cycleHours > 70) {
      setError("Cycle hours must be between 0 and 70");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Perform the actual API call
      const result = await privateAxios.post<{ routes: ApiRoute[] }>(
        `/calculate-route/`,
        {
          start: startLocation,
          end: endLocation,
          pickup: pickupLocation,
        }
      );
      const apiResponse = result.data;

      console.log({ apiResponse });

      if (
        !apiResponse ||
        !apiResponse.routes ||
        apiResponse.routes.length === 0
      ) {
        setError("No route found between the selected locations.");
        setRouteData(null);
        return;
      }

      const primaryRoute = apiResponse.routes[0]; // Assuming you want the first route
      const totalDistance = primaryRoute.summary.distance;
      const totalDuration = primaryRoute.summary.duration;

      const flattenedInstructions: Instruction[] =
        primaryRoute.segments.flatMap((segment) =>
          segment.steps.map((step) => ({
            type: {
              text: getInstructionTypeString(step),
              digit: step.type,
            },
            text: step.instruction,
            distance: step.distance,
            duration: step.duration,
            name: step.name,
          }))
        );

      const hoursRemaining = 70 - cycleHours;
      const routeHours = totalDuration / 3600; // Convert seconds to hours

      setRouteData({
        distance: totalDistance,
        duration: totalDuration,
        instructions: flattenedInstructions,
        geometry: primaryRoute.geometry,
        cycleHours,
        hoursRemaining,
        canCompleteRoute: routeHours <= hoursRemaining,
      });
    } catch (err) {
      setError("Failed to calculate route. Please try again.");
      console.error("[RoutePlanningApp] Route calculation error:", err);
      setRouteData(null);
    } finally {
      setIsCalculating(false);
    }
  },
  handleClearRoute: () => {
    const {
      setStartLocation,
      setEndLocation,
      setRouteData,
      setError,
      setCycleHours,
    } = useAppStore();
    setStartLocation(null);
    setEndLocation(null);
    setRouteData(null);
    setError(null);
    setCycleHours(0);
  },
  handleSearch: async (query: string) => {
    try {
      const results = await privateAxios.post<{ locations: Location[] }>(
        "/search-location/",
        {
          query,
        }
      );
      console.log({ data: results.data });
      return results.data;
    } catch (error: Error | any) {
      console.error("Location search error:", error);
      throw new Error(error);
    }
  },
}));
