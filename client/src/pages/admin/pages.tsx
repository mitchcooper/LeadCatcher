import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import type { PaginatedResponse, LandingPage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// PAGES LIST
// =============================================================================

export default function AdminPages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch pages
  const { data, isLoading } = useQuery<PaginatedResponse<LandingPage>>({
    queryKey: ["/api/admin/pages"],
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/pages/${id}/publish`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page published",
        description: "Your page is now live.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish page.",
        variant: "destructive",
      });
    },
  });

  // Unpublish mutation
  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/pages/${id}/unpublish`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page unpublished",
        description: "Your page is now in draft mode.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unpublish page.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page deleted",
        description: "The page has been permanently deleted.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      });
    },
  });

  const pages = data?.data || [];

  return (
    <AdminLayout
      title="Landing Pages"
      description="Manage your landing pages"
      actions={
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      }
    >
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading pages...
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No landing pages yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first landing page to start generating leads.
            </p>
            <Button asChild>
              <Link href="/admin/pages/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Page
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Submissions</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => {
                const conversion =
                  page.views && page.views > 0
                    ? (((page.submissions || 0) / page.views) * 100).toFixed(1)
                    : "0";

                return (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      /p/{page.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          page.status === "published" ? "default" : "secondary"
                        }
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(page.views || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {(page.submissions || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{conversion}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/pages/${page.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {page.status === "published" && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`/p/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Live
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {page.status === "published" ? (
                            <DropdownMenuItem
                              onClick={() => unpublishMutation.mutate(page.id)}
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => publishMutation.mutate(page.id)}
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(page.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Landing Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? This action cannot be
              undone and will also delete all associated analytics data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
