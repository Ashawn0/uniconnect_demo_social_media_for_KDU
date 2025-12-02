import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, resolveApiUrl } from "@/lib/queryClient";
import { FileText, Upload, Download } from "lucide-react";
import type { ResourceWithDetails, GroupWithMembers } from "@shared/schema";

export default function Resources() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: resources, isLoading } = useQuery<ResourceWithDetails[]>({
    queryKey: ["/api/resources"],
  });

  const { data: groups } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
  });

  const uploadResourceMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; fileType: string; fileUrl: string; groupId?: string }) => {
      return await apiRequest("/api/resources", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsUploadModalOpen(false);
      setTitle("");
      setDescription("");
      setFileType("");
      setSelectedFile(null);
      setSelectedGroupId("");
      toast({
        title: "Success",
        description: "Resource uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload resource",
        variant: "destructive",
      });
    },
  });

  const handleUploadResource = async () => {
    if (!title.trim() || !fileType.trim() || !selectedFile) {
      toast({
        title: "Error",
        description: "Please fill in required fields (title, file type, and file)",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch(resolveApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();

      uploadResourceMutation.mutate({
        title,
        description,
        fileType,
        fileUrl: result.url,
        groupId: selectedGroupId === "none" ? undefined : selectedGroupId || undefined,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (resource: ResourceWithDetails) => {
    try {
      setDownloadingId(resource.id);
      const downloadUrl = resolveApiUrl(`/api/resources/${resource.id}/download`);
      const opened = window.open(downloadUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        throw new Error("Please allow popups to download files.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open file",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">Academic Archive</p>
          <h1 className="mt-2 text-3xl font-semibold">Research &amp; Study Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share lecture notes, policy briefs, lab reports, and verified documentation with fellow students.
          </p>
        </div>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full bg-kdu-navy px-5 py-2 text-white hover:bg-kdu-blue" data-testid="button-upload-resource">
              <Upload className="h-4 w-4" />
              Upload Resource
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-upload-resource">
            <DialogHeader>
              <DialogTitle>Upload Study Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Title *</Label>
                <Input
                  id="resource-title"
                  placeholder="e.g., Linear Algebra Notes Chapter 5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-resource-title"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="file-type">File Type *</Label>
                  <Input
                    id="file-type"
                    placeholder="e.g., PDF, DOCX, PPTX"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    data-testid="input-file-type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-group">Group (Optional)</Label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger id="resource-group" data-testid="select-resource-group">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {groups?.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">File *</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  data-testid="input-file-upload"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-description">Description (Optional)</Label>
                <Textarea
                  id="resource-description"
                  placeholder="Add notes about this resource..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="input-resource-description"
                />
              </div>
              <Button
                onClick={handleUploadResource}
                className="w-full bg-kdu-navy text-white hover:bg-kdu-blue"
                disabled={uploadResourceMutation.isPending}
                data-testid="button-submit-resource"
              >
                {uploadResourceMutation.isPending ? "Uploading..." : "Upload Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl border border-border">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="flex flex-col rounded-2xl border border-border bg-card/80 shadow-sm"
              data-testid={`card-resource-${resource.id}`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="rounded-xl bg-kdu-navy/10 p-3 text-kdu-navy">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle
                        className="line-clamp-2 break-words text-lg font-semibold leading-snug"
                        data-testid={`text-resource-title-${resource.id}`}
                      >
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="mt-1 break-words text-sm text-muted-foreground">
                        {resource.fileType || "File"} {resource.group && `• ${resource.group.name}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-kdu-blue text-kdu-blue hover:bg-kdu-blue/10 sm:w-auto"
                    onClick={() => handleDownload(resource)}
                    disabled={downloadingId === resource.id}
                    data-testid={`button-download-${resource.id}`}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              {resource.description && (
                <CardContent className="border-t border-border/60 pt-4">
                  <p className="break-words text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-dashed border-border bg-card/60 text-center">
          <CardContent className="py-12">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No resources yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload study materials to share with your classmates.
            </p>
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-kdu-navy text-white hover:bg-kdu-blue" data-testid="button-upload-first-resource">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Resource
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
