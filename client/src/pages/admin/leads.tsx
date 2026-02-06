import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import type { PaginatedResponse, PropertyAppraisal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// STATUS BADGE
// =============================================================================

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  converted: "bg-purple-100 text-purple-800",
  lost: "bg-gray-100 text-gray-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColors[status] || statusColors.new} variant="outline">
      {status}
    </Badge>
  );
}

// =============================================================================
// LEAD DETAIL MODAL
// =============================================================================

function LeadDetailModal({
  lead,
  open,
  onClose,
  onStatusChange,
}: {
  lead: PropertyAppraisal | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {lead.firstName} {lead.lastName}
            </span>
            <StatusBadge status={lead.status} />
          </DialogTitle>
          <DialogDescription>
            Submitted {new Date(lead.createdAt).toLocaleDateString()} at{" "}
            {new Date(lead.createdAt).toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </div>
          </div>

          {/* Property Address */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Property Address
            </h4>
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span className="text-sm">{lead.addressFull}</span>
            </div>
          </div>

          {/* Form Responses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Relationship to Property
              </h4>
              <p className="text-sm capitalize">
                {lead.relationship || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Selling Timeline
              </h4>
              <p className="text-sm capitalize">
                {lead.timeline?.replace(/-/g, " ") || "Not specified"}
              </p>
            </div>
          </div>

          {/* UTM Tracking */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Traffic Source
              </h4>
              <div className="flex flex-wrap gap-2">
                {lead.utmSource && (
                  <Badge variant="outline">Source: {lead.utmSource}</Badge>
                )}
                {lead.utmMedium && (
                  <Badge variant="outline">Medium: {lead.utmMedium}</Badge>
                )}
                {lead.utmCampaign && (
                  <Badge variant="outline">Campaign: {lead.utmCampaign}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Update Status
            </h4>
            <div className="flex gap-2">
              {["new", "contacted", "qualified", "converted", "lost"].map((s) => (
                <Button
                  key={s}
                  variant={lead.status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(lead.id, s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {lead.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// LEADS LIST
// =============================================================================

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<PropertyAppraisal | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch leads
  const { data, isLoading } = useQuery<PaginatedResponse<PropertyAppraisal>>({
    queryKey: ["/api/admin/appraisals", { status: statusFilter !== "all" ? statusFilter : undefined }],
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin/appraisals/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appraisals"] });
      toast({
        title: "Status updated",
        description: "Lead status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status });
    }
  };

  const leads = data?.data || [];
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      lead.firstName.toLowerCase().includes(search) ||
      lead.lastName.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.addressFull.toLowerCase().includes(search)
    );
  });

  return (
    <AdminLayout
      title="Leads"
      description="View and manage property appraisal requests"
      actions={
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No leads found"
                : "No leads yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Leads will appear here when visitors submit the appraisal form"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {lead.addressFull}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`mailto:${lead.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`tel:${lead.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, "contacted")}
                        >
                          Mark as Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, "qualified")}
                        >
                          Mark as Qualified
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination info */}
      {data?.pagination && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredLeads.length} of {data.pagination.total} leads
        </div>
      )}

      {/* Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}
