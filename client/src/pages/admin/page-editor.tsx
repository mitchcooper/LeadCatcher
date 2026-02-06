import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { AdminLayout } from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Eye,
  Settings,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Video,
  MessageSquare,
  Layers,
} from "lucide-react";
import type { ApiResponse, LandingPage, PageSection, BlockConfig, FormFlow, PageType } from "@shared/schema";
import { PAGE_TYPES, PAGE_TYPE_LABELS } from "@shared/schema";
import { blockRegistry } from "@/lib/blocks/registry";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { PageTemplate } from "@shared/page-templates";

// =============================================================================
// PAGE TYPE ICONS
// =============================================================================

const PAGE_TYPE_ICONS: Record<PageType, typeof FileText> = {
  appraisal: FileText,
  lead_magnet: Download,
  newsletter: Mail,
  webinar: Video,
  inquiry: MessageSquare,
  custom: Layers,
};

// =============================================================================
// TEMPLATE PICKER (shown when creating a new page)
// =============================================================================

function TemplatePicker({
  onSelect,
}: {
  onSelect: (template: PageTemplate) => void;
}) {
  const { data } = useQuery<ApiResponse<PageTemplate[]>>({
    queryKey: ["/api/admin/page-templates"],
  });

  const templates = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create a New Page</h2>
        <p className="text-muted-foreground mt-1">
          Choose a template to get started. You can customize everything after.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = PAGE_TYPE_ICONS[template.pageType] || Layers;
          return (
            <Card
              key={template.pageType}
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
              onClick={() => onSelect(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{template.formFlow.steps.length} form step{template.formFlow.steps.length !== 1 ? "s" : ""}</span>
                  <span>&middot;</span>
                  <span>{template.sections.length} section{template.sections.length !== 1 ? "s" : ""}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// BLOCK SELECTOR
// =============================================================================

function BlockSelector({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  const blocksByCategory = blockRegistry.getByCategory();

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Block</SheetTitle>
          <SheetDescription>
            Select a block type to add to your page
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {Object.entries(blocksByCategory).map(([category, blocks]) => {
            if (blocks.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 capitalize">
                  {category.replace("-", " ")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {blocks.map((block) => (
                    <button
                      key={block.type}
                      onClick={() => {
                        onSelect(block.type);
                        onClose();
                      }}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <p className="font-medium text-sm">{block.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {block.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// BLOCK PROPERTIES EDITOR
// =============================================================================

function BlockPropertiesEditor({
  block,
  onUpdate,
  onClose,
}: {
  block: BlockConfig;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const metadata = blockRegistry.getMetadata(block.type);
  const [localProps, setLocalProps] = useState(block.props);

  if (!metadata) return null;

  const handleChange = (key: string, value: unknown) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    onUpdate(newProps);
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{metadata.name} Settings</SheetTitle>
          <SheetDescription>{metadata.description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {metadata.propsSchema?.map((prop) => (
            <div key={prop.key} className="space-y-2">
              <Label htmlFor={prop.key}>{prop.label}</Label>
              {prop.type === "text" && (
                <Input
                  id={prop.key}
                  value={(localProps[prop.key] as string) || ""}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  placeholder={prop.placeholder}
                />
              )}
              {prop.type === "textarea" && (
                <Textarea
                  id={prop.key}
                  value={(localProps[prop.key] as string) || ""}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  placeholder={prop.placeholder}
                />
              )}
              {prop.type === "number" && (
                <Input
                  id={prop.key}
                  type="number"
                  value={(localProps[prop.key] as number) || 0}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!Number.isNaN(parsed)) {
                      handleChange(prop.key, parsed);
                    }
                  }}
                />
              )}
              {prop.type === "boolean" && (
                <Select
                  value={localProps[prop.key] ? "true" : "false"}
                  onValueChange={(v) => handleChange(prop.key, v === "true")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {prop.type === "select" && prop.options && (
                <Select
                  value={(localProps[prop.key] as string) || (prop.default as string)}
                  onValueChange={(v) => handleChange(prop.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prop.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {prop.type === "image" && (
                <Input
                  id={prop.key}
                  value={(localProps[prop.key] as string) || ""}
                  onChange={(e) => handleChange(prop.key, e.target.value)}
                  placeholder="Enter image URL"
                />
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// PAGE SETTINGS
// =============================================================================

interface PageSettingsProps {
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  pageType: PageType;
  onChange: (field: string, value: string) => void;
}

function PageSettings({
  name,
  slug,
  metaTitle,
  metaDescription,
  pageType,
  onChange,
}: PageSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Settings</CardTitle>
        <CardDescription>Basic page information and SEO</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Page Type</Label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {(() => {
              const Icon = PAGE_TYPE_ICONS[pageType] || Layers;
              return <Icon className="h-4 w-4 text-primary" />;
            })()}
            <span className="font-medium text-sm">{PAGE_TYPE_LABELS[pageType]}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Page type is set when creating a page and determines the form behavior.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Page Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="My Landing Page"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/p/</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="my-page"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            placeholder="Page title for search engines"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            placeholder="Brief description for search engines"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// FORM FLOW EDITOR
// =============================================================================

function FormFlowEditor({
  formFlow,
  onUpdate,
}: {
  formFlow: FormFlow;
  onUpdate: (flow: FormFlow) => void;
}) {
  const updateStep = (stepIndex: number, field: string, value: string) => {
    const updated = { ...formFlow };
    updated.steps = [...updated.steps];
    updated.steps[stepIndex] = { ...updated.steps[stepIndex], [field]: value };
    onUpdate(updated);
  };

  const updateSubmitSettings = (field: string, value: string) => {
    onUpdate({ ...formFlow, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Flow</CardTitle>
        <CardDescription>
          Configure the steps and fields in your form. Each step is shown one at a time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {formFlow.steps.map((step, index) => (
          <div key={step.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                Step {index + 1}: {step.title}
              </h4>
              <span className="text-xs text-muted-foreground">
                {step.blocks.length} field{step.blocks.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Step Title</Label>
              <Input
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
              />
            </div>
            {step.description !== undefined && (
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={step.description || ""}
                  onChange={(e) => updateStep(index, "description", e.target.value)}
                  placeholder="Brief description for this step"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fields in this step:</Label>
              <div className="flex flex-wrap gap-1">
                {step.blocks.map((block) => {
                  const meta = blockRegistry.getMetadata(block.type);
                  return (
                    <span
                      key={block.id}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs"
                    >
                      {meta?.name || block.type}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm">Submission Settings</h4>
          <div className="space-y-2">
            <Label>Submit Button Text</Label>
            <Input
              value={formFlow.submitButtonText || ""}
              onChange={(e) => updateSubmitSettings("submitButtonText", e.target.value)}
              placeholder="Submit"
            />
          </div>
          <div className="space-y-2">
            <Label>Success Title</Label>
            <Input
              value={formFlow.successTitle || ""}
              onChange={(e) => updateSubmitSettings("successTitle", e.target.value)}
              placeholder="Thank You!"
            />
          </div>
          <div className="space-y-2">
            <Label>Success Message</Label>
            <Textarea
              value={formFlow.successMessage || ""}
              onChange={(e) => updateSubmitSettings("successMessage", e.target.value)}
              placeholder="We've received your submission."
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAGE EDITOR
// =============================================================================

export default function PageEditor() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isNew = !params.id || params.id === "new";

  // Page state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [pageType, setPageType] = useState<PageType>("appraisal");
  const [sections, setSections] = useState<PageSection[]>([
    { id: "main", name: "Main Content", blocks: [] },
  ]);
  const [formFlow, setFormFlow] = useState<FormFlow>({ steps: [] });
  const [templateSelected, setTemplateSelected] = useState(false);

  // UI state
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockConfig | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  // Fetch existing page
  const { data, isLoading } = useQuery<ApiResponse<LandingPage>>({
    queryKey: [`/api/admin/pages/${params.id}`],
    enabled: !isNew && !!params.id,
  });

  // Initialize form from fetched data
  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setSlug(data.data.slug);
      setMetaTitle(data.data.metaTitle || "");
      setMetaDescription(data.data.metaDescription || "");
      setPageType((data.data.pageType || "appraisal") as PageType);
      if (data.data.sections && data.data.sections.length > 0) {
        setSections(data.data.sections);
      }
      const flow = data.data.formFlow as FormFlow | undefined;
      if (flow && flow.steps && flow.steps.length > 0) {
        setFormFlow(flow);
      }
      setTemplateSelected(true); // Existing pages skip template picker
    }
  }, [data]);

  // Handle template selection for new pages
  const handleTemplateSelect = (template: PageTemplate) => {
    setPageType(template.pageType);
    setName(template.name);
    setSlug(`${template.defaultSlugPrefix}-${Date.now().toString(36)}`);
    setSections(template.sections);
    setFormFlow(template.formFlow);
    if (template.themeConfig) {
      // Theme config would be saved with the page
    }
    setTemplateSelected(true);
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<ApiResponse<LandingPage>> => {
      const payload = {
        name,
        slug,
        metaTitle,
        metaDescription,
        pageType,
        sections,
        formFlow,
      };

      if (isNew) {
        return apiRequest<ApiResponse<LandingPage>>("/api/admin/pages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest<ApiResponse<LandingPage>>(`/api/admin/pages/${params.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Saved",
        description: "Your page has been saved.",
      });
      if (isNew && result.data?.id) {
        navigate(`/admin/pages/${result.data.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save page.",
        variant: "destructive",
      });
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (): Promise<ApiResponse<LandingPage>> => {
      return apiRequest<ApiResponse<LandingPage>>(`/api/admin/pages/${params.id}/publish`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/pages/${params.id}`] });
      toast({
        title: "Published",
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

  // Add block
  const handleAddBlock = (type: string) => {
    const defaultConfig = blockRegistry.createDefaultConfig(type);
    if (!defaultConfig) return;

    setSections((prev) => {
      const updated = [...prev];
      updated[0].blocks.push(defaultConfig);
      return updated;
    });
  };

  // Update block
  const handleUpdateBlock = (blockId: string, props: Record<string, unknown>) => {
    setSections((prev) => {
      return prev.map((section) => ({
        ...section,
        blocks: section.blocks.map((block) =>
          block.id === blockId ? { ...block, props } : block
        ),
      }));
    });
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    setSections((prev) => {
      return prev.map((section) => ({
        ...section,
        blocks: section.blocks.filter((block) => block.id !== blockId),
      }));
    });
    setEditingBlock(null);
  };

  // Move block
  const handleMoveBlock = (blockId: string, direction: "up" | "down") => {
    setSections((prev) => {
      return prev.map((section) => {
        const blocks = [...section.blocks];
        const index = blocks.findIndex((b) => b.id === blockId);
        if (index === -1) return section;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return section;

        [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
        return { ...section, blocks };
      });
    });
  };

  // Handle settings change
  const handleSettingsChange = (field: string, value: string) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "slug":
        setSlug(value);
        break;
      case "metaTitle":
        setMetaTitle(value);
        break;
      case "metaDescription":
        setMetaDescription(value);
        break;
    }
  };

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="p-8 text-center text-muted-foreground">
          Loading page...
        </div>
      </AdminLayout>
    );
  }

  // Show template picker for new pages
  if (isNew && !templateSelected) {
    return (
      <AdminLayout
        title="New Page"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      >
        <TemplatePicker onSelect={handleTemplateSelect} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Page" : `Edit: ${name}`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {!isNew && slug && (
            <Button variant="outline" asChild>
              <a href={`/preview/${slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
          )}
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
          {!isNew && data?.data?.status !== "published" && (
            <Button
              variant="default"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="form">Form Flow</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Block list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Content Blocks</h3>
                <Button size="sm" onClick={() => setShowBlockSelector(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Block
                </Button>
              </div>

              {sections[0].blocks.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No content blocks yet. Add blocks like headlines, images, and testimonials.
                  </p>
                  <Button onClick={() => setShowBlockSelector(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Block
                  </Button>
                </Card>
              ) : (
                <div className="space-y-2">
                  {sections[0].blocks.map((block, index) => {
                    const metadata = blockRegistry.getMetadata(block.type);
                    return (
                      <Card
                        key={block.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveBlock(block.id, "up")}
                              disabled={index === 0}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveBlock(block.id, "down")}
                              disabled={index === sections[0].blocks.length - 1}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{metadata?.name || block.type}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {metadata?.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingBlock(block)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBlock(block.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <h3 className="font-medium mb-4">Preview</h3>
              <div className="border rounded-lg p-4 bg-white overflow-auto max-h-[600px]">
                <div className="transform scale-50 origin-top-left w-[200%]">
                  {sections[0].blocks.map((block) => (
                    <div key={block.id} className="mb-4">
                      <BlockRenderer config={block} isEditing />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="form">
          <div className="max-w-2xl">
            {formFlow.steps.length > 0 ? (
              <FormFlowEditor formFlow={formFlow} onUpdate={setFormFlow} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  This page uses the legacy appraisal form flow. To use a configurable form,
                  create a new page from a template.
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-2xl">
            <PageSettings
              name={name}
              slug={slug}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              pageType={pageType}
              onChange={handleSettingsChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Block selector */}
      {showBlockSelector && (
        <BlockSelector
          onSelect={handleAddBlock}
          onClose={() => setShowBlockSelector(false)}
        />
      )}

      {/* Block properties editor */}
      {editingBlock && (
        <BlockPropertiesEditor
          block={editingBlock}
          onUpdate={(props) => handleUpdateBlock(editingBlock.id, props)}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </AdminLayout>
  );
}
