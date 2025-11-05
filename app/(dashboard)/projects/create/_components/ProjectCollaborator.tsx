"use client";

import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

// Define the props
interface Collaborator {
  id: string;
  full_name: string;
  position: string;
}

interface ProjectCollaboratorProps {
  selectedCollaborator: Collaborator | null;
  onOpenModal: () => void;
  onClearCollaborator: () => void;
}

export function ProjectCollaborator({
  selectedCollaborator,
  onOpenModal,
  onClearCollaborator,
}: ProjectCollaboratorProps) {
  if (selectedCollaborator) {
    return (
      <div className="p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                {selectedCollaborator.full_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedCollaborator.position}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCollaborator}
            className="text-muted-foreground hover:text-foreground"
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onOpenModal}
      className="w-full gap-2 border-border text-foreground hover:bg-muted/50 h-12"
    >
      <span className="text-foreground">Assign Collaborator</span>
      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <Plus className="h-4 w-4 text-white" />
      </div>
    </Button>
  );
}
