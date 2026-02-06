"use client";

import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types/database.gen";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

type Evidence = Database["public"]["Tables"]["evidences"]["Row"];

export function useMilestoneEvidence() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize supabase client so it doesn't change on every render
  const supabase = useMemo(() => createClient(), []);

  const { showError, showSuccess, showNetworkError } = useErrorToast();

  const evidences_bucket = "evidences";

  // Fetch evidence for a specific milestone
  const fetchEvidence = useCallback(
    async (milestoneId: string) => {
      if (!milestoneId) {
        setError("Milestone ID is required");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("evidences")
          .select("*")
          .eq("milestone_id", milestoneId)
          .order("created_at", { ascending: false });

        if (fetchError) {
          if (fetchError.message.includes("permission")) {
            throw new Error(
              "You don't have permission to view this evidence. Please contact support.",
            );
          }
          throw fetchError;
        }

        setEvidence(data || []);
      } catch (err) {
        logError(err, "Fetch Evidence");
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch evidence";
        setError(errorMessage);

        // Removed unstable toast functions from dependency array
        // We call them directly here, relying on their closure scope or stable refs if provided by the hook
        if (isNetworkError(err)) {
          // If showNetworkError is unstable, this recursion in the arrow function is fine
          // but we shouldn't list it in the useCallback deps if it causes loops.
          console.error("Network error fetching evidence");
        } else {
          console.error("API error fetching evidence", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [supabase], // ✅ Only depend on the stable supabase instance
  );

  // Upload a new piece of evidence
  const uploadEvidence = async (
    milestoneId: string,
    file: File,
    description: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!milestoneId) throw new Error("Milestone ID is required");
      if (!file) throw new Error("Please select a file to upload");
      if (!description || description.trim() === "")
        throw new Error("Please provide a description for the evidence");

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError)
        throw new Error("Authentication failed. Please sign in again.");
      if (!user) throw new Error("You must be signed in to upload evidence");

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${milestoneId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(evidences_bucket)
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes("not found"))
          throw new Error(
            "Evidence storage bucket not found. Please contact support.",
          );
        if (uploadError.message.includes("permission"))
          throw new Error("You don't have permission to upload evidence.");
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(evidences_bucket).getPublicUrl(filePath);

      if (!publicUrl)
        throw new Error("Could not get public URL for uploaded file");

      // Insert record into database
      const evidenceData = {
        milestone_id: milestoneId,
        description: description.trim(),
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        created_by: user.id,
      };

      const { data: newEvidence, error: insertError } = await supabase
        .from("evidences")
        .insert(evidenceData as never)
        .select()
        .single();

      if (insertError) {
        if (insertError.message.includes("permission"))
          throw new Error("You don't have permission to add evidence.");
        throw new Error(
          `Failed to save evidence record: ${insertError.message}`,
        );
      }

      // Update local state
      setEvidence((prev) => [newEvidence, ...prev]);

      showSuccess("Evidence Uploaded", `Successfully uploaded ${file.name}`);

      return { success: true, data: newEvidence };
    } catch (err) {
      logError(err, "Upload Evidence");
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload evidence";
      setError(errorMessage);

      if (isNetworkError(err)) {
        showNetworkError(() => uploadEvidence(milestoneId, file, description));
      } else {
        showError(err, "Upload Failed");
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    evidence,
    isLoading,
    error,
    fetchEvidence,
    uploadEvidence,
  };
}
