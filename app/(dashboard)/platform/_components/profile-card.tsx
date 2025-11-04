'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Building2 } from 'lucide-react';
import { TOrganizationRow } from '@/lib/supabase/types/domain/organizations';

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
