"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useMilestoneEvidence } from "@/lib/hooks/useMilestoneEvidence";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  onUploadSuccess: () => void;
}

export function EvidenceUploadModal({
  isOpen,
  onClose,
  milestoneId,
  onUploadSuccess,
}: EvidenceUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const { uploadEvidence, isLoading, error } = useMilestoneEvidence();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!milestoneId) {
      toast.error("Milestone ID is missing.");
      return;
    }

    const result = await uploadEvidence(milestoneId, file, description);

    if (result.success) {
      toast.success("Evidence uploaded successfully!");
      onUploadSuccess(); // Refresh the list on the project page
      onClose(); // Close the modal
      // Reset form
      setFile(null);
      setDescription("");
    } else {
      toast.error(`Upload failed: ${result.error}`);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Evidence</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit your work for this milestone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="mt-2 bg-muted/50 border-border text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a comment about your evidence..."
              rows={3}
              className="mt-2 bg-muted/50 border-border text-foreground resize-none"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {isLoading ? "Uploading..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
