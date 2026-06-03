'use client';

import { motion } from 'framer-motion';
import Footer from '../components/ui/Footer';
import { getThemeColors } from '@/lib/theme';

export default function AboutPage() {
  const colors = getThemeColors('primary');

  return (
    <div className="relative w-full min-h-screen bg-white text-black" style={colors.cssVars}>
      {/* Content — padded to clear the fixed header (marquee + nav) */}
      <div className="flex flex-col min-h-screen pt-[90px]">

        <div className="pt-16 pb-12 px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colors.titleGradient} uppercase`}
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            About
          </motion.h1>
        </div>

        <div className="flex-1 px-6 md:px-12 max-w-2xl mx-auto mb-[70px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 text-lg leading-relaxed text-gray-700"
          >
            <p>
              Blackbear was founded in 2025 to give you the best gym clothing ever
            </p>

            <p>
              Every piece is produced by Algerian artisans using locally sourced materials.
              The only exception is our cotton, which we import to ensure the highest quality
              for our customers.
            </p>

            <p>
              From design to production to delivery, everything happens within Algeria.
            </p>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
