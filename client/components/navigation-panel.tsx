"use client";

import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  RotateCw,
  Navigation,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { formatDistance, formatDuration } from "@/lib/helpers";

// Helper to choose the correct icon based on instruction type (numerical from API)
const getDirectionIcon = (type: number) => {
  switch (type) {
    case 0: // Continue, go straight
    case 11: // Head on (e.g., "Head southeast")
      return <ArrowUp className="h-5 w-5" />;
    case 1: // Turn right, bear right
      return <ArrowRight className="h-5 w-5" />;
    case 2: // Turn left, bear left
      return <ArrowLeft className="h-5 w-5" />;
    case 7: // Enter roundabout
      return <RotateCw className="h-5 w-5" />;
    default:
      return <ArrowUp className="h-5 w-5" />; // Default to straight/continue
  }
};

export default function NavigationPanel() {
  const { routeData } = useAppStore();

  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Navigation className="h-4 w-4" />
        Turn-by-Turn Navigation
      </h3>
      <ScrollArea className="h-[calc(100vh-500px)]">
        <div className="space-y-3 pr-4">
          {routeData?.instructions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No navigation instructions available.
            </p>
          ) : (
            routeData?.instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex gap-3 pb-3 border-b last:border-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {index + 1}
                  </div>
                  {index < routeData?.instructions.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 mt-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium mb-1">
                    <span className="inline-flex items-center gap-1 mr-1">
                      {getDirectionIcon(instruction.type.digit)}
                    </span>
                    {instruction.text}
                  </p>
                  {instruction.name &&
                    instruction.name !== "-" && ( // Check for actual name
                      <p className="text-xs text-muted-foreground mb-1">
                        on {instruction.name}
                      </p> // Use step.name for road name
                    )}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatDistance(instruction.distance)}</span>
                    <span>•</span>
                    <span>{formatDuration(instruction.duration)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
