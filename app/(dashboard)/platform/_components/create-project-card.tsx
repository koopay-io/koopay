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
