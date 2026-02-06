import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  appraisalSubmissionSchema,
  formSubmissionSchema,
  createLandingPageSchema,
  updateLandingPageSchema,
  analyticsEventSchema,
  paginationSchema,
  createSuburbSchema,
  updateSuburbSchema,
  createBlockTemplateSchema,
} from "@shared/validations";
import type { ApiResponse, InsertLandingPage, InsertPropertyAppraisal, InsertFormSubmission, InsertSuburb, InsertBlockTemplate } from "@shared/schema";
import { getAllPageTemplates, getPageTemplate } from "@shared/page-templates";
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

// Parse and validate pagination query parameters
function parsePagination(query: Request["query"]) {
  const result = paginationSchema.safeParse({
    page: query.page,
    pageSize: query.pageSize,
  });
  if (result.success) {
    return result.data;
  }
  return { page: 1, pageSize: 20 };
}

// =============================================================================
// RATE LIMITING (in-memory, per-IP)
// =============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return sendError(res, 429, "Too many requests. Please try again later.");
    }

    entry.count++;
    next();
  };
}

// Periodically clean up expired entries
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, ip) => {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  });
}, 60_000);

// =============================================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// =============================================================================

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.ADMIN_API_KEY;

  // If no API key is configured, allow access (development mode)
  if (!apiKey) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Authentication required");
  }

  const token = authHeader.slice(7);
  if (token !== apiKey) {
    return sendError(res, 403, "Invalid API key");
  }

  next();
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
  // PAGE TEMPLATES
  // ===========================================================================

  // Get all page templates (for creating new pages)
  app.get("/api/admin/page-templates", requireAdmin, (_req, res) => {
    const templates = getAllPageTemplates();
    sendSuccess(res, templates);
  });

  // Get template for a specific page type
  app.get("/api/admin/page-templates/:pageType", requireAdmin, (req, res) => {
    const { pageType } = req.params;
    try {
      const template = getPageTemplate(pageType as any);
      sendSuccess(res, template);
    } catch {
      sendError(res, 404, "Template not found for this page type");
    }
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
  app.get("/api/admin/pages", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const { page, pageSize } = parsePagination(req.query);
      const result = await storage.getLandingPages({
        status: status as string | undefined,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching pages:", error);
      sendError(res, 500, "Failed to fetch pages");
    }
  });

  // Get landing page by ID
  app.get("/api/admin/pages/:id", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/preview/:slug", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/pages", requireAdmin, async (req, res) => {
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
  app.put("/api/admin/pages/:id", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/pages/:id/publish", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/pages/:id/unpublish", requireAdmin, async (req, res) => {
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
  app.delete("/api/admin/pages/:id", requireAdmin, async (req, res) => {
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

  // Submit appraisal form (public endpoint, rate limited)
  app.post("/api/appraisals", rateLimit(10, 60_000), async (req, res) => {
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
  // GENERIC FORM SUBMISSIONS - PUBLIC
  // ===========================================================================

  // Submit generic form (for non-appraisal page types: lead magnet, newsletter, etc.)
  app.post("/api/submissions", rateLimit(10, 60_000), async (req, res) => {
    try {
      const validated = formSubmissionSchema.parse(req.body);

      const submissionData: InsertFormSubmission = {
        ...validated,
        referrer: req.get("referrer") || undefined,
        ipAddress: req.ip || undefined,
      };

      const submission = await storage.createFormSubmission(submissionData);

      // Increment submission count on the landing page
      if (submission.landingPageId) {
        await storage.incrementPageSubmissions(submission.landingPageId);
      }

      sendSuccess(res, { id: submission.id }, "Thank you for your submission!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error creating form submission:", error);
      sendError(res, 500, "Failed to submit form. Please try again.");
    }
  });

  // ===========================================================================
  // FORM SUBMISSIONS - ADMIN
  // ===========================================================================

  // List form submissions (admin)
  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    try {
      const { pageType, landingPageId } = req.query;
      const { page, pageSize } = parsePagination(req.query);
      const result = await storage.getFormSubmissions({
        pageType: pageType as string | undefined,
        landingPageId: landingPageId as string | undefined,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      sendError(res, 500, "Failed to fetch submissions");
    }
  });

  // ===========================================================================
  // APPRAISALS (LEADS) - ADMIN
  // ===========================================================================

  // List all appraisals
  app.get("/api/admin/appraisals", requireAdmin, async (req, res) => {
    try {
      const { status, landingPageId } = req.query;
      const { page, pageSize } = parsePagination(req.query);
      const result = await storage.getAppraisals({
        status: status as string | undefined,
        landingPageId: landingPageId as string | undefined,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching appraisals:", error);
      sendError(res, 500, "Failed to fetch appraisals");
    }
  });

  // Get appraisal by ID
  app.get("/api/admin/appraisals/:id", requireAdmin, async (req, res) => {
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
  app.patch("/api/admin/appraisals/:id/status", requireAdmin, async (req, res) => {
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
      let decodedName: string;
      try {
        decodedName = decodeURIComponent(name);
      } catch {
        return sendError(res, 400, "Invalid suburb name encoding");
      }

      const suburb = await storage.getSuburbByName(decodedName);

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
  app.get("/api/admin/suburbs", requireAdmin, async (req, res) => {
    try {
      const suburbs = await storage.getSuburbs();
      sendSuccess(res, suburbs);
    } catch (error) {
      console.error("Error fetching suburbs:", error);
      sendError(res, 500, "Failed to fetch suburbs");
    }
  });

  // Create suburb (admin)
  app.post("/api/admin/suburbs", requireAdmin, async (req, res) => {
    try {
      const validated = createSuburbSchema.parse(req.body);
      const suburb = await storage.createSuburb(validated as InsertSuburb);
      sendSuccess(res, suburb, "Suburb created successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error creating suburb:", error);
      sendError(res, 500, "Failed to create suburb");
    }
  });

  // Update suburb (admin)
  app.put("/api/admin/suburbs/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validated = updateSuburbSchema.parse(req.body);
      const suburb = await storage.updateSuburb(id, validated as Partial<InsertSuburb>);

      if (!suburb) {
        return sendError(res, 404, "Suburb not found");
      }

      sendSuccess(res, suburb, "Suburb updated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error updating suburb:", error);
      sendError(res, 500, "Failed to update suburb");
    }
  });

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  // Track analytics event (public, rate limited)
  app.post("/api/analytics/track", rateLimit(60, 60_000), async (req, res) => {
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
  app.get("/api/admin/analytics/:landingPageId", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/analytics/:landingPageId/events", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/templates", requireAdmin, async (req, res) => {
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
  app.post("/api/admin/templates", requireAdmin, async (req, res) => {
    try {
      const validated = createBlockTemplateSchema.parse(req.body);
      const template = await storage.createBlockTemplate(validated as InsertBlockTemplate);
      sendSuccess(res, template, "Template created successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, error.errors[0]?.message || "Validation failed");
      }
      console.error("Error creating template:", error);
      sendError(res, 500, "Failed to create template");
    }
  });

  return httpServer;
}
