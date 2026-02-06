import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, Calendar, ChevronRight } from "lucide-react";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface CtaButtonBlockProps {
  text: string;
  action: "scroll" | "link" | "phone" | "email" | "submit";
  href?: string;
  scrollTo?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
  icon?: "none" | "arrow" | "chevron" | "phone" | "mail" | "calendar";
  iconPosition?: "left" | "right";
  animate?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const iconMap: Record<string, LucideIcon> = {
  arrow: ArrowRight,
  chevron: ChevronRight,
  phone: Phone,
  mail: Mail,
  calendar: Calendar,
};

const sizeClasses = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  xl: "h-16 px-10 text-xl",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
};

export function CtaButtonBlock({
  props,
  isEditing,
  formContext,
}: BlockProps<CtaButtonBlockProps>) {
  const {
    text = "Get Started",
    action = "scroll",
    href,
    scrollTo,
    size = "lg",
    variant = "primary",
    fullWidth = false,
    icon = "arrow",
    iconPosition = "right",
    animate = true,
  } = props;

  const IconComponent = icon !== "none" ? iconMap[icon] : null;

  const handleClick = () => {
    if (isEditing) return;

    switch (action) {
      case "scroll":
        if (scrollTo) {
          const element = document.getElementById(scrollTo);
          element?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "link":
        if (href) {
          window.location.href = href;
        }
        break;
      case "phone":
        if (href) {
          window.location.href = `tel:${href}`;
        }
        break;
      case "email":
        if (href) {
          window.location.href = `mailto:${href}`;
        }
        break;
      case "submit":
        // Form submission is handled by form context
        if (formContext) {
          formContext.handleSubmit((data) => {
            console.log("Form submitted:", data);
          })();
        }
        break;
    }
  };

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
    ghost: "text-primary hover:bg-primary/10",
  };

  const buttonContent = (
    <>
      {IconComponent && iconPosition === "left" && (
        <IconComponent className={cn(iconSizes[size], "mr-2")} />
      )}
      <span>{text}</span>
      {IconComponent && iconPosition === "right" && (
        <IconComponent
          className={cn(
            iconSizes[size],
            "ml-2",
            animate && "transition-transform group-hover:translate-x-1"
          )}
        />
      )}
    </>
  );

  const buttonClasses = cn(
    "group font-semibold rounded-xl transition-all duration-200",
    sizeClasses[size],
    variantStyles[variant],
    fullWidth && "w-full",
    isEditing && "pointer-events-none"
  );

  if (animate) {
    return (
      <motion.button
        className={buttonClasses}
        onClick={handleClick}
        whileHover={{ scale: isEditing ? 1 : 1.02 }}
        whileTap={{ scale: isEditing ? 1 : 0.98 }}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button className={buttonClasses} onClick={handleClick}>
      {buttonContent}
    </button>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("cta-button", CtaButtonBlock, {
  name: "CTA Button",
  description: "Call-to-action button with multiple styles",
  category: "conversion",
  icon: "MousePointerClick",
  defaultProps: {
    text: "Get Your Free Appraisal",
    action: "scroll",
    scrollTo: "appraisal-form",
    size: "lg",
    variant: "primary",
    fullWidth: false,
    icon: "arrow",
    iconPosition: "right",
    animate: true,
  },
  propsSchema: [
    { key: "text", label: "Button Text", type: "text", required: true },
    {
      key: "action",
      label: "Action",
      type: "select",
      options: [
        { label: "Scroll to Section", value: "scroll" },
        { label: "External Link", value: "link" },
        { label: "Phone Call", value: "phone" },
        { label: "Email", value: "email" },
        { label: "Submit Form", value: "submit" },
      ],
      default: "scroll",
    },
    { key: "href", label: "Link/Phone/Email", type: "text" },
    { key: "scrollTo", label: "Scroll Target ID", type: "text" },
    {
      key: "size",
      label: "Size",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
      default: "lg",
    },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
      ],
      default: "primary",
    },
    { key: "fullWidth", label: "Full Width", type: "boolean", default: false },
    {
      key: "icon",
      label: "Icon",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Arrow", value: "arrow" },
        { label: "Chevron", value: "chevron" },
        { label: "Phone", value: "phone" },
        { label: "Mail", value: "mail" },
        { label: "Calendar", value: "calendar" },
      ],
      default: "arrow",
    },
    {
      key: "iconPosition",
      label: "Icon Position",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      default: "right",
    },
    { key: "animate", label: "Animate", type: "boolean", default: true },
  ],
});
