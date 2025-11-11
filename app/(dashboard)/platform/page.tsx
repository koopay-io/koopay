import { createClient } from "@/lib/supabase/server";
import { PlatformClient } from "./_components/PlatformClient";
import { Database } from "@/lib/supabase/types/database.gen";
import { redirect } from "next/navigation";
import { ProjectsSection } from "./_components/ProjectsSection"; // Import for prop types
import { formatDateRange, formatTotalPay } from "@/lib/utils";

type ProjectCardData = React.ComponentProps<
  typeof ProjectsSection
>["projects"][0];

type ProjectWithMilestoneCount =
  Database["public"]["Tables"]["projects"]["Row"] & {
    milestones: [{ count: number }];
  };

export default async function Home() {
  const { projects, error } = await getProjects();
  if (error) {
    console.error("Error fetching projects:", error.message);
  }

  const formattedProjects: ProjectCardData[] = (projects || []).map(
    (project) => {
      const statusMap: Record<
        Database["public"]["Enums"]["project_status"],
        ProjectCardData["status"]
      > = {
        draft: "in_progress",
        active: "in_progress",
        completed: "done",
        cancelled: "canceled",
      };

      return {
        id: project.id,
        title: project.title,
        status: statusMap[project.status || "draft"],
        collaborator: "N/A", // Collaborator name is 'N/A' for now due to RLS. TODO! Fix this
        dateRange: formatDateRange(
          project.created_at,
          project.expected_delivery_date,
        ),
        milestones: project.milestones[0]?.count || 0,
        totalPay: formatTotalPay(project.total_amount),
      };
    },
  );

  return <PlatformClient projects={formattedProjects} />;
}

async function getProjects() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: projectsData, error: projectsError } = (await supabase
    .from("projects")
    .select("*, milestones(count)") // Get project data and a count of milestones
    .or(`contractor_id.eq.${user.id},freelancer_id.eq.${user.id}`) // Get projects for this user
    .order("created_at", { ascending: false })
    .limit(10)) as { data: ProjectWithMilestoneCount[] | null; error: any };

  return {
    projects: projectsData || [],
    error: projectsError,
  };
}
