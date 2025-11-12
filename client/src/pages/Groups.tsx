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
  const [groupType, setGroupType] = useState<"study" | "club" | "project" | "social">("study");
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
      setGroupType("study");
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
        method: "POST",
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
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join groups to connect with students in your department, clubs, and interests
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2" data-testid="button-create-group">
                <Plus className="w-4 h-4" />
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
                    placeholder="e.g., CS Study Group"
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
                      <SelectItem value="study">Study Group</SelectItem>
                      <SelectItem value="club">Club</SelectItem>
                      <SelectItem value="project">Project Team</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea
                    id="group-description"
                    placeholder="Describe your group..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                    data-testid="input-group-description"
                  />
                </div>
                <Button 
                  onClick={handleCreateGroup}
                  className="w-full"
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
                  {isUserInGroup(group) ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2" 
                      onClick={() => leaveGroupMutation.mutate(group.id)}
                      disabled={leaveGroupMutation.isPending}
                      data-testid={`button-leave-${group.id}`}
                    >
                      <UserMinus className="w-4 h-4" />
                      Leave Group
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full gap-2" 
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={joinGroupMutation.isPending}
                      data-testid={`button-join-${group.id}`}
                    >
                      <UserPlus className="w-4 h-4" />
                      Join Group
                    </Button>
                  )}
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
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" data-testid="button-create-first-group">
                    <Plus className="w-4 h-4 mr-2" />
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
