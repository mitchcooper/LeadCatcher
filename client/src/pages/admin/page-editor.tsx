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
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import type { ApiResponse, LandingPage, PageSection, BlockConfig } from "@shared/schema";
import { blockRegistry, generateBlockId } from "@/lib/blocks/registry";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
                  onChange={(e) => handleChange(prop.key, parseFloat(e.target.value))}
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
  onChange: (field: string, value: string) => void;
}

function PageSettings({
  name,
  slug,
  metaTitle,
  metaDescription,
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
  const [sections, setSections] = useState<PageSection[]>([
    { id: "main", name: "Main Content", blocks: [] },
  ]);

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
      if (data.data.sections && data.data.sections.length > 0) {
        setSections(data.data.sections);
      }
    }
  }, [data]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<ApiResponse<LandingPage>> => {
      const payload = {
        name,
        slug,
        metaTitle,
        metaDescription,
        sections,
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
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Block list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Blocks</h3>
                <Button size="sm" onClick={() => setShowBlockSelector(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Block
                </Button>
              </div>

              {sections[0].blocks.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No blocks yet. Add your first block to get started.
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

        <TabsContent value="settings">
          <div className="max-w-2xl">
            <PageSettings
              name={name}
              slug={slug}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
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
