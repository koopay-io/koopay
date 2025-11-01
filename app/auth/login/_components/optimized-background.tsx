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
