import { blockRegistry, type BlockProps, type BlockConfig } from "@/lib/blocks/registry";
import { BlockRenderer } from "../BlockRenderer";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface ColumnConfig {
  blocks: BlockConfig[];
  width?: "auto" | "1/4" | "1/3" | "1/2" | "2/3" | "3/4";
}

export interface ColumnsBlockProps {
  columns: ColumnConfig[];
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  verticalAlign?: "top" | "center" | "bottom" | "stretch";
  stackOnMobile?: boolean;
  reverseOnMobile?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const gapClasses = {
  none: "gap-0",
  sm: "gap-2 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
  xl: "gap-8 sm:gap-12",
};

const alignClasses = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
};

const widthClasses = {
  auto: "flex-1",
  "1/4": "w-full sm:w-1/4",
  "1/3": "w-full sm:w-1/3",
  "1/2": "w-full sm:w-1/2",
  "2/3": "w-full sm:w-2/3",
  "3/4": "w-full sm:w-3/4",
};

export function ColumnsBlock({
  props,
  isEditing,
}: BlockProps<ColumnsBlockProps>) {
  const {
    columns = [],
    gap = "md",
    verticalAlign = "top",
    stackOnMobile = true,
    reverseOnMobile = false,
  } = props;

  if (columns.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        No columns configured
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        stackOnMobile ? "flex-col sm:flex-row" : "flex-row",
        reverseOnMobile && stackOnMobile && "flex-col-reverse sm:flex-row",
        gapClasses[gap],
        alignClasses[verticalAlign],
        isEditing && "ring-1 ring-dashed ring-blue-300"
      )}
    >
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className={cn(
            widthClasses[column.width || "auto"],
            isEditing && "ring-1 ring-dashed ring-gray-200 p-2"
          )}
        >
          {column.blocks.map((blockConfig) => (
            <BlockRenderer
              key={blockConfig.id}
              config={blockConfig}
              isEditing={isEditing}
            />
          ))}
          {column.blocks.length === 0 && isEditing && (
            <div className="p-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded">
              Empty column
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("columns", ColumnsBlock, {
  name: "Columns",
  description: "Multi-column layout with flexible widths",
  category: "layout",
  icon: "Columns",
  defaultProps: {
    columns: [
      { blocks: [], width: "1/2" },
      { blocks: [], width: "1/2" },
    ],
    gap: "md",
    verticalAlign: "top",
    stackOnMobile: true,
    reverseOnMobile: false,
  },
  propsSchema: [
    {
      key: "gap",
      label: "Gap",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
      default: "md",
    },
    {
      key: "verticalAlign",
      label: "Vertical Alignment",
      type: "select",
      options: [
        { label: "Top", value: "top" },
        { label: "Center", value: "center" },
        { label: "Bottom", value: "bottom" },
        { label: "Stretch", value: "stretch" },
      ],
      default: "top",
    },
    { key: "stackOnMobile", label: "Stack on Mobile", type: "boolean", default: true },
    { key: "reverseOnMobile", label: "Reverse on Mobile", type: "boolean", default: false },
  ],
});
