import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download } from "lucide-react";
import type { ResourceWithDetails } from "@shared/schema";

export default function Resources() {
  const { data: resources, isLoading } = useQuery<ResourceWithDetails[]>({
    queryKey: ["/api/resources"],
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Study Resources</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share and download notes, PDFs, and study materials
            </p>
          </div>
          <Button variant="default" className="gap-2" data-testid="button-upload-resource">
            <Upload className="w-4 h-4" />
            Upload Resource
          </Button>
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
                    <Button variant="outline" size="sm" className="gap-2 shrink-0" data-testid={`button-download-${resource.id}`}>
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
              <Button variant="default" data-testid="button-upload-first-resource">
                <Upload className="w-4 h-4 mr-2" />
                Upload First Resource
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
