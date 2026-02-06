import { Star, Quote } from "lucide-react";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface TestimonialCardBlockProps {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorImage?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  showQuoteIcon?: boolean;
  variant?: "default" | "highlighted" | "minimal";
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TestimonialCardBlock({
  props,
  isEditing,
}: BlockProps<TestimonialCardBlockProps>) {
  const {
    quote = "This is an amazing testimonial quote that shows how great your service is!",
    authorName = "John Smith",
    authorRole,
    authorImage,
    rating = 5,
    showQuoteIcon = true,
    variant = "default",
  } = props;

  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-sm",
    highlighted: "bg-primary/5 border border-primary/20",
    minimal: "bg-transparent border-none shadow-none",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-8",
        variantClasses[variant]
      )}
    >
      {/* Quote icon */}
      {showQuoteIcon && (
        <Quote className="w-8 h-8 text-primary/20 mb-4" />
      )}

      {/* Rating */}
      {rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Quote text */}
      <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {authorImage ? (
          <img
            src={authorImage}
            alt={authorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">
              {authorName.charAt(0)}
            </span>
          </div>
        )}

        {/* Name and role */}
        <div>
          <p className="font-semibold text-gray-900">{authorName}</p>
          {authorRole && (
            <p className="text-sm text-gray-500">{authorRole}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("testimonial-card", TestimonialCardBlock, {
  name: "Testimonial Card",
  description: "Single testimonial with author info and rating",
  category: "social-proof",
  icon: "MessageSquare",
  defaultProps: {
    quote: "This is an amazing testimonial quote that shows how great your service is!",
    authorName: "John Smith",
    authorRole: "Homeowner",
    rating: 5,
    showQuoteIcon: true,
    variant: "default",
  },
  propsSchema: [
    { key: "quote", label: "Quote", type: "textarea", required: true },
    { key: "authorName", label: "Author Name", type: "text", required: true },
    { key: "authorRole", label: "Author Role", type: "text" },
    { key: "authorImage", label: "Author Image URL", type: "image" },
    {
      key: "rating",
      label: "Rating (1-5)",
      type: "select",
      options: [
        { label: "5 Stars", value: "5" },
        { label: "4 Stars", value: "4" },
        { label: "3 Stars", value: "3" },
        { label: "2 Stars", value: "2" },
        { label: "1 Star", value: "1" },
      ],
      default: "5",
    },
    { key: "showQuoteIcon", label: "Show Quote Icon", type: "boolean", default: true },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Highlighted", value: "highlighted" },
        { label: "Minimal", value: "minimal" },
      ],
      default: "default",
    },
  ],
});
