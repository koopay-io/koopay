"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProjectCard } from "./ProjectCard";
import Link from "next/link";
import { Filter, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  status: "in_progress" | "canceled" | "done";
  collaborator: string;
  dateRange: string;
  milestones: number;
  totalPay: string;
}

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.collaborator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasMoreThanThree = filteredProjects.length > 3;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">Your Projects</h2>
          <Badge variant="secondary" className="gap-1">
            {filteredProjects.length}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <Link href="/projects/create" className="w-full sm:w-auto">
          <Button
            variant="default"
            size="sm"
            className="gap-2 w-full sm:w-auto bg-gradient-3 hover:bg-gradient-2 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg border border-border">
          <Input
            placeholder="Search by name or collaborator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[180px]"
          >
            <option value="all">All statuses</option>
            <option value="in_progress">In progress</option>
            <option value="canceled">Canceled</option>
            <option value="done">Done</option>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No projects found matching your filters.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Always show as grid, one column */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:hidden">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                {...project}
                onViewProject={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>

          {/* Desktop: Carousel if more than 3, grid otherwise */}
          {hasMoreThanThree ? (
            <Carousel className="hidden lg:block w-full">
              <CarouselContent className="-ml-4">
                {filteredProjects.map((project, index) => (
                  <CarouselItem key={project.id} className="pl-4 basis-1/3">
                    <ProjectCard
                      {...project}
                      onViewProject={() =>
                        router.push(`/projects/${project.id}`)
                      }
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex" />
              <CarouselNext className="hidden lg:flex" />
            </Carousel>
          ) : (
            <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  {...project}
                  onViewProject={() => router.push(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
