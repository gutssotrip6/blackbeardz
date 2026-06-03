// components/ui/LogoFallback.tsx
import { getThemeColors } from '@/lib/theme';

export default function LogoFallback() {
  const colors = getThemeColors('primary');
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        className={`${colors.text} text-5xl font-bold tracking-widest`}
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        Blackbear
      </div>
    </div>
  );
}