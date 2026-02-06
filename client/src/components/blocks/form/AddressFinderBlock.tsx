import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import {
  loadAddressFinderScript,
  initAddressFinderWidget,
  parseAddressMetadata,
  getAddressFinderApiKey,
  type AddressFinderWidget,
  type AddressFinderMetadata,
  type AddressFinderResult,
} from "@/lib/addressfinder";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface AddressFinderBlockProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  fieldName?: string;
  errorMessage?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AddressFinderBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<AddressFinderBlockProps>) {
  const {
    label = "Property Address",
    placeholder = "Start typing your address...",
    helperText = "Enter your property address to get started",
    required = true,
    fieldName = "address",
    errorMessage = "Please select an address from the suggestions",
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<AddressFinderWidget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressFinderResult | null>(null);

  // Get form methods if available
  const { register, setValue, setError: setFormError, clearErrors, formState } = formContext || {};
  const fieldError = formState?.errors?.[fieldName];

  // Handle address selection
  const handleAddressSelect = useCallback(
    (fullAddress: string, metadata: AddressFinderMetadata) => {
      const result = parseAddressMetadata(fullAddress, metadata);
      setSelectedAddress(result);

      // Update form values if form context is available
      if (setValue) {
        setValue(`${fieldName}Full`, fullAddress, { shouldValidate: true });
        setValue(`${fieldName}Components`, result.components, { shouldValidate: true });
        setValue("coordinates", result.coordinates, { shouldValidate: true });
        setValue("suburb", result.components.suburb, { shouldValidate: true });
        clearErrors?.(fieldName);
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent("addressSelected", {
          detail: result,
        })
      );
    },
    [fieldName, setValue, clearErrors]
  );

  // Initialize AddressFinder widget
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        await loadAddressFinderScript();

        if (!isMounted || !inputRef.current) return;

        const apiKey = getAddressFinderApiKey();
        if (!apiKey) {
          setError("AddressFinder API key not configured");
          setIsLoading(false);
          return;
        }

        const widget = initAddressFinderWidget(inputRef.current, apiKey);
        if (!widget) {
          setError("Failed to initialize address widget");
          setIsLoading(false);
          return;
        }

        widgetRef.current = widget;

        // Listen for address selection
        widget.on("result:select", handleAddressSelect);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load AddressFinder:", err);
        if (isMounted) {
          setError("Failed to load address lookup");
          setIsLoading(false);
        }
      }
    };

    // Don't initialize in editing mode
    if (!isEditing) {
      init();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
    };
  }, [isEditing, handleAddressSelect]);

  // Editing mode preview
  if (isEditing) {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={placeholder}
            disabled
            className="pl-10 h-12 text-base"
          />
        </div>
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />

        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={isLoading ? "Loading..." : placeholder}
          disabled={isLoading}
          autoComplete="off"
          className={cn(
            "pl-10 h-12 text-base",
            selectedAddress && "border-green-500 focus:ring-green-500",
            (fieldError || error) && "border-red-500 focus:ring-red-500"
          )}
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
        )}

        {selectedAddress && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-500">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {(fieldError || error) && (
        <p className="text-sm text-red-500">
          {error || (fieldError?.message as string) || errorMessage}
        </p>
      )}

      {/* Helper text */}
      {!fieldError && !error && helperText && !selectedAddress && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Selected address confirmation */}
      {selectedAddress && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <MapPin className="h-4 w-4" />
          <span>{selectedAddress.components.suburb}, {selectedAddress.components.city}</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("address-finder", AddressFinderBlock, {
  name: "Address Finder",
  description: "NZ address autocomplete with map integration",
  category: "form",
  icon: "MapPin",
  defaultProps: {
    label: "Property Address",
    placeholder: "Start typing your address...",
    helperText: "Enter your property address to get started",
    required: true,
    fieldName: "address",
    errorMessage: "Please select an address from the suggestions",
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text", default: "Property Address" },
    { key: "placeholder", label: "Placeholder", type: "text", default: "Start typing your address..." },
    { key: "helperText", label: "Helper Text", type: "text", default: "Enter your property address to get started" },
    { key: "required", label: "Required", type: "boolean", default: true },
    { key: "fieldName", label: "Field Name", type: "text", default: "address" },
  ],
});
