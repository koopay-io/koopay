"use client";

// All your existing client-side imports
import { DonutChart } from "@/components/DonutChart";
import { useGlobalStore } from "@/lib/stores/globalStore";
import { ProfileCard } from "./ProfileCard";
import { CreateProjectCard } from "./CreateProjectCard";
import { ProjectsSection } from "./ProjectsSection";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Define the props it accepts from the Server Component
type ProjectCardData = React.ComponentProps<
  typeof ProjectsSection
>["projects"][0];

interface PlatformClientProps {
  projects: ProjectCardData[];
}

export function PlatformClient({ projects }: PlatformClientProps) {
  // Get the organization from the global store (populated by the layout)
  const { currentOrganization } = useGlobalStore();

  return (
    <div>
      {/* Mobile Search Bar */}
      <div className="lg:hidden mb-4">
        <div className="relative">
          <Input
            placeholder="Search providers or requesters"
            className="bg-[#16132C] text-tertiary-foreground placeholder:text-primary-foreground rounded-full px-6 border-none outline-none hover:outline-none focus-visible:ring-0 w-full"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-foreground h-4 w-4" />
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {/* Desktop: Left Column - Profile & Create Project */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
          <div className="order-1 lg:order-1 lg:h-[160px]">
            {/* This component gets the org from the global store */}
            <ProfileCard organization={currentOrganization} />
          </div>
          <div className="order-3 lg:order-2 lg:h-[160px]">
            <CreateProjectCard />
          </div>
        </div>

        {/* Desktop: Right Column - Statistics */}
        <div className="lg:col-span-7 w-full order-2 lg:order-2 lg:h-[336px]">
          <DonutChart />
        </div>
      </div>

      {/* Projects Section - Now using real data from props */}
      <ProjectsSection projects={projects} />
    </div>
  );
}
