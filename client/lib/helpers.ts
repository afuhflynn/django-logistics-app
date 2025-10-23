import { LogEntry } from "./route-calculator";
import { ApiRoute, Step } from "./types";

// Helper function to convert step type to a more readable string for icons
export const getInstructionTypeString = (step: Step): string => {
  if (step.exit_number !== undefined) {
    return "roundabout";
  }
  switch (step.type) {
    case 0: // Straight, Continue
      return "continue";
    case 1: // Turn right
      return "turn-right";
    case 2: // Turn left
      return "turn-left";
    case 3: // U-turn (common type)
      return "u-turn";
    case 4: // Bear right
      return "bear-right";
    case 5: // Bear left
      return "bear-left";
    case 6: // Arrive
      return "arrive";
    case 7: // Enter roundabout (will be handled by exit_number, but good to have)
      return "roundabout";
    // Add more cases as needed based on your API's 'type' values
    // For now, any unknown type will default to 'continue'
    default:
      return "continue";
  }
};

export const formatDistance = (meters: number | undefined): string => {
  if (typeof meters !== "number" || isNaN(meters)) {
    return "N/A";
  }

  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatDuration = (seconds: number | undefined): string => {
  if (typeof seconds !== "number" || isNaN(seconds)) {
    return "N/A";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatInstruction = (instruction: string): string => {
  return instruction.replace(/,\s*-/g, "").replace(/\s+/g, " ").trim();
};

/**
 * Transforms the API route data into an array of LogEntry objects for the ELDChart.
 * This version attempts to infer activity types based on context, but may need
 * further refinement based on specific business rules for "rest", "pickup", "dropoff", "fuel".
 *
 * @param apiResponse The raw API response containing route data.
 * @returns An array of LogEntry objects suitable for the ELDChart.
 */
export function transformRouteDataToLogEntries(apiResponse: {
  routes: ApiRoute[];
}): LogEntry[] {
  const logEntries: LogEntry[] = [];

  if (!apiResponse.routes || apiResponse.routes.length === 0) {
    return [];
  }

  const primaryRoute = apiResponse.routes[0];

  // Iterate over each segment to create log entries
  primaryRoute.segments.forEach((segment, index) => {
    const durationHours = segment.duration / 3600; // Convert segment duration from seconds to hours

    // Default to driving. You'll need more sophisticated logic to determine
    // 'rest', 'pickup', 'dropoff', or 'fuel' based on your application's rules.
    let type: LogEntry["type"] = "driving";
    let activity = `Driving Segment ${index + 1}`;

    // --- CUSTOM LOGIC FOR INFERRING ACTIVITY TYPES ---
    // This is where you'd add your business logic to determine non-driving activities.
    // Examples:
    // 1. If you have specific waypoints marked as 'pickup' or 'dropoff':
    //    if (isPickupLocation(segment.startCoordinate) || isDropoffLocation(segment.endCoordinate)) {
    //      type = "pickup"; // or "dropoff"
    //      activity = "Customer Stop";
    //    }
    // 2. If you want to insert a rest period after a certain driving duration:
    //    if (segment.duration > SOME_THRESHOLD_FOR_REST) {
    //      // You might split this segment or insert a new one
    //    }
    // 3. If your API provides a 'type' for segments or steps directly:
    //    if (segment.type === "rest_area") { type = "rest"; activity = "Rest Stop"; }
    // 4. If you're manually inserting breaks:
    //    For a full route, you might estimate rest times. For example, if the route is very long,
    //    you could add an artificial "rest" LogEntry.

    // For demonstration, let's add a hypothetical pickup at the start and a dropoff at the end
    // and a single rest period if the route is long enough.
    // @ts-ignore
    if (index === 0 && primaryRoute.way_points.length > 2) {
      // Assuming the first segment might represent a "pickup" if there are multiple waypoints
      // This is a very loose interpretation; adjust based on your actual data.
      // We'll add a short pickup activity before the main driving.
      logEntries.push({
        activity: "Initial Pickup",
        duration: 0.25, // e.g., 15 minutes
        type: "pickup",
      });
    }

    logEntries.push({
      activity: activity,
      duration: durationHours,
      type: type,
    });

    // Hypothetical rest stop after a long driving segment
    if (
      durationHours > 4 &&
      index === Math.floor(primaryRoute.segments.length / 2)
    ) {
      logEntries.push({
        activity: "Driver Rest",
        duration: 0.5, // e.g., 30 minutes rest
        type: "rest",
      });
    }

    // @t
    if (
      index === primaryRoute.segments.length - 1 &&
      primaryRoute.way_points.length > 2
    ) {
      // Assuming the last segment might lead to a "dropoff"
      // We'll add a short dropoff activity after the main driving.
      logEntries.push({
        activity: "Final Dropoff",
        duration: 0.25, // e.g., 15 minutes
        type: "dropoff",
      });
    }

    // --- END CUSTOM LOGIC ---
  });

  return logEntries;
}
