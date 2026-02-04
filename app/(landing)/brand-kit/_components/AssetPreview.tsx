'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, cubicBezier, motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AssetPreviewProps {
  darkSrc: string;
  lightSrc: string;
  alt: string;
  className?: string;
}

export function AssetPreview({ darkSrc, lightSrc, alt, className }: AssetPreviewProps) {
  const [activeTab, setActiveTab] = useState<'dark' | 'light'>('dark');

  const tabVariants: Variants = {
    inactive: {
      scale: 0.95,
      opacity: 0.7,
      transition: { duration: 0.2 },
    },
    active: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  const previewVariants: Variants = {
    dark: {
      backgroundColor: '#0f172a',
      transition: { duration: 0.3, ease: cubicBezier(0.4, 0, 0.2, 1) },
    },
    light: {
      backgroundColor: '#ffffff',
      transition: { duration: 0.3, ease: cubicBezier(0.4, 0, 0.2, 1) },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: cubicBezier(0.25, 0.46, 0.45, 0.94) },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div 
      className="rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10">
        <motion.button
          onClick={() => setActiveTab('dark')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative',
            activeTab === 'dark'
              ? 'bg-slate-800/60 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
          variants={tabVariants}
          animate={activeTab === 'dark' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Dark Background
          {activeTab === 'dark' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('light')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative',
            activeTab === 'light'
              ? 'bg-slate-800/60 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
          variants={tabVariants}
          animate={activeTab === 'light' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Light Background
          {activeTab === 'light' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>

      {/* Preview Area */}
      <div className="p-8">
        <motion.div
          className="rounded-2xl p-8 flex items-center justify-center min-h-[120px]"
          variants={previewVariants}
          animate={activeTab}
        >
          <div className={cn('relative', className)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={logoVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Image
                  src={activeTab === 'dark' ? darkSrc : lightSrc}
                  alt={alt}
                  width={200}
                  height={60}
                  className="object-contain w-auto h-full"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Background Indicator */}
        <motion.div 
          className="flex items-center justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <motion.div
              className={cn(
                'w-3 h-3 rounded-full border',
                activeTab === 'dark' 
                  ? 'bg-slate-900 border-slate-700' 
                  : 'bg-white border-zinc-300'
              )}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: activeTab === 'dark' ? 0 : 180
              }}
              transition={{ 
                scale: { duration: 1, repeat: Infinity },
                rotate: { duration: 0.3 }
              }}
            />
            <motion.span
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dark' ? 'Dark' : 'Light'} background preview
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
