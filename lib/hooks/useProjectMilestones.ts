"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Database } from "@/lib/supabase/types/database.gen";

// Usar tipos de Database en lugar de definir manualmente
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

export function useProjectMilestones(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const [projectResult, milestonesResult] = await Promise.all([
          supabase.from("projects").select("*").eq("id", projectId).single(),
          supabase
            .from("milestones")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: true }),
        ]);

        if (projectResult.error) {
          throw new Error(
            `Error fetching project: ${projectResult.error.message}`
          );
        }

        if (milestonesResult.error) {
          throw new Error(
            `Error fetching milestones: ${milestonesResult.error.message}`
          );
        }

        setProject(projectResult.data);
        // Ensure consistent ordering: by created_at first, then by id as tiebreaker
        const sortedMilestones = (milestonesResult.data || []).sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (dateA !== dateB) {
            return dateA - dateB;
          }
          // If created_at is the same, sort by id for consistent ordering
          return a.id.localeCompare(b.id);
        });
        setMilestones(sortedMilestones);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, supabase]);

  const fetchProject = async () => {
    setError(null);

    try {
      const { data, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Error fetching project: ${projectError.message}`);
      }

      setProject(data);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching project:", error);
      return null;
    }
  };

  const fetchMilestones = async () => {
    setError(null);

    try {
      const { data, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (milestonesError) {
        throw new Error(
          `Error fetching milestones: ${milestonesError.message}`
        );
      }

      // Ensure consistent ordering: by created_at first, then by id as tiebreaker
      const sortedMilestones = (data || []).sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        // If created_at is the same, sort by id for consistent ordering
        return a.id.localeCompare(b.id);
      });

      setMilestones(sortedMilestones);
      return sortedMilestones;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching milestones:", error);
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchProject(), fetchMilestones()]);
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMilestoneStatus = async (
    milestoneId: string,
    status: "pending" | "in_progress" | "completed"
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("milestones")
        .update({ status } as unknown as never)
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating milestone: ${error.message}`);
      }

      // Don't update local state here - fetchAllData() will be called after
      // and will fetch fresh data from DB in correct order (created_at ASC)
      // This ensures the order is always correct from the source of truth

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error updating milestone:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData: {
    title: string;
    description?: string;
    percentage: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const milestoneInsert = {
        project_id: projectId,
        title: milestoneData.title,
        description: milestoneData.description || null,
        percentage: milestoneData.percentage,
        status: "pending",
      } as const;

      const { data, error } = await supabase
        .from("milestones")
        .insert(milestoneInsert as unknown as never)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating milestone: ${error.message}`);
      }

      // Update local state
      setMilestones((prev) => [...prev, data]);

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error creating milestone:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMilestone = () => {
    return (
      milestones.find((m) => m.status === "in_progress") ||
      milestones.find((m) => m.status === "pending" || m.status === null) ||
      null
    );
  };

  const calculateProgress = () => {
    if (!milestones.length) return 0;
    const completedMilestones = milestones.filter(
      (m) => m.status === "completed"
    );
    return Math.round((completedMilestones.length / milestones.length) * 100);
  };

  const getMilestoneAmount = (milestone: Milestone, totalAmount: number) => {
    return Math.round(totalAmount * (milestone.percentage / 100));
  };

  return {
    project,
    milestones,
    loading,
    error,
    fetchProject,
    fetchMilestones,
    fetchAllData,
    updateMilestoneStatus,
    createMilestone,
    getCurrentMilestone,
    calculateProgress,
    getMilestoneAmount,
  };
}
