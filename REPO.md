# Directory Structure
```
app/
  (dashboard)/
    _components/
      Breadcrumb.tsx
      DashboardNavbar.tsx
      TeamSwitcher.tsx
    account/
      _components/
        AddFundsDialog.tsx
        OrganizationQrCode.tsx
        OrganizationSchema.ts
        WithdrawDialog.tsx
      layout.tsx
      page.tsx
    platform/
      _components/
        CreateProjectCard.tsx
        PlatformClient.tsx
        ProfileCard.tsx
        ProjectCard.tsx
        ProjectsSection.tsx
      page.tsx
    projects/
      [id]/
        _components/
          CurrentMilestone.tsx
          ErrorState.tsx
          EscrowInfoCard.tsx
          EvidenceList.tsx
          FundEscrowCard.tsx
          LoadingState.tsx
          MilestonesTimeline.tsx
          PaymentTransactionCard.tsx
          ProjectOverview.tsx
          ProjectProgress.tsx
        test-escrow/
          page.tsx
        page.tsx
      create/
        _components/
          ProjectCollaborator.tsx
          ProjectDetailsForm.tsx
          ProjectMilestones.tsx
        layout.tsx
        page.tsx
      layout.tsx
    layout.tsx
  actions/
    project-actions.ts
  auth/
    callback/
      route.ts
    login/
      _components/
        AuthButton.tsx
        AuthLayout.tsx
        OptimizedBackground.tsx
      layout.tsx
      page.tsx
  onboarding/
    _components/
      OnboardingError.tsx
      OrganizationTypeSelector.tsx
      Step1.tsx
      Step2.tsx
      Step3.tsx
      Step4.tsx
      Stepper.tsx
    layout.tsx
    page.tsx
  favicon.ico
  globals.css
  layout.tsx
schemas/
  schema.sql
.env.example
AGENTS.md
package.json
README.md
```

# Files

## File: app/(dashboard)/account/layout.tsx
````typescript
import { ReactNode } from 'react';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(dashboard)/projects/create/layout.tsx
````typescript
export default function CreateProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: app/(dashboard)/projects/layout.tsx
````typescript
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
````

## File: app/auth/callback/route.ts
````typescript
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";
import { StellarWalletManager } from "@/lib/stellar/wallet";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  // Always redirect to onboarding after successful authentication
  const next = "/onboarding";

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Create Stellar wallet for OAuth users (Google, Microsoft, etc.)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.app_metadata?.provider) {
          const provider = user.app_metadata.provider; // 'google' or 'azure' (Microsoft)
          // Check if wallet already exists
          const existingWallet = user.user_metadata?.stellar_wallet;
          
          if (!existingWallet) {
            console.log(`🌟 Creating invisible Stellar wallet for ${provider} user...`);
            const walletManager = new StellarWalletManager('testnet');
            
            // Get user ID from identity data or use email as fallback
            const identity = user.identities?.find(i => i.provider === provider);
            const userId = identity?.id || user.email || user.id;
            
            console.log('🔍 Using identifier:', userId);
            
            // Create wallet from user ID
            const wallet = await walletManager.createAndFundWallet(
              userId,
              provider
            );
            
            // Save wallet to user metadata
            await supabase.auth.updateUser({
              data: {
                stellar_wallet: wallet
              }
            });
            
            console.log('✅ Stellar wallet created:', wallet.publicKey);
          }
        }
      } catch (walletError) {
        console.error('Error creating wallet:', walletError);
        // Don't fail the login if wallet creation fails
      }
      
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to login page with error
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Authentication failed')}`);
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { aeonik } from '@/lib/fonts';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Koopay: Secure payments for freelancers',
  description:
    'Koopay is a decentralized freelancing platform that allows freelancers to get paid securely and efficiently.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${aeonik.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
````

## File: app/(dashboard)/_components/Breadcrumb.tsx
````typescript
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
````

## File: app/(dashboard)/_components/TeamSwitcher.tsx
````typescript
'use client';

import * as React from 'react';
import { ChevronsUpDown, Building2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGlobalStore } from '@/lib/stores/globalStore';

interface TeamSwitcherProps {
  variant?: 'icon' | 'full';
}

