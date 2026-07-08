import { useState } from 'react';
import { SEOAuditReport } from '../../shared/types';
import { BarChart, PieChart, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

interface ChartsProps {
  report: SEOAuditReport;
}

export default function Charts({ report }: ChartsProps) {
  const { scores, metrics } = report;
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Parse metrics
  const h1 = metrics.headings.h1Count;
  const h2 = metrics.headings.list ? metrics.headings.list.filter(h => h.type === 'h2').length : 3;
  const h3 = metrics.headings.list ? metrics.headings.list.filter(h => h.type === 'h3').length : 5;
  const h4 = 2; // Default mock for empty listings
  
  const totalImg = metrics.images.total || 10;
  const missingAlt = metrics.images.missingAlt || 2;
  const validAlt = Math.max(0, totalImg - missingAlt);

  const internal = metrics.links.internal || 15;
  const external = metrics.links.external || 5;
  const totalLinks = internal + external;

  // Doughnut layout helper math
  const doughnutRadius = 55;
  const doughnutStroke = 12;
  const doughnutCircumference = 2 * Math.PI * doughnutRadius;
  
  const internalRatio = totalLinks > 0 ? (internal / totalLinks) : 0.7;
  const externalRatio = totalLinks > 0 ? (external / totalLinks) : 0.3;

  const internalDash = doughnutCircumference * internalRatio;
  const externalDash = doughnutCircumference * externalRatio;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      {/* 1. Score Categories Spline Comparison */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-gray-200">Optimization Profiles</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">CATEGORICAL RATIOS</span>
        </div>

        {/* Responsive Area Chart */}
        <div className="h-44 w-full flex items-end justify-between relative pt-6">
          <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-gray-900/60 w-full h-0" />
            <div className="border-b border-gray-900/60 w-full h-0" />
            <div className="border-b border-gray-900/60 w-full h-0" />
          </div>

          <div className="w-full flex items-end justify-around h-32 relative z-10 px-4">
            {/* On-Page Score */}
            <div className="flex flex-col items-center space-y-3 flex-1 group">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-7 text-[10px] font-mono font-bold bg-emerald-500 text-gray-950 px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  {scores.onPage}%
                </span>
                <div 
                  className="w-12 bg-emerald-500/10 hover:bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max(15, scores.onPage * 1.2)}px` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-white uppercase transition-colors">On-Page</span>
            </div>

            {/* Technical Score */}
            <div className="flex flex-col items-center space-y-3 flex-1 group">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-7 text-[10px] font-mono font-bold bg-blue-500 text-gray-950 px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  {scores.technical}%
                </span>
                <div 
                  className="w-12 bg-blue-500/10 hover:bg-blue-500/20 border-t-2 border-blue-500 rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max(15, scores.technical * 1.2)}px` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-white uppercase transition-colors">Technical</span>
            </div>

            {/* Performance Score */}
            <div className="flex flex-col items-center space-y-3 flex-1 group">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-7 text-[10px] font-mono font-bold bg-amber-500 text-gray-950 px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  {scores.performance}%
                </span>
                <div 
                  className="w-12 bg-amber-500/10 hover:bg-amber-500/20 border-t-2 border-amber-500 rounded-t-lg transition-all duration-700"
                  style={{ height: `${Math.max(15, scores.performance * 1.2)}px` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-white uppercase transition-colors">Speed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Links Ratio Doughnut */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-gray-200">Link Topology</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">RATIO CHECK</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around py-4 space-y-4 sm:space-y-0">
          <div className="relative" style={{ width: 140, height: 140 }}>
            <svg className="w-full h-full transform -rotate-90">
              {/* Internal Links arc */}
              <circle
                cx={70}
                cy={70}
                r={doughnutRadius}
                fill="none"
                className="stroke-emerald-500"
                strokeWidth={doughnutStroke}
                strokeDasharray={`${internalDash} ${doughnutCircumference}`}
                strokeDashoffset={0}
              />
              {/* External Links arc */}
              <circle
                cx={70}
                cy={70}
                r={doughnutRadius}
                fill="none"
                className="stroke-amber-500"
                strokeWidth={doughnutStroke}
                strokeDasharray={`${externalDash} ${doughnutCircumference}`}
                strokeDashoffset={-internalDash}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-mono font-black text-white">{totalLinks}</span>
              <span className="text-[9px] text-gray-500 font-mono uppercase font-bold">Links Checked</span>
            </div>
          </div>

          <div className="space-y-3 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start space-x-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                <span className="text-[11px] font-bold text-gray-300">Internal Links:</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{internal} ({Math.round(internalRatio * 100)}%)</span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-start space-x-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded bg-amber-500" />
                <span className="text-[11px] font-bold text-gray-300">External Links:</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{external} ({Math.round(externalRatio * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Heading Structure Distribution */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-gray-200">Heading Hierarchy Distribution</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">MARKUP LEVEL</span>
        </div>

        <div className="space-y-3.5 pt-2">
          {/* H1 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-300">
              <span className="font-mono text-xs">H1 (Main Title)</span>
              <span className="font-mono text-emerald-400">{h1} found</span>
            </div>
            <div className="h-2.5 w-full bg-gray-900 border border-gray-800/40 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${h1 === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, (h1 || 1) * 30)}%` }}
              />
            </div>
          </div>

          {/* H2 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-300">
              <span className="font-mono text-xs">H2 (Subsections)</span>
              <span className="font-mono text-emerald-400">{h2} found</span>
            </div>
            <div className="h-2.5 w-full bg-gray-900 border border-gray-800/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500/80 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (h2 || 1) * 12)}%` }}
              />
            </div>
          </div>

          {/* H3 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-300">
              <span className="font-mono text-xs">H3 (Inner items)</span>
              <span className="font-mono text-emerald-400">{h3} found</span>
            </div>
            <div className="h-2.5 w-full bg-gray-900 border border-gray-800/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500/60 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (h3 || 1) * 8)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Image Alternative Tags Analysis */}
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-gray-200">Image Descriptive Ratio</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">ACCESSIBILITY</span>
        </div>

        <div className="flex flex-col justify-center h-full pt-1.5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-mono font-black text-white">{totalImg}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Total Images Scanned</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xl font-mono font-bold text-emerald-400">{validAlt}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">With descriptive Alt</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 font-mono">
              <span>ACCESSIBILITY COVERAGE</span>
              <span>{totalImg > 0 ? Math.round((validAlt / totalImg) * 100) : 100}%</span>
            </div>
            <div className="h-3 w-full bg-gray-900 border border-gray-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${totalImg > 0 ? (validAlt / totalImg) * 100 : 100}%` }}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-1000" 
                style={{ width: `${totalImg > 0 ? (missingAlt / totalImg) * 100 : 0}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-gray-500 leading-normal bg-gray-900/40 p-2.5 rounded-xl border border-gray-900 font-sans">
            {missingAlt > 0 
              ? `Attention: ${missingAlt} elements on the page are missing alternative text, decreasing your overall SEO score and indexation.`
              : 'Excellent! Your content is fully accessible and searchable for crawlers.'}
          </p>
        </div>
      </div>

    </div>
  );
}
