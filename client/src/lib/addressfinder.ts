/**
 * NZ AddressFinder API Integration
 * https://addressfinder.nz/docs/
 */

import type { AddressComponents, Coordinates } from "@shared/schema";

// =============================================================================
// TYPES
// =============================================================================

export interface AddressFinderResult {
  /** Full formatted address string */
  fullAddress: string;
  /** Address components */
  components: AddressComponents;
  /** GPS coordinates */
  coordinates: Coordinates;
  /** Raw metadata from AddressFinder */
  metadata: AddressFinderMetadata;
}

export interface AddressFinderMetadata {
  pxid?: string;
  x?: number; // Longitude
  y?: number; // Latitude
  a?: string; // Full address
  suburb?: string;
  city?: string;
  postcode?: string;
  region?: string;
  street?: string;
  street_number?: string;
  [key: string]: unknown;
}

export interface AddressFinderSuggestion {
  full_address: string;
  pxid: string;
  a?: string;
}

// =============================================================================
// ADDRESSFINDER WIDGET INTERFACE
// =============================================================================

declare global {
  interface Window {
    AddressFinder?: {
      Widget: new (
        input: HTMLInputElement,
        apiKey: string,
        country: string,
        options: AddressFinderWidgetOptions
      ) => AddressFinderWidget;
    };
  }
}

export interface AddressFinderWidgetOptions {
  show_locations?: boolean;
  address_params?: {
    street?: number;
    suburb?: number;
    city?: number;
    region?: number;
    post_box?: number;
    region_code?: number;
  };
  empty_content?: string;
  manual_style?: boolean;
  max_results?: number;
  list_class?: string;
  item_class?: string;
  hover_class?: string;
  footer_class?: string;
  error_class?: string;
}

export interface AddressFinderWidget {
  on(event: "result:select", callback: (fullAddress: string, metadata: AddressFinderMetadata) => void): void;
  on(event: "results:empty", callback: () => void): void;
  on(event: "results:update", callback: (suggestions: AddressFinderSuggestion[]) => void): void;
  destroy(): void;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const defaultWidgetConfig: AddressFinderWidgetOptions = {
  show_locations: false,
  address_params: {
    street: 0,
    suburb: 0,
    city: 0,
    region: 0,
    post_box: 0,
    region_code: 1,
  },
  empty_content: "No addresses found",
  manual_style: true,
  max_results: 10,
  list_class: "af-list",
  item_class: "af-item",
  hover_class: "af-item-hover",
  footer_class: "af-footer",
  error_class: "af-error",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Load the AddressFinder widget script
 */
export function loadAddressFinderScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.AddressFinder) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://api.addressfinder.io/assets/v3/widget.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load AddressFinder script")));
      return;
    }

    // Create and load the script
    const script = document.createElement("script");
    script.src = "https://api.addressfinder.io/assets/v3/widget.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load AddressFinder script"));
    document.body.appendChild(script);
  });
}

/**
 * Initialize AddressFinder widget on an input element
 */
export function initAddressFinderWidget(
  input: HTMLInputElement,
  apiKey: string,
  options: Partial<AddressFinderWidgetOptions> = {}
): AddressFinderWidget | null {
  if (!window.AddressFinder) {
    console.error("AddressFinder script not loaded");
    return null;
  }

  const config = { ...defaultWidgetConfig, ...options };

  return new window.AddressFinder.Widget(input, apiKey, "NZ", config);
}

/**
 * Parse AddressFinder metadata into structured components
 */
export function parseAddressMetadata(
  fullAddress: string,
  metadata: AddressFinderMetadata
): AddressFinderResult {
  const components: AddressComponents = {
    streetNumber: metadata.street_number,
    street: metadata.street,
    suburb: metadata.suburb ?? "",
    city: metadata.city ?? "",
    postcode: metadata.postcode ?? "",
    region: metadata.region,
  };

  const coordinates: Coordinates = {
    lat: metadata.y ?? 0,
    lng: metadata.x ?? 0,
  };

  return {
    fullAddress,
    components,
    coordinates,
    metadata,
  };
}

/**
 * Get the API key from environment variables
 */
export function getAddressFinderApiKey(): string {
  // Client-side: use VITE_ prefixed env var
  return import.meta.env.VITE_ADDRESSFINDER_API_KEY || "";
}
