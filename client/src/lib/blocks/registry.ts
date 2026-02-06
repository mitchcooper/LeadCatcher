import { ComponentType } from "react";
import type { BlockConfig } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";

// Re-export BlockConfig for convenience
export type { BlockConfig } from "@shared/schema";

// =============================================================================
// BLOCK PROPS INTERFACE
// =============================================================================

export interface BlockProps<T = Record<string, unknown>> {
  id: string;
  config: BlockConfig;
  props: T;
  isEditing?: boolean;
  onUpdate?: (config: Partial<BlockConfig>) => void;
  onSelect?: () => void;
  formContext?: UseFormReturn<any>;
}

// =============================================================================
// BLOCK METADATA
// =============================================================================

export type BlockCategory = "form" | "content" | "social-proof" | "layout" | "conversion";

export interface BlockMetadata {
  type: string;
  name: string;
  description: string;
  category: BlockCategory;
  icon: string; // Lucide icon name
  defaultProps: Record<string, unknown>;
  // Property schema for the editor panel
  propsSchema?: PropSchema[];
}

export interface PropSchema {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "color" | "image" | "array";
  options?: { label: string; value: string }[];
  default?: unknown;
  required?: boolean;
  placeholder?: string;
}

// =============================================================================
// BLOCK REGISTRY
// =============================================================================

type BlockComponent = ComponentType<BlockProps<any>>;

interface RegisteredBlock {
  component: BlockComponent;
  metadata: BlockMetadata;
}

class BlockRegistry {
  private blocks: Map<string, RegisteredBlock> = new Map();

  /**
   * Register a block component with its metadata
   */
  register(type: string, component: BlockComponent, metadata: Omit<BlockMetadata, "type">): void {
    this.blocks.set(type, {
      component,
      metadata: { ...metadata, type },
    });
  }

  /**
   * Get a block component by type
   */
  getComponent(type: string): BlockComponent | null {
    return this.blocks.get(type)?.component ?? null;
  }

  /**
   * Get block metadata by type
   */
  getMetadata(type: string): BlockMetadata | null {
    return this.blocks.get(type)?.metadata ?? null;
  }

  /**
   * Get all registered block types
   */
  getAllTypes(): string[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Get all blocks grouped by category
   */
  getByCategory(): Record<BlockCategory, BlockMetadata[]> {
    const categories: Record<BlockCategory, BlockMetadata[]> = {
      form: [],
      content: [],
      "social-proof": [],
      layout: [],
      conversion: [],
    };

    this.blocks.forEach(({ metadata }) => {
      const category = metadata.category as BlockCategory;
      categories[category].push(metadata);
    });

    return categories;
  }

  /**
   * Get all block metadata
   */
  getAllMetadata(): BlockMetadata[] {
    return Array.from(this.blocks.values()).map((b) => b.metadata);
  }

  /**
   * Check if a block type is registered
   */
  has(type: string): boolean {
    return this.blocks.has(type);
  }

  /**
   * Create default config for a block type
   */
  createDefaultConfig(type: string): BlockConfig | null {
    const metadata = this.getMetadata(type);
    if (!metadata) return null;

    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      props: { ...metadata.defaultProps },
      visibility: {
        desktop: true,
        tablet: true,
        mobile: true,
      },
    };
  }
}

// Singleton instance
export const blockRegistry = new BlockRegistry();

// =============================================================================
// HELPER FUNCTION TO GENERATE BLOCK IDS
// =============================================================================

export function generateBlockId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