export function TeamSwitcher({ variant = 'icon' }: TeamSwitcherProps) {
  const { currentOrganization } = useGlobalStore();

  if (!currentOrganization) {
    return null;
  }

  const organizationName =
    currentOrganization.legal_type === 'individual'
      ? currentOrganization.legal_name
      : currentOrganization.name;
  const organizationType = currentOrganization.type === 'requester' ? 'Requester' : 'Provider';

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
          >
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Switch organization</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Current Organization
          </DropdownMenuLabel>
          <DropdownMenuItem disabled className="gap-3 p-3 cursor-default">
            <Avatar className="w-10 h-10 border-2 border-primary/20 rounded-full">
              {currentOrganization.avatar_url ? (
                <AvatarImage src={currentOrganization.avatar_url} alt={organizationName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 border border-primary/20">
                {currentOrganization.legal_type === 'individual' ? (
                  <User className="w-5 h-5 text-primary" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{organizationName}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{organizationType}</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <Badge variant="secondary" className="w-full justify-center text-xs py-1.5">
              Coming soon: Multiple organizations
            </Badge>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-muted/50 transition-colors"
        >
          <Avatar className="w-8 h-8 flex-shrink-0 rounded-full">
            {currentOrganization.avatar_url ? (
              <AvatarImage src={currentOrganization.avatar_url} alt={organizationName} />
            ) : null}
            <AvatarFallback className="bg-primary/10 border border-primary/20">
              {currentOrganization.legal_type === 'individual' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Building2 className="w-4 h-4 text-primary" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-medium truncate max-w-[150px]">{organizationName}</span>
            <span className="text-xs text-muted-foreground">{organizationType}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Current Organization
        </DropdownMenuLabel>
        <DropdownMenuItem disabled className="gap-3 p-3 cursor-default">
          <Avatar className="w-10 h-10 border-2 border-primary/20 rounded-full">
            {currentOrganization.avatar_url ? (
              <AvatarImage src={currentOrganization.avatar_url} alt={organizationName} />
            ) : null}
            <AvatarFallback className="bg-primary/10 border border-primary/20">
              {currentOrganization.legal_type === 'individual' ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Building2 className="w-5 h-5 text-primary" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{organizationName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{organizationType}</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-3 py-2">
          <Badge variant="secondary" className="w-full justify-center text-xs py-1.5">
            Coming soon: Multiple organizations
          </Badge>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
````

## File: app/(dashboard)/account/_components/AddFundsDialog.tsx
````typescript
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Copy, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AddFundsDialogProps {
  publicKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsDialog({ publicKey, open, onOpenChange }: AddFundsDialogProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <Plus className="h-5 w-5" />
          <span className="text-xs sm:text-sm">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Send XLM from an external wallet to your public address on Stellar testnet
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border">
            <QRCodeSVG
              value={publicKey}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#ffffff"
              bgColor="#16132c"
            />
          </div>
          <div>
            <Label>Your Public Address</Label>
            <div className="flex gap-2 mt-2">
              <Input value={publicKey} readOnly className="flex-1 font-mono text-xs" />
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(publicKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">To start using this wallet:</p>
              <p>Send at least 1 XLM from an external wallet to the address above on Stellar testnet.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
````

## File: app/(dashboard)/account/_components/OrganizationQrCode.tsx
````typescript
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationQRCodeProps {
  url: string;
  organizationName?: string;
}

export function OrganizationQRCode({ url, organizationName }: OrganizationQRCodeProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: organizationName || 'Organization',
        url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-card rounded-lg border">
      {url && (
        <QRCodeSVG
          value={url}
          size={typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 200}
          level="H"
          includeMargin={true}
          fgColor="#ffffff"
          bgColor="#16132c"
        />
      )}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <Input value={url} readOnly className="flex-1 font-mono text-xs sm:text-sm" />
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={shareUrl}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
````

## File: app/(dashboard)/account/_components/WithdrawDialog.tsx
````typescript
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowUpRight } from 'lucide-react';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  amount: string;
  onDestinationChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}

export function WithdrawDialog({
  open,
  onOpenChange,
  destination,
  amount,
  onDestinationChange,
  onAmountChange,
  onWithdraw,
  isWithdrawing,
}: WithdrawDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-xs sm:text-sm">Withdraw</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>Send XLM to another Stellar address</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="withdraw-destination">Destination Address</Label>
            <Input
              id="withdraw-destination"
              placeholder="Enter Stellar address..."
              value={destination}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="withdraw-amount">Amount (XLM)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.0000001"
              placeholder="0.0000001"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="mt-2"
            />
          </div>
          <Button
            onClick={onWithdraw}
            disabled={!destination || !amount || isWithdrawing}
            className="w-full"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
````

## File: app/(dashboard)/platform/_components/CreateProjectCard.tsx
````typescript
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export function CreateProjectCard() {
  return (
    <Link href="/projects/create" className="h-full">
      <Card className="h-full bg-muted/50 border-muted-foreground/20 hover:bg-muted/60 transition-colors">
        <CardContent className="p-4 sm:p-6 pb-8 sm:pb-6 h-full flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 flex-1 justify-center sm:justify-start">
            <Image
              src="/icons/star.svg"
              alt="Start"
              width={24}
              height={24}
              className="sm:w-8 sm:h-8"
            />
            <div className="text-center sm:text-left">
              <h3 className="font-medium text-base sm:text-lg lg:text-xl">
                Create a new <br className="hidden sm:block" /> payment project
              </h3>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-center sm:justify-end lg:items-center lg:h-full">
            <Image
              src="/icons/create-project.svg"
              alt="Document icons"
              width={160}
              height={100}
              className="w-24 h-16 sm:w-32 sm:h-20 lg:h-full lg:w-auto object-contain"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
````

## File: app/(dashboard)/platform/_components/ProjectCard.tsx
````typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Star } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  status: 'in_progress' | 'canceled' | 'done';
  collaborator: string;
  dateRange: string;
  milestones: number;
  totalPay: string;
  onViewProject?: () => void;
}

export function ProjectCard({
  title,
  status,
  collaborator,
  dateRange,
  milestones,
  totalPay,
  onViewProject,
}: ProjectCardProps) {
  const statusConfig = {
    in_progress: {
      color: 'text-primary',
      bgColor: 'bg-primary',
      label: 'In progress',
    },
    canceled: {
      color: 'text-destructive',
      bgColor: 'bg-destructive',
      label: 'Canceled',
    },
    done: {
      color: 'text-success',
      bgColor: 'bg-success',
      label: 'Done',
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <div className={`flex items-center gap-1 ${config.color}`}>
            <div className={`w-2 h-2 ${config.bgColor} rounded-full`}></div>
            <span className="text-xs sm:text-sm">{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Collaborated with {collaborator}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{dateRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Divided into {milestones} Milestones</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="font-semibold text-base sm:text-lg">Total Pay: {totalPay}</p>
          <Button
            className="w-full mt-3 text-sm sm:text-base bg-gradient-1"
            onClick={onViewProject}
          >
            View project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/ErrorState.tsx
````typescript
export function ErrorState({ message = "Proyecto no encontrado" }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">{message}</div>
    </div>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/EvidenceList.tsx
````typescript
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/lib/supabase/types/database.gen";
import { FileText, Download } from "lucide-react";

type Evidence = Database["public"]["Tables"]["evidences"]["Row"];

interface EvidenceListProps {
  evidence: Evidence[];
  isLoading: boolean;
}

export function EvidenceList({ evidence, isLoading }: EvidenceListProps) {
  if (isLoading) {
    return <div className="text-white/60">Loading evidence...</div>;
  }

  if (evidence.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">
            No evidence has been uploaded for this milestone yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {evidence.map((item) => (
        <Card
          key={item.id}
          className="bg-gray-900/50 border-gray-700 overflow-hidden"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-white font-medium truncate"
                title={item.file_name || "File"}
              >
                {item.file_name || "Uploaded File"}
              </p>
              <p
                className="text-white/60 text-sm truncate"
                title={item.description || ""}
              >
                {item.description || "No description"}
              </p>
            </div>
            <a
              href={item.file_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              download={item.file_name}
              className="flex-shrink-0 text-white/60 hover:text-white"
            >
              <Download className="w-5 h-5" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/LoadingState.tsx
````typescript
export function LoadingState({ message = "Cargando proyecto..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">{message}</div>
    </div>
  );
}
````

## File: app/(dashboard)/projects/create/_components/ProjectCollaborator.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";

// Define the props
interface Collaborator {
  id: string;
  full_name: string;
  position: string;
}

interface ProjectCollaboratorProps {
  selectedCollaborator: Collaborator | null;
  onOpenModal: () => void;
  onClearCollaborator: () => void;
}

export function ProjectCollaborator({
  selectedCollaborator,
  onOpenModal,
  onClearCollaborator,
}: ProjectCollaboratorProps) {
  if (selectedCollaborator) {
    return (
      <div className="p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">
                {selectedCollaborator.full_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedCollaborator.position}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCollaborator}
            className="text-muted-foreground hover:text-foreground"
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onOpenModal}
      className="w-full gap-2 border-border text-foreground hover:bg-muted/50 h-12"
    >
      <span className="text-foreground">Assign Collaborator</span>
      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <Plus className="h-4 w-4 text-white" />
      </div>
    </Button>
  );
}
````

## File: app/(dashboard)/projects/create/_components/ProjectDetailsForm.tsx
````typescript
"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// Define the props it accepts from the parent
interface ProjectDetailsFormProps {
  projectTitle: string;
  setProjectTitle: (value: string) => void;
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  totalAmount: number;
  setTotalAmount: (value: number) => void;
  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (value: string) => void;
}

export function ProjectDetailsForm({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  totalAmount,
  setTotalAmount,
  expectedDeliveryDate,
  setExpectedDeliveryDate,
}: ProjectDetailsFormProps) {
  return (
    <>
      {/* Project Details */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Project Title
          </label>
          <Input
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Enter project title"
            className="bg-muted/50 border-border text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Brief Description
          </label>
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Enter project description"
            rows={4}
            className="bg-muted/50 border-border text-foreground resize-none"
          />
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Total money allocated to the collaborator:
          </label>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground">
                ${totalAmount.toLocaleString("en-US")} USD
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$100</span>
                <span>$20,000</span>
              </div>
              <Slider
                value={[totalAmount]}
                onValueChange={(value) => setTotalAmount(value[0])}
                min={100}
                max={20000}
                step={50}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expected Delivery Date */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Expected Delivery Date
        </label>
        <Input
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          className="bg-muted/50 border-border text-foreground"
        />
      </div>
    </>
  );
}
````

## File: app/(dashboard)/projects/create/_components/ProjectMilestones.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus } from "lucide-react";

// Define the props
interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

interface ProjectMilestonesProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (id: string) => void;
}

// Utility to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export function ProjectMilestones({
  milestones,
  onAddMilestone,
  onEditMilestone,
}: ProjectMilestonesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Define Milestones
        </h2>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="bg-muted/30 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">
                  {milestone.title || "Untitled Milestone"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditMilestone(milestone.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {milestone.description || "No description provided"}
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Deadline: {formatDate(milestone.deadline)}</div>
                <div>Percent of total: {milestone.percentage}%</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Milestone Button */}
      <Button
        variant="outline"
        onClick={onAddMilestone}
        className="w-full gap-2 border-border text-foreground hover:bg-muted/50"
      >
        <Plus className="h-4 w-4" />
        Add Milestone
      </Button>
    </div>
  );
}
````

## File: app/actions/project-actions.ts
````typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import { tw } from "@/lib/tw";
import { getUserStellarWallet } from "@/lib/actions/wallet";
import { revalidatePath } from "next/cache";
import { USDC_TRUSTLINE } from "@/lib/constants";

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_TRUSTLESS_ADMIN_PK ?? "";
const PLATFORM_FEE = Number(
  process.env.NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE || "1.5",
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Step 1 — Prepare: validate, fetch freelancer wallet, get unsigned XDR
// ---------------------------------------------------------------------------

export async function prepareProjectCreation(
  data: CreateProjectInput,
  userPublicKey: string,
): Promise<ActionResult<{ unsignedTransaction: string }>> {
  if (!PLATFORM_ADDRESS) {
    return {
      success: false,
      error: "Platform address not configured (NEXT_PUBLIC_TRUSTLESS_ADMIN_PK)",
    };
  }

  // 1. Validate input
  const validation = createProjectSchema.safeParse(data);
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }
  const projectData = validation.data;

  // 2. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 3. Determine collaborator wallet address
  let freelancerWallet = "";

  if (projectData.freelancer_address) {
    freelancerWallet = projectData.freelancer_address;
  } else if (projectData.freelancer_id) {
    const walletFromDb = await getUserStellarWallet(projectData.freelancer_id);
    if (!walletFromDb) {
      return {
        success: false,
        error: "Selected collaborator has not set up their wallet.",
      };
    }
    freelancerWallet = walletFromDb;
  } else {
    return { success: false, error: "No collaborator assigned" };
  }

  // 4. Build Trustless Work payload
  const payload = {
    signer: userPublicKey,
    engagementId: `koopay-${Date.now()}`,
    title: projectData.title,
    description: projectData.description,
    platformFee: PLATFORM_FEE,
    milestones: projectData.milestones.map((m) => ({
      description: m.title,
      amount: Number(
        (projectData.total_amount * (m.percentage / 100)).toFixed(7),
      ),
      // Receiver is correctly defined here per milestone
      receiver: freelancerWallet,
    })),
    trustline: {
      address: USDC_TRUSTLINE,
      symbol: "USDC",
    },
    roles: {
      approver: userPublicKey,
      releaseSigner: userPublicKey,
      serviceProvider: freelancerWallet,
      // REMOVED: receiver (Not allowed in Roles schema)
      platformAddress: PLATFORM_ADDRESS,
      disputeResolver: PLATFORM_ADDRESS,
    },
    // REMOVED: receiverMemo (Not allowed in Root schema)
  };

  // 5. Call Trustless Work API
  try {
    const response = await tw.post("/deployer/multi-release", payload);
    const unsignedTransaction: string | undefined =
      response.data?.unsignedTransaction;

    if (!unsignedTransaction) {
      return {
        success: false,
        error: "Failed to generate transaction from Trustless Work",
      };
    }

    return { success: true, unsignedTransaction };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string; details?: unknown } };
      message?: string;
    };

    // Improved logging to see validation details in terminal
    console.error(
      "TW API Error:",
      JSON.stringify(
        axiosError?.response?.data || axiosError?.message,
        null,
        2,
      ),
    );

    return { success: false, error: "Failed to prepare escrow contract." };
  }
}

// ---------------------------------------------------------------------------
// Step 2 — Finalize: submit signed TX, persist to DB
// ---------------------------------------------------------------------------

export async function finalizeProjectCreation(
  signedXdr: string,
  projectData: CreateProjectInput,
): Promise<ActionResult<{ projectId: string }>> {
  if (!PLATFORM_ADDRESS) {
    return {
      success: false,
      error: "Platform address not configured (NEXT_PUBLIC_TRUSTLESS_ADMIN_PK)",
    };
  }

  const validation = createProjectSchema.safeParse(projectData);
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstError };
  }
  const validatedProjectData = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  let contractId = "";

  // 1. Submit signed transaction to Stellar via Trustless Work
  try {
    const sendRes = await tw.post("/helper/send-transaction", { signedXdr });

    contractId =
      sendRes.data?.contractId ?? sendRes.data?.escrow?.contractId ?? "";

    if (!contractId) {
      console.error("TX response missing contractId:", sendRes.data);
      return {
        success: false,
        error: "Transaction submitted but no contract ID returned.",
      };
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    console.error(
      "TX Submission Error:",
      axiosError?.response?.data ?? axiosError?.message,
    );
    return {
      success: false,
      error: "Failed to submit transaction to the Stellar network.",
    };
  }

  // 2. Persist project + milestones to the database
  try {
    // Insert project
    const { data: project, error: projError } = await supabase
      .from("projects")
      .insert({
        contractor_id: user.id,
        freelancer_id: validatedProjectData.freelancer_id ?? null,
        freelancer_address: validatedProjectData.freelancer_address ?? null,
        title: validatedProjectData.title,
        description: validatedProjectData.description,
        total_amount: validatedProjectData.total_amount,
        expected_delivery_date: validatedProjectData.expected_delivery_date,
        status: "active" as const,
        contract_id: contractId,
      })
      .select()
      .single();

    if (projError || !project) {
      throw new Error(projError?.message ?? "Project insert failed");
    }

    // Insert milestones
    const baseTime = Date.now();
    const milestonesInsert = validatedProjectData.milestones.map((m, i) => ({
      project_id: project.id,
      title: m.title,
      description: m.description,
      percentage: m.percentage,
      status: "pending" as const,
      created_at: new Date(baseTime + i * 1000).toISOString(),
    }));

    const { error: mileError } = await supabase
      .from("milestones")
      .insert(milestonesInsert);

    if (mileError) {
      throw new Error(mileError.message);
    }

    revalidatePath("/projects");

    return { success: true, projectId: project.id };
  } catch (dbError: unknown) {
    const message =
      dbError instanceof Error ? dbError.message : "Unknown database error";
    console.error("DB Error:", message);
    return {
      success: false,
      error: `Escrow deployed but failed to save project data. Contact support with Contract ID: ${contractId}`,
    };
  }
}
````

## File: app/auth/login/_components/AuthButton.tsx
````typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'default'}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
````

## File: app/auth/login/_components/OptimizedBackground.tsx
````typescript
"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import Image from "next/image";

interface OptimizedBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function OptimizedBackground({
  children,
  className,
}: OptimizedBackgroundProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render anything until image is loaded
  if (!imageLoaded) {
    return (
      <div
        className={cn(
          "min-h-screen w-full relative overflow-hidden optimized-background",
          className
        )}
      >
        {/* Background Image - hidden until loaded */}
        <Image
          src="/background.png"
          alt="Background"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center"
          onLoad={() => setImageLoaded(true)}
          style={{
            // Performance optimizations
            willChange: "auto",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            // Ensure smooth rendering
            imageRendering: "auto",
            // GPU acceleration
            WebkitTransform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            opacity: 0, // Hidden until loaded
          }}
        />
      </div>
    );
  }

  // Render content only after image is loaded
  return (
    <div
      className={cn(
        "min-h-screen w-full relative overflow-hidden optimized-background",
        className
      )}
    >
      {/* Background Image */}
      <Image
        src="/background.png"
        alt="Background"
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover object-center"
        style={{
          // Performance optimizations
          willChange: "auto",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          // Ensure smooth rendering
          imageRendering: "auto",
          // GPU acceleration
          WebkitTransform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      />

      {/* Optional overlay for better text readability */}
      <div
        className="absolute inset-0 bg-black/10 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at 50% 50%,
              transparent 0%,
              rgba(0, 0, 0, 0.1) 100%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
````

## File: app/auth/login/layout.tsx
````typescript
import { AuthLayout } from './_components/AuthLayout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-2 lg:justify-end lg:pr-0">
        {children}
      </div>
    </AuthLayout>
  );
}
````

## File: app/onboarding/_components/OnboardingError.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';

interface OnboardingErrorProps {
  error: string;
}

export function OnboardingError({ error }: OnboardingErrorProps) {
  const router = useRouter();
  const { clearCompletionError } = useOnboardingContext();

  const handleBackToOnboarding = () => {
    clearCompletionError();
    router.push('/onboarding');
  };

  return (
    <div className="text-center min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-foreground mb-6 text-sm sm:text-base">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleBackToOnboarding}
            className="w-full sm:w-auto"
          >
            Back to onboarding
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `mailto:salinatomass53@gmail.com?subject=Onboarding Error&body=${encodeURIComponent(error)}`;
            }}
            className="w-full sm:w-auto gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Development
          </Button>
        </div>
      </div>
    </div>
  );
}
````

## File: app/onboarding/_components/Stepper.tsx
````typescript
'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
}

export function Stepper({ currentStep, totalSteps = 4 }: StepperProps) {
  const router = useRouter();
  const { maxStepReached } = useOnboardingContext();

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached && step !== currentStep) {
      router.push(`/onboarding?step=${step}`);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-12 max-w-80">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-1 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
        {currentStep}
      </div>
      <div className="flex gap-1.5 sm:gap-2 flex-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isReached = step <= maxStepReached;
          const isCurrent = step === currentStep;

          return (
            <button
              key={step}
              type="button"
              onClick={() => handleStepClick(step)}
              disabled={isCurrent}
              className={cn(
                'h-2 w-6 sm:w-8 rounded transition-all touch-manipulation flex-1',
                isReached
                  ? isCurrent
                    ? 'bg-gradient-1 cursor-default'
                    : 'bg-gradient-1 hover:bg-gradient-1/80 active:bg-gradient-1/70 cursor-pointer'
                  : 'bg-gradient-1/20 border border-dashed border-primary cursor-not-allowed'
              )}
              aria-label={`Go to step ${step}`}
            />
          );
        })}
      </div>
    </div>
  );
}
````

## File: app/onboarding/layout.tsx
````typescript
import { ReactNode } from 'react';
import { OnboardingProvider } from '@/lib/contexts/OnboardingContext';
import { createClient } from '@/lib/supabase/server';
import { TCountryRow } from '@/lib/validations/countries';

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const [countriesResult, userResult] = await Promise.all([
    supabase
      .from('countries')
      .select('*')
      .eq('available', true)
      .order('name', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const countries: TCountryRow[] = countriesResult.data || [];
  const user = userResult.data?.user || null;

  return (
    <OnboardingProvider countries={countries} user={user}>
      {children}
    </OnboardingProvider>
  );
}
````

## File: app/globals.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #0a0014;
    --foreground: #ffffff;

    --card: #16132c;
    --card-foreground: #ffffff;

    --popover: #16132c;
    --popover-foreground: #ffffff;

    --primary: #4566fe;
    --primary-foreground: #ffffff;
    --secondary: #0037ff;
    --secondary-foreground: #ffffff;

    --accent: #ffffff;
    --accent-foreground: #16132c;

    --muted: #a3a3a3;
    --muted-foreground: #ffffff;

    --success: #00b87c;
    --success-foreground: #ffffff;
    --info: #0e3cff;
    --info-foreground: #ffffff;
    --warning: #ffa500;
    --warning-foreground: #ffffff;
    --destructive: #da3333;
    --destructive-foreground: #ffffff;

    --border: #16132c;
    --input: #6983ff;
    --ring: #16132c;

    --chart-1: #0e3cff;
    --chart-2: #2e96ff;
    --chart-3: #273186;
    --chart-4: #1f2041;

    --gradient-1-from: #5755ff;
    --gradient-1-to: #0e3cff;
    --gradient-2-from: #3945eb;
    --gradient-2-to: #1989fa;
    --gradient-3-from: #5755ff;
    --gradient-3-to: #0e3cff;

    --gradient-1: linear-gradient(90deg, #5755ff 0%, #0e3cff 100%);
    --gradient-2: linear-gradient(45deg, #3945eb 0%, #1989fa 100%);
    --gradient-3: linear-gradient(90deg, rgba(87, 85, 255, 0.2) 0%, rgba(14, 60, 255, 0.2) 100%);

    --radius: 0.5rem;
  }
  .dark {
    --background: #0a0014;
    --foreground: #ffffff;

    --card: #16132c;
    --card-foreground: #ffffff;

    --popover: #16132c;
    --popover-foreground: #ffffff;

    --primary: #4566fe;
    --primary-foreground: #ffffff;
    --secondary: #0037ff;
    --secondary-foreground: #ffffff;

    --accent: #ffffff;
    --accent-foreground: #16132c;

    --muted: #16132c;
    --muted-foreground: #a3a3a3;

    --success: #00b87c;
    --success-foreground: #ffffff;
    --info: #0e3cff;
    --info-foreground: #ffffff;
    --warning: #ffa500;
    --warning-foreground: #ffffff;
    --destructive: #da3333;
    --destructive-foreground: #ffffff;

    --border: #16132c;
    --input: #6983ff;
    --ring: #16132c;

    --chart-1: #0e3cff;
    --chart-2: #2e96ff;
    --chart-3: #273186;
    --chart-4: #1f2041;

    --gradient-1: linear-gradient(90deg, #5755ff 0%, #0e3cff 100%);

    --gradient-2: linear-gradient(45deg, #3945eb 0%, #1989fa 100%);

    --gradient-3: linear-gradient(90deg, rgba(87, 85, 255, 0.2) 0%, rgba(14, 60, 255, 0.2) 100%);

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-aeonik), system-ui, -apple-system, sans-serif;
  }
}

/* Ultra-optimized background image styles for maximum performance */

.optimized-background {
  /* Hardware acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;

  /* Smooth rendering */
  image-rendering: optimizeQuality;
  image-rendering: -webkit-optimize-contrast;

  /* Prevent layout shifts */
  contain: layout style paint;

  /* Optimize for mobile */
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000px;

  /* Reduce repaints */
  will-change: auto;
}

/* Optimize Next.js Image component */
.optimized-background img {
  /* Ensure image covers the entire container */
  object-fit: cover !important;
  object-position: center !important;

  /* Performance optimizations */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: auto;

  /* No transitions - instant display */
}

/* Responsive optimizations */
@media (max-width: 768px) {
  .optimized-background img {
    /* Optimize for mobile screens */
    object-position: center center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .optimized-background {
    /* Disable animations for users who prefer reduced motion */
    transition: none !important;
    animation: none !important;
  }
}

/* High DPI display optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .optimized-background img {
    /* Ensure crisp rendering on high DPI displays */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
````

## File: app/(dashboard)/_components/DashboardNavbar.tsx
````typescript
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { TeamSwitcher } from './TeamSwitcher';

const mockNotifications = [
  {
    id: 1,
    title: 'New project assigned',
    message: 'You have been assigned to the Logo Design project',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Payment received',
    message: 'Payment of $1,500 has been received for Landing Page project',
    time: '1 day ago',
    read: true,
  },
  {
    id: 3,
    title: 'Milestone completed',
    message: 'Milestone 3 of the Web Development project has been completed',
    time: '3 days ago',
    read: true,
  },
];

export function DashboardNavbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchPosition, setSearchPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const mockUsers = [
    { name: 'Micaela Descotte', avatar: '/avatars/micaela-descotte.png' },
    { name: 'Renzo Barcos', avatar: '/avatars/renzo-barcos.png' },
    { name: 'Tomas Salina', avatar: '/avatars/tomas-salina.png' },
    { name: 'Steven Molina', avatar: '/avatars/steven-molina.png' },
  ];

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);

    if (value.length > 0) {
      const rect = e.target.getBoundingClientRect();
      setSearchPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/platform" className="flex items-center">
                <Image src="/logo.svg" alt="Koopay" className="h-8 w-auto" width={32} height={32} />
              </Link>
              <div className="hidden sm:block">
                <TeamSwitcher />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="w-[448px] max-w-md relative">
                <div className="relative">
                  <Input
                    placeholder="Search providers or requesters..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-[#16132C] text-tertiary-foreground placeholder:text-primary-foreground rounded-full px-6 border-none outline-none hover:outline-none focus-visible:ring-0"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-foreground h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/account">
                  <Button variant="default" className="gap-2 bg-gradient-1">
                    <Image
                      src="/icons/profile-icon.svg"
                      alt="Account"
                      className="h-4 w-4"
                      width={16}
                      height={16}
                    />
                    Go to account
                  </Button>
                </Link>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Image
                        src="/icons/notification-icon.svg"
                        alt="Notifications"
                        className="h-4 w-4"
                        width={16}
                        height={16}
                      />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Notifications</SheetTitle>
                      <SheetDescription>
                        You have {mockNotifications.filter((n) => !n.read).length} unread
                        notifications
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {mockNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.read
                              ? 'bg-muted/50 border-muted-foreground/20'
                              : 'bg-primary/5 border-primary/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <Image
                    src="/icons/logout-icon.svg"
                    alt="Logout"
                    className="h-4 w-4"
                    width={16}
                    height={16}
                  />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <TeamSwitcher variant="full" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Search</label>
                    <div className="relative">
                      <Input
                        placeholder="Search providers or requesters..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-[#16132C] text-tertiary-foreground placeholder:text-primary-foreground rounded-full px-6 border-none outline-none hover:outline-none focus-visible:ring-0"
                      />
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-foreground h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="default"
                        className="w-full gap-2 justify-start bg-gradient-1"
                      >
                        <Image
                          src="/icons/profile-icon.svg"
                          alt="Account"
                          className="h-4 w-4"
                          width={16}
                          height={16}
                        />
                        Go to account
                      </Button>
                    </Link>

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" className="w-full gap-2 justify-start">
                          <Image
                            src="/icons/notification-icon.svg"
                            alt="Notifications"
                            className="h-4 w-4"
                            width={16}
                            height={16}
                          />
                          Notifications
                          {mockNotifications.filter((n) => !n.read).length > 0 && (
                            <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                              {mockNotifications.filter((n) => !n.read).length}
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Notifications</SheetTitle>
                          <SheetDescription>
                            You have {mockNotifications.filter((n) => !n.read).length} unread
                            notifications
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          {mockNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-lg border ${
                                notification.read
                                  ? 'bg-muted/50 border-muted-foreground/20'
                                  : 'bg-primary/5 border-primary/20'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>

                    <Button
                      variant="ghost"
                      className="w-full gap-2 justify-start text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <Image
                        src="/icons/logout-icon.svg"
                        alt="Logout"
                        className="h-4 w-4"
                        width={16}
                        height={16}
                      />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {showSearchResults &&
        filteredUsers.length > 0 &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed bg-background border border-border rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto"
            style={{
              top: searchPosition.top,
              left: searchPosition.left,
              width: searchPosition.width,
            }}
          >
            {filteredUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
              >
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
````

## File: app/(dashboard)/account/_components/OrganizationSchema.ts
````typescript
import { z } from 'zod';
import {
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
} from '@/lib/validations/shared/enums';

export const createOrganizationSchema = (isIndividual: boolean) =>
  z.object({
    name: isIndividual
      ? z.string().optional()
      : z.string().min(2, 'Name must be at least 2 characters').max(200),
    legal_name: z.string().min(2, 'Legal name must be at least 2 characters').max(200),
    legal_id: z.string().min(3, 'ID must be at least 3 characters').max(100),
    legal_phone: z.string().nullable().optional(),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(2000),
    business_type: z.string().refine((val) => zOrganizationBusinessTypeEnum.safeParse(val).success),
    custom_business_type: z.string().nullable().optional(),
    industry_type: z.string().refine((val) => zOrganizationIndustryTypeEnum.safeParse(val).success),
    custom_industry_type: z.string().nullable().optional(),
    legal_country_id: z.number().int().positive(),
    legal_state: z.string().min(2).max(100),
    legal_city: z.string().min(2).max(100),
    legal_street_name: z.string().min(2).max(200),
    legal_street_number: z.number().int().positive(),
    legal_postal_code: z.string().min(4).max(12),
    legal_suite: z.string().nullable().optional(),
    legal_floor: z.string().nullable().optional(),
  });
````

## File: app/(dashboard)/platform/_components/PlatformClient.tsx
````typescript
"use client";

// All your existing client-side imports
import { DonutChart } from "@/components/DonutChart";
import { useGlobalStore } from "@/lib/stores/globalStore";
import { ProfileCard } from "./ProfileCard";
import { CreateProjectCard } from "./CreateProjectCard";
import { ProjectsSection } from "./ProjectsSection";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { calculateProjectStatistics } from "@/lib/utils/projectStatistics";

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

  // Calculate statistics from projects data
  const statistics = calculateProjectStatistics(projects);

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
          <DonutChart statistics={statistics} />
        </div>
      </div>

      {/* Projects Section - Now using real data from props */}
      <ProjectsSection projects={projects} />
    </div>
  );
}
````

## File: app/(dashboard)/platform/_components/ProfileCard.tsx
````typescript
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Building2 } from 'lucide-react';
import { TOrganizationRow } from '@/lib/validations/organizations';

interface ProfileCardProps {
  organization: TOrganizationRow | null;
}

export function ProfileCard({ organization }: ProfileCardProps) {
  const organizationName = organization
    ? organization.legal_type === 'individual'
      ? organization.legal_name
      : organization.name
    : 'Loading...';
  const organizationType = organization?.type === 'requester' ? 'Company' : 'Provider';

  return (
    <Link href="/account">
      <Card className="bg-gradient-2 border-0 text-primary-foreground h-full">
        <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              {organization?.avatar_url ? (
                <AvatarImage src={organization.avatar_url} alt={organizationName} />
              ) : null}
              <AvatarFallback className="bg-primary-foreground/10">
                {organization?.legal_type === 'individual' ? (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                ) : (
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xl sm:text-2xl lg:text-3xl truncate">
                {organizationName}
              </h3>
              <p className="text-primary-foreground/80 text-sm sm:text-base">{organizationType}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/FundEscrowCard.tsx
````typescript
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStellarWallet } from '@/lib/hooks/useStellarWallet';
import { useEscrowWithSecretKey } from '@/lib/hooks/useEscrowWithSecretKey';
import { cn } from '@/lib/utils';
import type { FundEscrowPayload } from '@trustless-work/escrow/types';

type FundingStatus = 'unfunded' | 'funding' | 'funded' | 'error';

interface FundEscrowCardProps {
  contractId: string;
  totalAmount: number;
  fundingStatus: FundingStatus;
  escrowUsdcBalance?: number | null;
  onFundingSuccess?: () => void;
}

const HELP_LINK =
  'https://docs.trustlesswork.com/trustless-work/open-source-dapps/dapp-overview/step-4-funding-an-escrow';

export function FundEscrowCard({
  contractId,
  totalAmount,
  fundingStatus,
  escrowUsdcBalance,
  onFundingSuccess,
}: FundEscrowCardProps) {
  const { wallet, balance, refreshBalance } = useStellarWallet();
  const { fundMultiReleaseEscrow } = useEscrowWithSecretKey();
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  const contractorUsdcBalance = useMemo(() => {
    const usdcEntry = balance.find((entry) => entry.asset === 'USDC');
    const parsedBalance = usdcEntry ? Number(usdcEntry.balance) : 0;
    return Number.isFinite(parsedBalance) ? parsedBalance : 0;
  }, [balance]);

  const hasWallet = Boolean(wallet?.publicKey && wallet?.secretKey);
  const isFunded = fundingStatus === 'funded' || fundingSuccess;
  const isInsufficientBalance =
    totalAmount > 0 && contractorUsdcBalance < totalAmount;
  const isActionDisabled =
    isFunding || isFunded || isInsufficientBalance || !hasWallet;

  const handleFundEscrow = async () => {
    if (!wallet?.publicKey || !wallet?.secretKey) {
      setFundingError('Wallet no disponible. Inicia sesión de nuevo.');
      return;
    }

    setFundingError(null);
    setFundingSuccess(false);
    setIsFunding(true);

    try {
      const payload: FundEscrowPayload = {
        amount: totalAmount,
        contractId,
        signer: wallet.publicKey,
      };

      const result = await fundMultiReleaseEscrow(payload, wallet.secretKey);

      if (result && typeof result === 'object') {
        const status = (result as { status?: string }).status;
        if (status === 'ERROR') {
          const message =
            (result as { message?: string }).message ||
            'No se pudo fondear el escrow.';
          throw new Error(message);
        }
      }

      setFundingSuccess(true);
      await refreshBalance();
      // Delay before refetching escrow to give indexer time to update
      await new Promise((resolve) => setTimeout(resolve, 3000));
      onFundingSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al fondear el escrow.';
      setFundingError(message);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-8">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Fondear Escrow del Proyecto
            </h3>
            <p className="text-white/60 text-sm">
              Contract ID:{' '}
              <code className="text-green-400 font-mono text-xs">
                {contractId}
              </code>
            </p>
          </div>
          <Badge
            className={cn(
              'text-white',
              isFunded ? 'bg-green-600' : 'bg-yellow-600',
            )}
          >
            {isFunded ? 'Funded' : 'Unfunded'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Monto del proyecto</p>
            <p className="text-xl font-semibold text-white">
              {totalAmount.toLocaleString()} USDC
            </p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Tu balance USDC</p>
            <p className="text-xl font-semibold text-white">
              {contractorUsdcBalance.toLocaleString()} USDC
            </p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
            <p className="text-sm text-white/60">Balance del escrow</p>
            <p className="text-xl font-semibold text-white">
              {(escrowUsdcBalance ?? 0).toLocaleString()} USDC
            </p>
          </div>
        </div>

        {isInsufficientBalance && (
          <div className="rounded-lg border border-yellow-700 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-200">
            Tu balance USDC no es suficiente para fondear este escrow.
          </div>
        )}

        {!hasWallet && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            Tu wallet no está disponible. Inicia sesión de nuevo para fondear.
          </div>
        )}

        {fundingError && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {fundingError}
          </div>
        )}

        {fundingSuccess && (
          <div className="rounded-lg border border-green-700 bg-green-900/20 px-4 py-3 text-sm text-green-200">
            Escrow fondeado correctamente.
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <a
            href={HELP_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            ¿Cómo fondear un escrow con Trustless Work?
          </a>
          <Button
            onClick={handleFundEscrow}
            disabled={isActionDisabled}
            className="bg-blue-500 text-white hover:brightness-110 hover:shadow-lg disabled:opacity-50"
          >
            {isFunding ? 'Fondeando...' : 'Fund Escrow'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/PaymentTransactionCard.tsx
````typescript
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getStellarExplorerUrl, truncateHash } from "@/lib/utils/stellar";
import { formatCurrency } from "@/lib/utils/projectHelpers";

interface PaymentTransactionCardProps {
  paymentHash: string | null;
  amount: number;
  recipient: string;
  timestamp: string | null;
  status: "pending" | "success" | "failed";
}

export function PaymentTransactionCard({
  paymentHash,
  amount,
  recipient,
  timestamp,
  status,
}: PaymentTransactionCardProps) {
  const [copied, setCopied] = useState(false);

  if (!paymentHash) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">
            No payment transaction recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentHash);
    setCopied(true);
    toast.success("Transaction hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = getStellarExplorerUrl(paymentHash);

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-600 text-white">Success</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600 text-white">Failed</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Payment Details</h3>
          {getStatusBadge()}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <code className="text-white bg-black/30 px-3 py-1.5 rounded text-sm flex-1">
                {truncateHash(paymentHash)}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="text-white hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Amount</p>
              <p className="text-white font-semibold">{formatCurrency(amount)}</p>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">Recipient</p>
              <p className="text-white font-mono text-sm">
                {truncateHash(recipient, 6, 6)}
              </p>
            </div>
          </div>

          {timestamp && (
            <div>
              <p className="text-sm text-white/60 mb-1">Sent At</p>
              <p className="text-white">
                {new Date(timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <Button
            onClick={() => window.open(explorerUrl, "_blank")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            View on Stellar Explorer
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/ProjectOverview.tsx
````typescript
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/projectHelpers";

interface ProjectOverviewProps {
  title: string;
  description: string;
  totalAmount: number;
}

export function ProjectOverview({ title, description, totalAmount }: ProjectOverviewProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-white/80 text-lg mb-8">{description}</p>
        <Badge className="bg-black text-white px-4 py-2 text-lg">
          Total: {formatCurrency(totalAmount)}
        </Badge>
      </CardContent>
    </Card>
  );
}
````

## File: app/auth/login/_components/AuthLayout.tsx
````typescript
'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { OptimizedBackground } from './OptimizedBackground';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

const rotatingWords = [
  'freelancers',
  'agencies',
  'consultants',
  'creators',
  'teams',
  'companies',
  'everyone',
];

const TEXT_DELAY_MS = 400;
const IMAGE_DELAY_MS = 800;
const WORD_DELAY_AFTER_IMAGE_MS = 600;
const WORD_DISPLAY_DURATION_MS = 1800;
const FINAL_WORD = 'everyone';

export function AuthLayout({ children }: AuthLayoutProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [displayWord, setDisplayWord] = useState(rotatingWords[0]);
  const [isFading, setIsFading] = useState(false);
  const [hasWordAppeared, setHasWordAppeared] = useState(false);
  const currentWordIndexRef = useRef(0);

  useEffect(() => {
    const wordDelay = IMAGE_DELAY_MS + WORD_DELAY_AFTER_IMAGE_MS;

    const timer = setTimeout(() => {
      setHasWordAppeared(true);
    }, wordDelay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasWordAppeared || !isAnimating) return;

    let interval: NodeJS.Timeout | null = null;
    const initialTimer = setTimeout(() => {
      setIsFading(true);

      setTimeout(() => {
        const nextIndex = currentWordIndexRef.current + 1;
        const nextWord = rotatingWords[nextIndex];
        currentWordIndexRef.current = nextIndex;

        if (nextWord === FINAL_WORD) {
          setIsAnimating(false);
          setDisplayWord(nextWord);
          setIsFading(false);
          return;
        }

        setDisplayWord(nextWord);
        setIsFading(false);

        interval = setInterval(() => {
          setIsFading(true);

          setTimeout(() => {
            const nextIndex = currentWordIndexRef.current + 1;
            const nextWord = rotatingWords[nextIndex];
            currentWordIndexRef.current = nextIndex;

            if (nextWord === FINAL_WORD) {
              setIsAnimating(false);
              setDisplayWord(nextWord);
              setIsFading(false);
              return;
            }

            setDisplayWord(nextWord);
            setIsFading(false);
          }, 300);
        }, WORD_DISPLAY_DURATION_MS);
      }, 300);
    }, WORD_DISPLAY_DURATION_MS);

    return () => {
      clearTimeout(initialTimer);
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, hasWordAppeared]);

  return (
    <OptimizedBackground>
      <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row overflow-hidden lg:pr-16">
        <div className="w-full lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2000px] mx-auto flex flex-col lg:flex-row lg:gap-20 lg:h-full lg:items-center lg:justify-center lg:mr-30">
          <motion.div
            className="w-full lg:w-fit flex items-center justify-center lg:justify-end p-4 sm:p-6 md:p-8 lg:h-full "
            initial={{ opacity: 0, x: -50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full">{children}</div>
          </motion.div>

          <motion.div
            className="w-fit hidden lg:flex items-center justify-start lg:h-full"
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="w-fit xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl px-0 lg:h-full flex items-center">
              <div className="w-fit space-y-4 lg:space-y-5 xl:space-y-6 3xl:space-y-8 flex flex-col justify-center items-start">
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                  className="w-fit"
                >
                  <Image
                    src="/logo.svg"
                    alt="Koopay Logo"
                    width={174}
                    height={48}
                    className="w-auto h-auto max-w-[140px] lg:max-w-[160px] xl:max-w-[174px] 3xl:max-w-[200px]"
                    priority
                  />
                </motion.div>

                <motion.div
                  className="w-fit space-y-1 lg:space-y-2 3xl:space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: TEXT_DELAY_MS / 1000 }}
                >
                  <h1>
                    <span className="text-2xl w-fit sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold text-white leading-tight text-left">
                      Secure payments for{' '}
                    </span>
                    <br />
                    <motion.span
                      key={displayWord}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hasWordAppeared && !isFading ? 1 : 0,
                        y: hasWordAppeared && !isFading ? 0 : 10,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-2xl w-fit sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold text-white leading-tight text-left"
                    >
                      {displayWord}
                    </motion.span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    delay: IMAGE_DELAY_MS / 1000,
                  }}
                  className="w-full flex-shrink-0"
                >
                  <Image
                    src="/login-illustration.png"
                    alt="Login Illustration"
                    width={530}
                    height={300}
                    className="w-full h-auto max-w-[350px] lg:max-w-[400px] xl:max-w-[450px] 2xl:max-w-[500px] 3xl:max-w-[600px]"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </OptimizedBackground>
  );
}
````

## File: app/auth/login/page.tsx
````typescript
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MagnetizeButton } from "@/components/ui/magnetize-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const getErrorMessage = (error: unknown): string => {
    if (!error) return "An error occurred";
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);

    if (
      errorMessage.includes("email rate limit") ||
      errorMessage.includes("too many requests")
    ) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    if (
      errorMessage.includes("invalid email") ||
      errorMessage.includes("email format")
    ) {
      return "Please enter a valid email address.";
    }
    if (
      errorMessage.includes("token has expired") ||
      errorMessage.includes("expired")
    ) {
      return "The verification code has expired. Please request a new one.";
    }
    if (
      errorMessage.includes("invalid token") ||
      errorMessage.includes("invalid code")
    ) {
      return "Invalid verification code. Please check and try again.";
    }
    if (
      errorMessage.includes("email not confirmed") ||
      errorMessage.includes("unconfirmed")
    ) {
      return "Please verify your email address first.";
    }
    if (errorMessage.includes("user not found")) {
      return "No account found with this email address.";
    }
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (errorMessage.includes("email already confirmed")) {
      return "This email is already verified. Please use a different authentication method.";
    }

    return errorMessage || "An error occurred. Please try again.";
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setOtpSent(true);
      setResendCooldown(60);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResendCooldown(60);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
            include_granted_scopes: "true",
          },
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "email",
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const OAuthButtons = () => (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <p className="text-center text-sm text-muted my-3">or</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-accent text-accent-foreground"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-accent text-accent-foreground mt-2"
        onClick={handleMicrosoftSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="none">
          <path d="M0 0H10.377V10.372H0V0Z" fill="#F25022" />
          <path d="M12.623 0H23V10.372H12.623V0Z" fill="#7FBA00" />
          <path d="M0 12.628H10.377V23H0V12.628Z" fill="#00A4EF" />
          <path d="M12.623 12.628H23V23H12.623V12.628Z" fill="#FFB900" />
        </svg>
        Continue with Microsoft
      </Button>
    </div>
  );

  const handleChangeEmail = () => {
    setOtpSent(false);
    setError(null);
    setResendCooldown(0);
  };

  return (
    <div
      className={cn("w-full max-w-sm lg:max-w-md flex gap-4 sm:gap-5 md:gap-6")}
    >
      <Card
        className={`w-full border-none bg-black/10 mix-blend-overlay py-6 px-6 sm:py-8 sm:px-6 md:py-10 md:px-8 lg:py-16 lg:px-16 ${
          otpSent ? "relative" : ""
        }`}
        style={{
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
        }}
      >
        {otpSent && (
          <button
            type="button"
            onClick={handleChangeEmail}
            className="absolute -top-2 left-6 sm:top-0 sm:left-6 md:top-0 md:left-8 lg:top-10 lg:left-16 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Change email</span>
          </button>
        )}
        <motion.div
          className="lg:hidden mb-4 sm:mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/logo.svg"
            alt="Koopay Logo"
            width={174}
            height={48}
            className="w-auto h-auto max-w-[140px] sm:max-w-[160px]"
            priority
          />
        </motion.div>
        <CardHeader className="px-0 pb-3 sm:pb-4 md:pb-5">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl sm:w-auto">
            Nice to see you again
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-3 sm:mt-4 md:mt-5 px-0">
          {!otpSent ? (
            <form onSubmit={handleSendMagicLink}>
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#101b40] border-0 outline-0 rounded-full px-6 py-5 text-base placeholder:text-white placeholder:font-normal font-bold hover:outline-0 focus-visible:ring-0"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive break-words">
                    {error}
                  </p>
                )}
                <div className="flex flex-col gap-3">
                  <MagnetizeButton
                    type="submit"
                    variant="default"
                    disabled={isLoading}
                    className="w-full bg-gradient-1"
                    particleCount={14}
                    attractRadius={60}
                  >
                    {isLoading ? "Sending link..." : "Send magic link"}
                  </MagnetizeButton>
                  <OAuthButtons />
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to
                </p>
                <p className="text-sm font-semibold text-foreground break-words">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Open it on this device to finish signing in.
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive break-words text-center px-2">
                  {error}
                </p>
              )}
              <div className="flex flex-col items-center gap-1">
                {resendCooldown > 0 ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Resend link in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend link
                  </button>
                )}
              </div>
              <OAuthButtons />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
````

## File: app/onboarding/_components/Step3.tsx
````typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { zSupabaseId } from '@/lib/validations/shared/base';
import { Stepper } from './Stepper';

const step3Schema = z.object({
  legal_country_id: z.number().int().positive('You must select a country'),
  legal_state: z
    .string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must not exceed 100 characters'),
  legal_city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters'),
  legal_street_name: z
    .string()
    .min(2, 'Street name must be at least 2 characters')
    .max(200, 'Street name must not exceed 200 characters'),
  legal_street_number: z
    .number()
    .int()
    .positive('Street number must be positive')
    .min(1, 'Street number must be at least 1')
    .max(999999, 'Street number must not exceed 999999'),
  legal_postal_code: z
    .string()
    .min(4, 'Postal code must be at least 4 characters')
    .max(12, 'Postal code must not exceed 12 characters'),
  legal_suite: z
    .string()
    .refine(
      (val) => !val || (val.length >= 1 && val.length <= 50),
      'Suite must be between 1 and 50 characters if provided'
    )
    .optional()
    .nullable(),
  legal_floor: z
    .string()
    .refine(
      (val) => !val || (val.length >= 1 && val.length <= 50),
      'Floor must be between 1 and 50 characters if provided'
    )
    .optional()
    .nullable(),
});

type FormData = z.infer<typeof step3Schema>;

export function Step3() {
  const router = useRouter();
  const { data, updateData, setMaxStepReached, countries } = useOnboardingContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      legal_country_id: data.legal_country_id,
      legal_state: data.legal_state,
      legal_city: data.legal_city,
      legal_street_name: data.legal_street_name,
      legal_street_number: data.legal_street_number,
      legal_postal_code: data.legal_postal_code,
      legal_suite: data.legal_suite || undefined,
      legal_floor: data.legal_floor || undefined,
    },
  });

  const countryIdValue = watch('legal_country_id');

  useEffect(() => {
    reset({
      legal_country_id: data.legal_country_id,
      legal_state: data.legal_state,
      legal_city: data.legal_city,
      legal_street_name: data.legal_street_name,
      legal_street_number: data.legal_street_number,
      legal_postal_code: data.legal_postal_code,
      legal_suite: data.legal_suite || undefined,
      legal_floor: data.legal_floor || undefined,
    });
  }, [
    data.legal_country_id,
    data.legal_state,
    data.legal_city,
    data.legal_street_name,
    data.legal_street_number,
    data.legal_postal_code,
    data.legal_suite,
    data.legal_floor,
    reset,
  ]);

  const onSubmit = (formData: FormData) => {
    updateData(formData);
    setMaxStepReached(4);
    router.push('/onboarding?step=4');
  };

  const handleBack = () => {
    router.push('/onboarding?step=2');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={3} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">Address</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="legal_country_id">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select
            id="legal_country_id"
            className="mt-2"
            autoComplete="country"
            value={(countryIdValue || data.legal_country_id)?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              if (value && value > 0) {
                const parsedValue = zSupabaseId.parse(value);
                setValue('legal_country_id', parsedValue);
                updateData({ legal_country_id: parsedValue });
              }
            }}
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id.toString()}>
                {country.emoji ? `${country.emoji} ` : ''}
                {country.name}
              </option>
            ))}
          </Select>
          {errors.legal_country_id && (
            <p className="text-destructive text-sm mt-1">{errors.legal_country_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_state">
            State/Province <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_state"
            {...register('legal_state')}
            placeholder="e.g., California, Texas, Florida"
            autoComplete="address-level1"
            className="mt-2"
          />
          {errors.legal_state && (
            <p className="text-destructive text-sm mt-1">{errors.legal_state.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_city"
            {...register('legal_city')}
            placeholder="e.g., San Francisco, Austin, Miami"
            autoComplete="address-level2"
            className="mt-2"
          />
          {errors.legal_city && (
            <p className="text-destructive text-sm mt-1">{errors.legal_city.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legal_street_name">
              Street Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legal_street_name"
              {...register('legal_street_name')}
              placeholder="e.g., Main Street, Park Avenue"
              autoComplete="street-address"
              className="mt-2"
            />
            {errors.legal_street_name && (
              <p className="text-destructive text-sm mt-1">{errors.legal_street_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="legal_street_number">
              Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legal_street_number"
              type="number"
              {...register('legal_street_number', { valueAsNumber: true })}
              placeholder="e.g., 123"
              autoComplete="off"
              className="mt-2"
            />
            {errors.legal_street_number && (
              <p className="text-destructive text-sm mt-1">{errors.legal_street_number.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="legal_postal_code">
            Postal Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_postal_code"
            {...register('legal_postal_code')}
            placeholder="e.g., 10001, M5H 2N2, SW1A 1AA"
            autoComplete="postal-code"
            className="mt-2"
          />
          {errors.legal_postal_code && (
            <p className="text-destructive text-sm mt-1">{errors.legal_postal_code.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legal_suite">Suite</Label>
            <Input
              id="legal_suite"
              {...register('legal_suite')}
              placeholder="e.g., Suite 100, Unit 5"
              autoComplete="off"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="legal_floor">Floor</Label>
            <Input
              id="legal_floor"
              {...register('legal_floor')}
              placeholder="e.g., 5th Floor, Floor 10"
              autoComplete="off"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 sm:pt-6">
          <Button type="submit" className="gap-2 w-full sm:w-auto">
            Next
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </form>
    </>
  );
}
````

## File: app/onboarding/page.tsx
````typescript
'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { OrganizationTypeSelector } from './_components/OrganizationTypeSelector';
import { Step1 } from './_components/Step1';
import { Step2 } from './_components/Step2';
import { Step3 } from './_components/Step3';
import { Step4 } from './_components/Step4';
import { OnboardingError } from './_components/OnboardingError';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step');
  const { organizationType, data, setMaxStepReached, completionError, clearCompletionError } = useOnboardingContext();

  useEffect(() => {
    const stepNum = step ? parseInt(step) : 0;
    if (stepNum > 0 && stepNum <= 4) {
      setMaxStepReached(stepNum);
    }
  }, [step, setMaxStepReached]);

  useEffect(() => {
    if (step && step !== 'complete' && completionError) {
      clearCompletionError();
    }
  }, [step, completionError, clearCompletionError]);

  const renderStep = () => {
    if (completionError) {
      return <OnboardingError error={completionError} />;
    }

    if (!step) {
      return <OrganizationTypeSelector />;
    }

    if (!organizationType && step !== '1') {
      return <OrganizationTypeSelector />;
    }

    switch (step) {
      case '1':
        if (!organizationType) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step1 />
            </div>
          </div>
        );

      case '2':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step2 />
            </div>
          </div>
        );

      case '3':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step3 />
            </div>
          </div>
        );

      case '4':
        if (!data.legal_type) {
          return <OrganizationTypeSelector />;
        }
        return (
          <div className="min-h-screen bg-background flex flex-col px-4 sm:px-6 py-4 sm:py-8">
            <div className="max-w-4xl mx-auto w-full">
              <Step4 />
            </div>
          </div>
        );

      default:
        return <OrganizationTypeSelector />;
    }
  };

  return <>{renderStep()}</>;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
````

## File: schemas/schema.sql
````sql
-- ============================================================================
-- 1. SETUP & EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 2. ENUMS (Safe Creation)
-- ============================================================================
DO $$ BEGIN
    create type user_role as enum ('contractor', 'freelancer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type contractor_type as enum ('individual', 'company');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_type as enum ('requester', 'provider');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_legal_type as enum ('individual', 'company');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_business_type as enum ('freelance', 'agency', 'consultant', 'creator', 'team', 'company', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_industry_type as enum ('Technology', 'Artificial Intelligence', 'Web3 / Finance', 'Design / Creative', 'Consulting', 'Legal Services', 'Construction', 'Health', 'Media Production', 'Non Profit / Social', 'Manufacturing', 'Retail / Ecommerce', 'Travel / Hospitality', 'Real Estate', 'Other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_member_role as enum ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type organization_member_status as enum ('active', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type project_status as enum ('draft', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type milestone_status as enum ('pending', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type contract_status as enum ('draft', 'pending_signature', 'signed', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type notification_type as enum ('project_invitation', 'contract_signed', 'milestone_completed', 'payment_received');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    create type currency_code as enum ('usd', 'cad', 'mxn', 'bzd', 'crc', 'usd_sv', 'gtq', 'hnl', 'nio', 'pab', 'cup', 'dop', 'htg', 'jmd', 'ttd', 'bsd', 'bbd', 'xcd', 'gyd', 'ars', 'bob', 'brl', 'clp', 'cop', 'usd_ec', 'pyg', 'pen', 'uyu', 'ves', 'srd', 'eur_gf', 'eur', 'gbp', 'chf', 'pln', 'huf', 'dkk', 'sek', 'nok', 'isk', 'rub', 'try', 'bgn', 'hrk', 'mkd', 'rsd', 'bam', 'mdl', 'uah', 'byn', 'all', 'czk', 'nzd', 'kzt', 'amd', 'azn', 'kwd', 'lbp', 'gel', 'ron', 'ils', 'xpf');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

create table if not exists public.continents (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  code text not null,
  emoji text,
  description text
);

create table if not exists public.countries (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  iso2 text not null,
  iso3 text not null,
  numeric_code int,
  emoji text,
  continent_id bigint references public.continents(id),
  currency_code currency_code,
  currency_name text,
  currency_symbol text,
  phone_code text,
  available boolean default true
);

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role user_role,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

create table if not exists public.organizations (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  created_by uuid references auth.users(id),
  type organization_type not null,
  legal_type organization_legal_type not null,
  name text not null,
  legal_name text not null,
  legal_id text not null,
  legal_phone text,
  bio text,
  avatar_url text,
  business_type organization_business_type,
  custom_business_type text, -- NEW
  industry_type organization_industry_type,
  custom_industry_type text, -- NEW
  legal_country_id bigint references public.countries(id),
  legal_state text,
  legal_city text,
  legal_street_name text,
  legal_street_number int,
  legal_postal_code text,
  legal_suite text,
  legal_floor text,
  -- Soft Delete Support
  deleted_at timestamp with time zone,
  deleted_by uuid references auth.users(id)
);

create table if not exists public.user_organization (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id),
  organization_id bigint references public.organizations(id),
  email text not null,
  role organization_member_role default 'member',
  status organization_member_status default 'pending',
  joined_at timestamp with time zone,
  -- Soft Delete Support
  deleted_at timestamp with time zone,
  deleted_by uuid references auth.users(id)
);

-- Note: These profile tables are likely deprecated in favor of 'organizations'
-- but kept for backward compatibility if needed.
create table if not exists public.contractor_profiles (
  id uuid references public.profiles(id) primary key,
  contractor_type contractor_type not null,
  legal_name text,
  business_id text,
  address text,
  country text
);

create table if not exists public.freelancer_profiles (
  id uuid references public.profiles(id) primary key,
  full_name text,
  freelancer_id text,
  country text,
  address text,
  position text
);

create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  contractor_id uuid references public.profiles(id) not null, -- Note: This acts as 'Requester'
  freelancer_id uuid references public.profiles(id), -- Note: This acts as 'Provider'
  title text not null,
  description text not null,
  total_amount numeric not null,
  expected_delivery_date date not null,
  status project_status default 'draft',
  contract_id text,
  contract_url text,
  -- Soft Delete Support
  deleted_at timestamp with time zone,
  deleted_by uuid references auth.users(id)
);

create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  percentage int not null,
  status milestone_status default 'pending',
  -- NEW: Critical columns for project creation and payments
  deadline date,
  payment_hash text,
  payment_sent_at timestamp with time zone
);

create table if not exists public.contracts (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id),
  contractor_id uuid references public.profiles(id),
  freelancer_id uuid references public.profiles(id),
  status contract_status default 'draft',
  contract_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  user_id uuid references public.profiles(id),
  type notification_type not null,
  title text not null,
  message text not null,
  read boolean default false,
  project_id uuid references public.projects(id)
);

create table if not exists public.evidences (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  milestone_id uuid references public.milestones(id),
  description text,
  file_url text,
  file_name text,
  file_type text,
  created_by uuid references auth.users(id)
);

create table if not exists public.waitlist (
  id bigint generated by default as identity primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================================================
-- 4. DATA POPULATION (Safe Inserts)
-- ============================================================================

-- Continents
INSERT INTO public.continents (name, code)
SELECT 'North America', 'NA' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'NA');
INSERT INTO public.continents (name, code)
SELECT 'South America', 'SA' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'SA');
INSERT INTO public.continents (name, code)
SELECT 'Europe', 'EU' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'EU');
INSERT INTO public.continents (name, code)
SELECT 'Asia', 'AS' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'AS');
INSERT INTO public.continents (name, code)
SELECT 'Africa', 'AF' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'AF');
INSERT INTO public.continents (name, code)
SELECT 'Oceania', 'OC' WHERE NOT EXISTS (SELECT 1 FROM public.continents WHERE code = 'OC');

-- Countries
INSERT INTO public.countries (name, iso2, iso3, continent_id, currency_code, phone_code)
SELECT 'United States', 'US', 'USA', id, 'usd', '1' FROM public.continents WHERE code = 'NA' AND NOT EXISTS (SELECT 1 FROM public.countries WHERE iso2 = 'US');

INSERT INTO public.countries (name, iso2, iso3, continent_id, currency_code, phone_code)
SELECT 'Argentina', 'AR', 'ARG', id, 'ars', '54' FROM public.continents WHERE code = 'SA' AND NOT EXISTS (SELECT 1 FROM public.countries WHERE iso2 = 'AR');

INSERT INTO public.countries (name, iso2, iso3, continent_id, currency_code, phone_code)
SELECT 'Spain', 'ES', 'ESP', id, 'eur', '34' FROM public.continents WHERE code = 'EU' AND NOT EXISTS (SELECT 1 FROM public.countries WHERE iso2 = 'ES');

INSERT INTO public.countries (name, iso2, iso3, continent_id, currency_code, phone_code)
SELECT 'United Kingdom', 'GB', 'GBR', id, 'gbp', '44' FROM public.continents WHERE code = 'EU' AND NOT EXISTS (SELECT 1 FROM public.countries WHERE iso2 = 'GB');

-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to get organizations for a user
create or replace function get_user_organizations(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total', count(*),
    'organizations', coalesce(json_agg(o.*), '[]'::json)
  )
  into result
  from public.organizations o
  join public.user_organization uo on o.id = uo.organization_id
  where uo.user_id = p_user_id;

  return result;
end;
$$;

-- Function to handle new user signups (Profile creation)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users who might miss a profile
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles);

-- ============================================================================
-- 6. STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Create Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('organizations', 'organizations', true, 5242880, ARRAY['image/png','image/jpeg','image/jpg','image/webp']),
  ('contracts', 'contracts', false, 10485760, ARRAY['application/pdf']),
  ('evidences', 'evidences', false, 52428800, null)
on conflict (id) do nothing;

-- Create Policies Safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Organization Avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
        create policy "Public Access to Organization Avatars" on storage.objects for select using ( bucket_id = 'organizations' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users can Upload Avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
        create policy "Authenticated Users can Upload Avatars" on storage.objects for insert to authenticated with check ( bucket_id = 'organizations' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can Update Avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
        create policy "Users can Update Avatars" on storage.objects for update to authenticated using ( bucket_id = 'organizations' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Access to Contracts' AND tablename = 'objects' AND schemaname = 'storage') THEN
        create policy "Auth Access to Contracts" on storage.objects for all to authenticated using ( bucket_id = 'contracts' ) with check ( bucket_id = 'contracts' );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth Access to Evidences' AND tablename = 'objects' AND schemaname = 'storage') THEN
        create policy "Auth Access to Evidences" on storage.objects for all to authenticated using ( bucket_id = 'evidences' ) with check ( bucket_id = 'evidences' );
    END IF;
END $$;
````

## File: AGENTS.md
````markdown
# Repository Guidelines for AI Agents

---

## 🤖 Agent Persona & Mandate

You are a **Senior Full-Stack Developer** and **Expert** in:
* ReactJS, NextJS,, TypeScript
* TailwindCSS, Shadcn, Radix UI
* HTML, CSS, and modern UI/UX best practices

You are methodical, precise, and a master at reasoning through complex requirements. You always provide correct, DRY, bug-free, production-ready code.

* **Favor Simplicity:** Always favor simplicity and pragmatism. Avoid over-engineering.
* **Adhere to Guidelines:** You must follow all guidelines in this document.
* **Validate Your Work:** All code you generate must be 100% clean and pass the validation steps.

---

## 2. General Rules & Behavior

* Follow the user’s requirements **exactly** as stated.
* **Do not plan or ask for steps;** just implement the code in the best way possible without asking questions.
* **Never guess.** If a requirement is impossible to implement without clarification, state what is missing.
* If an external library is mentioned, always refer to its official documentation before implementation.
* Always ensure the final code is fully functional, with no placeholders, `TODO`s, or missing parts.
* Use best practices for React & Next.js development.

---

## 3. Project Structure & Module Organization

Koopay is a Next.js App Router project. Place new files according to this structure:
* **Feature Routes:** Live in `app/` (e.g., `app/(dashboard)/`, `app/onboarding/`).
* **Route-Specific Components:** For components used *only* by a specific route, place them in a `_components` folder within that route's directory (e.g., `app/(dashboard)/platform/_components/ProfileCard.tsx`).
* **Reusable React Components:** For components designed to be shared across *multiple* routes, place them in the root `components/` folder (e.g., `components/MilestoneEditModal.tsx`).
* **UI Primitives (Shadcn):** Live in `components/ui/`.
* **Reusable Logic (Hooks, Stores, Utils):** Grouped by domain in `lib/` (e.g., `lib/stellar/`, `lib/supabase/`).
* **Static Assets:** Live in `public/`.
* **SQL Migrations:** Live in `scripts/`.

---

## 4. Build, Validation, & Tool Use

* **Development:** `pnpm dev` starts the local development server.
* **Validation Mandate:** All code you generate must pass `pnpm lint` and `pnpm check`.
* **Build:** `pnpm build` creates a production build. **Do not** run this command during Trustless Work implementations.
* **Shell Commands:** Do not use `cd` to access directories. Do not chain commands with `&&`, `|`, or similar operators.
* **Dependencies:** When installing, always use `pnpm add` and enclose the dependency name in double quotes (e.g., `pnpm add "lucide-react"`).

---

## 5. Coding Style & Naming Conventions

* **Style:** 2-space indentation, single quotes, trailing commas (enforced by `pnpm lint`).
* **File Length:** Files should not be longer than 300 lines. If a file exceeds this, consider refactoring it into smaller, more focused modules.
* **Strictly "No `any`"**: You must **never** use the `any` type in TypeScript.
* **Imports:** Always include all necessary imports at the top of the file.
* **Clarity:** Use early returns (guard clauses) to improve code clarity.
* **Styling:**
    * Use **TailwindCSS classes** for all styling; avoid plain CSS.
    * For conditional classes, you **must** use the `clsx` (or `cn`) helper function.
    * All **colors and gradients** must be defined in `tailwind.config.ts` and `app/globals.css`. Do not use arbitrary hex codes. Use defined CSS variables (e.g., `bg-primary`, `bg-gradient-1`).
* **Naming & Simplicity:**
    * Use **descriptive** variable, function, and component names.
    * Event handlers must start with `handle` (e.g., `handleClick`, `handleSubmit`).
    * Prefer **`const` arrow functions** with explicit type annotations over `function` declarations.
    * Directories: `kebab-case` (e.g., `app/trustless/`)
    * Components: `PascalCase` (e.g., `components/ContractPdf.tsx`)
    * Hooks: `useThing` (e.g., `lib/hooks/useProjectCreation.ts`). Hooks **must** be simple, straightforward, and easy to understand.

---

## 6. Trustless Work (Stellar) Integration

When working with the TrustlessWork library, use the MCP if available and follow the following:
* **Documentation:**
    * React Library: `https://docs.trustlesswork.com/trustless-work/react-library`
    * Wallet Kit: `https://docs.trustlesswork.com/trustless-work/developer-resources/stellar-wallet-kit-quick-integration`
    * Types: `https://docs.trustlesswork.com/trustless-work/developer-resources/types`
* **Implementation:**
    * Ensure proper installation (`pnpm add "@trustless-work/escrow"`) and configuration (`TrustlessWorkProvider`).
    * Follow the API and component usage **exactly** as described in the documentation.
    * **Do not use `any`**. You must always use the provided Types from the documentation (e.g., `InitializeMultiReleaseEscrowPayload`, `FundEscrowPayload`).
* **Environment:** All blockchain work must use Stellar **testnet** keys and endpoints.

---

## 7. Supabase & Database
* **Strict Typing:** All database interactions **must** be strongly typed. Use the generated types and `IDatabase` interface from `lib/supabase/types/index.ts`.
* **Clients:** Use the provided Supabase clients: `lib/supabase/client.ts` (for client-side) or `lib/supabase/server.ts` (for server-side).
* **Schema Changes:** If you suggest a database schema change, you **must** also provide the corresponding SQL migration script to be placed in the `scripts/` directory.

---

## 8. Security & Configuration
* **Secrets:** Never hardcode API keys, secret keys, or other credentials. All secrets are loaded from `.env.local` via `process.env`.
````

## File: app/(dashboard)/platform/_components/ProjectsSection.tsx
````typescript
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
			{filteredProjects.map((project) => (
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
				{filteredProjects.map((project) => (
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
				{filteredProjects.map((project) => (
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
````

## File: app/(dashboard)/projects/[id]/_components/ProjectProgress.tsx
````typescript
import { calculateProgress } from "@/lib/utils/projectHelpers";
import { Database } from "@/lib/supabase/types/database.gen";

type Milestone = Database['public']['Tables']['milestones']['Row'];

interface ProjectProgressProps {
  milestones: Milestone[];
}

export function ProjectProgress({ milestones }: ProjectProgressProps) {
  const progress = calculateProgress(milestones);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-white text-lg">Progreso del proyecto:</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-white text-lg">{progress}%</span>
      </div>
    </div>
  );
}
````

## File: app/(dashboard)/projects/[id]/test-escrow/page.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Copy, ExternalLink, Home } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useProjectMilestones } from "@/lib/hooks/useProjectMilestones";
import { useEscrowDetails } from "@/lib/hooks/useEscrowDetails";

export default function TestEscrowPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { project, loading } = useProjectMilestones(projectId);

  // Get contract ID from project - escrow contract ID
  const escrowContractId = 
    (project as { contract_id?: string; contractId?: string })?.contract_id ||
    (project as { contract_id?: string; contractId?: string })?.contractId ||
    null;

  const { escrowData, loading: escrowLoading, error: escrowError } = useEscrowDetails(
    escrowContractId
  );

  // Extract escrow fields safely - now with proper types from Trustless Work
  const escrowTitle: string | null = escrowData?.escrow?.title 
    ? (typeof escrowData.escrow.title === 'string' ? escrowData.escrow.title : String(escrowData.escrow.title))
    : null;
  
  const escrowDescription: string | null = escrowData?.escrow?.description
    ? (typeof escrowData.escrow.description === 'string' ? escrowData.escrow.description : String(escrowData.escrow.description))
    : null;
  
  const escrowType: string = escrowData?.escrow?.type
    ? (typeof escrowData.escrow.type === 'string' ? escrowData.escrow.type : String(escrowData.escrow.type))
    : "multi-release";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Proyecto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 hover:text-white gap-2 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Proyecto
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/platform")}
              className="text-white/60 hover:text-white hover:bg-white/10 gap-2 transition-all"
            >
              <Home className="h-4 w-4" />
              Go to Platform
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Testeo de Escrow
            </h1>
            <p className="text-white/60">
              Página de prueba para visualizar y depurar los detalles del escrow del proyecto: <span className="text-white font-medium">{project.title}</span>
            </p>
          </div>

          {/* Project Info Card */}
          <Card className="bg-gray-900/50 border-gray-700 mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Información del Proyecto</h2>
              <div className="space-y-2 text-white/80">
                <p><span className="font-medium">ID:</span> {project.id}</p>
                <p><span className="font-medium">Título:</span> {project.title}</p>
                <p><span className="font-medium">Descripción:</span> {project.description}</p>
                <p><span className="font-medium">Monto Total:</span> ${project.total_amount.toLocaleString()} USD</p>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Details Section */}
          {escrowContractId ? (
            <div className="mb-8" id="escrow-details-section">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Detalles del Escrow
              </h2>
              
              {/* Show contract ID even while loading */}
              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">
                  Contract ID del Escrow
                </label>
                <div className="flex items-center gap-2">
                  <code className="bg-black/50 text-green-400 px-4 py-2 rounded text-sm font-mono flex-1">
                    {escrowContractId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(escrowContractId)}
                    className="text-white hover:bg-white/20 hover:text-white transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Soroban contracts (start with 'C') use /contract/ route
                      // Stellar accounts (start with 'G') use /account/ route
                      const isSorobanContract = escrowContractId.startsWith('C');
                      const explorerUrl = isSorobanContract
                        ? `https://stellar.expert/explorer/testnet/contract/${escrowContractId}`
                        : `https://stellar.expert/explorer/testnet/account/${escrowContractId}`;
                      window.open(explorerUrl, "_blank");
                    }}
                    className="text-white hover:bg-white/20 hover:border-white/40 hover:text-white border-gray-600 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {escrowLoading ? (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8">
                    <div className="text-white/60">Cargando detalles del escrow...</div>
                  </CardContent>
                </Card>
              ) : escrowError ? (
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="p-8">
                    <div className="text-red-400">
                      Error al cargar escrow: {escrowError}
                    </div>
                  </CardContent>
                </Card>
              ) : escrowData?.escrow ? (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8 space-y-6">

                    {/* Escrow Type */}
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">
                        Tipo de Escrow
                      </label>
                      <Badge className="bg-blue-600 text-white">
                        {escrowType}
                      </Badge>
                    </div>

                    {/* Escrow Title & Description */}
                    {escrowTitle !== null && (
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">
                          Título
                        </label>
                        <p className="text-white">{escrowTitle}</p>
                      </div>
                    )}

                    {escrowDescription !== null && (
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">
                          Descripción
                        </label>
                        <p className="text-white/80">{escrowDescription}</p>
                      </div>
                    )}

                    {/* Roles */}
                    {escrowData.escrow.roles && typeof escrowData.escrow.roles === 'object' && !Array.isArray(escrowData.escrow.roles) && (
                      <div>
                        <label className="text-white/60 text-sm mb-3 block">
                          Roles
                        </label>
                        <div className="space-y-2">
                          {Object.entries(escrowData.escrow.roles as Record<string, unknown>).map(([role, address]) => (
                            <div key={role} className="flex items-center justify-between">
                              <span className="text-white/80 capitalize">{role}:</span>
                              <code className="text-green-400 text-xs font-mono bg-black/50 px-2 py-1 rounded">
                                {String(address).slice(0, 8)}...{String(address).slice(-8)}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones from Escrow */}
                    {escrowData.escrow.milestones && Array.isArray(escrowData.escrow.milestones) && escrowData.escrow.milestones.length > 0 && (
                      <div>
                        <label className="text-white/60 text-sm mb-3 block">
                          Milestones del Escrow
                        </label>
                        <div className="space-y-3">
                          {(escrowData.escrow.milestones as Array<{ description?: string; amount?: number; status?: string; flags?: { approved?: boolean } }>).map((milestone: { description?: string; amount?: number; status?: string; flags?: { approved?: boolean } }, index: number) => {
                            // Determine if milestone is completed
                            const isCompleted = milestone.status === "completed" || milestone.flags?.approved === true;
                            const statusColor = isCompleted 
                              ? "bg-green-900/30 border-green-700" 
                              : "bg-yellow-900/20 border-yellow-700";
                            const statusBadgeColor = isCompleted
                              ? "bg-green-600 text-white"
                              : "bg-yellow-600 text-white";
                            
                            return (
                              <div
                                key={index}
                                className={`${statusColor} p-4 rounded border transition-colors`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-white font-medium">
                                    {milestone.description || `Milestone ${index + 1}`}
                                  </span>
                                  <Badge className="bg-blue-600 text-white">
                                    {milestone.amount} USDC
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={statusBadgeColor}>
                                    {isCompleted ? "✅ Completed" : "⏳ Pending"}
                                  </Badge>
                                  {milestone.status && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-gray-600 text-gray-300"
                                    >
                                      Status: {milestone.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Raw Escrow Data (for debugging) */}
                    <div className="pt-4 border-t border-gray-700">
                      <label className="text-white/60 text-sm mb-3 block">
                        Datos Raw del Escrow (Debug)
                      </label>
                      <pre className="bg-black/50 text-green-400 p-4 rounded text-xs font-mono overflow-auto max-h-96">
                        {JSON.stringify(escrowData.escrow, null, 2)}
                      </pre>
                    </div>

                    {/* View on Stellar Explorer */}
                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-white hover:bg-white/20 hover:border-white/40 hover:text-white transition-all"
                        onClick={() => {
                          // Soroban contracts (start with 'C') use /contract/ route
                          // Stellar accounts (start with 'G') use /account/ route
                          const isSorobanContract = escrowData.contractId.startsWith('C');
                          const explorerUrl = isSorobanContract
                            ? `https://stellar.expert/explorer/testnet/contract/${escrowData.contractId}`
                            : `https://stellar.expert/explorer/testnet/account/${escrowData.contractId}`;
                          window.open(explorerUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver en Stellar Explorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="text-white/60">
                        Los detalles completos del escrow aún no están disponibles. El escrow puede estar aún procesándose o indexándose.
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                        <Button
                          variant="outline"
                          className="w-full border-gray-600 text-white hover:bg-white/20 hover:border-white/40 hover:text-white transition-all"
                          onClick={() => {
                            // Soroban contracts (start with 'C') use /contract/ route
                            // Stellar accounts (start with 'G') use /account/ route
                            const isSorobanContract = escrowContractId.startsWith('C');
                            const explorerUrl = isSorobanContract
                              ? `https://stellar.expert/explorer/testnet/contract/${escrowContractId}`
                              : `https://stellar.expert/explorer/testnet/account/${escrowContractId}`;
                            window.open(explorerUrl, "_blank");
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Escrow en Stellar Explorer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-yellow-900/20 border-yellow-700">
              <CardContent className="p-8">
                <div className="text-yellow-400">
                  Este proyecto no tiene un escrow asociado. El contract_id no está disponible.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
````

## File: app/onboarding/_components/OrganizationTypeSelector.tsx
````typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Rocket } from "lucide-react";
import { useOnboardingContext } from "@/lib/contexts/OnboardingContext";
import { EOrganizationType } from "@/lib/validations/shared/enums";
import { cn } from "@/lib/utils";

export function OrganizationTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<EOrganizationType | null>(
    null,
  );
  const {
    setOrganizationType,
    setMaxStepReached,
    skipOnboarding,
    isCompleting,
  } = useOnboardingContext();

  const handleContinue = () => {
    if (!selectedType) return;
    setOrganizationType(selectedType);
    setMaxStepReached(1);
    router.push("/onboarding?step=1");
  };

  const handleQuickStart = async () => {
    if (!selectedType) return;
    setOrganizationType(selectedType);
    await skipOnboarding();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-12">
        <Image
          src="/logo.svg"
          alt="Koopay"
          width={174}
          height={48}
          className="h-10 sm:h-12 w-auto"
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-6 sm:mb-12 px-4">
        How do you want to use Koopay?
      </h1>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-4xl">
        <Card
          className={cn(
            "flex-1 cursor-pointer transition-all duration-300",
            selectedType === "provider"
              ? "ring-2 ring-primary bg-card/50"
              : "bg-card hover:bg-card/80",
          )}
          onClick={() => setSelectedType("provider")}
        >
          <CardContent className="px-4 py-6 sm:px-8 sm:py-8 text-center h-auto flex flex-col justify-center">
            <div className="space-y-4">
              <p className="text-foreground font-semibold text-lg sm:text-2xl">
                I want to receive payments
              </p>
              <Button className="w-full gap-2 bg-gradient-1">
                Provider
                {selectedType === "provider" && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "flex-1 cursor-pointer transition-all duration-300",
            selectedType === "requester"
              ? "ring-2 ring-primary bg-card/50"
              : "bg-card hover:bg-card/80",
          )}
          onClick={() => setSelectedType("requester")}
        >
          <CardContent className="p-6 sm:p-8 text-center h-auto flex flex-col justify-center">
            <div className="space-y-4">
              <p className="text-foreground font-semibold text-lg sm:text-2xl">
                I want to send payments
              </p>
              <Button className="w-full gap-2 bg-gradient-3">
                Requester
                {selectedType === "requester" && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "mt-8 sm:mt-12 w-full max-w-4xl px-4 transition-all duration-300 flex flex-col sm:flex-row gap-4 justify-center",
          selectedType ? "opacity-100" : "opacity-0",
        )}
      >
        <Button
          onClick={handleContinue}
          className="bg-secondary hover:bg-secondary/80 text-white px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
          disabled={isCompleting}
        >
          Full Setup
        </Button>

        <Button
          onClick={handleQuickStart}
          variant="default"
          className="bg-gradient-1 hover:bg-primary/90 text-white px-8 py-3 text-base sm:text-lg w-full sm:w-auto gap-2"
          disabled={isCompleting}
        >
          {isCompleting ? "Setting up..." : "Quick Start (Skip Details)"}
          {!isCompleting && <Rocket className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
````

## File: app/onboarding/_components/Step1.tsx
````typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { EOrganizationLegalType } from '@/lib/validations/shared/enums';
import { cn } from '@/lib/utils';
import { Stepper } from './Stepper';

export function Step1() {
  const router = useRouter();
  const { data, updateData, setMaxStepReached } = useOnboardingContext();

  useEffect(() => {
    if (!data.legal_type) {
      updateData({ legal_type: 'individual' });
    }
  }, [data.legal_type, updateData]);

  const handleSelect = (legalType: EOrganizationLegalType) => {
    updateData({ legal_type: legalType });
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  const currentLegalType = data.legal_type || 'individual';

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={1} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Are you an individual or a company?
      </h1>

      <div className="space-y-4 sm:space-y-6">
        <button
          onClick={() => handleSelect('individual')}
          className={cn(
            'w-full p-4 sm:p-6 rounded-lg border-2 flex items-center gap-3 sm:gap-4 transition-all touch-manipulation',
            currentLegalType === 'individual'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50 active:border-primary/70'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              currentLegalType === 'individual' ? 'border-primary bg-primary' : 'border-primary'
            )}
          >
            {currentLegalType === 'individual' && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
          <span className="text-foreground text-base sm:text-lg">Individual</span>
        </button>

        <button
          onClick={() => handleSelect('company')}
          className={cn(
            'w-full p-4 sm:p-6 rounded-lg border-2 flex items-center gap-3 sm:gap-4 transition-all touch-manipulation',
            currentLegalType === 'company'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50 active:border-primary/70'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              currentLegalType === 'company' ? 'border-primary bg-primary' : 'border-primary'
            )}
          >
            {currentLegalType === 'company' && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
          <span className="text-foreground text-base sm:text-lg">Company</span>
        </button>
      </div>

      <div className="mt-8 sm:mt-12 flex justify-end gap-4">
        <Button
          onClick={() => {
            setMaxStepReached(2);
            router.push('/onboarding?step=2');
          }}
          className="gap-2 w-full sm:w-auto bg-gradient-1"
        >
          Next
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>
    </>
  );
}
````

## File: app/onboarding/_components/Step2.tsx
````typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import { TOrganizationInsert } from '@/lib/validations/organizations';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Stepper } from './Stepper';

const createStep2Schema = (isIndividual: boolean) => {
  if (isIndividual) {
    return z.object({
      legal_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(200, 'Name must not exceed 200 characters'),
      legal_id: z
        .string()
        .min(3, 'ID must be at least 3 characters')
        .max(100, 'ID must not exceed 100 characters'),
      legal_phone: z
        .string()
        .refine(
          (val) => !val || (val.length >= 10 && val.length <= 20),
          'Phone number must be between 10 and 20 characters'
        )
        .optional()
        .nullable(),
    });
  }
  return z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name must not exceed 200 characters'),
    legal_name: z
      .string()
      .min(2, 'Legal name must be at least 2 characters')
      .max(200, 'Legal name must not exceed 200 characters'),
    legal_id: z
      .string()
      .min(3, 'Business ID must be at least 3 characters')
      .max(100, 'Business ID must not exceed 100 characters'),
    legal_phone: z
      .string()
      .refine(
        (val) => !val || (val.length >= 10 && val.length <= 20),
        'Phone number must be between 10 and 20 characters'
      )
      .optional()
      .nullable(),
  });
};

export function Step2() {
  const router = useRouter();
  const { data, updateData, setMaxStepReached, organizationType } = useOnboardingContext();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(data.avatarFile || null);

  useEffect(() => {
    if (data.avatarFile && !avatarPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(data.avatarFile);
    }
  }, [data.avatarFile, avatarPreview]);

  const isIndividual = data.legal_type === 'individual';
  const isProvider = organizationType === 'provider';
  const schema = createStep2Schema(isIndividual);

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (isIndividual) {
      reset({
        legal_name: data.legal_name,
        legal_id: data.legal_id,
        legal_phone: data.legal_phone || undefined,
      } as FormData);
    } else {
      reset({
        name: data.name,
        legal_name: data.legal_name,
        legal_id: data.legal_id,
        legal_phone: data.legal_phone || undefined,
      } as FormData);
    }
  }, [isIndividual, data.name, data.legal_name, data.legal_id, data.legal_phone, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must not exceed 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    setAvatarFile(file);
    updateData({ avatarFile: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (formData: FormData) => {
    const baseData: Partial<Pick<TOrganizationInsert, 'legal_name' | 'legal_id' | 'legal_phone'>> =
      {
        legal_name: formData.legal_name,
        legal_id: formData.legal_id,
        legal_phone: formData.legal_phone || null,
      };

    let finalData: Partial<
      Pick<TOrganizationInsert, 'name' | 'legal_name' | 'legal_id' | 'legal_phone'>
    >;

    if (isIndividual) {
      finalData = {
        ...baseData,
        name: `${formData.legal_name}'s Org`,
      };
    } else {
      const companyFormData = formData as {
        name: string;
        legal_name: string;
        legal_id: string;
        legal_phone?: string | null;
      };
      finalData = {
        ...baseData,
        name: companyFormData.name,
      };
    }

    if (avatarFile) {
      updateData({
        ...finalData,
        avatarFile,
      });
    } else {
      updateData(finalData);
    }

    setMaxStepReached(3);
    router.push('/onboarding?step=3');
  };

  const handleBack = () => {
    router.push('/onboarding?step=1');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={2} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Personal Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <div className="flex-shrink-0">
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label htmlFor="avatar" className="cursor-pointer block mt-2 touch-manipulation">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border hover:border-primary active:border-primary/70 transition-colors rounded-full">
                {avatarPreview ? <AvatarImage src={avatarPreview} alt="Avatar preview" /> : null}
                <AvatarFallback className="bg-card">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/40" />
                </AvatarFallback>
              </Avatar>
            </label>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <label htmlFor="avatar" className="cursor-pointer touch-manipulation">
              {isIndividual && (
                <p className="text-foreground/60 text-sm hover:text-foreground/80 active:text-foreground transition-colors">
                  Add a profile picture to help others recognize you
                </p>
              )}
              {!isIndividual && (
                <p className="text-foreground/60 text-sm hover:text-foreground/80 active:text-foreground transition-colors">
                  Add a logo to help others recognize your company
                </p>
              )}
            </label>
          </div>
        </div>

        {!isIndividual && (
          <div>
            <Label htmlFor="name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name' as FieldPath<FormData>)}
              placeholder={isProvider ? 'e.g., Creative Design Studio' : 'e.g., Tech Solutions'}
              autoComplete="organization"
              className="mt-2"
            />
            {(() => {
              if (!isIndividual && 'name' in errors && errors.name) {
                const nameError = errors.name;
                if (typeof nameError === 'object' && nameError !== null && 'message' in nameError) {
                  return (
                    <p className="text-destructive text-sm mt-1">{String(nameError.message)}</p>
                  );
                }
              }
              return null;
            })()}
          </div>
        )}

        <div>
          <Label htmlFor="legal_name">
            {isIndividual ? 'Full Name' : 'Legal Company Name'}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_name"
            {...register('legal_name')}
            placeholder={isIndividual ? 'e.g., John Smith' : 'e.g., Tech Solutions LLC'}
            autoComplete={isIndividual ? 'name' : 'organization'}
            className="mt-2"
          />
          {errors.legal_name && (
            <p className="text-destructive text-sm mt-1">{errors.legal_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_id">
            {isIndividual ? 'Your ID Number' : 'Your Business ID Number'}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="legal_id"
            {...register('legal_id')}
            placeholder={
              isIndividual
                ? 'e.g., 123-45-6789 or your national ID'
                : 'e.g., 12-3456789 or business registration number'
            }
            autoComplete={isIndividual ? 'off' : 'organization'}
            className="mt-2"
          />
          {errors.legal_id && (
            <p className="text-destructive text-sm mt-1">{errors.legal_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="legal_phone">{isIndividual ? 'Your Phone' : 'Your Business Phone'}</Label>
          <Input
            id="legal_phone"
            type="tel"
            {...register('legal_phone')}
            placeholder={isIndividual ? 'e.g., +1 (555) 123-4567' : 'e.g., +1 (555) 123-4567'}
            autoComplete="tel"
            className="mt-2"
          />
          {errors.legal_phone && (
            <p className="text-destructive text-sm mt-1">{errors.legal_phone.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 sm:pt-6">
          <Button type="submit" className="gap-2 w-full sm:w-auto bg-gradient-1">
            Next
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </form>
    </>
  );
}
````

## File: app/onboarding/_components/Step4.tsx
````typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useOnboardingContext } from '@/lib/contexts/OnboardingContext';
import {
  zOrganizationBusinessTypeEnum,
  zOrganizationIndustryTypeEnum,
} from '@/lib/validations/shared/enums';
import { TOrganizationInsert } from '@/lib/validations/organizations';
import { Spinner } from '@/components/ui/spinner';
import { Stepper } from './Stepper';

const step4Schema = z.object({
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(2000, 'Bio must not exceed 2000 characters'),
  business_type: z
    .string()
    .min(1, 'Please select a business type')
    .refine((val) => zOrganizationBusinessTypeEnum.safeParse(val).success, {
      message: 'Please select a business type',
    }),
  custom_business_type: z
    .string()
    .refine(
      (val) => !val || (val.length >= 2 && val.length <= 100),
      'Custom business type must be between 2 and 100 characters if provided'
    )
    .optional()
    .nullable(),
  industry_type: z
    .string()
    .min(1, 'Please select an industry type')
    .refine((val) => zOrganizationIndustryTypeEnum.safeParse(val).success, {
      message: 'Please select an industry type',
    }),
  custom_industry_type: z
    .string()
    .refine(
      (val) => !val || (val.length >= 2 && val.length <= 100),
      'Custom industry type must be between 2 and 100 characters if provided'
    )
    .optional()
    .nullable(),
});

type Step4FormInput = z.infer<typeof step4Schema>;

const businessTypes = [
  { value: 'freelance', label: 'Freelance' },
  { value: 'agency', label: 'Agency' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'creator', label: 'Creator' },
  { value: 'team', label: 'Team' },
  { value: 'company', label: 'Company' },
  { value: 'other', label: 'Other' },
];

const industryTypes = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Web3 / Finance', label: 'Web3 / Finance' },
  { value: 'Design / Creative', label: 'Design / Creative' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Legal Services', label: 'Legal Services' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Health', label: 'Health' },
  { value: 'Media Production', label: 'Media Production' },
  { value: 'Non Profit / Social', label: 'Non Profit / Social' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail / Ecommerce', label: 'Retail / Ecommerce' },
  { value: 'Travel / Hospitality', label: 'Travel / Hospitality' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Other', label: 'Other' },
];

export function Step4() {
  const router = useRouter();
  const { data, updateData, organizationType, isCompleting, completeOnboarding } =
    useOnboardingContext();
  const [showCustomBusiness, setShowCustomBusiness] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const isIndividual = data.legal_type === 'individual';
  const isProvider = organizationType === 'provider';

  const form = useForm<Step4FormInput>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      bio: data.bio,
      business_type: data.business_type,
      custom_business_type: data.custom_business_type || undefined,
      industry_type: data.industry_type,
      custom_industry_type: data.custom_industry_type || undefined,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    reset({
      bio: data.bio,
      business_type: data.business_type,
      custom_business_type: data.custom_business_type || undefined,
      industry_type: data.industry_type,
      custom_industry_type: data.custom_industry_type || undefined,
    });
  }, [
    data.bio,
    data.business_type,
    data.custom_business_type,
    data.industry_type,
    data.custom_industry_type,
    reset,
  ]);

  const businessType = watch('business_type');
  const industryType = watch('industry_type');

  useEffect(() => {
    setShowCustomBusiness(businessType === 'other');
  }, [businessType]);

  useEffect(() => {
    setShowCustomIndustry(industryType === 'Other');
  }, [industryType]);

  const onSubmit = async (formData: Step4FormInput) => {
    const businessTypeResult = zOrganizationBusinessTypeEnum.safeParse(formData.business_type);
    const industryTypeResult = zOrganizationIndustryTypeEnum.safeParse(formData.industry_type);

    if (!businessTypeResult.success || !industryTypeResult.success) {
      return;
    }

    const validatedData: Partial<
      Pick<
        TOrganizationInsert,
        'bio' | 'business_type' | 'custom_business_type' | 'industry_type' | 'custom_industry_type'
      >
    > = {
      bio: formData.bio,
      business_type: businessTypeResult.data,
      custom_business_type: formData.custom_business_type || null,
      industry_type: industryTypeResult.data,
      custom_industry_type: formData.custom_industry_type || null,
    };
    updateData(validatedData);
    await completeOnboarding(validatedData);
  };

  const handleBack = () => {
    router.push('/onboarding?step=3');
  };

  return (
    <>
      <Button variant="glass" size="sm" onClick={handleBack} className="mb-4 sm:mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Stepper currentStep={4} />

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-12">
        Additional Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div>
          <Label htmlFor="bio">
            Bio <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder={
              isIndividual
                ? isProvider
                  ? 'e.g., Experienced freelance designer specializing in branding and UI/UX design with 5+ years working with startups and established companies.'
                  : 'e.g., Business owner looking to streamline payments and manage projects efficiently.'
                : isProvider
                ? 'e.g., Leading creative agency specializing in digital marketing and brand development. We work with innovative companies to create compelling visual identities and marketing strategies.'
                : 'e.g., Technology company providing innovative solutions for businesses. We focus on delivering high-quality products and exceptional customer service.'
            }
            rows={5}
            className="mt-2"
          />
          {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <Label htmlFor="business_type">
            Business Type <span className="text-destructive">*</span>
          </Label>
          <Select id="business_type" {...register('business_type')} className="mt-2">
            <option value="">Select your business type</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.business_type && (
            <p className="text-destructive text-sm mt-1">{errors.business_type.message}</p>
          )}
        </div>

        {showCustomBusiness && (
          <div>
            <Label htmlFor="custom_business_type">Specify business type</Label>
            <Input
              id="custom_business_type"
              {...register('custom_business_type')}
              placeholder="e.g., Sole Proprietorship, Partnership, Non-profit"
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label htmlFor="industry_type">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Select id="industry_type" {...register('industry_type')} className="mt-2">
            <option value="">Select your industry type</option>
            {industryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          {errors.industry_type && (
            <p className="text-destructive text-sm mt-1">{errors.industry_type.message}</p>
          )}
        </div>

        {showCustomIndustry && (
          <div>
            <Label htmlFor="custom_industry_type">Specify industry type</Label>
            <Input
              id="custom_industry_type"
              {...register('custom_industry_type')}
              placeholder="e.g., Agriculture, Education, Energy"
              className="mt-2"
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8 sm:mt-12">
          <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={isCompleting}>
            {isCompleting ? (
              <>
                <Spinner size="sm" />
                Loading...
              </>
            ) : (
              <>
                Complete
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
````

## File: README.md
````markdown
<p align="center">
  <img src="public/logo.svg" alt="Koopay Logo" width="350">
</p>

<h1 align="center">Koopay: Secure Payments for Freelancers</h1>

<p align="center">
  A decentralized freelancing platform for transparent, automated, and secure milestone-based projects.
</p>

<p align="center">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge&logo=git">
  <img alt="Built on Stellar" src="https://img.shields.io/badge/Built_on-Stellar-blue.svg?style=for-the-badge&logo=stellar">
  <img alt="Powered by Supabase" src="https://img.shields.io/badge/Powered_by-Supabase-green.svg?style=for-the-badge&logo=supabase">
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Next.js-black.svg?style=for-the-badge&logo=nextdotjs">
</p>

<p align="center">
  <a href="CONTRIBUTING.md">Contributing Guidelines</a> •
  <a href="https://github.com/koopay-io/koopay/issues">Report Bug</a> •
  <a href="https://github.com/koopay-io/koopay/issues">Request Feature</a>
</p>

Koopay is a blockchain-based freelancing platform designed to make work agreements between clients (Requesters) and freelancers (Providers) more transparent and automated. It combines freelance project management, smart contract escrow services, and on-chain reputation tracking into a single, easy-to-use system.

The platform operates around **milestone-based projects**, where funds are held in secure smart contracts until specific parts of the work are completed. Payments are made in **USDC**, a stablecoin pegged to the U.S. dollar, allowing for fast, low-fee, and borderless transfers.

Crucially, Koopay provides an **invisible Web3 experience**. Users sign up with a standard email or Google account, and a secure Stellar wallet is automatically created for them in the background, removing the barrier of crypto wallet management.

## Fixing a Broken System

In traditional freelancing, the biggest risk isn't doing the work—it's getting paid. Koopay is built to solve the core problems of distrust and inefficiency.

| The Problem ❌ | The Koopay Solution ✅ |
| :--- | :--- |
| **Delayed Payments** | **Automatic Payments** <br> Funds are secured upfront in an escrow and released automatically when a milestone is approved. No chasing invoices. |
| **Ghosting & Distrust** | **Secure, Visible Contracts** <br> Both parties see the project terms and secured funds from day one. Everything is recorded and shared. |
| **High Fees & Slow Transfers** | **Global, Fast Payments** <br> Built on Stellar, payments are settled in seconds with near-zero fees, anywhere in the world. |

-----

## ✨ Key Features

  * **🔒 Smart Escrow Contracts:** Project funds are locked in a `multi-release` escrow contract, automatically managed by code, not people.
  * **📍 Milestone-Based Projects:** Break down large projects into smaller, verifiable milestones, each with its own deliverable and payment.
  * **💳 Invisible Wallet Onboarding:** Users sign up with Google or email, and a secure, non-custodial Stellar wallet is generated for them automatically. No "connect wallet" friction.
  * **💸 Global USDC Payments:** Send and receive payments in a stable, dollar-backed currency for true global collaboration.
  * **🧾 PDF Contract Generation:** Automatically generate and store a formal PDF contract for every project.
  * **📈 On-Chain Reputation:** Every completed project contributes to a user’s public, verifiable, and portable on-chain reputation.
  * **🔐 Supabase Powered:** Utilizes Supabase for secure authentication, database management (PostgreSQL), and file storage.

## ⚙️ How It Works: The Core Flow

1.  **Onboard:** A Client or Freelancer signs up with Google or email. A secure Stellar wallet is instantly and invisibly created for them.
2.  **Create Project:** A Client (Requester) creates a new project, defining the title, description, total budget (in USD), and expected delivery date.
3.  **Assign & Define:** The Client assigns a Freelancer (Provider) and breaks the project into clear, verifiable milestones (e.g., "Milestone 1: Wireframes - 20%", "Milestone 2: Final Design - 80%").
4.  **Secure Escrow:** When the project is created, a smart contract escrow is automatically deployed to the Stellar network, and the `contract_id` is saved to the project.
5.  **Fund (WIP):** The Client funds the escrow with the total project amount in USDC.
6.  **Work & Approve:** The Freelancer completes a milestone. The Client reviews the work and approves it in the Koopay app.
7.  **Get Paid (WIP):** Approving the milestone automatically triggers the escrow contract to release the corresponding USDC payment directly to the Freelancer's wallet.
8.  **Build Reputation:** The completed project is recorded, building the on-chain reputation for both parties.

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) |
| **Blockchain** | [Stellar (Testnet)](https://stellar.org/), [@trustless-work/escrow SDK](https://docs.trustlesswork.com/trustless-work/react-library) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/), [React Context](https://react.dev/learn/passing-data-deeply-with-context) |
| **Utilities** | [Zod](https://zod.dev/) (Validation), [@react-pdf/renderer](https://react-pdf.org/) (PDF Generation) |

## 🚀 Getting Started

### 1\. Clone the Repository

```bash
git clone https://github.com/tomassalina/koopay.git
cd koopay
```

### 2\. Install Dependencies

This project uses `pnpm` for package management.

```bash
pnpm install
```

### 3\. Set Up Environment Variables

Copy the example environment file and fill in your keys.

```bash
cp .env.example .env.local
```

You will need to fill in the following values in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Trustless Work
NEXT_PUBLIC_TRUSTLESS_BASE_URL=
NEXT_PUBLIC_TRUSTLESS_API_KEY=
NEXT_PUBLIC_TRUSTLESS_ADMIN_PK=
NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE=1.5
NEXT_PUBLIC_TRUSTLESS_SKIP_ESCROW=false
```

### 4\. Set Up Supabase Database

1.  Log in to your Supabase account and create a new project.
2.  Go to the **SQL Editor**.
3.  Open the `scripts/002_create_triggers.sql` file from this repo, paste its content into the editor, and run it.
4.  *(Note: Other SQL files appear to be for altering existing tables, `002` is the main setup script).*
5.  **Important:** [Row Level Security (RLS)](https://www.google.com/search?q=https-%3E) is **not yet implemented**. For a production environment, you **must** add RLS policies to all tables.

### 5\. Generate Database Types

To ensure full TypeScript safety, generate types from your new Supabase instance:

```bash
# This will generate types from your remote Supabase DB
pnpm db:types:remote
```

### 6\. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the app.

-----

## 🔧 Development Scripts

  * `pnpm dev`: Starts the Next.js development server (with Turbopack).
  * `pnpm build`: Creates a production-ready build.
  * `pnpm start`: Starts the production server.
  * `pnpm lint`: Runs ESLint to check for code quality issues.
  * `pnpm check`: Runs the TypeScript compiler to check for type errors.
  * `pnpm db:types`: Auto-detects and generates Supabase types (local-first, then remote).
  * `pnpm db:types:local`: Generates types from a local Supabase instance.
  * `pnpm db:types:remote`: Generates types from the remote Supabase DB (production).

## 🛣️ Project Status

This project is a functional MVP with a solid foundation. The core flows for authentication, onboarding, and project creation are complete.

### ✅ What's Working

  * **Authentication:** Full email/password and Google OAuth login.
  * **Invisible Wallet:** Automatic Stellar wallet creation and storage in Supabase `user_metadata` on auth callback.
  * **Onboarding:** A complete 4-step flow for Requesters & Providers to create their organization profile.
  * **Project Creation:** A multi-step form to create a project, define details, assign a collaborator, and set milestones.
  * **Escrow Deployment:** Successfully deploys a `multi-release` escrow smart contract to the Stellar testnet upon project creation.
  * **PDF Contracts:** Generates and saves a PDF contract to Supabase Storage.
  * **Project Viewing:** A detailed project page to view milestones, progress, and contract details.

### ❌ What's Next (Roadmap)

The main pending items involve completing the blockchain interaction loop and implementing security/real-time features.

  * **🔐 Security (Critical):** Implement **Row Level Security (RLS)** in Supabase for all tables.
  * **💸 Escrow Funding & Release:** Implement the UI and logic for:
      * Clients to **fund** the escrow contract with USDC.
      * Clients to **approve** a milestone, triggering the automated payment release from the escrow.
  * **📊 Live Dashboard:** Connect the main dashboard components (`DonutChart`, `ProjectsSection`) to real data from the database instead of mock data.
  * **🔔 Notifications:** Implement a real-time notification system (e.g., project invites, milestone approvals).
  * **🧑‍⚖️ Dispute Resolution:** Build the initial admin-managed dispute resolution system.
````

## File: app/(dashboard)/projects/[id]/_components/EscrowInfoCard.tsx
````typescript
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { truncateContractId } from '@/lib/utils/projectHelpers';

interface EscrowInfoCardProps {
  contractId: string;
  fundingStatus?: 'unfunded' | 'funding' | 'funded' | 'error';
  escrowUsdcBalance?: number | null;
  onViewDetails: () => void;
}

export function EscrowInfoCard({
  contractId,
  fundingStatus = 'unfunded',
  escrowUsdcBalance,
  onViewDetails,
}: EscrowInfoCardProps) {
  const statusLabel =
    fundingStatus === 'funded'
      ? 'Funded'
      : fundingStatus === 'funding'
        ? 'Funding'
        : fundingStatus === 'error'
          ? 'Error'
          : 'Unfunded';
  const statusClassName =
    fundingStatus === 'funded'
      ? 'bg-green-600'
      : fundingStatus === 'funding'
        ? 'bg-yellow-600'
        : fundingStatus === 'error'
          ? 'bg-red-600'
          : 'bg-gray-600';

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                Escrow Disponible
              </h3>
              <Badge className={cn('text-white', statusClassName)}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-white/60 text-sm">
              Contract ID:{" "}
              <code className="text-green-400 font-mono text-xs">
                {truncateContractId(contractId)}
              </code>
            </p>
            {fundingStatus === 'funded' && (
              <p className="text-white/60 text-sm mt-1">
                Balance en escrow:{' '}
                <span className="text-white">
                  {(escrowUsdcBalance ?? 0).toLocaleString()} USDC
                </span>
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={onViewDetails}
            className="text-white hover:bg-white/20 hover:border-white/40 hover:text-white border-gray-600 transition-all"
          >
            Ver Detalles del Escrow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
````

## File: app/(dashboard)/layout.tsx
````typescript
import { createClient } from "@/lib/supabase/server";
import { TrustlessWorkProvider } from "@/components/providers/TrustlessWorkProvider";
import { GlobalStoreProvider } from "@/lib/providers/globalStoreProvider";
import { DashboardNavbar } from "./_components/DashboardNavbar";
import { Breadcrumb } from "./_components/Breadcrumb";
import { redirect } from "next/navigation";
import {
	TGetUserOrganizationsResponse,
	TGetUserOrganizationsParams,
} from "@/lib/validations/shared/functions";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	const rpcResult = (await (
		supabase.rpc as unknown as (
			name: string,
			params: TGetUserOrganizationsParams,
		) => Promise<{
			data: TGetUserOrganizationsResponse | null;
			error: Error | null;
		}>
	)("get_user_organizations", {
		p_user_id: user.id,
	} as TGetUserOrganizationsParams)) as {
		data: TGetUserOrganizationsResponse | null;
		error: Error | null;
	};
	const { data: organizationsData, error } = rpcResult;

	if (error) {
		throw new Error(`Error fetching organizations: ${error.message}`);
	}

	if (!organizationsData) {
		throw new Error("No organizations data returned");
	}

	const organizationsResponse = organizationsData;

	if (!organizationsResponse || organizationsResponse.total === 0) {
		redirect("/onboarding");
	}

	return (
		<ErrorBoundary>
			<TrustlessWorkProvider>
				<GlobalStoreProvider
					initialState={{
						user,
						organizations: organizationsResponse.organizations,
					}}>
					<div className='min-h-screen bg-background'>
						<DashboardNavbar />
						<main className='container mx-auto px-4 sm:px-6 py-4 sm:py-8'>
							<Breadcrumb />
							{children}
						</main>
					</div>
				</GlobalStoreProvider>
			</TrustlessWorkProvider>
		</ErrorBoundary>
	);
}
````

## File: .env.example
````
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Trustless Work
NEXT_PUBLIC_TRUSTLESS_BASE_URL=
NEXT_PUBLIC_TRUSTLESS_API_KEY=
TRUSTLESS_API_KEY=
NEXT_PUBLIC_TRUSTLESS_ADMIN_PK=
NEXT_PUBLIC_TRUSTLESS_PLATFORM_FEE=1.5
````

## File: package.json
````json
{
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "tsc && eslint .",
    "check": "tsc --noEmit",
    "db:types": "node scripts/generate-types.js",
    "db:types:local": "node scripts/generate-types.js --local",
    "db:types:remote": "node scripts/generate-types.js --remote"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.1",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.14",
    "@radix-ui/react-label": "^2.1.6",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.2",
    "@radix-ui/react-tabs": "^1.1.13",
    "@react-pdf/renderer": "^4.3.0",
    "@stellar/stellar-sdk": "^14.1.1",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "@trustless-work/escrow": "^3.0.0",
    "axios": "^1.12.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "crypto-js": "^4.2.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.23.24",
    "input-otp": "^1.4.2",
    "jose": "^6.1.0",
    "lucide-react": "^0.511.0",
    "next": "^16.1.1",
    "next-themes": "^0.4.6",
    "qrcode.react": "^4.2.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.66.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.0",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/crypto-js": "^4.2.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "15.3.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "5.9.3"
  }
}
````

## File: app/(dashboard)/account/page.tsx
````typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useGlobalStore } from "@/lib/stores/globalStore";
import { createClient } from "@/lib/supabase/client";
import { useStellarWallet } from "@/lib/hooks/useStellarWallet";
import {
	Copy,
	Share2,
	Save,
	Wallet,
	Eye,
	EyeOff,
	User,
	Plus,
	ArrowUpRight,
	Trash2,
	Info,
	Building2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { TeamSwitcher } from "../_components/TeamSwitcher";
import {
	TOrganizationUpdate,
	TOrganizationRow,
} from "@/lib/validations/organizations";
import {
	zOrganizationBusinessTypeEnum,
	zOrganizationIndustryTypeEnum,
	EOrganizationBusinessType,
	EOrganizationIndustryType,
} from "@/lib/validations/shared/enums";
import { TCountryRow } from "@/lib/validations/countries";
import {
	TGetUserOrganizationsResponse,
	zGetUserOrganizationsResponse,
	TGetUserOrganizationsParams,
} from "@/lib/validations/shared/functions";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const createOrganizationSchema = (isIndividual: boolean) =>
	z.object({
		name: isIndividual
			? z.string().optional()
			: z.string().min(2, "Name must be at least 2 characters").max(200),
		legal_name: z
			.string()
			.min(2, "Legal name must be at least 2 characters")
			.max(200),
		legal_id: z.string().min(3, "ID must be at least 3 characters").max(100),
		legal_phone: z.string().nullable().optional(),
		bio: z.string().min(10, "Bio must be at least 10 characters").max(2000),
		business_type: z
			.string()
			.refine((val) => zOrganizationBusinessTypeEnum.safeParse(val).success),
		custom_business_type: z.string().nullable().optional(),
		industry_type: z
			.string()
			.refine((val) => zOrganizationIndustryTypeEnum.safeParse(val).success),
		custom_industry_type: z.string().nullable().optional(),
		legal_country_id: z.number().int().positive(),
		legal_state: z.string().min(2).max(100),
		legal_city: z.string().min(2).max(100),
		legal_street_name: z.string().min(2).max(200),
		legal_street_number: z.number().int().positive(),
		legal_postal_code: z.string().min(4).max(12),
		legal_suite: z.string().nullable().optional(),
		legal_floor: z.string().nullable().optional(),
	});

export default function AccountPage() {
	const router = useRouter();
	const [countries, setCountries] = useState<TCountryRow[]>([]);
	const { currentOrganization, user, setOrganizations } = useGlobalStore();
	const {
		wallet,
		balance,
		isLoading: walletLoading,
		refreshBalance,
		sendPayment,
	} = useStellarWallet();
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [showSecret, setShowSecret] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
	const [withdrawDestination, setWithdrawDestination] = useState("");
	const [withdrawAmount, setWithdrawAmount] = useState("");
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const isIndividual = currentOrganization?.legal_type === "individual";
	const organizationSchema = createOrganizationSchema(isIndividual);
	type OrganizationFormData = z.infer<typeof organizationSchema>;

	const organizationUrl = currentOrganization
		? `${typeof window !== "undefined" ? window.location.origin : ""}/organizations/${
				currentOrganization.id
			}`
		: "";

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<OrganizationFormData>({
		resolver: zodResolver(organizationSchema),
		defaultValues: currentOrganization
			? {
					name: currentOrganization.name,
					legal_name: currentOrganization.legal_name,
					legal_id: currentOrganization.legal_id,
					legal_phone: currentOrganization.legal_phone || "",
					bio: currentOrganization.bio,
					business_type: currentOrganization.business_type,
					custom_business_type:
						currentOrganization.custom_business_type || "",
					industry_type: currentOrganization.industry_type,
					custom_industry_type:
						currentOrganization.custom_industry_type || "",
					legal_country_id: currentOrganization.legal_country_id,
					legal_state: currentOrganization.legal_state,
					legal_city: currentOrganization.legal_city,
					legal_street_name: currentOrganization.legal_street_name,
					legal_street_number: currentOrganization.legal_street_number,
					legal_postal_code: currentOrganization.legal_postal_code,
					legal_suite: currentOrganization.legal_suite || "",
					legal_floor: currentOrganization.legal_floor || "",
				}
			: undefined,
	});

	useEffect(() => {
		const fetchCountries = async () => {
			const supabaseClient = createClient();
			const { data } = await supabaseClient
				.from("countries")
				.select("*")
				.eq("available", true)
				.order("name", { ascending: true });
			if (data) {
				setCountries(data);
			}
		};
		fetchCountries();
	}, []);

	useEffect(() => {
		if (currentOrganization) {
			reset({
				name: currentOrganization.name,
				legal_name: currentOrganization.legal_name,
				legal_id: currentOrganization.legal_id,
				legal_phone: currentOrganization.legal_phone || "",
				bio: currentOrganization.bio,
				business_type: currentOrganization.business_type,
				custom_business_type:
					currentOrganization.custom_business_type || "",
				industry_type: currentOrganization.industry_type,
				custom_industry_type:
					currentOrganization.custom_industry_type || "",
				legal_country_id: currentOrganization.legal_country_id,
				legal_state: currentOrganization.legal_state,
				legal_city: currentOrganization.legal_city,
				legal_street_name: currentOrganization.legal_street_name,
				legal_street_number: currentOrganization.legal_street_number,
				legal_postal_code: currentOrganization.legal_postal_code,
				legal_suite: currentOrganization.legal_suite || "",
				legal_floor: currentOrganization.legal_floor || "",
			});
			if (currentOrganization.avatar_url) {
				setAvatarPreview(currentOrganization.avatar_url);
			}
		}
	}, [currentOrganization, reset]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("Image must not exceed 10MB");
			return;
		}

		if (!file.type.startsWith("image/")) {
			toast.error("File must be an image");
			return;
		}

		setAvatarFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatarPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard!");
	};

	const shareUrl = () => {
		if (navigator.share) {
			navigator.share({
				title: currentOrganization?.name || "Organization",
				url: organizationUrl,
			});
		} else {
			copyToClipboard(organizationUrl);
		}
	};

	const handleWithdraw = async () => {
		if (!withdrawDestination || !withdrawAmount || !wallet) return;

		setIsWithdrawing(true);
		try {
			const txHash = await sendPayment(withdrawDestination, withdrawAmount);
			if (txHash) {
				setWithdrawDestination("");
				setWithdrawAmount("");
				setShowWithdrawDialog(false);
				toast.success("Withdrawal successful!");
				await refreshBalance();
			}
		} catch (error) {
			toast.error(
				"Withdrawal failed: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		} finally {
			setIsWithdrawing(false);
		}
	};

	const performDelete = async () => {
		if (!currentOrganization || !user) return;

		setIsDeleting(true);
		try {
			const supabaseClient = createClient();
			const updatePayload = {
				deleted_at: new Date().toISOString(),
				deleted_by: user.id,
			};

			// 1. Mark organization as deleted
			const deleteOrgResult = (await (
				supabaseClient.from("organizations") as unknown as {
					update: (payload: typeof updatePayload) => {
						eq: (
							column: string,
							value: string | number,
						) => Promise<{ error: Error | null }>;
					};
				}
			)
				.update(updatePayload as unknown as never)
				.eq("id", currentOrganization.id)) as unknown as {
				error: Error | null;
			};

			if (deleteOrgResult.error) throw deleteOrgResult.error;

			// 2. Also mark user_organization as deleted to prevent middleware loop
			const deleteUserOrgResult = (await (
				supabaseClient.from("user_organization") as unknown as {
					update: (payload: typeof updatePayload) => {
						eq: (
							column: string,
							value: string | number,
						) => {
							eq: (
								column: string,
								value: string | number,
							) => Promise<{ error: Error | null }>;
						};
					};
				}
			)
				.update(updatePayload as unknown as never)
				.eq("organization_id", currentOrganization.id)
				.eq("user_id", user.id)) as unknown as { error: Error | null };

			if (deleteUserOrgResult.error) throw deleteUserOrgResult.error;

			toast.success("Account deleted successfully");
			router.push("/onboarding");
		} catch (error) {
			toast.error(
				"Failed to delete account: " +
					(error instanceof Error ? error.message : "Unknown error"),
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const onSubmit = async (formData: OrganizationFormData) => {
		if (!currentOrganization || !user) return;

		setIsSaving(true);
		setSaveError(null);

		try {
			const supabaseClient = createClient();
			let avatarUrl = currentOrganization.avatar_url;

			if (avatarFile) {
				const fileExt = avatarFile.name.split(".").pop();
				const fileName = `avatar-${Date.now()}.${fileExt}`;
				const filePath = `${currentOrganization.id}/avatars/${fileName}`;

			const { error: uploadError } =
				await supabaseClient.storage
						.from("organizations")
						.upload(filePath, avatarFile, {
							cacheControl: "3600",
							upsert: false,
						});

				if (uploadError) throw uploadError;

				const { data: urlData } = supabaseClient.storage
					.from("organizations")
					.getPublicUrl(filePath);
				avatarUrl = urlData.publicUrl;
			}

			// Parse business_type and industry_type to ensure they are valid enum values
			const businessTypeParse = zOrganizationBusinessTypeEnum.safeParse(
				formData.business_type,
			);
			const industryTypeParse = zOrganizationIndustryTypeEnum.safeParse(
				formData.industry_type,
			);

			if (!businessTypeParse.success) {
				throw new Error("Invalid business type");
			}
			if (!industryTypeParse.success) {
				throw new Error("Invalid industry type");
			}

			const updateData: TOrganizationUpdate = {
				name: isIndividual ? `${formData.legal_name}'s Org` : formData.name,
				legal_name: formData.legal_name,
				legal_id: formData.legal_id,
				legal_phone: formData.legal_phone || null,
				bio: formData.bio,
				business_type: businessTypeParse.data as EOrganizationBusinessType,
				custom_business_type: formData.custom_business_type || null,
				industry_type: industryTypeParse.data as EOrganizationIndustryType,
				custom_industry_type: formData.custom_industry_type || null,
				legal_country_id: formData.legal_country_id,
				legal_state: formData.legal_state,
				legal_city: formData.legal_city,
				legal_street_name: formData.legal_street_name,
				legal_street_number: formData.legal_street_number,
				legal_postal_code: formData.legal_postal_code,
				legal_suite: formData.legal_suite || null,
				legal_floor: formData.legal_floor || null,
				avatar_url: avatarUrl,
			};

			const updateResult = (await (
				supabaseClient.from("organizations") as unknown as {
					update: (payload: typeof updateData) => {
						eq: (
							column: string,
							value: string | number,
						) => {
							select: () => {
								single: () => Promise<{
									data: TOrganizationRow | null;
									error: Error | null;
								}>;
							};
						};
					};
				}
			)
				.update(updateData as unknown as never)
				.eq("id", currentOrganization.id)
				.select()
				.single()) as {
				data: TOrganizationRow | null;
				error: Error | null;
			};
			const { error } = updateResult;

			if (error) throw error;

			const rpcParams: TGetUserOrganizationsParams = {
				p_user_id: user.id,
			};
			const rpcResult = (await (
				supabaseClient.rpc as unknown as (
					name: string,
					params: TGetUserOrganizationsParams,
				) => Promise<{ data: TGetUserOrganizationsResponse | null }>
			)("get_user_organizations", rpcParams)) as {
				data: TGetUserOrganizationsResponse | null;
			};
			const { data: orgsData } = rpcResult;

			if (orgsData) {
				const parsedResponse =
					zGetUserOrganizationsResponse.parse(orgsData);
				setOrganizations(parsedResponse.organizations);
			}

			toast.success("Account updated successfully!");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update account";
			setSaveError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	if (!currentOrganization) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-6xl'>
				<div className='text-center py-12'>
					<p className='text-muted-foreground'>
						Loading organization data...
					</p>
				</div>
			</div>
		);
	}

	const countryIdValue = watch("legal_country_id");
	const totalBalance = balance.reduce(
		(sum, bal) => sum + parseFloat(bal.balance),
		0,
	);
	const xlmBalance = balance.find((b) => b.asset === "XLM")?.balance || "0";

	return (
		<div className='container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-6xl'>
			<div className='space-y-4 sm:space-y-8'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div className='hidden sm:block'>
						<h1 className='text-2xl sm:text-3xl font-bold mb-2'>
							Account Settings
						</h1>
						<p className='text-muted-foreground text-sm sm:text-base'>
							Manage your account information and settings
						</p>
					</div>
					<div className='w-full sm:w-auto'>
						<TeamSwitcher variant='full' />
					</div>
				</div>

				<div className='lg:hidden space-y-4'>
					<Card className='w-full'>
						<CardHeader className='pb-4'>
							<CardTitle className='text-lg sm:text-xl'>
								Organization QR Code
							</CardTitle>
							<CardDescription className='text-sm'>
								Share this QR code to let others find your organization
							</CardDescription>
						</CardHeader>
						<CardContent>{renderQRCode()}</CardContent>
					</Card>

					<Tabs
						defaultValue='account'
						className='w-full'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='account'>Account</TabsTrigger>
							<TabsTrigger value='wallet'>Wallet</TabsTrigger>
						</TabsList>
						<TabsContent
							value='account'
							className='mt-4 space-y-4'>
							{renderAccountForm()}
						</TabsContent>
						<TabsContent
							value='wallet'
							className='mt-4'>
							{renderWalletSection()}
						</TabsContent>
					</Tabs>
				</div>

				<div className='hidden lg:grid lg:grid-cols-3 gap-6'>
					<div className='lg:col-span-2 space-y-6'>
						<Card className='w-full'>
							<CardHeader className='pb-4'>
								<CardTitle className='text-lg sm:text-xl'>
									Organization QR Code
								</CardTitle>
								<CardDescription className='text-sm'>
									Share this QR code to let others find your
									organization
								</CardDescription>
							</CardHeader>
							<CardContent>{renderQRCode()}</CardContent>
						</Card>
						{renderAccountForm()}
					</div>
					<div className='space-y-6'>{renderWalletSection()}</div>
				</div>
			</div>
		</div>
	);

	function renderQRCode() {
		return (
			<div className='flex flex-col items-center gap-4 p-4 sm:p-6 bg-card rounded-lg border'>
				{organizationUrl && (
					<QRCodeSVG
						value={organizationUrl}
						size={
							typeof window !== "undefined" && window.innerWidth < 640
								? 180
								: 200
						}
						level='H'
						includeMargin={true}
						fgColor='#ffffff'
						bgColor='#16132c'
					/>
				)}
				<div className='w-full max-w-md'>
					<div className='flex gap-2'>
						<Input
							value={organizationUrl}
							readOnly
							className='flex-1 font-mono text-xs sm:text-sm'
						/>
						<Button
							variant='outline'
							size='sm'
							onClick={() => copyToClipboard(organizationUrl)}>
							<Copy className='h-4 w-4' />
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={shareUrl}>
							<Share2 className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>
		);
	}

	function renderAccountForm() {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Organization Information</CardTitle>
					<CardDescription>
						Update your organization details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-4 sm:space-y-6'>
						<div className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center'>
							<div className='flex-shrink-0'>
								<input
									type='file'
									id='avatar'
									accept='image/*'
									onChange={handleAvatarChange}
									className='hidden'
								/>
								<label
									htmlFor='avatar'
									className='cursor-pointer block'>
									<Avatar className='w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border-2 border-border hover:border-primary transition-colors rounded-full'>
										{avatarPreview ? (
											<AvatarImage
												src={avatarPreview}
												alt='Avatar'
											/>
										) : null}
										<AvatarFallback className='bg-primary/20'>
											{currentOrganization?.legal_type ===
											"individual" ? (
												<User className='w-10 h-10 sm:w-12 sm:h-12 text-foreground/60' />
											) : (
												<Building2 className='w-10 h-10 sm:w-12 sm:h-12 text-foreground/60' />
											)}
										</AvatarFallback>
									</Avatar>
								</label>
							</div>
							<div className='flex-1'>
								<Label
									htmlFor='avatar'
									className='cursor-pointer'>
									<p className='text-foreground/60 text-sm'>
										Click to change logo
									</p>
								</Label>
							</div>
						</div>

						{!isIndividual && (
							<div>
								<Label htmlFor='name'>
									Organization Name{" "}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									id='name'
									{...register("name")}
									className='mt-2'
								/>
								{errors.name && (
									<p className='text-destructive text-sm mt-1'>
										{errors.name.message}
									</p>
								)}
							</div>
						)}

						<div>
							<Label htmlFor='legal_name'>
								Legal Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='legal_name'
								{...register("legal_name")}
								className='mt-2'
							/>
							{errors.legal_name && (
								<p className='text-destructive text-sm mt-1'>
									{errors.legal_name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='legal_id'>
								Legal ID <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='legal_id'
								{...register("legal_id")}
								className='mt-2'
							/>
							{errors.legal_id && (
								<p className='text-destructive text-sm mt-1'>
									{errors.legal_id.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='legal_phone'>Phone</Label>
							<Input
								id='legal_phone'
								type='tel'
								{...register("legal_phone")}
								className='mt-2'
							/>
						</div>

						<div>
							<Label htmlFor='bio'>
								Bio <span className='text-destructive'>*</span>
							</Label>
							<Textarea
								id='bio'
								{...register("bio")}
								rows={4}
								className='mt-2'
								placeholder='Tell us about your organization...'
							/>
							{errors.bio && (
								<p className='text-destructive text-sm mt-1'>
									{errors.bio.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='business_type'>
								Business Type{" "}
								<span className='text-destructive'>*</span>
							</Label>
							<Select
								id='business_type'
								className='mt-2'
								value={watch("business_type")}
								onChange={(e) =>
									setValue("business_type", e.target.value)
								}>
								<option value='b2b'>B2B</option>
								<option value='b2c'>B2C</option>
								<option value='b2g'>B2G</option>
								<option value='nonprofit'>Nonprofit</option>
								<option value='other'>Other</option>
							</Select>
						</div>

						{watch("business_type") === "other" && (
							<div>
								<Label htmlFor='custom_business_type'>
									Custom Business Type
								</Label>
								<Input
									id='custom_business_type'
									{...register("custom_business_type")}
									className='mt-2'
								/>
							</div>
						)}

						<div>
							<Label htmlFor='industry_type'>
								Industry Type{" "}
								<span className='text-destructive'>*</span>
							</Label>
							<Select
								id='industry_type'
								className='mt-2'
								value={watch("industry_type")}
								onChange={(e) =>
									setValue("industry_type", e.target.value)
								}>
								<option value='technology'>Technology</option>
								<option value='finance'>Finance</option>
								<option value='healthcare'>Healthcare</option>
								<option value='education'>Education</option>
								<option value='retail'>Retail</option>
								<option value='manufacturing'>Manufacturing</option>
								<option value='other'>Other</option>
							</Select>
						</div>

						{watch("industry_type") === "other" && (
							<div>
								<Label htmlFor='custom_industry_type'>
									Custom Industry Type
								</Label>
								<Input
									id='custom_industry_type'
									{...register("custom_industry_type")}
									className='mt-2'
								/>
							</div>
						)}

						<div>
							<Label htmlFor='legal_country_id'>
								Country <span className='text-destructive'>*</span>
							</Label>
							<Select
								id='legal_country_id'
								className='mt-2'
								value={countryIdValue?.toString() || ""}
								onChange={(e) => {
									const value = e.target.value
										? parseInt(e.target.value, 10)
										: undefined;
									if (value && value > 0) {
										setValue("legal_country_id", value);
									}
								}}>
								<option value=''>Select a country</option>
								{countries.map((country) => (
									<option
										key={country.id}
										value={country.id.toString()}>
										{country.emoji ? `${country.emoji} ` : ""}
										{country.name}
									</option>
								))}
							</Select>
						</div>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='legal_state'>
									State/Province{" "}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									id='legal_state'
									{...register("legal_state")}
									className='mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='legal_city'>
									City <span className='text-destructive'>*</span>
								</Label>
								<Input
									id='legal_city'
									{...register("legal_city")}
									className='mt-2'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='legal_street_name'>
								Street Name <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='legal_street_name'
								{...register("legal_street_name")}
								className='mt-2'
							/>
						</div>

						<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
							<div>
								<Label htmlFor='legal_street_number'>
									Street Number{" "}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									id='legal_street_number'
									type='number'
									{...register("legal_street_number", {
										valueAsNumber: true,
									})}
									className='mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='legal_postal_code'>
									Postal Code{" "}
									<span className='text-destructive'>*</span>
								</Label>
								<Input
									id='legal_postal_code'
									{...register("legal_postal_code")}
									className='mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='legal_suite'>Suite</Label>
								<Input
									id='legal_suite'
									{...register("legal_suite")}
									className='mt-2'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='legal_floor'>Floor</Label>
							<Input
								id='legal_floor'
								{...register("legal_floor")}
								className='mt-2'
							/>
						</div>

						{saveError && (
							<div className='p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
								<p className='text-destructive text-sm'>{saveError}</p>
							</div>
						)}

						<Button
							type='submit'
							disabled={isSaving}
							className='w-full'>
							<Save className='h-4 w-4 mr-2' />
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>

						<Button
							type='button'
							variant='destructive'
							disabled={isDeleting}
							onClick={performDelete}
							className='w-full'>
							<Trash2 className='h-4 w-4 mr-2' />
							{isDeleting ? "Deleting..." : "Delete Account"}
						</Button>
					</form>
				</CardContent>
			</Card>
		);
	}

	function renderWalletSection() {
		if (!wallet) {
			return (
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Wallet className='h-5 w-5' />
							Stellar Wallet
						</CardTitle>
						<CardDescription>No wallet found</CardDescription>
					</CardHeader>
				</Card>
			);
		}

		return (
			<ErrorBoundary>
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Wallet className='h-5 w-5' />
							Stellar Wallet
						</CardTitle>
						<CardDescription>
							Your invisible wallet managed automatically
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='text-center'>
							<div className='text-3xl sm:text-4xl font-bold mb-1'>
								{parseFloat(xlmBalance).toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 7,
								})}{" "}
								XLM
							</div>
							<p className='text-muted-foreground text-sm'>
								${totalBalance.toFixed(2)} USD (approx)
							</p>
						</div>

						<div className='grid grid-cols-3 gap-2 sm:gap-4'>
							<Dialog
								open={showAddDialog}
								onOpenChange={setShowAddDialog}>
								<DialogTrigger asChild>
									<Button
										variant='outline'
										className='flex flex-col items-center gap-2 h-auto py-4'>
										<Plus className='h-5 w-5' />
										<span className='text-xs sm:text-sm'>Add</span>
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-md'>
									<DialogHeader>
										<DialogTitle>Add Funds</DialogTitle>
										<DialogDescription>
											Send XLM from an external wallet to your public
											address on Stellar testnet
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div className='flex flex-col items-center gap-4 p-4 bg-card rounded-lg border'>
											<QRCodeSVG
												value={wallet.publicKey}
												size={180}
												level='H'
												includeMargin={true}
												fgColor='#ffffff'
												bgColor='#16132c'
											/>
										</div>
										<div>
											<Label>Your Public Address</Label>
											<div className='flex gap-2 mt-2'>
												<Input
													value={wallet.publicKey}
													readOnly
													className='flex-1 font-mono text-xs'
												/>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														copyToClipboard(wallet.publicKey)
													}>
													<Copy className='h-4 w-4' />
												</Button>
											</div>
										</div>
										<div className='p-4 bg-info/10 border border-info/20 rounded-lg flex gap-3'>
											<Info className='h-5 w-5 text-info flex-shrink-0 mt-0.5' />
											<div className='text-sm text-muted-foreground'>
												<p className='font-medium mb-1'>
													To start using this wallet:
												</p>
												<p>
													Send at least 1 XLM from an external
													wallet to the address above on Stellar
													testnet.
												</p>
											</div>
										</div>
									</div>
								</DialogContent>
							</Dialog>

							<Dialog
								open={showWithdrawDialog}
								onOpenChange={setShowWithdrawDialog}>
								<DialogTrigger asChild>
									<Button
										variant='outline'
										className='flex flex-col items-center gap-2 h-auto py-4'>
										<ArrowUpRight className='h-5 w-5' />
										<span className='text-xs sm:text-sm'>
											Withdraw
										</span>
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Withdraw Funds</DialogTitle>
										<DialogDescription>
											Send XLM to another Stellar address
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div>
											<Label htmlFor='withdraw-destination'>
												Destination Address
											</Label>
											<Input
												id='withdraw-destination'
												placeholder='Enter Stellar address...'
												value={withdrawDestination}
												onChange={(e) =>
													setWithdrawDestination(e.target.value)
												}
												className='mt-2'
											/>
										</div>
										<div>
											<Label htmlFor='withdraw-amount'>
												Amount (XLM)
											</Label>
											<Input
												id='withdraw-amount'
												type='number'
												step='0.0000001'
												placeholder='0.0000001'
												value={withdrawAmount}
												onChange={(e) =>
													setWithdrawAmount(e.target.value)
												}
												className='mt-2'
											/>
										</div>
										<Button
											onClick={handleWithdraw}
											disabled={
												!withdrawDestination ||
												!withdrawAmount ||
												isWithdrawing
											}
											className='w-full'>
											{isWithdrawing ? "Withdrawing..." : "Withdraw"}
										</Button>
									</div>
								</DialogContent>
							</Dialog>

							<Button
								variant='outline'
								className='flex flex-col items-center gap-2 h-auto py-4'
								onClick={() => copyToClipboard(wallet.publicKey)}>
								<Copy className='h-5 w-5' />
								<span className='text-xs sm:text-sm'>Copy</span>
							</Button>
						</div>

						<div className='pt-4 border-t'>
							<div className='flex items-center justify-between mb-2'>
								<Label className='text-sm font-medium'>Balance</Label>
								<Button
									variant='ghost'
									size='sm'
									onClick={refreshBalance}
									disabled={walletLoading}>
									{walletLoading ? "Loading..." : "Refresh"}
								</Button>
							</div>
							{walletLoading ? (
								<div className='text-center py-4 text-sm text-muted-foreground'>
									Loading...
								</div>
							) : balance.length === 0 ? (
								<div className='p-4 bg-muted/50 rounded-lg text-center'>
									<p className='text-sm text-muted-foreground'>
										No balance found
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{balance.map((bal, index) => (
										<div
											key={index}
											className='flex justify-between items-center text-sm'>
											<span className='font-medium'>
												{bal.asset}
											</span>
											<span className='font-mono'>
												{bal.balance}
											</span>
										</div>
									))}
								</div>
							)}
						</div>

						<div className='pt-4 border-t space-y-4'>
							<div>
								<Label className='text-sm font-medium'>
									Public Address
								</Label>
								<div className='flex items-center gap-2 mt-1'>
									<code className='flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono break-all'>
										{wallet.publicKey}
									</code>
									<Button
										variant='outline'
										size='sm'
										onClick={() => copyToClipboard(wallet.publicKey)}>
										<Copy className='h-4 w-4' />
									</Button>
								</div>
							</div>

							<div>
								<Label className='text-sm font-medium'>
									Secret Key
								</Label>
								<div className='flex items-center gap-2 mt-1'>
									<code className='flex-1 bg-muted px-3 py-2 rounded-md text-xs font-mono break-all'>
										{showSecret
											? wallet.secretKey
											: "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
									</code>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setShowSecret(!showSecret)}>
										{showSecret ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</Button>
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											copyToClipboard(wallet.secretKey || "")
										}>
										<Copy className='h-4 w-4' />
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</ErrorBoundary>
		);
	}
}
````

## File: app/(dashboard)/platform/page.tsx
````typescript
import { createClient } from "@/lib/supabase/server";
import { PlatformClient } from "./_components/PlatformClient";
import { Database } from "@/lib/supabase/types/database.gen";
import { redirect } from "next/navigation";
import { ProjectsSection } from "./_components/ProjectsSection"; // Import for prop types
import { formatDateRange, formatTotalPay } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
		console.error("Error fetching projects:", error);
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

	return (
		<ErrorBoundary>
			<PlatformClient projects={formattedProjects} />
		</ErrorBoundary>
	);
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
		.limit(10)) as { data: ProjectWithMilestoneCount[] | null; error: unknown };

	return {
		projects: projectsData || [],
		error: projectsError,
	};
}
````

## File: app/(dashboard)/projects/[id]/_components/MilestonesTimeline.tsx
````typescript
import { Card, CardContent } from "@/components/ui/card";
import { CompletedMilestoneIcon } from "@/components/milestone-icons/CompletedMilestoneIcon";
import { PendingMilestoneIcon } from "@/components/milestone-icons/PendingMilestoneIcon";
import { getMilestoneAmount, formatCurrency } from "@/lib/utils/projectHelpers";
import { Database } from "@/lib/supabase/types/database.gen";

type Milestone = Database['public']['Tables']['milestones']['Row'] & {
  payment_hash?: string | null;
  payment_sent_at?: string | null;
};

interface MilestonesTimelineProps {
  milestones: Milestone[];
  totalAmount: number;
}

export function MilestonesTimeline({ milestones, totalAmount }: MilestonesTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                Este proyecto no tiene milestones
              </h3>
              <p className="text-white/80">
                Los milestones deben ser creados al momento de crear el proyecto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Milestones are already ordered correctly by created_at from the database
  // No need to sort again - they come in the correct order from useProjectMilestones
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Milestones</h2>
      <div className="relative">
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-600"></div>
        <div className="flex justify-between items-start">
          {milestones.map((milestone) => {
            const isPaid = milestone.status === "completed" && milestone.payment_hash;
            const isCompleted = milestone.status === "completed";
            
            return (
              <div
                key={milestone.id}
                className="flex flex-col items-center relative z-10"
              >
                <div className="w-16 h-16 mb-4">
                  {isPaid ? (
                    <div className="w-full h-full rounded-full bg-green-600 flex items-center justify-center border-4 border-green-400">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : isCompleted ? (
                    <CompletedMilestoneIcon id={`completed-${milestone.id}`} />
                  ) : (
                    <PendingMilestoneIcon />
                  )}
                </div>
                <div className="text-center max-w-32">
                  <h3 className="text-white text-sm font-medium mb-2 leading-tight">
                    {milestone.title}
                  </h3>
                  <p className="text-blue-400 text-sm font-semibold">
                    {formatCurrency(getMilestoneAmount(totalAmount, milestone.percentage))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
````

## File: app/(dashboard)/projects/[id]/_components/CurrentMilestone.tsx
````typescript
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Upload } from "lucide-react";
import {
  formatDate,
  getDaysLeft,
} from "@/lib/utils/projectHelpers";
import { Database } from "@/lib/supabase/types/database.gen";

type Milestone = Database["public"]["Tables"]["milestones"]["Row"] & {
  payment_hash?: string | null;
  payment_sent_at?: string | null;
};

interface CurrentMilestoneProps {
  milestone: Milestone | null;
  expectedDeliveryDate: string;
  milestoneCompleted: boolean;
  onMilestoneCompletedChange: (completed: boolean) => void;
  onUploadEvidenceClick: () => void;
}

export function CurrentMilestone({
  milestone,
  expectedDeliveryDate,
  milestoneCompleted,
  onMilestoneCompletedChange,
  onUploadEvidenceClick,
}: CurrentMilestoneProps) {
  if (!milestone) {
    return (
      <Card className="bg-blue-600 border-blue-500">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Current milestone:
          </h2>
          <div className="text-white/60">No hay hitos pendientes</div>
        </CardContent>
      </Card>
    );
  }

	const daysLeft = getDaysLeft(expectedDeliveryDate);

  return (
    <Card className="bg-blue-600 border-blue-500">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-white mb-6">
          Current milestone:
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-white" />
            <span className="text-white text-lg">{milestone.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-white/80" />
            <span className="text-white/80">
              Deadline: {formatDate(expectedDeliveryDate)}
            </span>
          </div>

          <div className="flex gap-4 mt-6">
            <Badge className="bg-white/20 text-white border-white/30">
              Receive for this milestone: {milestone.percentage}%
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30">
              {daysLeft} days left
            </Badge>
            {milestone.status === "completed" && milestone.payment_hash && (
              <Badge className="bg-green-600 text-white border-green-500">
                ✓ Paid
              </Badge>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={milestoneCompleted}
                onChange={(e) => onMilestoneCompletedChange(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-white">Marcar hito como completado</span>
            </label>

            <Button
              className="w-full bg-white text-blue-600 hover:brightness-110 hover:shadow-lg gap-2 transition-all"
              onClick={onUploadEvidenceClick}
            >
              <Upload className="h-4 w-4" />
              Subir evidencia
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
````

## File: app/(dashboard)/projects/create/page.tsx
````typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useStellarWallet } from "@/lib/hooks/useStellarWallet";
import { signTransactionWithSk } from "@/lib/stellar/trustless";
import { toast } from "sonner";

// Components
import { MilestoneEditModal } from "@/components/MilestoneEditModal";
import { CollaboratorAssignmentModal } from "@/components/CollaboratorAssignmentModal";
import { ProjectDetailsForm } from "./_components/ProjectDetailsForm";
import { ProjectCollaborator } from "./_components/ProjectCollaborator";
import { ProjectMilestones } from "./_components/ProjectMilestones";

// Server Actions
import {
  prepareProjectCreation,
  finalizeProjectCreation,
} from "@/app/actions/project-actions";

// Types
import type { CreateProjectInput } from "@/lib/validations/project";

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  percentage: number;
}

interface Collaborator {
  id: string;
  full_name: string;
  position: string;
  avatar_url: string | null;
  wallet_address?: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { wallet } = useStellarWallet();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-foreground hover:bg-muted/50 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <CreateProjectForm wallet={wallet} onBack={() => router.back()} />
      </div>
    </div>
  );
}

// This component handles all high-frequency updates (typing, slider)
interface CreateProjectFormProps {
  wallet: { publicKey: string; secretKey?: string } | null;
  onBack: () => void;
}

function CreateProjectForm({ wallet, onBack }: CreateProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(8000);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Hero section",
      description:
        "Create the wireframes and high quality mockup design of the hero section...",
      deadline: "2026-02-14",
      percentage: 100,
    },
  ]);

  // Modal State
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null,
  );
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

  // Collaborator State
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<Collaborator | null>(null);

  // --- Handlers ---

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (id: string) => {
    const milestone = milestones.find((m) => m.id === id);
    setEditingMilestone(milestone || null);
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (milestone: Milestone) => {
    if (editingMilestone) {
      setMilestones(
        milestones.map((m) => (m.id === milestone.id ? milestone : m)),
      );
    } else {
      setMilestones([
        ...milestones,
        { ...milestone, id: Date.now().toString() },
      ]);
    }
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSelectCollaborator = (freelancer: Collaborator) => {
    setSelectedCollaborator(freelancer);
  };

  const handlePublishProject = () => {
    if (!wallet?.publicKey || !wallet?.secretKey) {
      toast.error("Wallet not connected or missing secret key");
      return;
    }

    if (!selectedCollaborator) {
      toast.error("Please assign a collaborator");
      return;
    }

    const isManualCollaborator = selectedCollaborator.id === "manual";
    const manualAddress = selectedCollaborator.wallet_address?.trim() ?? "";

    if (isManualCollaborator && !manualAddress) {
      toast.error("Missing collaborator wallet address");
      return;
    }

    const payload: CreateProjectInput = {
      title: projectTitle,
      description: projectDescription,
      total_amount: totalAmount,
      expected_delivery_date: expectedDeliveryDate,
      freelancer_id: isManualCollaborator ? null : selectedCollaborator.id,
      freelancer_address: isManualCollaborator ? manualAddress : null,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        deadline: m.deadline,
      })),
    };

    startTransition(async () => {
      try {
        // 1. Prepare (Server)
        toast.info("Preparing contract...");
        const prep = await prepareProjectCreation(payload, wallet.publicKey);

        if (!prep.success) {
          throw new Error(prep.error);
        }

        // 2. Sign (Client)
        toast.info("Signing transaction...");
        const signedXdr = signTransactionWithSk(
          prep.unsignedTransaction,
          wallet.secretKey!,
        );

        // 3. Finalize (Server)
        toast.info("Deploying to Stellar network...");
        const result = await finalizeProjectCreation(signedXdr, payload);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("Project created successfully!");
        router.push(`/projects/${result.projectId}`);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create project";
        toast.error(message);
      }
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            New Project
          </h1>

          <ProjectDetailsForm
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            expectedDeliveryDate={expectedDeliveryDate}
            setExpectedDeliveryDate={setExpectedDeliveryDate}
          />

          <ProjectCollaborator
            selectedCollaborator={selectedCollaborator}
            onOpenModal={() => setIsCollaboratorModalOpen(true)}
            onClearCollaborator={() => setSelectedCollaborator(null)}
          />
        </div>

        {/* Right Section */}
        <ProjectMilestones
          milestones={milestones}
          onAddMilestone={handleAddMilestone}
          onEditMilestone={handleEditMilestone}
        />
      </div>

      {/* Terms and Create Project Button */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-foreground cursor-pointer"
          >
            I accept the terms and conditions of the established contract
          </label>
        </div>

        <Button
          onClick={handlePublishProject}
          disabled={
            isPending ||
            !projectTitle ||
            !projectDescription ||
            !expectedDeliveryDate ||
            !acceptTerms ||
            !selectedCollaborator
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Create Project
              <Check className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <MilestoneEditModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        milestone={editingMilestone}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
      />

      <CollaboratorAssignmentModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        onSelect={handleSelectCollaborator}
        selectedFreelancer={selectedCollaborator}
      />
    </>
  );
}
````

## File: app/(dashboard)/projects/[id]/page.tsx
````typescript
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, FileText, Home } from "lucide-react";
import { useParams } from "next/navigation";
import { useProjectPage } from "@/lib/hooks/useProjectPage";
import { LoadingState } from "./_components/LoadingState";
import { ErrorState } from "./_components/ErrorState";
import { ProjectOverview } from "./_components/ProjectOverview";
import { CurrentMilestone } from "./_components/CurrentMilestone";
import { MilestonesTimeline } from "./_components/MilestonesTimeline";
import { ProjectProgress } from "./_components/ProjectProgress";
import { EscrowInfoCard } from "./_components/EscrowInfoCard";
import { FundEscrowCard } from "./_components/FundEscrowCard";
import { useMilestoneEvidence } from "@/lib/hooks/useMilestoneEvidence";
import { useEffect, useState } from "react";
import { EvidenceList } from "./_components/EvidenceList";
import { EvidenceUploadModal } from "@/components/EvidenceUploadModal";
import { PaymentTransactionCard } from "./_components/PaymentTransactionCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    project,
    milestones,
    loading,
    currentMilestone,
    escrowContractId,
    escrowFundingStatus,
    escrowUsdcBalance,
    refetchEscrowDetails,
    milestoneCompleted,
    setMilestoneCompleted,
    handleViewContract,
    handleMilestoneComplete,
    router,
    isApproving,
    approvalError,
  } = useProjectPage(projectId);

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  const {
    evidence,
    isLoading: isLoadingEvidence,
    fetchEvidence,
  } = useMilestoneEvidence();

  // ✅ FIX: Only re-run when the ID changes, not the object reference
  useEffect(() => {
    if (currentMilestone?.id) {
      fetchEvidence(currentMilestone.id);
    }
    // We only depend on the ID string, which is stable across renders
  }, [currentMilestone?.id, fetchEvidence]);

  if (loading) {
    return <LoadingState />;
  }

  if (!project) {
    return <ErrorState />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20 hover:text-white gap-2 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/platform")}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-2 transition-all"
              >
                <Home className="h-4 w-4" />
                Go to Platform
              </Button>
            </div>

            {/* Project Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <ProjectOverview
                title={project.title}
                description={project.description}
                totalAmount={project.total_amount}
              />

              <CurrentMilestone
                milestone={currentMilestone}
                expectedDeliveryDate={project.expected_delivery_date}
                milestoneCompleted={milestoneCompleted}
                onMilestoneCompletedChange={setMilestoneCompleted}
                onUploadEvidenceClick={() => setIsEvidenceModalOpen(true)}
              />
            </div>

            {/* Evidence */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Evidence</h2>
              <EvidenceList evidence={evidence} isLoading={isLoadingEvidence} />
            </div>

            {/* Payment Details */}
            {(() => {
              const milestoneToShow =
                currentMilestone?.status === "completed"
                  ? currentMilestone
                  : milestones
                      .filter((m) => m.status === "completed" && m.payment_hash)
                      .sort(
                        (a, b) =>
                          new Date(b.payment_sent_at || 0).getTime() -
                          new Date(a.payment_sent_at || 0).getTime(),
                      )[0];

              return milestoneToShow?.payment_hash &&
                (project.freelancer_address || project.freelancer_id) ? (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Payment Details
                  </h2>
                  {(() => {
                    const recipient =
                      project.freelancer_address ?? project.freelancer_id;
                    if (!recipient) return null;

                    return (
                      <PaymentTransactionCard
                        paymentHash={milestoneToShow.payment_hash}
                        amount={
                          project.total_amount *
                          (milestoneToShow.percentage / 100)
                        }
                        recipient={recipient}
                        timestamp={milestoneToShow.payment_sent_at ?? null}
                        status="success"
                      />
                    );
                  })()}
                </div>
              ) : null;
            })()}

            {/* Milestones Timeline */}
            <MilestonesTimeline
              milestones={milestones}
              totalAmount={project.total_amount}
            />

            {/* Project Progress */}
            <ProjectProgress milestones={milestones} />

            {/* Escrow */}
            {escrowContractId && project && (
              <>
                {escrowFundingStatus !== "funded" && (
                  <FundEscrowCard
                    contractId={escrowContractId}
                    totalAmount={project.total_amount}
                    fundingStatus={escrowFundingStatus}
                    escrowUsdcBalance={escrowUsdcBalance}
                    onFundingSuccess={refetchEscrowDetails}
                  />
                )}

                <EscrowInfoCard
                  contractId={escrowContractId}
                  fundingStatus={escrowFundingStatus}
                  escrowUsdcBalance={escrowUsdcBalance}
                  onViewDetails={() =>
                    router.push(`/projects/${projectId}/test-escrow`)
                  }
                />
              </>
            )}

            {/* Save Changes Button */}
            <div className="flex flex-col items-end gap-4">
              {approvalError && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-2 rounded text-sm">
                  Error: {approvalError}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleViewContract}
                  variant="secondary"
                  className="hover:brightness-110 hover:shadow-lg transition-all"
                  disabled={isApproving}
                >
                  <FileText className="h-5 w-5" />
                  Ver Contrato
                </Button>

                <Button
                  onClick={handleMilestoneComplete}
                  disabled={!milestoneCompleted || isApproving}
                  className="bg-blue-500 hover:brightness-110 hover:shadow-lg text-white px-8 py-3 text-lg gap-2 disabled:opacity-50 transition-all"
                >
                  {isApproving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Aprobando en Smart Contract...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Evidence Upload Modal */}
        {currentMilestone && (
          <EvidenceUploadModal
            isOpen={isEvidenceModalOpen}
            onClose={() => setIsEvidenceModalOpen(false)}
            milestoneId={currentMilestone.id}
            onUploadSuccess={() => fetchEvidence(currentMilestone.id)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
````
