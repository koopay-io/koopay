'use client';

import { DonutChart } from '@/components/DonutChart';
import { useGlobalStore } from '@/lib/stores/globalStore';
import { ProfileCard } from './_components/ProfileCard';
import { CreateProjectCard } from './_components/CreateProjectCard';
import { ProjectsSection } from './_components/ProjectsSection';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const mockProjects = [
  {
    title: 'Logo Design',
    status: 'in_progress' as const,
    collaborator: 'Juan Barcos',
    dateRange: 'From 14/02/25 to 14/04/25',
    milestones: 5,
    totalPay: '$4000USD',
  },
  {
    title: 'Landing Page',
    status: 'canceled' as const,
    collaborator: 'Micaela Gomez',
    dateRange: 'From 13/02/25 to 29/05/25',
    milestones: 23,
    totalPay: '$1000USD',
  },
  {
    title: 'Logo Design',
    status: 'done' as const,
    collaborator: 'Juan Barcos',
    dateRange: 'From 14/02/25 to 14/04/25',
    milestones: 5,
    totalPay: '$3000USD',
  },
  {
    title: 'Mobile App',
    status: 'in_progress' as const,
    collaborator: 'Carlos Rodriguez',
    dateRange: 'From 01/03/25 to 15/06/25',
    milestones: 8,
    totalPay: '$6000USD',
  },
  {
    title: 'E-commerce Platform',
    status: 'done' as const,
    collaborator: 'Ana Martinez',
    dateRange: 'From 10/01/25 to 20/03/25',
    milestones: 12,
    totalPay: '$8000USD',
  },
];

export default function Home() {
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
        {/* Mobile: ProfileCard (order-1) -> DonutChart (order-2) -> CreateProjectCard (order-3) */}
        {/* Desktop: Left Column - Profile & Create Project */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
          <div className="order-1 lg:order-1 lg:h-[160px]">
            <ProfileCard organization={currentOrganization} />
          </div>
          <div className="order-3 lg:order-2 lg:h-[160px]">
            <CreateProjectCard />
          </div>
        </div>

        {/* Mobile: DonutChart in middle (order-2) */}
        {/* Desktop: Right Column - Statistics */}
        <div className="lg:col-span-7 w-full order-2 lg:order-2 lg:h-[336px]">
          <DonutChart />
        </div>
      </div>

      {/* Projects Section */}
      <ProjectsSection projects={mockProjects} />
    </div>
  );
}
