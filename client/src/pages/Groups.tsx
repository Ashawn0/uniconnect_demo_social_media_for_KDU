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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Plus, UserPlus, UserMinus } from "lucide-react";
import type { GroupWithMembers } from "@shared/schema";

export default function Groups() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupType, setGroupType] = useState<"department" | "club" | "semester">("club");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: groups, isLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; type: string }) => {
      return await apiRequest("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateModalOpen(false);
      setGroupName("");
      setGroupDescription("");
      setGroupType("club");
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/groups/${groupId}/join`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Joined group successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/groups/${groupId}/leave`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Left group successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = () => {
    if (!groupName.trim() || !groupDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createGroupMutation.mutate({ name: groupName, description: groupDescription, type: groupType });
  };

  const isUserInGroup = (group: GroupWithMembers) => {
    return group.members.some(member => member.userId === user?.id);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kdu-blue">Communities</p>
          <h1 className="mt-2 text-3xl font-semibold">Student &amp; Faculty Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Collaborate with departments, study circles, clubs, and international cohorts.
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full bg-kdu-navy px-5 py-2 text-white hover:bg-kdu-blue" data-testid="button-create-group">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-group">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Smart Computing Cohort"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  data-testid="input-group-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-type">Group Type</Label>
                <Select value={groupType} onValueChange={(value: any) => setGroupType(value)}>
                  <SelectTrigger id="group-type" data-testid="select-group-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="semester">Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  placeholder="Describe the purpose, meeting cadence, or membership criteria…"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                  data-testid="input-group-description"
                />
              </div>
              <Button
                onClick={handleCreateGroup}
                className="w-full bg-kdu-navy text-white hover:bg-kdu-blue"
                disabled={createGroupMutation.isPending}
                data-testid="button-submit-group"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl border border-border">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="flex h-full flex-col rounded-2xl border border-border bg-card/80 shadow-sm"
              data-testid={`card-group-${group.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-kdu-navy/10 p-3 text-kdu-navy">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-group-name-${group.id}`}>
                        {group.name}
                      </CardTitle>
                      <CardDescription className="mt-1 capitalize">
                        {group.type} • {group.membersCount || 0} members
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-4 flex-1 break-words text-sm text-muted-foreground">{group.description}</p>
                {isUserInGroup(group) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full gap-2 border-kdu-blue text-kdu-blue hover:bg-kdu-blue/10"
                    onClick={() => leaveGroupMutation.mutate(group.id)}
                    disabled={leaveGroupMutation.isPending}
                    data-testid={`button-leave-${group.id}`}
                  >
                    <UserMinus className="h-4 w-4" />
                    Leave Group
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="mt-auto w-full gap-2 bg-kdu-navy text-white hover:bg-kdu-blue"
                    onClick={() => joinGroupMutation.mutate(group.id)}
                    disabled={joinGroupMutation.isPending}
                    data-testid={`button-join-${group.id}`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Group
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border border-dashed border-border bg-card/60 text-center">
          <CardContent className="py-12">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">No groups yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Be the first to create a group for your department or club
            </p>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-kdu-navy text-white hover:bg-kdu-blue" data-testid="button-create-first-group">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Group
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
