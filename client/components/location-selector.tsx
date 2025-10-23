"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { MapPin, Navigation2, X, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useDebounce } from "use-debounce";

// ---------------------------------------------
// Custom Hook: Handles debounced search logic
// ---------------------------------------------
function useSearchSuggestions(
  query: string,
  handleSearch: (q: string) => Promise<any>
) {
  const [debouncedQuery] = useDebounce(query, 800);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);

  useMemo(() => {
    let active = true;

    const search = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        if (active) setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await handleSearch(debouncedQuery);
        if (active) setSuggestions(data?.locations || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    search();
    return () => {
      active = false;
    };
  }, [debouncedQuery, handleSearch]);

  return { suggestions, isSearching, setSuggestions };
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------
export default function LocationSelector() {
  const {
    startLocation,
    endLocation,
    cycleHours,
    setCycleHours,
    setPickupLocation,
    setStartLocation,
    setEndLocation,
    handleCalculateRoute,
    isCalculating,
    handleClearRoute,
    handleSearch,
  } = useAppStore();

  const [queries, setQueries] = useState({
    start: "",
    pickup: "",
    end: "",
  });

  // Custom hooks per input field
  const start = useSearchSuggestions(queries.start, handleSearch);
  const pickup = useSearchSuggestions(queries.pickup, handleSearch);
  const end = useSearchSuggestions(queries.end, handleSearch);

  // Handlers
  const handleQueryChange = useCallback((key: string, value: string) => {
    setQueries((prev) => ({ ...prev, [key]: value }));
  }, []);

  const selectLocation = useCallback(
    (key: "start" | "pickup" | "end", location: Location) => {
      if (key === "start") setStartLocation(location);
      if (key === "pickup") setPickupLocation(location);
      if (key === "end") setEndLocation(location);

      setQueries((prev) => ({ ...prev, [key]: location.name || "" }));

      if (key === "start") start.setSuggestions([]);
      if (key === "pickup") pickup.setSuggestions([]);
      if (key === "end") end.setSuggestions([]);
    },
    [setStartLocation, setPickupLocation, setEndLocation, start, pickup, end]
  );

  const clearLocation = useCallback(
    (key: "start" | "pickup" | "end") => {
      if (key === "start") setStartLocation(null);
      if (key === "pickup") setPickupLocation(null);
      if (key === "end") setEndLocation(null);
      setQueries((prev) => ({ ...prev, [key]: "" }));

      if (key === "start") start.setSuggestions([]);
      if (key === "pickup") pickup.setSuggestions([]);
      if (key === "end") end.setSuggestions([]);
    },
    [setStartLocation, setPickupLocation, setEndLocation, start, pickup, end]
  );

  return (
    <div className="space-y-4">
      {/* Start Location */}
      <MemoizedLocationInput
        id="start"
        label="Current Location"
        colorClass="bg-blue-500"
        icon={<MapPin className="h-4 w-4 text-white" />}
        query={queries.start}
        setQuery={(v) => handleQueryChange("start", v)}
        isSearching={start.isSearching}
        suggestions={start.suggestions}
        clear={() => clearLocation("start")}
        onSelect={(loc) => selectLocation("start", loc)}
      />

      {/* Pickup Location */}
      <MemoizedLocationInput
        id="pickup"
        label="Pickup Location"
        colorClass="bg-orange-500"
        icon={<MapPin className="h-4 w-4 text-white" />}
        query={queries.pickup}
        setQuery={(v) => handleQueryChange("pickup", v)}
        isSearching={pickup.isSearching}
        suggestions={pickup.suggestions}
        clear={() => clearLocation("pickup")}
        onSelect={(loc) => selectLocation("pickup", loc)}
      />

      {/* End Location */}
      <MemoizedLocationInput
        id="end"
        label="Drop-off Location"
        colorClass="bg-red-500"
        icon={<Navigation2 className="h-4 w-4 text-destructive-foreground" />}
        query={queries.end}
        setQuery={(v) => handleQueryChange("end", v)}
        isSearching={end.isSearching}
        suggestions={end.suggestions}
        clear={() => clearLocation("end")}
        onSelect={(loc) => selectLocation("end", loc)}
      />

      {/* Cycle Hours */}
      <div className="space-y-2">
        <Label
          htmlFor="cycleHours"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full">
            <Clock className="h-4 w-4" />
          </div>
          Current Cycle Usage (Hours)
        </Label>
        <Input
          id="cycleHours"
          type="number"
          min="0"
          max="70"
          step="0.5"
          placeholder="Enter hours used..."
          value={cycleHours || ""}
          onChange={(e) =>
            setCycleHours(Number.parseFloat(e.target.value) || 0)
          }
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Enter hours already used in your 70-hour/8-day cycle (0–70 hours)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleCalculateRoute}
          disabled={!startLocation || !endLocation || isCalculating}
          className="flex-1"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation2 className="mr-2 h-4 w-4" />
              Calculate Route
            </>
          )}
        </Button>
        <Button
          onClick={handleClearRoute}
          variant="outline"
          disabled={!startLocation && !endLocation}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Reusable Child Component (Memoized)
// ---------------------------------------------
const LocationInput = ({
  id,
  label,
  colorClass,
  icon,
  query,
  setQuery,
  isSearching,
  suggestions,
  clear,
  onSelect,
}: {
  id: string;
  label: string;
  colorClass: string;
  icon: React.ReactNode;
  query: string;
  setQuery: (v: string) => void;
  isSearching: boolean;
  suggestions: Location[];
  clear: () => void;
  onSelect: (location: Location) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass}`}
        >
          {icon}
        </div>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder="Enter city, address, or place..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-8"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
            {suggestions.map((location, i) => (
              <button
                key={i}
                onClick={() => onSelect(location)}
                className="w-full border-b border-border px-4 py-3 text-left text-sm hover:bg-accent last:border-b-0"
              >
                <div className="font-medium text-foreground">
                  {location.name}
                </div>
                {location.address && (
                  <div className="text-xs text-muted-foreground">
                    {location.address}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MemoizedLocationInput = memo(LocationInput);
