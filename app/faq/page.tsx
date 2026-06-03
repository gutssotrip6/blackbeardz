'use client';

import { motion } from 'framer-motion';
import Footer from '../components/ui/Footer';
import { getThemeColors } from '@/lib/theme';

export default function FAQPage() {
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
            FAQ
          </motion.h1>
        </div>

        <div className="flex-1 px-6 md:px-12 max-w-2xl mx-auto mb-[70px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <p className={`${colors.text} text-sm uppercase tracking-widest mb-2`}>Where are your products made?</p>
              <p className="text-gray-700 text-lg">Everything is handmade in Algeria, except for the cotton which is imported.</p>
            </div>

            <div>
              <p className={`${colors.text} text-sm uppercase tracking-widest mb-2`}>How do I pay?</p>
              <p className="text-gray-700 text-lg">Cash on delivery. We deliver to all 69 wilayas.</p>
            </div>

            <div>
              <p className={`${colors.text} text-sm uppercase tracking-widest mb-2`}>Can I return an item?</p>
              <p className="text-gray-700 text-lg">No. All sales are final.</p>
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
