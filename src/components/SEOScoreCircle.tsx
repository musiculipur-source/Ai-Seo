import { useEffect, useState } from 'react';

interface SEOScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
}

export default function SEOScoreCircle({ score, size = 'lg', title, subtitle }: SEOScoreCircleProps) {
  const [offset, setOffset] = useState(0);

  const sizes = {
    sm: { diameter: 80, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[9px]' },
    md: { diameter: 120, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-[11px]' },
    lg: { diameter: 170, stroke: 12, fontSize: 'text-4xl', labelSize: 'text-xs' },
    xl: { diameter: 220, stroke: 16, fontSize: 'text-5xl', labelSize: 'text-sm' }
  };

  const selected = sizes[size];
  const radius = (selected.diameter - selected.stroke) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    // Animate radial loader stroke offset
    const progressOffset = circumference - (score / 100) * circumference;
    setOffset(progressOffset);
  }, [score, circumference]);

  const getScoreColor = (val: number) => {
    if (val >= 90) return { stroke: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (val >= 60) return { stroke: 'stroke-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { stroke: 'stroke-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: selected.diameter, height: selected.diameter }}>
        {/* Background track circle */}
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx={selected.diameter / 2}
            cy={selected.diameter / 2}
            r={radius}
            className="stroke-gray-800 fill-none"
            strokeWidth={selected.stroke}
          />
          {/* Active colored score stroke */}
          <circle
            cx={selected.diameter / 2}
            cy={selected.diameter / 2}
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth={selected.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-black ${selected.fontSize} ${colors.text}`}>
            {score}
          </span>
          {subtitle && (
            <span className={`text-gray-400 font-medium tracking-wide ${selected.labelSize} uppercase mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {title && (
        <h4 className="mt-3.5 text-sm font-semibold tracking-wide text-gray-200 text-center">
          {title}
        </h4>
      )}
    </div>
  );
}
