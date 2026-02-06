import { eq, desc, sql as drizzleSql, and, count } from "drizzle-orm";
import { getDb } from "./lib/db";
import {
  type LandingPage,
  type InsertLandingPage,
  type PropertyAppraisal,
  type InsertPropertyAppraisal,
  type FormSubmission,
  type InsertFormSubmission,
  type Suburb,
  type InsertSuburb,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type BlockTemplate,
  type InsertBlockTemplate,
  type PaginatedResponse,
  leadsLandingPages,
  leadsPropertyAppraisals,
  leadsFormSubmissions,
  leadsSuburbs,
  leadsAnalyticsEvents,
  leadsBlockTemplates,
} from "@shared/schema";

// =============================================================================
// STORAGE INTERFACE
// =============================================================================

export interface IStorage {
  // Landing Pages
  getLandingPages(options?: { status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<LandingPage>>;
  getLandingPageById(id: string): Promise<LandingPage | undefined>;
  getLandingPageBySlug(slug: string): Promise<LandingPage | undefined>;
  createLandingPage(page: InsertLandingPage): Promise<LandingPage>;
  updateLandingPage(id: string, page: Partial<InsertLandingPage>): Promise<LandingPage | undefined>;
  deleteLandingPage(id: string): Promise<boolean>;
  incrementPageViews(id: string): Promise<void>;
  incrementPageSubmissions(id: string): Promise<void>;

  // Property Appraisals (Leads)
  getAppraisals(options?: { status?: string; landingPageId?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<PropertyAppraisal>>;
  getAppraisalById(id: string): Promise<PropertyAppraisal | undefined>;
  createAppraisal(appraisal: InsertPropertyAppraisal): Promise<PropertyAppraisal>;
  updateAppraisalStatus(id: string, status: string, notes?: string): Promise<PropertyAppraisal | undefined>;

  // Generic Form Submissions
  getFormSubmissions(options?: { pageType?: string; landingPageId?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<FormSubmission>>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;

  // Suburbs
  getSuburbs(options?: { isActive?: boolean }): Promise<Suburb[]>;
  getSuburbByName(name: string): Promise<Suburb | undefined>;
  createSuburb(suburb: InsertSuburb): Promise<Suburb>;
  updateSuburb(id: string, suburb: Partial<InsertSuburb>): Promise<Suburb | undefined>;

  // Analytics Events
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEvents(options?: { landingPageId?: string; eventType?: string; startDate?: Date; endDate?: Date }): Promise<AnalyticsEvent[]>;
  getAnalyticsSummary(landingPageId: string): Promise<{
    totalViews: number;
    totalSubmissions: number;
    conversionRate: number;
    stepCompletions: Record<number, number>;
  }>;

  // Block Templates
  getBlockTemplates(options?: { category?: string }): Promise<BlockTemplate[]>;
  createBlockTemplate(template: InsertBlockTemplate): Promise<BlockTemplate>;
}

// =============================================================================
// DATABASE STORAGE IMPLEMENTATION
// =============================================================================

export class DatabaseStorage implements IStorage {
  // Landing Pages
  async getLandingPages(options?: { status?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<LandingPage>> {
    const db = getDb();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (options?.status) {
      conditions.push(eq(leadsLandingPages.status, options.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(leadsLandingPages)
        .where(whereClause)
        .orderBy(desc(leadsLandingPages.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(leadsLandingPages)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      success: true,
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getLandingPageById(id: string): Promise<LandingPage | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(leadsLandingPages)
      .where(eq(leadsLandingPages.id, id))
      .limit(1);
    return result[0];
  }

  async getLandingPageBySlug(slug: string): Promise<LandingPage | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(leadsLandingPages)
      .where(eq(leadsLandingPages.slug, slug))
      .limit(1);
    return result[0];
  }

  async createLandingPage(page: InsertLandingPage): Promise<LandingPage> {
    const db = getDb();
    const result = await db.insert(leadsLandingPages).values(page).returning();
    return result[0];
  }

  async updateLandingPage(id: string, page: Partial<InsertLandingPage>): Promise<LandingPage | undefined> {
    const db = getDb();
    const result = await db
      .update(leadsLandingPages)
      .set({ ...page, updatedAt: new Date() })
      .where(eq(leadsLandingPages.id, id))
      .returning();
    return result[0];
  }

  async deleteLandingPage(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(leadsLandingPages)
      .where(eq(leadsLandingPages.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementPageViews(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(leadsLandingPages)
      .set({ views: drizzleSql`${leadsLandingPages.views} + 1` })
      .where(eq(leadsLandingPages.id, id));
  }

  async incrementPageSubmissions(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(leadsLandingPages)
      .set({ submissions: drizzleSql`${leadsLandingPages.submissions} + 1` })
      .where(eq(leadsLandingPages.id, id));
  }

  // Property Appraisals
  async getAppraisals(options?: { status?: string; landingPageId?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<PropertyAppraisal>> {
    const db = getDb();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (options?.status) {
      conditions.push(eq(leadsPropertyAppraisals.status, options.status));
    }
    if (options?.landingPageId) {
      conditions.push(eq(leadsPropertyAppraisals.landingPageId, options.landingPageId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(leadsPropertyAppraisals)
        .where(whereClause)
        .orderBy(desc(leadsPropertyAppraisals.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(leadsPropertyAppraisals)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      success: true,
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getAppraisalById(id: string): Promise<PropertyAppraisal | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(leadsPropertyAppraisals)
      .where(eq(leadsPropertyAppraisals.id, id))
      .limit(1);
    return result[0];
  }

  async createAppraisal(appraisal: InsertPropertyAppraisal): Promise<PropertyAppraisal> {
    const db = getDb();
    const result = await db.insert(leadsPropertyAppraisals).values(appraisal).returning();
    return result[0];
  }

  async updateAppraisalStatus(id: string, status: string, notes?: string): Promise<PropertyAppraisal | undefined> {
    const db = getDb();
    const result = await db
      .update(leadsPropertyAppraisals)
      .set({ status, notes, updatedAt: new Date() })
      .where(eq(leadsPropertyAppraisals.id, id))
      .returning();
    return result[0];
  }

  // Generic Form Submissions
  async getFormSubmissions(options?: { pageType?: string; landingPageId?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<FormSubmission>> {
    const db = getDb();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (options?.pageType) {
      conditions.push(eq(leadsFormSubmissions.pageType, options.pageType));
    }
    if (options?.landingPageId) {
      conditions.push(eq(leadsFormSubmissions.landingPageId, options.landingPageId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(leadsFormSubmissions)
        .where(whereClause)
        .orderBy(desc(leadsFormSubmissions.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(leadsFormSubmissions)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      success: true,
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const db = getDb();
    const result = await db.insert(leadsFormSubmissions).values(submission).returning();
    return result[0];
  }

  // Suburbs
  async getSuburbs(options?: { isActive?: boolean }): Promise<Suburb[]> {
    const db = getDb();
    const conditions = [];
    if (options?.isActive !== undefined) {
      conditions.push(eq(leadsSuburbs.isActive, options.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.select().from(leadsSuburbs).where(whereClause);
  }

  async getSuburbByName(name: string): Promise<Suburb | undefined> {
    const db = getDb();
    const result = await db
      .select()
      .from(leadsSuburbs)
      .where(eq(leadsSuburbs.name, name))
      .limit(1);
    return result[0];
  }

  async createSuburb(suburb: InsertSuburb): Promise<Suburb> {
    const db = getDb();
    const result = await db.insert(leadsSuburbs).values(suburb).returning();
    return result[0];
  }

  async updateSuburb(id: string, suburb: Partial<InsertSuburb>): Promise<Suburb | undefined> {
    const db = getDb();
    const result = await db
      .update(leadsSuburbs)
      .set({ ...suburb, updatedAt: new Date() })
      .where(eq(leadsSuburbs.id, id))
      .returning();
    return result[0];
  }

  // Analytics Events
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const db = getDb();
    const result = await db.insert(leadsAnalyticsEvents).values(event).returning();
    return result[0];
  }

  async getAnalyticsEvents(options?: { landingPageId?: string; eventType?: string; startDate?: Date; endDate?: Date }): Promise<AnalyticsEvent[]> {
    const db = getDb();
    const conditions = [];

    if (options?.landingPageId) {
      conditions.push(eq(leadsAnalyticsEvents.landingPageId, options.landingPageId));
    }
    if (options?.eventType) {
      conditions.push(eq(leadsAnalyticsEvents.eventType, options.eventType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select()
      .from(leadsAnalyticsEvents)
      .where(whereClause)
      .orderBy(desc(leadsAnalyticsEvents.createdAt));
  }

  async getAnalyticsSummary(landingPageId: string): Promise<{
    totalViews: number;
    totalSubmissions: number;
    conversionRate: number;
    stepCompletions: Record<number, number>;
  }> {
    const db = getDb();

    // Get views count
    const viewsResult = await db
      .select({ count: count() })
      .from(leadsAnalyticsEvents)
      .where(
        and(
          eq(leadsAnalyticsEvents.landingPageId, landingPageId),
          eq(leadsAnalyticsEvents.eventType, "page_view")
        )
      );

    // Get submissions count
    const submissionsResult = await db
      .select({ count: count() })
      .from(leadsAnalyticsEvents)
      .where(
        and(
          eq(leadsAnalyticsEvents.landingPageId, landingPageId),
          eq(leadsAnalyticsEvents.eventType, "form_submit")
        )
      );

    // Get step completions
    const stepResults = await db
      .select({
        stepNumber: leadsAnalyticsEvents.stepNumber,
        count: count(),
      })
      .from(leadsAnalyticsEvents)
      .where(
        and(
          eq(leadsAnalyticsEvents.landingPageId, landingPageId),
          eq(leadsAnalyticsEvents.eventType, "step_complete")
        )
      )
      .groupBy(leadsAnalyticsEvents.stepNumber);

    const totalViews = viewsResult[0]?.count ?? 0;
    const totalSubmissions = submissionsResult[0]?.count ?? 0;
    const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;

    const stepCompletions: Record<number, number> = {};
    stepResults.forEach((step) => {
      if (step.stepNumber !== null) {
        stepCompletions[step.stepNumber] = step.count;
      }
    });

    return {
      totalViews,
      totalSubmissions,
      conversionRate,
      stepCompletions,
    };
  }

  // Block Templates
  async getBlockTemplates(options?: { category?: string }): Promise<BlockTemplate[]> {
    const db = getDb();
    const conditions = [];

    if (options?.category) {
      conditions.push(eq(leadsBlockTemplates.category, options.category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.select().from(leadsBlockTemplates).where(whereClause);
  }

  async createBlockTemplate(template: InsertBlockTemplate): Promise<BlockTemplate> {
    const db = getDb();
    const result = await db.insert(leadsBlockTemplates).values(template).returning();
    return result[0];
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
