'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: '24H Shipping',
    desc: 'Order today, get your gear tomorrow.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'BEST PRICES',
    desc: 'For the best clothes, we make sure you pay the lowest price.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: '100% Quality',
    desc: 'Premium gym apparel built to make everybody look great.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function ShippingBanner() {
  return (
    <section className="relative z-20 px-6 md:px-12 pt-6 pb-8 md:py-10 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -3 }}
            className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 md:px-5 md:py-4 transition-all duration-300 hover:border-black hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg bg-black text-white transition-transform duration-300 group-hover:scale-105">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-black leading-tight">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
