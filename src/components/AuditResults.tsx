import { useState } from 'react';
import { SEOAuditReport, AuditStatus } from '../../shared/types';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, FileText, Download, Sparkles } from 'lucide-react';

interface AuditResultsProps {
  report: SEOAuditReport;
  onBack: () => void;
}

export default function AuditResults({ report, onBack }: AuditResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'pass': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getStatusIcon = (status: AuditStatus) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'stroke-emerald-400 text-emerald-400';
    if (score >= 60) return 'stroke-amber-400 text-amber-400';
    return 'stroke-rose-400 text-rose-400';
  };

  const toggleExpand = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Basic lightweight parser to render AI Markdown report cleanly in JSX
  const renderMarkdown = (md: string) => {
    return md.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      
      if (cleanLine.startsWith('# ')) {
        return <h1 key={idx} className="text-xl sm:text-2xl font-display font-bold text-white mt-6 mb-3 border-b border-gray-800 pb-2">{cleanLine.replace('# ', '')}</h1>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h2 key={idx} className="text-lg sm:text-xl font-display font-bold text-emerald-300 mt-5 mb-2.5 flex items-center"><Sparkles className="h-4.5 w-4.5 text-emerald-400 mr-2" /> {cleanLine.replace('## ', '')}</h2>;
      }
      if (cleanLine.startsWith('### ')) {
        return <h3 key={idx} className="text-md font-sans font-bold text-white mt-4 mb-2">{cleanLine.replace('### ', '')}</h3>;
      }
      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
        const text = cleanLine.substring(2);
        // Highlight inline code
        const formattedText = text.split('`').map((part, i) => i % 2 === 1 ? <code key={i} className="px-1.5 py-0.5 bg-gray-950 text-emerald-400 font-mono text-xs rounded border border-gray-800">{part}</code> : part);
        return <li key={idx} className="list-disc list-inside text-gray-300 text-sm mb-1.5 ml-4 leading-relaxed">{formattedText}</li>;
      }
      if (cleanLine.startsWith('|')) {
        // Render simple Markdown table lines as rows
        const cells = cleanLine.split('|').map(c => c.trim()).filter(c => c !== '');
        if (cells.length > 0 && !cleanLine.includes('---')) {
          const isHeader = idx === 0 || idx === 1 || cleanLine.includes('Priority');
          return (
            <div key={idx} className={`grid grid-cols-5 gap-2 px-3 py-2 text-xs border-b border-gray-950 font-sans ${isHeader ? 'bg-gray-950 font-bold text-white' : 'text-gray-300 hover:bg-gray-900/50'}`}>
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className="truncate">{cell}</div>
              ))}
            </div>
          );
        }
        return null;
      }
      if (cleanLine === '') return <div key={idx} className="h-3" />;
      
      const formattedText = line.split('`').map((part, i) => i % 2 === 1 ? <code key={i} className="px-1.5 py-0.5 bg-gray-950 text-emerald-400 font-mono text-xs rounded border border-gray-800">{part}</code> : part);
      return <p key={idx} className="text-gray-300 text-sm mb-2 leading-relaxed">{formattedText}</p>;
    });
  };

  return (
    <div className="py-8 bg-gray-950 min-h-screen px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-900 gap-4" id="results-header">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            id="back-to-audit-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>New SEO Audit</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {/* Download PDF Placeholder */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1.5 text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3.5 py-2.5 rounded-xl cursor-not-allowed opacity-60"
                id="pdf-download-btn"
              >
                <FileText className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-gray-300 border border-gray-800 text-[10px] p-2 rounded-lg w-44 shadow-xl z-20 font-sans">
                PDF Export module integrates on Part 2 using our backend canvas engines.
              </div>
            </div>

            {/* CSV Export Placeholder */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1.5 text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3.5 py-2.5 rounded-xl cursor-not-allowed opacity-60"
                id="csv-download-btn"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-gray-300 border border-gray-800 text-[10px] p-2 rounded-lg w-44 shadow-xl z-20 font-sans">
                CSV parser is pre-mapped to download direct raw spreadsheet diagnostics.
              </div>
            </div>
          </div>
        </div>

        {/* Audit Details Title */}
        <div className="mb-8" id="audit-url-title">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
            AUDIT REPORT COMPLETE
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-3 truncate">
            {report.url}
          </h2>
          <p className="text-xs font-mono text-gray-500 mt-1">
            Analyzed on: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="scores-dashboard">
          {/* Main Overall Score Card */}
          <div className="md:col-span-1 p-6 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Overall Score</span>
            
            {/* SVG Progress Circle */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-gray-950 fill-none" strokeWidth="8" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className={`fill-none transition-all duration-1000 ${getScoreColor(report.overallScore)}`} 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - report.overallScore / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-display font-black text-white">{report.overallScore}</span>
                <span className="text-[10px] font-mono text-gray-500 uppercase">/100</span>
              </div>
            </div>
            
            <span className="text-xs font-semibold text-emerald-400 mt-4 tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              {report.overallScore >= 85 ? 'Outstanding SEO' : report.overallScore >= 60 ? 'Needs Alignment' : 'Critical Issues'}
            </span>
          </div>

          {/* Categorical Scores Card */}
          <div className="md:col-span-3 p-6 bg-gray-900 border border-gray-800 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-6">Category Scores</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Category 1: On-Page */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">On-Page SEO</span>
                  <span className="text-xs font-mono text-gray-400">{report.scores.onPage}%</span>
                </div>
                <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${report.scores.onPage}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 mt-1.5 font-sans leading-relaxed">Headings, title bounds, descriptions</span>
              </div>

              {/* Category 2: Technical */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Technical SEO</span>
                  <span className="text-xs font-mono text-gray-400">{report.scores.technical}%</span>
                </div>
                <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-violet-400 h-full rounded-full" style={{ width: `${report.scores.technical}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 mt-1.5 font-sans leading-relaxed">SSL redirection, Sitemap indexation</span>
              </div>

              {/* Category 3: Performance */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Performance</span>
                  <span className="text-xs font-mono text-gray-400">{report.scores.performance}%</span>
                </div>
                <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${report.scores.performance}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 mt-1.5 font-sans leading-relaxed">Page speeds, weights, download sizes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Detailed Metadata Audits */}
        <div className="mb-8" id="detailed-metrics-accordion">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 block">Detailed Element Audits</h3>
          <div className="space-y-3">
            {/* Title Check */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleExpand('title')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors cursor-pointer"
                id="metric-btn-title"
              >
                <div className="flex items-center space-x-3 text-left">
                  {getStatusIcon(report.metrics.title.status)}
                  <div>
                    <span className="text-sm font-bold text-white block">Page Title Check</span>
                    <span className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-md block">
                      {report.metrics.title.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">{report.metrics.title.length} characters</span>
                  {expandedSection === 'title' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>
              
              {expandedSection === 'title' && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-950 bg-gray-950/20 text-xs text-gray-300 space-y-3 font-sans">
                  <div>
                    <span className="font-bold text-white block mb-1">Found Content:</span>
                    <div className="p-3 bg-gray-950 border border-gray-800 text-emerald-400 rounded-lg font-mono">
                      {report.metrics.title.value || '[No Title Tag Found]'}
                    </div>
                  </div>
                  {report.metrics.title.recommendation && (
                    <div>
                      <span className="font-bold text-white block mb-1 text-rose-300">Optimization Strategy:</span>
                      <p className="leading-relaxed">{report.metrics.title.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description Check */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleExpand('desc')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors cursor-pointer"
                id="metric-btn-desc"
              >
                <div className="flex items-center space-x-3 text-left">
                  {getStatusIcon(report.metrics.description.status)}
                  <div>
                    <span className="text-sm font-bold text-white block">Meta Description Check</span>
                    <span className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-md block">
                      {report.metrics.description.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">{report.metrics.description.length} characters</span>
                  {expandedSection === 'desc' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>
              
              {expandedSection === 'desc' && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-950 bg-gray-950/20 text-xs text-gray-300 space-y-3 font-sans">
                  <div>
                    <span className="font-bold text-white block mb-1">Found Content:</span>
                    <div className="p-3 bg-gray-950 border border-gray-800 text-emerald-400 rounded-lg font-mono leading-relaxed">
                      {report.metrics.description.value || '[No Meta Description Tag Found]'}
                    </div>
                  </div>
                  {report.metrics.description.recommendation && (
                    <div>
                      <span className="font-bold text-white block mb-1 text-rose-300">Optimization Strategy:</span>
                      <p className="leading-relaxed">{report.metrics.description.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Headings Check */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleExpand('headings')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors cursor-pointer"
                id="metric-btn-headings"
              >
                <div className="flex items-center space-x-3 text-left">
                  {getStatusIcon(report.metrics.headings.status)}
                  <div>
                    <span className="text-sm font-bold text-white block">Heading Tag Structure</span>
                    <span className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-md block">
                      {report.metrics.headings.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">{report.metrics.headings.h1Count} x H1</span>
                  {expandedSection === 'headings' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>
              
              {expandedSection === 'headings' && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-950 bg-gray-950/20 text-xs text-gray-300 space-y-3 font-sans">
                  <div>
                    <span className="font-bold text-white block mb-1">Heading Hierarchy (First 15 headings found):</span>
                    <div className="space-y-1 p-3 bg-gray-950 border border-gray-800 rounded-lg font-mono overflow-y-auto max-h-48 text-[11px]">
                      {report.metrics.headings.list.length > 0 ? (
                        report.metrics.headings.list.slice(0, 15).map((h, i) => (
                          <div key={i} className="flex items-start">
                            <span className="text-emerald-500 font-bold w-12 flex-shrink-0">&lt;{h.type}&gt;</span>
                            <span className="text-gray-300 truncate">{h.text}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">[No Headings Found]</span>
                      )}
                    </div>
                  </div>
                  {report.metrics.headings.recommendation && (
                    <div>
                      <span className="font-bold text-white block mb-1 text-rose-300">Optimization Strategy:</span>
                      <p className="leading-relaxed">{report.metrics.headings.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Images ALT Check */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleExpand('images')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors cursor-pointer"
                id="metric-btn-images"
              >
                <div className="flex items-center space-x-3 text-left">
                  {getStatusIcon(report.metrics.images.status)}
                  <div>
                    <span className="text-sm font-bold text-white block">Image Alternative Text Check</span>
                    <span className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-md block">
                      {report.metrics.images.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">{report.metrics.images.total} images</span>
                  {expandedSection === 'images' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>
              
              {expandedSection === 'images' && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-950 bg-gray-950/20 text-xs text-gray-300 space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg text-center">
                      <span className="text-lg font-bold text-white block">{report.metrics.images.total}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Images</span>
                    </div>
                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg text-center">
                      <span className={`text-lg font-bold block ${report.metrics.images.missingAlt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {report.metrics.images.missingAlt}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Missing ALT Description</span>
                    </div>
                  </div>
                  {report.metrics.images.recommendation && (
                    <div>
                      <span className="font-bold text-white block mb-1 text-rose-300">Optimization Strategy:</span>
                      <p className="leading-relaxed">{report.metrics.images.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance and Speeds */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleExpand('perf')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors cursor-pointer"
                id="metric-btn-perf"
              >
                <div className="flex items-center space-x-3 text-left">
                  {getStatusIcon(report.metrics.performance.status)}
                  <div>
                    <span className="text-sm font-bold text-white block">Speed & Weight Audit</span>
                    <span className="text-xs text-gray-400 truncate max-w-[280px] sm:max-w-md block">
                      {report.metrics.performance.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">{report.metrics.performance.loadTimeMs}ms</span>
                  {expandedSection === 'perf' ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>
              
              {expandedSection === 'perf' && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-950 bg-gray-950/20 text-xs text-gray-300 space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg text-center">
                      <span className="text-lg font-bold text-white block">{report.metrics.performance.loadTimeMs} ms</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Scraper Fetch Time</span>
                    </div>
                    <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg text-center">
                      <span className="text-lg font-bold text-white block">{report.metrics.performance.pageSizeKb} KB</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Raw Document Size</span>
                    </div>
                  </div>
                  {report.metrics.performance.recommendation && (
                    <div>
                      <span className="font-bold text-white block mb-1 text-rose-300">Optimization Strategy:</span>
                      <p className="leading-relaxed">{report.metrics.performance.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Pro-Grade AI-powered Gemini Optimization Report */}
        <div className="p-6 sm:p-8 bg-gray-900 border border-emerald-500/10 rounded-2xl glow-emerald" id="gemini-ai-report">
          <div className="flex items-center space-x-2.5 mb-6 border-b border-gray-800 pb-4">
            <div className="p-2 bg-gradient-to-r from-emerald-500/15 to-violet-500/15 border border-emerald-500/20 rounded-xl">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-white">Gemini Pro-Grade AI Recommendations</h3>
              <p className="text-[11px] font-mono text-gray-500 mt-0.5">Semantic audit generated via server-side gemini-3.5-flash model</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-sm leading-relaxed" id="markdown-contents">
            {report.aiRecommendations ? (
              renderMarkdown(report.aiRecommendations)
            ) : (
              <span className="text-gray-500 italic">No AI recommendation content generated yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
