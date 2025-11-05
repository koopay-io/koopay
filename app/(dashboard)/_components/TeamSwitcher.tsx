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

