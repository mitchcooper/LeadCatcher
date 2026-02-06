CREATE TABLE "auction_sessions" (
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooper_tokens" (
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads_analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" varchar,
	"session_id" varchar(64),
	"event_type" varchar(64) NOT NULL,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"step_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads_block_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(32) NOT NULL,
	"block_type" varchar(64) NOT NULL,
	"default_config" jsonb NOT NULL,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads_landing_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"meta_title" varchar(256),
	"meta_description" text,
	"og_image_url" varchar(512),
	"theme_config" jsonb DEFAULT '{}'::jsonb,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"form_flow" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"published_at" timestamp,
	"views" integer DEFAULT 0,
	"submissions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_landing_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads_property_appraisals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" varchar,
	"address_full" text NOT NULL,
	"address_components" jsonb,
	"coordinates" jsonb,
	"relationship" varchar(32),
	"timeline" varchar(32),
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb,
	"utm_source" varchar(128),
	"utm_medium" varchar(128),
	"utm_campaign" varchar(128),
	"utm_term" varchar(128),
	"utm_content" varchar(128),
	"referrer" varchar(512),
	"user_agent" text,
	"ip_address" varchar(45),
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"notes" text,
	"crm_submitted" boolean DEFAULT false,
	"crm_response" jsonb,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads_suburbs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"region" varchar(64),
	"city" varchar(64),
	"homes_sold_last_year" integer DEFAULT 0,
	"median_price" integer,
	"average_days_on_market" integer,
	"custom_text" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teamgci_office_exclusions" (
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "leads_analytics_events" ADD CONSTRAINT "leads_analytics_events_landing_page_id_leads_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."leads_landing_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads_property_appraisals" ADD CONSTRAINT "leads_property_appraisals_landing_page_id_leads_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."leads_landing_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_analytics_landing_page_idx" ON "leads_analytics_events" USING btree ("landing_page_id");--> statement-breakpoint
CREATE INDEX "leads_analytics_session_idx" ON "leads_analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "leads_analytics_event_type_idx" ON "leads_analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "leads_analytics_created_at_idx" ON "leads_analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_landing_pages_slug_idx" ON "leads_landing_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "leads_landing_pages_status_idx" ON "leads_landing_pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_appraisals_landing_page_idx" ON "leads_property_appraisals" USING btree ("landing_page_id");--> statement-breakpoint
CREATE INDEX "leads_appraisals_created_at_idx" ON "leads_property_appraisals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_appraisals_email_idx" ON "leads_property_appraisals" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_appraisals_status_idx" ON "leads_property_appraisals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_suburbs_name_idx" ON "leads_suburbs" USING btree ("name");