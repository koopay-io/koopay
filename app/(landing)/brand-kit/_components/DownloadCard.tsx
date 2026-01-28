'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DownloadCardProps {
  title: string;
  description: string;
  basePath: string;
  zipPath: string;
}

export function DownloadCard({ title, description, basePath, zipPath }: DownloadCardProps) {
  const handleDownload = (format: string, path: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = path.split('/').pop() || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { 
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const cardVariants = {
    hover: {
      y: -5,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="rounded-3xl border border-white/12 bg-slate-900/60 p-6 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)]"
      variants={cardVariants}
      whileHover="hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.h3 
        className="font-semibold text-zinc-100 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-sm text-zinc-400/85 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {description}
      </motion.p>
      
      <motion.div 
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <motion.button
          onClick={() => handleDownload('ZIP', zipPath)}
          className="px-4 py-2 bg-gradient-1 hover:brightness-110 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </motion.svg>
          Full ZIP
        </motion.button>
        
        <motion.button
          onClick={() => handleDownload('SVG', `${basePath}-dark.svg`)}
          className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-white/15 rounded-xl text-zinc-200 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </motion.svg>
          SVG
        </motion.button>
        
        <motion.button
          onClick={() => handleDownload('PNG', `${basePath}-dark.png`)}
          className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-white/15 rounded-xl text-zinc-200 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </motion.svg>
          PNG
        </motion.button>
      </motion.div>
    </motion.div>
  );
}