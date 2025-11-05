"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

interface MilestoneEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  onSave: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
}

export function MilestoneEditModal({
  isOpen,
  onClose,
  milestone,
  onSave,
  onDelete,
}: MilestoneEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    percentage: 0,
  });

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description,
        deadline: milestone.deadline,
        percentage: milestone.percentage,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        deadline: "",
        percentage: 0,
      });
    }
  }, [milestone]);

  const handleSave = () => {
    const milestoneData: Milestone = {
      id: milestone?.id || "", // Use existing ID or empty string for new milestones
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      percentage: formData.percentage,
    };

    onSave(milestoneData);
    onClose();
  };

  const handleDelete = () => {
    if (milestone && onDelete) {
      onDelete(milestone.id);
      onClose();
    }
  };

  const isNewMilestone = !milestone;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isNewMilestone ? "Add Milestone" : "Edit Milestone"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isNewMilestone
              ? "Add a new milestone to your project"
              : "Modify the milestone details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Milestone Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="E.g: Hero section, Landing page, etc."
              className="bg-muted/50 border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this milestone includes..."
              rows={3}
              className="bg-muted/50 border-border text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Deadline *
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="bg-muted/50 border-border text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Percentage of Total *
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    percentage: Number(e.target.value),
                  }))
                }
                placeholder="20"
                className="bg-muted/50 border-border text-foreground"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {!isNewMilestone && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.title ||
                !formData.deadline ||
                formData.percentage <= 0
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isNewMilestone ? "Add" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
