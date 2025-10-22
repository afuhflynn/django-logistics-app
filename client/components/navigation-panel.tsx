"use client"

import { ArrowRight, ArrowLeft, ArrowUp, RotateCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Instruction } from "@/lib/types"

interface NavigationPanelProps {
  instructions: Instruction[]
}

export default function NavigationPanel({ instructions }: NavigationPanelProps) {
  const getDirectionIcon = (type: string) => {
    switch (type) {
      case "turn-right":
      case "bear-right":
        return <ArrowRight className="h-4 w-4" />
      case "turn-left":
      case "bear-left":
        return <ArrowLeft className="h-4 w-4" />
      case "continue":
      case "straight":
        return <ArrowUp className="h-4 w-4" />
      case "roundabout":
        return <RotateCw className="h-4 w-4" />
      default:
        return <ArrowUp className="h-4 w-4" />
    }
  }

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371
    return miles >= 0.1 ? `${miles.toFixed(1)} mi` : `${meters.toFixed(0)} ft`
  }

  return (
    <div className="flex-1 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Turn-by-Turn Navigation</h3>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {getDirectionIcon(instruction.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">{instruction.text}</p>
                <p className="text-xs text-muted-foreground">{formatDistance(instruction.distance)}</p>
              </div>
              <div className="flex-shrink-0 text-xs font-medium text-muted-foreground">{index + 1}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
