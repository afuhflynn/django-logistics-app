"use client";

import { Clock, Navigation, MapPin, ArrowRight } from "lucide-react"; // Added ArrowRight for instructions
import { useAppStore } from "@/lib/store";
import {
  formatDistance,
  formatDuration,
  formatInstruction,
} from "@/lib/helpers";

export default function RouteDetails() {
  const { routeData, startLocation, endLocation } = useAppStore();

  if (!routeData) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p className="text-sm">
          Enter start and end locations to see route details
        </p>
      </div>
    );
  }

  // Extract data directly from the apiResponse
  const totalDistance = routeData.distance;
  const totalDuration = routeData.duration;
  const allInstructions = routeData.instructions;

  return (
    <div className="flex flex-col h-full">
      {/* Route Summary */}
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-sm font-medium truncate">
              {startLocation?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">To</p>
            <p className="text-sm font-medium truncate">{endLocation?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-semibold">
                {formatDistance(totalDistance)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">
                {formatDuration(totalDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-turn Directions */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-semibold mb-3">Directions</h3>
        {allInstructions.length > 0 ? (
          <ol className="space-y-3 overflow-auto">
            {allInstructions.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <ArrowRight className="h-4 w-4 mt-1 text-gray-500 shrink-0" />
                <div>
                  <p className="text-sm">
                    {formatInstruction(step.text)}{" "}
                    {/* Use step.text for instruction */}
                  </p>
                  {step.name && step.name !== "-" && (
                    <p className="text-xs text-muted-foreground">
                      On: {step.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ({formatDistance(step.distance)})
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No detailed instructions available.
          </p>
        )}
      </div>
    </div>
  );
}
