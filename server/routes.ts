import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  appraisalSubmissionSchema,
  createLandingPageSchema,
  updateLandingPageSchema,
  analyticsEventSchema,
} from "@shared/validations";
import type { ApiResponse, InsertLandingPage, InsertPropertyAppraisal } from "@shared/schema";
import { z } from "zod";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function sendSuccess<T>(res: Response, data: T, message?: string) {
  res.json({ success: true, data, message } as ApiResponse<T>);
}

function sendError(res: Response, status: number, error: string) {
  res.status(status).json({ success: false, error } as ApiResponse<never>);
}

// Extract UTM params from query string
function extractUtmParams(query: Request["query"]) {
  return {
    utmSource: query.utm_source as string | undefined,
    utmMedium: query.utm_medium as string | undefined,
    utmCampaign: query.utm_campaign as string | undefined,
    utmTerm: query.utm_term as string | undefined,
    utmContent: query.utm_content as string | undefined,
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ===========================================================================
  // HEALTH CHECK
  // ===========================================================================

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      message: "LeadConverter API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // ===========================================================================
  // LANDING PAGES - PUBLIC
  // ===========================================================================

  // Get published landing page by slug (public endpoint)
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getLandingPageBySlug(slug);

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      if (page.status !== "published") {
        return sendError(res, 404, "Page not found");
      }

      // Increment view count
      await storage.incrementPageViews(page.id);

      sendSuccess(res, page);
    } catch (error) {
      console.error("Error fetching page:", error);
      sendError(res, 500, "Failed to fetch page");
    }
  });

  // ===========================================================================
  // LANDING PAGES - ADMIN
  // ===========================================================================

  // List all landing pages
  app.get("/api/admin/pages", async (req, res) => {
    try {
      const { status, page, pageSize } = req.query;
      const result = await storage.getLandingPages({
        status: status as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching pages:", error);
      sendError(res, 500, "Failed to fetch pages");
    }
  });

  // Get landing page by ID
  app.get("/api/admin/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const page = await storage.getLandingPageById(id);

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      sendSuccess(res, page);
    } catch (error) {
      console.error("Error fetching page:", error);
      sendError(res, 500, "Failed to fetch page");
    }
  });

  // Preview landing page by slug (admin - works for drafts too)
  app.get("/api/admin/preview/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getLandingPageBySlug(slug);

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      // Admin preview - no status check, works for drafts
      sendSuccess(res, page);
    } catch (error) {
      console.error("Error fetching page preview:", error);
      sendError(res, 500, "Failed to fetch page preview");
    }
  });

  // Create landing page
  app.post("/api/admin/pages", async (req, res) => {
    try {
      const validated = createLandingPageSchema.parse(req.body);
      const page = await storage.createLandingPage(validated as InsertLandingPage);
      sendSuccess(res, page, "Page created successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error creating page:", error);
      sendError(res, 500, "Failed to create page");
    }
  });

  // Update landing page
  app.put("/api/admin/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = updateLandingPageSchema.parse(req.body);
      const page = await storage.updateLandingPage(id, validated as Partial<InsertLandingPage>);

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      sendSuccess(res, page, "Page updated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error updating page:", error);
      sendError(res, 500, "Failed to update page");
    }
  });

  // Publish landing page
  app.post("/api/admin/pages/:id/publish", async (req, res) => {
    try {
      const { id } = req.params;
      const page = await storage.updateLandingPage(id, {
        status: "published",
        publishedAt: new Date(),
      });

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      sendSuccess(res, page, "Page published successfully");
    } catch (error) {
      console.error("Error publishing page:", error);
      sendError(res, 500, "Failed to publish page");
    }
  });

  // Unpublish landing page
  app.post("/api/admin/pages/:id/unpublish", async (req, res) => {
    try {
      const { id } = req.params;
      const page = await storage.updateLandingPage(id, {
        status: "draft",
      });

      if (!page) {
        return sendError(res, 404, "Page not found");
      }

      sendSuccess(res, page, "Page unpublished successfully");
    } catch (error) {
      console.error("Error unpublishing page:", error);
      sendError(res, 500, "Failed to unpublish page");
    }
  });

  // Delete landing page
  app.delete("/api/admin/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLandingPage(id);

      if (!deleted) {
        return sendError(res, 404, "Page not found");
      }

      sendSuccess(res, null, "Page deleted successfully");
    } catch (error) {
      console.error("Error deleting page:", error);
      sendError(res, 500, "Failed to delete page");
    }
  });

  // ===========================================================================
  // APPRAISALS (LEADS) - PUBLIC
  // ===========================================================================

  // Submit appraisal form (public endpoint)
  app.post("/api/appraisals", async (req, res) => {
    try {
      const validated = appraisalSubmissionSchema.parse(req.body);

      // Build appraisal data
      const appraisalData: InsertPropertyAppraisal = {
        ...validated,
        ...extractUtmParams(req.query),
        referrer: req.get("referrer") || undefined,
        userAgent: req.get("user-agent") || undefined,
        ipAddress: req.ip || undefined,
      };

      const appraisal = await storage.createAppraisal(appraisalData);

      // Increment submission count if linked to a landing page
      if (appraisal.landingPageId) {
        await storage.incrementPageSubmissions(appraisal.landingPageId);
      }

      sendSuccess(res, { id: appraisal.id }, "Thank you! We'll be in touch soon.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error creating appraisal:", error);
      sendError(res, 500, "Failed to submit form. Please try again.");
    }
  });

  // ===========================================================================
  // APPRAISALS (LEADS) - ADMIN
  // ===========================================================================

  // List all appraisals
  app.get("/api/admin/appraisals", async (req, res) => {
    try {
      const { status, landingPageId, page, pageSize } = req.query;
      const result = await storage.getAppraisals({
        status: status as string | undefined,
        landingPageId: landingPageId as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching appraisals:", error);
      sendError(res, 500, "Failed to fetch appraisals");
    }
  });

  // Get appraisal by ID
  app.get("/api/admin/appraisals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const appraisal = await storage.getAppraisalById(id);

      if (!appraisal) {
        return sendError(res, 404, "Appraisal not found");
      }

      sendSuccess(res, appraisal);
    } catch (error) {
      console.error("Error fetching appraisal:", error);
      sendError(res, 500, "Failed to fetch appraisal");
    }
  });

  // Update appraisal status
  app.patch("/api/admin/appraisals/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return sendError(res, 400, "Status is required");
      }

      const appraisal = await storage.updateAppraisalStatus(id, status, notes);

      if (!appraisal) {
        return sendError(res, 404, "Appraisal not found");
      }

      sendSuccess(res, appraisal, "Status updated successfully");
    } catch (error) {
      console.error("Error updating appraisal:", error);
      sendError(res, 500, "Failed to update appraisal");
    }
  });

  // ===========================================================================
  // SUBURBS
  // ===========================================================================

  // List suburbs (public)
  app.get("/api/suburbs", async (req, res) => {
    try {
      const suburbs = await storage.getSuburbs({ isActive: true });
      sendSuccess(res, suburbs);
    } catch (error) {
      console.error("Error fetching suburbs:", error);
      sendError(res, 500, "Failed to fetch suburbs");
    }
  });

  // Get suburb by name (public)
  app.get("/api/suburbs/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const suburb = await storage.getSuburbByName(decodeURIComponent(name));

      if (!suburb) {
        return sendError(res, 404, "Suburb not found");
      }

      sendSuccess(res, suburb);
    } catch (error) {
      console.error("Error fetching suburb:", error);
      sendError(res, 500, "Failed to fetch suburb");
    }
  });

  // List all suburbs (admin)
  app.get("/api/admin/suburbs", async (req, res) => {
    try {
      const suburbs = await storage.getSuburbs();
      sendSuccess(res, suburbs);
    } catch (error) {
      console.error("Error fetching suburbs:", error);
      sendError(res, 500, "Failed to fetch suburbs");
    }
  });

  // Create suburb (admin)
  app.post("/api/admin/suburbs", async (req, res) => {
    try {
      const suburb = await storage.createSuburb(req.body);
      sendSuccess(res, suburb, "Suburb created successfully");
    } catch (error) {
      console.error("Error creating suburb:", error);
      sendError(res, 500, "Failed to create suburb");
    }
  });

  // Update suburb (admin)
  app.put("/api/admin/suburbs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const suburb = await storage.updateSuburb(id, req.body);

      if (!suburb) {
        return sendError(res, 404, "Suburb not found");
      }

      sendSuccess(res, suburb, "Suburb updated successfully");
    } catch (error) {
      console.error("Error updating suburb:", error);
      sendError(res, 500, "Failed to update suburb");
    }
  });

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  // Track analytics event (public)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const validated = analyticsEventSchema.parse(req.body);
      const event = await storage.createAnalyticsEvent(validated);
      sendSuccess(res, { id: event.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error tracking event:", error);
      sendError(res, 500, "Failed to track event");
    }
  });

  // Get analytics summary (admin)
  app.get("/api/admin/analytics/:landingPageId", async (req, res) => {
    try {
      const { landingPageId } = req.params;
      const summary = await storage.getAnalyticsSummary(landingPageId);
      sendSuccess(res, summary);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      sendError(res, 500, "Failed to fetch analytics");
    }
  });

  // Get analytics events (admin)
  app.get("/api/admin/analytics/:landingPageId/events", async (req, res) => {
    try {
      const { landingPageId } = req.params;
      const { eventType } = req.query;
      const events = await storage.getAnalyticsEvents({
        landingPageId,
        eventType: eventType as string | undefined,
      });
      sendSuccess(res, events);
    } catch (error) {
      console.error("Error fetching events:", error);
      sendError(res, 500, "Failed to fetch events");
    }
  });

  // ===========================================================================
  // BLOCK TEMPLATES
  // ===========================================================================

  // List block templates (admin)
  app.get("/api/admin/templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = await storage.getBlockTemplates({
        category: category as string | undefined,
      });
      sendSuccess(res, templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      sendError(res, 500, "Failed to fetch templates");
    }
  });

  // Create block template (admin)
  app.post("/api/admin/templates", async (req, res) => {
    try {
      const template = await storage.createBlockTemplate(req.body);
      sendSuccess(res, template, "Template created successfully");
    } catch (error) {
      console.error("Error creating template:", error);
      sendError(res, 500, "Failed to create template");
    }
  });

  return httpServer;
}
