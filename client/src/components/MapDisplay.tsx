import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import {
  createMap,
  flyToLocation,
  addMarkerToMap,
  removeMarker,
  resizeMap,
  destroyMap,
  initMapbox,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  PROPERTY_ZOOM,
} from "@/lib/mapbox";
import type { Coordinates } from "@shared/schema";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS
// =============================================================================

interface MapDisplayProps {
  /** Coordinates to display (marker position) */
  coordinates?: Coordinates | null;
  /** Initial center if no coordinates provided */
  initialCenter?: [number, number];
  /** Initial zoom level */
  initialZoom?: number;
  /** Zoom level when showing a property */
  propertyZoom?: number;
  /** Whether to animate to new positions */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Map height */
  height?: string;
  /** Whether the map is interactive */
  interactive?: boolean;
  /** Callback when map is loaded */
  onLoad?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MapDisplay({
  coordinates,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  propertyZoom = PROPERTY_ZOOM,
  animate = true,
  animationDuration = 1000,
  className,
  height = "100%",
  interactive = true,
  onLoad,
}: MapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Initialize Mapbox token
      initMapbox();

      // Create the map
      const map = createMap({
        container: containerRef.current,
        center: initialCenter,
        zoom: initialZoom,
        interactive,
      });

      mapRef.current = map;

      // Handle map load
      map.on("load", () => {
        setIsLoaded(true);
        onLoad?.();
      });

      // Handle errors
      map.on("error", (e) => {
        console.error("Mapbox error:", e);
        setError("Failed to load map");
      });

      // Cleanup on unmount
      return () => {
        if (markerRef.current) {
          removeMarker(markerRef.current);
          markerRef.current = null;
        }
        destroyMap(map);
        mapRef.current = null;
      };
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map");
    }
  }, [initialCenter, initialZoom, interactive, onLoad]);

  // Handle coordinates changes
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    if (coordinates) {
      // Remove existing marker
      if (markerRef.current) {
        removeMarker(markerRef.current);
      }

      // Add new marker
      markerRef.current = addMarkerToMap(map, coordinates);

      // Navigate to the location
      if (animate) {
        flyToLocation(map, coordinates, {
          zoom: propertyZoom,
          duration: animationDuration,
        });
      } else {
        map.jumpTo({
          center: [coordinates.lng, coordinates.lat],
          zoom: propertyZoom,
        });
      }
    } else {
      // Remove marker if coordinates cleared
      if (markerRef.current) {
        removeMarker(markerRef.current);
        markerRef.current = null;
      }
    }
  }, [coordinates, isLoaded, animate, animationDuration, propertyZoom]);

  // Handle container resize
  const handleResize = useCallback(() => {
    if (mapRef.current && isLoaded) {
      resizeMap(mapRef.current);
    }
  }, [isLoaded]);

  // Observe container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          className
        )}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("rounded-lg overflow-hidden", className)}
      style={{ height, minHeight: "300px" }}
    />
  );
}
