import { motion } from "framer-motion";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsBarBlockProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  animated?: boolean;
  variant?: "default" | "bordered" | "cards";
}

// =============================================================================
// COMPONENT
// =============================================================================

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function StatsBarBlock({
  props,
}: BlockProps<StatsBarBlockProps>) {
  const {
    stats = [
      { value: "500+", label: "Homes Sold" },
      { value: "$1.2M", label: "Avg Sale Price" },
      { value: "14", label: "Days on Market" },
      { value: "98%", label: "Client Satisfaction" },
    ],
    columns = 4,
    animated = true,
    variant = "default",
  } = props;

  const variantClasses = {
    default: "",
    bordered: "divide-x divide-gray-200",
    cards: "gap-4",
  };

  const itemVariantClasses = {
    default: "text-center py-6",
    bordered: "text-center py-6",
    cards: "bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center",
  };

  return (
    <div
      className={cn(
        "grid",
        columnClasses[columns],
        variantClasses[variant]
      )}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={animated ? { opacity: 0, y: 20 } : false}
          whileInView={animated ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className={itemVariantClasses[variant]}
        >
          <p className="text-3xl sm:text-4xl font-bold text-gray-900">
            {stat.prefix}
            {stat.value}
            {stat.suffix}
          </p>
          <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("stats-bar", StatsBarBlock, {
  name: "Stats Bar",
  description: "Display key statistics in a row",
  category: "social-proof",
  icon: "BarChart",
  defaultProps: {
    stats: [
      { value: "500+", label: "Homes Sold" },
      { value: "$1.2M", label: "Avg Sale Price" },
      { value: "14", label: "Days on Market" },
      { value: "98%", label: "Client Satisfaction" },
    ],
    columns: 4,
    animated: true,
    variant: "default",
  },
  propsSchema: [
    { key: "stats", label: "Statistics", type: "array" },
    {
      key: "columns",
      label: "Columns",
      type: "select",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      default: "4",
    },
    { key: "animated", label: "Animate on Scroll", type: "boolean", default: true },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Bordered", value: "bordered" },
        { label: "Cards", value: "cards" },
      ],
      default: "default",
    },
  ],
});
