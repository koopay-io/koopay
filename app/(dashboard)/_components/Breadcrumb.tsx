"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Routes that don't have a corresponding page (should not be linked)
const NON_LINKABLE_ROUTES = ["/projects"];

// Custom labels for specific routes
const CUSTOM_LABELS: Record<string, string> = {
  create: "Create Project",
  "test-escrow": "Test Escrow",
  account: "Account",
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Skip breadcrumb on platform home page
  if (pathname === "/platform") return null;

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Platform", href: "/platform" },
  ];

  // Build breadcrumbs from path segments
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip adding the current page as a breadcrumb (it's the last one)
    if (index === pathSegments.length - 1) {
      return;
    }

    // Skip routes that don't have pages (like /projects)
    if (NON_LINKABLE_ROUTES.includes(currentPath)) {
      return;
    }

    // Format segment for display
    const label = CUSTOM_LABELS[segment] || segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: NON_LINKABLE_ROUTES.includes(currentPath) ? undefined : currentPath,
    });
  });

  // Get current page label
  const lastSegment = pathSegments[pathSegments.length - 1];
  const currentLabel = lastSegment
    ? CUSTOM_LABELS[lastSegment] || lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Page";

  // Special handling for project detail pages (UUID)
  if (pathSegments.length === 2 && pathSegments[0] === "projects") {
    // For /projects/[id], show "Projects" as non-clickable, then project ID
    return (
      <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
        <Link
          href="/platform"
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span>Platform</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Project</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white font-mono text-xs">{lastSegment.slice(0, 8)}...</span>
      </nav>
    );
  }

  // Special handling for nested routes like /projects/[id]/test-escrow
  if (pathSegments.length === 3 && pathSegments[0] === "projects") {
    const projectId = pathSegments[1];
    const subRoute = pathSegments[2];
    const subRouteLabel = CUSTOM_LABELS[subRoute] || subRoute
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return (
      <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
        <Link
          href="/platform"
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span>Platform</span>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/projects/${projectId}`}
          className="hover:text-white transition-colors"
        >
          Project
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">{subRouteLabel}</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
      <Link
        href="/platform"
        className="hover:text-white transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span>Platform</span>
      </Link>
      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
        </div>
      ))}
      <ChevronRight className="h-4 w-4" />
      <span className="text-white">{currentLabel}</span>
    </nav>
  );
}

