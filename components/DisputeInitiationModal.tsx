"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DisputeInitiationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { reason: string; comments?: string; files: File[] }) => Promise<void>;
}

export function DisputeInitiationModal({ open, onOpenChange, onSubmit }: DisputeInitiationModalProps) {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }
    if (files.length === 0) {
      return;
    }
    setSubmitting(true);
    await onSubmit({ reason, comments: comments.trim() || undefined, files });
    setSubmitting(false);
    setReason("");
    setComments("");
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-background border-border">
        <DialogHeader>
          <DialogTitle>Open Dispute</DialogTitle>
          <DialogDescription>Provide details and attach at least one evidence file.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue with this milestone..."
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Comments (optional)</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any extra context to help the resolver..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Evidence (min. 1 file)</Label>
            <Input type="file" multiple onChange={handleFilesChange} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{files.length} file(s) selected</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason.trim() || files.length === 0}>
            {submitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


