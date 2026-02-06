import { Shield, Award, Star, BadgeCheck, Lock, Clock, ThumbsUp, Users } from "lucide-react";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface TrustBadge {
  icon: string;
  text: string;
}

export interface TrustBadgesBlockProps {
  badges: TrustBadge[];
  variant?: "default" | "compact" | "pills";
  alignment?: "left" | "center" | "right";
  columns?: 2 | 3 | 4 | 6;
}

// =============================================================================
// COMPONENT
// =============================================================================

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  award: Award,
  star: Star,
  badge: BadgeCheck,
  lock: Lock,
  clock: Clock,
  thumbsUp: ThumbsUp,
  users: Users,
};

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  6: "grid-cols-3 sm:grid-cols-6",
};

const alignmentClasses = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function TrustBadgesBlock({
  props,
}: BlockProps<TrustBadgesBlockProps>) {
  const {
    badges = [
      { icon: "shield", text: "Licensed & Insured" },
      { icon: "star", text: "5-Star Reviews" },
      { icon: "clock", text: "Quick Response" },
      { icon: "award", text: "Award Winning" },
    ],
    variant = "default",
    alignment = "center",
    columns = 4,
  } = props;

  if (variant === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-3", alignmentClasses[alignment])}>
        {badges.map((badge, index) => {
          const IconComponent = iconMap[badge.icon] || Shield;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium"
            >
              <IconComponent className="w-4 h-4" />
              <span>{badge.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-6", alignmentClasses[alignment])}>
        {badges.map((badge, index) => {
          const IconComponent = iconMap[badge.icon] || Shield;
          return (
            <div key={index} className="flex items-center gap-2 text-gray-600">
              <IconComponent className="w-5 h-5 text-primary" />
              <span className="text-sm">{badge.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Default grid variant
  return (
    <div className={cn("grid gap-4", columnClasses[columns])}>
      {badges.map((badge, index) => {
        const IconComponent = iconMap[badge.icon] || Shield;
        return (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("trust-badges", TrustBadgesBlock, {
  name: "Trust Badges",
  description: "Display trust indicators and certifications",
  category: "conversion",
  icon: "Shield",
  defaultProps: {
    badges: [
      { icon: "shield", text: "Licensed & Insured" },
      { icon: "star", text: "5-Star Reviews" },
      { icon: "clock", text: "Quick Response" },
      { icon: "award", text: "Award Winning" },
    ],
    variant: "default",
    alignment: "center",
    columns: 4,
  },
  propsSchema: [
    { key: "badges", label: "Badges", type: "array" },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Grid", value: "default" },
        { label: "Compact", value: "compact" },
        { label: "Pills", value: "pills" },
      ],
      default: "default",
    },
    {
      key: "alignment",
      label: "Alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      default: "center",
    },
    {
      key: "columns",
      label: "Columns",
      type: "select",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
        { label: "6 Columns", value: "6" },
      ],
      default: "4",
    },
  ],
});
