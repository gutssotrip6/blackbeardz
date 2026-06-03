'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { getThemeColors, Theme } from '@/lib/theme';

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
  theme = 'primary'
}: FilterBarProps) {
  const { t } = useLanguage();
  const baseColors = getThemeColors(theme);

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
          className={`text-5xl md:text-6xl font-bold mb-6 md:mb-0 text-transparent bg-clip-text bg-gradient-to-r ${baseColors.titleGradient} uppercase`}
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          {title}
        </h2>
      )}
      
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-6 py-2 border transition-all duration-300 text-sm uppercase tracking-wider font-medium ${
                activeFilter === filter
                  ? 'bg-black text-white border-black'
                  : `bg-white text-black ${baseColors.border} hover:border-black`
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