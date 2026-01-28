'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DownloadCard } from './DownloadCard';
import { AssetPreview } from './AssetPreview';

export function BrandKitSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.section 
      className="relative pt-32 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-zinc-100 mb-6"
            variants={itemVariants}
          >
            Brand Kit
          </motion.h1>
          <motion.p 
            className="text-xl text-zinc-400/85 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Download Koopay brand assets for your projects. All assets are available in multiple formats 
            and optimized for both dark and light backgrounds.
          </motion.p>
        </motion.div>

        {/* Brand Assets Grid */}
        <motion.div className="grid gap-12 lg:gap-16" variants={containerVariants}>
          {/* Wordmark Logo Section */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 items-center"
            variants={sectionVariants}
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-semibold text-zinc-100 mb-4">
                Wordmark Logo
              </h2>
              <p className="text-zinc-400/85 mb-6 leading-relaxed">
                The complete Koopay wordmark including both the icon and text. 
                Perfect for headers, documentation, and official communications.
              </p>
              <DownloadCard
                title="Wordmark Logo"
                description="Download includes both versions of the logo for dark and light backgrounds"
                basePath="/brand-kit/wordmark-logo/wordmark-logo"
                zipPath="/brand-kit/wordmark-logo.zip"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AssetPreview
                darkSrc="/brand-kit/wordmark-logo/wordmark-logo-dark.svg"
                lightSrc="/brand-kit/wordmark-logo/wordmark-logo-light.svg"
                alt="Koopay Wordmark Logo"
                className="h-16"
              />
            </motion.div>
          </motion.div>

          {/* Logo Section */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 items-center"
            variants={sectionVariants}
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="lg:order-2" variants={itemVariants}>
              <h2 className="text-3xl font-semibold text-zinc-100 mb-4">
                Logo
              </h2>
              <p className="text-zinc-400/85 mb-6 leading-relaxed">
                The Koopay icon logo without text. Ideal for favicons, app icons, 
                and compact layouts where space is limited.
              </p>
              <DownloadCard
                title="Logo"
                description="Download includes both versions of the logo for dark and light backgrounds"
                basePath="/brand-kit/logo/logo"
                zipPath="/brand-kit/logo.zip"
              />
            </motion.div>
            <motion.div className="lg:order-1" variants={itemVariants}>
              <AssetPreview
                darkSrc="/brand-kit/logo/logo-dark.svg"
                lightSrc="/brand-kit/logo/logo-light.svg"
                alt="Koopay Logo"
                className="h-20"
              />
            </motion.div>
          </motion.div>

          {/* Brand Guidelines Section */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 items-center"
            variants={sectionVariants}
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-semibold text-zinc-100 mb-4">
                Brand Guidelines
              </h2>
              <p className="text-zinc-400/85 mb-6 leading-relaxed">
                Comprehensive brand guidelines including logo usage, color palette, 
                typography, and best practices for maintaining brand consistency.
              </p>
              <motion.div 
                className="rounded-3xl border border-white/12 bg-slate-900/60 p-6 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)]"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-zinc-100 mb-2">Brand Guidelines</h3>
                    <p className="text-sm text-zinc-400/85">
                      Everything you need to know on how to apply the Koopay brand
                    </p>
                  </div>
                  <motion.a
                    href="/brand-kit/brand-guidelines.pdf"
                    download="koopay-brand-guidelines.pdf"
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-white/15 rounded-xl text-zinc-200 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center p-12 rounded-3xl border border-white/12 bg-slate-900/60 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)]"
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.div>
                <p className="text-zinc-400/85 text-sm">Brand Guidelines PDF</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Usage Guidelines */}
        <motion.div 
          className="mt-20 rounded-3xl border border-white/12 bg-slate-900/60 p-8 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)]"
          variants={sectionVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <motion.h3 
            className="text-2xl font-semibold text-zinc-100 mb-6"
            variants={itemVariants}
          >
            Usage Guidelines
          </motion.h3>
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h4 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Do's
              </h4>
              <ul className="space-y-2 text-zinc-400/85">
                <li>• Use the provided logo files without modification</li>
                <li>• Maintain adequate clear space around the logo</li>
                <li>• Use appropriate logo version for background color</li>
                <li>• Ensure logos are legible at all sizes</li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-rose-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                Don'ts
              </h4>
              <ul className="space-y-2 text-zinc-400/85">
                <li>• Don't alter the logo colors or proportions</li>
                <li>• Don't add effects, shadows, or outlines</li>
                <li>• Don't use low-resolution or pixelated versions</li>
                <li>• Don't place logos on busy or conflicting backgrounds</li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}