"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

export default function ELDChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { logEntries } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    // Calculate total hours
    const totalHours = logEntries.reduce(
      (sum, entry) => sum + entry.duration,
      0
    );
    const hoursPerPixel = totalHours / chartWidth;

    // Draw background grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight / 10) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Draw time segments
    let currentX = padding;
    logEntries.forEach((entry) => {
      const segmentWidth = entry.duration / hoursPerPixel;

      // Set color based on type
      let color = "rgba(148, 163, 184, 0.5)"; // default
      if (entry.type === "driving") {
        color = "rgba(34, 197, 94, 0.8)"; // green
      } else if (entry.type === "rest") {
        color = "rgba(59, 130, 246, 0.8)"; // blue
      } else if (entry.type === "pickup" || entry.type === "dropoff") {
        color = "rgba(249, 115, 22, 0.8)"; // orange
      }

      ctx.fillStyle = color;
      ctx.fillRect(currentX, padding, segmentWidth, chartHeight);

      // Draw border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, padding, segmentWidth, chartHeight);

      currentX += segmentWidth;
    });

    // Draw axes
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "rgb(148, 163, 184)";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time (hours)", rect.width / 2, rect.height - 10);

    // Draw hour markers
    const hourMarkers = Math.ceil(totalHours / 5);
    for (let i = 0; i <= hourMarkers; i++) {
      const hours = i * 5;
      const x = padding + hours / hoursPerPixel;
      if (x <= rect.width - padding) {
        ctx.fillText(hours.toString(), x, rect.height - padding + 20);
      }
    }
  }, [logEntries]);

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <canvas ref={canvasRef} className="w-full" style={{ height: "200px" }} />
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-accent" />
          <span className="text-muted-foreground">Driving</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-muted-foreground">Rest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-secondary" />
          <span className="text-muted-foreground">Pickup/Dropoff</span>
        </div>
      </div>
    </div>
  );
}
