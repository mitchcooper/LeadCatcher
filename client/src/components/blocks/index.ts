// Block rendering components
export { BlockRenderer } from "./BlockRenderer";
export { SectionRenderer, PageRenderer } from "./SectionRenderer";

// Re-export registry utilities
export { blockRegistry, generateBlockId } from "@/lib/blocks/registry";
export type { BlockProps, BlockMetadata, BlockCategory, PropSchema } from "@/lib/blocks/registry";

// Form blocks
export * from "./form";

// Content blocks
export * from "./content";

// Social proof blocks
export * from "./social-proof";

// Layout blocks
export * from "./layout";

// Conversion blocks
export * from "./conversion";
