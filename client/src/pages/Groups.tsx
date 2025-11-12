import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import type { GroupWithMembers } from "@shared/schema";

export default function Groups() {
  const { data: groups, isLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join groups to connect with students in your department, clubs, and interests
            </p>
          </div>
          <Button variant="default" className="gap-2" data-testid="button-create-group">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-kdublue/10 text-kdublue">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-group-name-${group.id}`}>
                          {group.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {group.type} • {group.membersCount || 0} members
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-join-${group.id}`}>
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to create a group for your department or club
              </p>
              <Button variant="default" data-testid="button-create-first-group">
                <Plus className="w-4 h-4 mr-2" />
                Create First Group
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
