'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { Theme } from '@/lib/theme';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  title?: string;
  theme?: Theme;
}

export default function FilterBar({ 
  filters, 
  activeFilter, 
  onFilterChange,
  title,
}: FilterBarProps) {
  const { t } = useLanguage();

  // Map filter keys to translation keys
  const getFilterLabel = (filter: string) => {
    const filterMap: Record<string, string> = {
      'ALL': 'filter.all',
      'WINTER': 'category.winter',
      'SUMMER': 'category.summer',
      'SHIRTS': 'category.shirts',
      'PANTS': 'category.pants',
      'POPULAR': 'nav.popular'
    };
    return t(filterMap[filter] || filter);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 max-w-7xl mx-auto">
      {title && (
        <h2
          className="text-5xl md:text-6xl font-extrabold mb-6 md:mb-0 text-black uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
      )}

      <div className="flex flex-wrap gap-2.5">
        {filters.map((filter) => {
          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-5 py-2 rounded-none border text-[0.8rem] uppercase tracking-wide font-semibold transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black hover:bg-black hover:text-white'
              }`}
            >
              {getFilterLabel(filter)}
            </button>
          );
        })}
      </div>
    </div>
  );
}