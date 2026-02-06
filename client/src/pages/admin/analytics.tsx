import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import type { PaginatedResponse, LandingPage, ApiResponse } from "@shared/schema";
import { useState } from "react";

// =============================================================================
// STATS CARD
// =============================================================================

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: typeof Eye;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {change >= 0 ? (
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1">vs last period</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// FUNNEL CHART
// =============================================================================

function FunnelChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-sm text-muted-foreground">{item.value}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          {index < data.length - 1 && (
            <div className="flex justify-center my-1">
              <span className="text-xs text-muted-foreground">
                {item.value > 0
                  ? `${((data[index + 1]?.value || 0) / item.value * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// ANALYTICS PAGE
// =============================================================================

interface AnalyticsSummary {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  stepCompletions: Record<number, number>;
}

export default function AdminAnalytics() {
  const [selectedPage, setSelectedPage] = useState<string>("all");

  // Fetch landing pages
  const { data: pagesData } = useQuery<PaginatedResponse<LandingPage>>({
    queryKey: ["/api/admin/pages"],
  });

  // Fetch analytics for selected page
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<ApiResponse<AnalyticsSummary>>({
    queryKey: [`/api/admin/analytics/${selectedPage}`],
    enabled: selectedPage !== "all" && !!selectedPage,
  });

  const pages = pagesData?.data || [];

  // Calculate totals across all pages
  const totalViews = pages.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalSubmissions = pages.reduce((sum, p) => sum + (p.submissions || 0), 0);
  const overallConversion = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : "0";

  // Selected page data
  const selectedPageData = pages.find((p) => p.id === selectedPage);
  const analytics = analyticsData?.data;

  // Funnel data
  const funnelData = analytics
    ? [
        { label: "Page Views", value: analytics.totalViews },
        { label: "Step 1: Address", value: analytics.stepCompletions[1] || 0 },
        { label: "Step 2: Relationship", value: analytics.stepCompletions[2] || 0 },
        { label: "Step 3: Timeline", value: analytics.stepCompletions[3] || 0 },
        { label: "Step 4: Contact", value: analytics.stepCompletions[4] || 0 },
        { label: "Form Submitted", value: analytics.totalSubmissions },
      ]
    : selectedPage === "all"
    ? [
        { label: "Total Page Views", value: totalViews },
        { label: "Total Submissions", value: totalSubmissions },
      ]
    : [];

  return (
    <AdminLayout
      title="Analytics"
      description="Track performance across your landing pages"
    >
      {/* Page selector */}
      <div className="mb-6">
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages (Overview)</SelectItem>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Views"
          value={
            selectedPage === "all"
              ? totalViews.toLocaleString()
              : analytics?.totalViews?.toLocaleString() || selectedPageData?.views?.toLocaleString() || "0"
          }
          icon={Eye}
          description="Unique page views"
        />
        <StatsCard
          title="Submissions"
          value={
            selectedPage === "all"
              ? totalSubmissions.toLocaleString()
              : analytics?.totalSubmissions?.toLocaleString() || selectedPageData?.submissions?.toLocaleString() || "0"
          }
          icon={Users}
          description="Form completions"
        />
        <StatsCard
          title="Conversion Rate"
          value={
            selectedPage === "all"
              ? `${overallConversion}%`
              : `${analytics?.conversionRate?.toFixed(1) || "0"}%`
          }
          icon={TrendingUp}
          description="Views to submissions"
        />
        <StatsCard
          title="Active Pages"
          value={pages.filter((p) => p.status === "published").length}
          icon={Target}
          description="Currently published"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              {selectedPage === "all"
                ? "Overall form completion rate"
                : "Step-by-step conversion breakdown"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : funnelData.length > 0 ? (
              <FunnelChart data={funnelData} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {selectedPage === "all"
                  ? "No analytics data available"
                  : "Select a page to view funnel data"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page performance */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>Comparison across all pages</CardDescription>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pages to display
              </div>
            ) : (
              <div className="space-y-4">
                {pages.slice(0, 5).map((page) => {
                  const pageConversion =
                    page.views && page.views > 0
                      ? ((page.submissions || 0) / page.views) * 100
                      : 0;
                  return (
                    <div key={page.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{page.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(page.views || 0).toLocaleString()} views
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {pageConversion.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(page.submissions || 0).toLocaleString()} leads
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="flex items-center gap-4 pt-6">
          <BarChart3 className="h-10 w-10 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Enhanced Analytics Coming Soon</h3>
            <p className="text-sm text-blue-700">
              We're working on more detailed analytics including time-based trends,
              traffic source breakdowns, and A/B testing capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
