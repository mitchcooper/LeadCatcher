import { Phone, Mail, Award } from "lucide-react";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface AgentCardBlockProps {
  name: string;
  title: string;
  photo?: string;
  phone?: string;
  email?: string;
  experience?: string;
  achievements?: string[];
  variant?: "default" | "horizontal" | "compact";
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AgentCardBlock({
  props,
  isEditing,
}: BlockProps<AgentCardBlockProps>) {
  const {
    name = "John Cooper",
    title = "Senior Sales Consultant",
    photo,
    phone,
    email,
    experience = "15 years experience",
    achievements = [],
    variant = "default",
  } = props;

  if (variant === "horizontal") {
    return (
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Photo */}
        <div className="flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-3xl">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-primary font-medium">{title}</p>
          {experience && (
            <p className="text-sm text-gray-500 mt-1">{experience}</p>
          )}

          {/* Contact */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
              >
                <Phone className="w-4 h-4" />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary"
              >
                <Mail className="w-4 h-4" />
                {email}
              </a>
            )}
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                >
                  <Award className="w-3 h-3" />
                  {achievement}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        {/* Photo */}
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{title}</p>
        </div>

        {/* Phone */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
      </div>
    );
  }

  // Default variant (centered/card)
  return (
    <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Photo */}
      <div className="mb-4">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-32 h-32 mx-auto rounded-full object-cover"
          />
        ) : (
          <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-4xl">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      <p className="text-primary font-medium">{title}</p>
      {experience && (
        <p className="text-sm text-gray-500 mt-1">{experience}</p>
      )}

      {/* Contact */}
      <div className="flex flex-col gap-2 mt-4">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <Phone className="w-4 h-4" />
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary"
          >
            <Mail className="w-4 h-4" />
            {email}
          </a>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {achievements.map((achievement, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
            >
              <Award className="w-3 h-3" />
              {achievement}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("agent-card", AgentCardBlock, {
  name: "Agent Card",
  description: "Display agent profile with photo and contact info",
  category: "social-proof",
  icon: "User",
  defaultProps: {
    name: "John Cooper",
    title: "Senior Sales Consultant",
    phone: "021 123 4567",
    email: "john@cooperco.co.nz",
    experience: "15 years experience",
    achievements: ["Top Performer 2023", "50+ Sales This Year"],
    variant: "default",
  },
  propsSchema: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "photo", label: "Photo URL", type: "image" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "experience", label: "Experience", type: "text" },
    { key: "achievements", label: "Achievements", type: "array" },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Default (Centered)", value: "default" },
        { label: "Horizontal", value: "horizontal" },
        { label: "Compact", value: "compact" },
      ],
      default: "default",
    },
  ],
});
