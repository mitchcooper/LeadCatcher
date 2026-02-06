import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";
import type { PaginatedResponse, LandingPage, PropertyAppraisal } from "@shared/schema";

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function AdminDashboard() {
  // Fetch landing pages
  const { data: pagesData, isLoading: pagesLoading } = useQuery<PaginatedResponse<LandingPage>>({
    queryKey: ["/api/admin/pages"],
  });

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading } = useQuery<PaginatedResponse<PropertyAppraisal>>({
    queryKey: ["/api/admin/appraisals"],
  });

  const pages = pagesData?.data || [];
  const leads = leadsData?.data || [];
  const totalViews = pages.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalSubmissions = pages.reduce((sum, p) => sum + (p.submissions || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : "0";

  // Recent leads (last 5)
  const recentLeads = leads.slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your landing pages and leads"
      actions={
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagesLoading ? "-" : pages.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {pages.filter(p => p.status === "published").length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadsLoading ? "-" : leadsData?.pagination?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === "new").length} new
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagesLoading ? "-" : totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Views to submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest property appraisal requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leads yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.addressFull}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={lead.status === "new" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {lead.status}
                      </Badge>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Landing Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Landing Pages</CardTitle>
              <CardDescription>Your active landing pages</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/pages">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No pages yet</p>
                <Button size="sm" asChild>
                  <Link href="/admin/pages/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Page
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pages.slice(0, 5).map((page) => (
                  <Link
                    key={page.id}
                    href={`/admin/pages/${page.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{page.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{page.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <Badge
                        variant={page.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {page.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{page.views || 0}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
