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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Upload, Download } from "lucide-react";
import type { ResourceWithDetails, GroupWithMembers } from "@shared/schema";

export default function Resources() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
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

  const downloadResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      return await apiRequest(`/api/resources/${resourceId}/download`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
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
      const uploadResponse = await apiRequest("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      await fetch(uploadResponse.uploadURL, {
        method: "PUT",
        body: selectedFile,
      });

      const aclResponse = await apiRequest("/api/images", {
        method: "PUT",
        body: JSON.stringify({ uploadId: uploadResponse.uploadId }),
        headers: { "Content-Type": "application/json" },
      });

      uploadResourceMutation.mutate({
        title,
        description,
        fileType,
        fileUrl: aclResponse.objectPath,
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
    downloadResourceMutation.mutate(resource.id);
    // Open file in new tab
    window.open(resource.fileUrl, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Study Resources</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share and download notes, PDFs, and study materials
            </p>
          </div>
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2" data-testid="button-upload-resource">
                <Upload className="w-4 h-4" />
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
                  className="w-full"
                  disabled={uploadResourceMutation.isPending}
                  data-testid="button-submit-resource"
                >
                  {uploadResourceMutation.isPending ? "Uploading..." : "Upload Resource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover-elevate" data-testid={`card-resource-${resource.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-kdugold/10 text-kdugold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate" data-testid={`text-resource-title-${resource.id}`}>
                          {resource.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {resource.fileType || 'File'}
                          {resource.group && ` • ${resource.group.name}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 shrink-0" 
                      onClick={() => handleDownload(resource)}
                      disabled={downloadResourceMutation.isPending}
                      data-testid={`button-download-${resource.id}`}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                {resource.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No resources yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload study materials to share with your classmates
              </p>
              <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" data-testid="button-upload-first-resource">
                    <Upload className="w-4 h-4 mr-2" />
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
