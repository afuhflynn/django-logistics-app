"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { RouteResult } from "@/lib/route-calculator";
import ELDChart from "./eld-chart";
import { useAppStore } from "@/lib/store";

export default function ELDLogs() {
  const { routeData, logEntries } = useAppStore();

  const hoursRemaining = routeData?.hoursRemaining!;

  if (!hoursRemaining || !logEntries || !routeData) return null;

  return (
    <Card className="bg-card w-120">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          Electronic Log Device (ELD) Sheet
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Hours of Service compliance tracking (70-hour/8-day rule)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Banner */}
        <div
          className={`mb-6 rounded-lg border p-4 ${
            hoursRemaining < 10
              ? "border-destructive/50 bg-destructive/10"
              : "border-accent/50 bg-accent/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {hoursRemaining < 10
                  ? "Warning: Low Hours Remaining"
                  : "Compliant"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hoursRemaining.toFixed(1)} hours remaining in current cycle
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {((hoursRemaining / 70) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ELDChart />

        {/* Log Entries Table */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Detailed Log Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">
                    Activity
                  </th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logEntries.map((entry, index) => (
                  <tr key={index}>
                    <td className="py-3 text-foreground">{entry.activity}</td>
                    <td className="py-3 text-foreground">
                      {entry.duration.toFixed(1)} hours
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          entry.type === "driving"
                            ? "bg-accent/20 text-accent"
                            : entry.type === "rest"
                            ? "bg-primary/20 text-primary"
                            : entry.type === "pickup"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
