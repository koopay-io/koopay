"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Database } from "@/lib/supabase/types/database.gen";
import { useErrorToast } from "./useErrorToast";
import { logError, isNetworkError } from "@/lib/utils/errorHelpers";

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

export function useProjectMilestones(projectId: string) {
	const [project, setProject] = useState<Project | null>(null);
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = createClient();
	const { showError, showSuccess, showNetworkError, showAPIError } =
		useErrorToast();

	useEffect(() => {
		const fetchData = async () => {
			if (!projectId) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const [projectResult, milestonesResult] = await Promise.all([
					supabase
						.from("projects")
						.select("*")
						.eq("id", projectId)
						.single(),
					supabase
						.from("milestones")
						.select("*")
						.eq("project_id", projectId)
						.order("created_at", { ascending: true }),
				]);

				if (projectResult.error) {
					if (projectResult.error.code === "PGRST116") {
						throw new Error(
							"Project not found. It may have been deleted.",
						);
					}
					if (projectResult.error.message.includes("permission")) {
						throw new Error(
							"You don't have permission to view this project.",
						);
					}
					throw new Error(
						`Error fetching project: ${projectResult.error.message}`,
					);
				}

				if (milestonesResult.error) {
					if (milestonesResult.error.message.includes("permission")) {
						throw new Error(
							"You don't have permission to view milestones for this project.",
						);
					}
					throw new Error(
						`Error fetching milestones: ${milestonesResult.error.message}`,
					);
				}

				setProject(projectResult.data);

				const sortedMilestones = (milestonesResult.data || []).sort(
					(a, b) => {
						const dateA = a.created_at
							? new Date(a.created_at).getTime()
							: 0;
						const dateB = b.created_at
							? new Date(b.created_at).getTime()
							: 0;
						if (dateA !== dateB) {
							return dateA - dateB;
						}
						return a.id.localeCompare(b.id);
					},
				);
				setMilestones(sortedMilestones);
			} catch (error) {
				logError(error, "Fetch Project Data");
				const errorMessage =
					error instanceof Error
						? error.message
						: "Unknown error occurred";
				setError(errorMessage);

				if (isNetworkError(error)) {
					showNetworkError(() => fetchData());
				} else {
					showAPIError(error, "Failed to Load Project");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [projectId, supabase, showNetworkError, showAPIError]);

	const fetchProject = async () => {
		setError(null);

		try {
			const { data, error: projectError } = await supabase
				.from("projects")
				.select("*")
				.eq("id", projectId)
				.single();

			if (projectError) {
				if (projectError.code === "PGRST116") {
					throw new Error("Project not found");
				}
				throw new Error(`Error fetching project: ${projectError.message}`);
			}

			setProject(data);
			return data;
		} catch (error) {
			logError(error, "Fetch Project");
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(fetchProject);
			} else {
				showAPIError(error, "Failed to Fetch Project");
			}

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
					`Error fetching milestones: ${milestonesError.message}`,
				);
			}

			const sortedMilestones = (data || []).sort((a, b) => {
				const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
				const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
				if (dateA !== dateB) {
					return dateA - dateB;
				}
				return a.id.localeCompare(b.id);
			});

			setMilestones(sortedMilestones);
			return sortedMilestones;
		} catch (error) {
			logError(error, "Fetch Milestones");
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(fetchMilestones);
			} else {
				showAPIError(error, "Failed to Fetch Milestones");
			}

			return [];
		}
	};

	const fetchAllData = async () => {
		setLoading(true);
		setError(null);

		try {
			await Promise.all([fetchProject(), fetchMilestones()]);
		} catch (error) {
			logError(error, "Fetch All Data");
		} finally {
			setLoading(false);
		}
	};

	const updateMilestoneStatus = async (
		milestoneId: string,
		status: "pending" | "in_progress" | "completed",
		paymentHash?: string | null,
	) => {
		if (!milestoneId) {
			showError({ message: "Milestone ID is required" }, "Update Failed");
			return null;
		}

		setLoading(true);
		setError(null);

		try {
			const updateData: Record<string, unknown> = { status };

			if (paymentHash) {
				updateData.payment_hash = paymentHash;
				updateData.payment_sent_at = new Date().toISOString();
			}

			const { data, error } = await supabase
				.from("milestones")
				.update(updateData as never)
				.eq("id", milestoneId)
				.select()
				.single();

			if (error) {
				if (error.message.includes("permission")) {
					throw new Error(
						"You don't have permission to update this milestone.",
					);
				}
				throw new Error(`Error updating milestone: ${error.message}`);
			}

			showSuccess("Milestone Updated", `Status changed to ${status}`);

			// Refresh milestones to ensure UI is in sync
			await fetchMilestones();

			return data;
		} catch (error) {
			logError(error, "Update Milestone Status");
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(() =>
					updateMilestoneStatus(milestoneId, status, paymentHash),
				);
			} else {
				showError(error, "Failed to Update Milestone");
			}

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
		// Validate input
		if (!milestoneData.title || milestoneData.title.trim() === "") {
			showError(
				{ message: "Milestone title is required" },
				"Validation Error",
			);
			return null;
		}

		if (milestoneData.percentage <= 0 || milestoneData.percentage > 100) {
			showError(
				{ message: "Percentage must be between 1 and 100" },
				"Validation Error",
			);
			return null;
		}

		setLoading(true);
		setError(null);

		try {
			const milestoneInsert = {
				project_id: projectId,
				title: milestoneData.title.trim(),
				description: milestoneData.description?.trim() || null,
				percentage: milestoneData.percentage,
				status: "pending",
			} as const;

			const { data, error } = await supabase
				.from("milestones")
				.insert(milestoneInsert as unknown as never)
				.select()
				.single();

			if (error) {
				if (error.message.includes("permission")) {
					throw new Error(
						"You don't have permission to create milestones for this project.",
					);
				}
				throw new Error(`Error creating milestone: ${error.message}`);
			}

			setMilestones((prev) => [...prev, data]);
			showSuccess(
				"Milestone Created",
				`"${milestoneData.title}" has been added to the project`,
			);

			return data;
		} catch (error) {
			logError(error, "Create Milestone");
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setError(errorMessage);

			if (isNetworkError(error)) {
				showNetworkError(() => createMilestone(milestoneData));
			} else {
				showError(error, "Failed to Create Milestone");
			}

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
			(m) => m.status === "completed",
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
