/**
 * Mapbox GL JS Integration
 * https://docs.mapbox.com/mapbox-gl-js/
 */

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Coordinates } from "@shared/schema";

// =============================================================================
// TYPES
// =============================================================================

export interface MapConfig {
  container: HTMLElement | string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  style?: string;
  interactive?: boolean;
}

export interface MapInstance {
  map: mapboxgl.Map;
  marker: mapboxgl.Marker | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Default center: Auckland, New Zealand
export const DEFAULT_CENTER: [number, number] = [174.7645, -36.8509];
export const DEFAULT_ZOOM = 11;
export const PROPERTY_ZOOM = 15;

// Custom map style (or use default Mapbox style)
export const DEFAULT_STYLE = "mapbox://styles/mapbox/streets-v12";

// Brand color for markers
export const MARKER_COLOR = "#00AEEF";

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Set the Mapbox access token
 */
export function setMapboxAccessToken(token: string): void {
  mapboxgl.accessToken = token;
}

/**
 * Get the Mapbox access token from environment variables
 */
export function getMapboxAccessToken(): string {
  return import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
}

/**
 * Initialize Mapbox with the access token from env
 */
export function initMapbox(): void {
  const token = getMapboxAccessToken();
  if (token) {
    setMapboxAccessToken(token);
  } else {
    console.warn("Mapbox access token not found. Map features will be disabled.");
  }
}

// =============================================================================
// MAP CREATION
// =============================================================================

/**
 * Create a new Mapbox map instance
 */
export function createMap(config: MapConfig): mapboxgl.Map {
  // Ensure token is set
  if (!mapboxgl.accessToken) {
    initMapbox();
  }

  const map = new mapboxgl.Map({
    container: config.container,
    style: config.style ?? DEFAULT_STYLE,
    center: config.center ?? DEFAULT_CENTER,
    zoom: config.zoom ?? DEFAULT_ZOOM,
    interactive: config.interactive ?? true,
    attributionControl: true,
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  return map;
}

// =============================================================================
// MARKER MANAGEMENT
// =============================================================================

/**
 * Create a marker at the specified coordinates
 */
export function createMarker(
  coordinates: Coordinates,
  options?: {
    color?: string;
    draggable?: boolean;
  }
): mapboxgl.Marker {
  const marker = new mapboxgl.Marker({
    color: options?.color ?? MARKER_COLOR,
    draggable: options?.draggable ?? false,
  }).setLngLat([coordinates.lng, coordinates.lat]);

  return marker;
}

/**
 * Add a marker to the map
 */
export function addMarkerToMap(
  map: mapboxgl.Map,
  coordinates: Coordinates,
  options?: {
    color?: string;
    draggable?: boolean;
  }
): mapboxgl.Marker {
  const marker = createMarker(coordinates, options);
  marker.addTo(map);
  return marker;
}

/**
 * Update marker position
 */
export function updateMarkerPosition(
  marker: mapboxgl.Marker,
  coordinates: Coordinates
): void {
  marker.setLngLat([coordinates.lng, coordinates.lat]);
}

/**
 * Remove marker from map
 */
export function removeMarker(marker: mapboxgl.Marker): void {
  marker.remove();
}

// =============================================================================
// MAP NAVIGATION
// =============================================================================

/**
 * Fly to a location with animation
 */
export function flyToLocation(
  map: mapboxgl.Map,
  coordinates: Coordinates,
  options?: {
    zoom?: number;
    duration?: number;
  }
): void {
  map.flyTo({
    center: [coordinates.lng, coordinates.lat],
    zoom: options?.zoom ?? PROPERTY_ZOOM,
    duration: options?.duration ?? 1000,
    essential: true,
  });
}

/**
 * Jump to a location instantly (no animation)
 */
export function jumpToLocation(
  map: mapboxgl.Map,
  coordinates: Coordinates,
  zoom?: number
): void {
  map.jumpTo({
    center: [coordinates.lng, coordinates.lat],
    zoom: zoom ?? PROPERTY_ZOOM,
  });
}

/**
 * Fit the map to show multiple coordinates
 */
export function fitBounds(
  map: mapboxgl.Map,
  coordinates: Coordinates[],
  options?: {
    padding?: number;
    maxZoom?: number;
  }
): void {
  if (coordinates.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();
  coordinates.forEach((coord) => {
    bounds.extend([coord.lng, coord.lat]);
  });

  map.fitBounds(bounds, {
    padding: options?.padding ?? 50,
    maxZoom: options?.maxZoom ?? PROPERTY_ZOOM,
  });
}

// =============================================================================
// MAP CLEANUP
// =============================================================================

/**
 * Properly cleanup and destroy a map instance
 */
export function destroyMap(map: mapboxgl.Map): void {
  map.remove();
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if Mapbox is supported in the current browser
 */
export function isMapboxSupported(): boolean {
  return mapboxgl.supported();
}

/**
 * Resize the map (useful when container size changes)
 */
export function resizeMap(map: mapboxgl.Map): void {
  map.resize();
}
