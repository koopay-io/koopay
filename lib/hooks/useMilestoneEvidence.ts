"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types/database.gen";

// Define the type for an evidence row, based on your new schema
type Evidence = Database["public"]["Tables"]["evidences"]["Row"];

export function useMilestoneEvidence() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const evidences_bucket = "evidences";

  // 1. Function to fetch evidence for a specific milestone
  const fetchEvidence = useCallback(
    async (milestoneId: string) => {
      if (!milestoneId) return;

      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("evidences")
          .select("*")
          .eq("milestone_id", milestoneId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEvidence(data || []);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        console.error("Error fetching evidence:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  // 2. Function to upload a new piece of evidence
  const uploadEvidence = async (
    milestoneId: string,
    file: File,
    description: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Use milestoneId as the folder name, as defined in the storage policy
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${milestoneId}/${fileName}`;

      // Upload to 'evidence' bucket
      const { error: uploadError } = await supabase.storage
        .from(evidences_bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(evidences_bucket).getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Could not get public URL for uploaded file");
      }

      // Insert record into 'evidences' table
      const evidenceData = {
        milestone_id: milestoneId,
        description: description,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        created_by: user.id,
      };

      const { data: newEvidence, error: insertError } = await supabase
        .from("evidences")
        .insert(evidenceData as never) // Use 'as never' to bypass type check if TS complains
        .select()
        .single();

      if (insertError) throw insertError;

      // Add new evidence to the local state
      setEvidence((prev) => [newEvidence, ...prev]);
      return { success: true, data: newEvidence };
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      console.error("Error uploading evidence:", e);
      return { success: false, error: e.message };
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
