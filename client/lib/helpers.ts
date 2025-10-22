import { Step } from "./types";

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
