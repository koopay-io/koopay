'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';
import { Magnet } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface MagnetizeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
  children?: React.ReactNode;
  variant?: 'default' | 'outline';
  asChild?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

function MagnetizeButton({
  className,
  particleCount = 12,
  attractRadius = 50,
  children,
  variant = 'default',
  asChild,
  ...props
}: MagnetizeButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesControl = useAnimation();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * 360 - 180,
    }));
    setParticles(newParticles);
  }, [particleCount]);

  const handleInteractionStart = useCallback(async () => {
    setIsAttracting(true);
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
      },
    });
  }, [particlesControl]);

  const handleInteractionEnd = useCallback(async () => {
    setIsAttracting(false);
    await particlesControl.start((i) => ({
      x: particles[i].x,
      y: particles[i].y,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    }));
  }, [particlesControl, particles]);

  const particleColor = variant === 'outline' 
    ? 'bg-sky-400/60 dark:bg-sky-300/60' 
    : 'bg-white/40 dark:bg-white/30';

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      {particles.map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          initial={{ x: particles[index].x, y: particles[index].y }}
          animate={particlesControl}
          className={cn(
            'absolute w-1.5 h-1.5 rounded-full pointer-events-none z-0',
            particleColor,
            'transition-opacity duration-300',
            isAttracting ? 'opacity-100' : 'opacity-40'
          )}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <Button
        ref={buttonRef}
        variant={variant}
        asChild={asChild}
        className={cn(
          'relative touch-none overflow-visible z-10',
          className
        )}
        {...props}
      >
        {children || (
          <>
            <Magnet
              className={cn(
                'w-4 h-4 transition-transform duration-300',
                isAttracting && 'scale-110'
              )}
            />
            {isAttracting ? 'Attracting' : 'Hover me'}
          </>
        )}
      </Button>
    </div>
  );
}

export { MagnetizeButton };

