import { useState, useEffect } from 'react';
import { useSEO } from '../context/SEOContext';
import { SEOAuditReport } from '../../shared/types';
import { 
  Check, 
  Copy, 
  Sparkles, 
  AlertOctagon, 
  AlertTriangle, 
  Info,
  ShieldCheck,
  TrendingUp,
  Search,
  FileText,
  Lightbulb,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  HelpCircle,
  Trophy,
  ArrowRight,
  ShieldAlert,
  Flame,
  Globe
} from 'lucide-react';
import { getAIRecommendations } from '../services/api';
import { AIRecommendationResponse, SEORecommendation, KeywordSuggestion } from '../types/recommendation.types';

interface RecommendationCardsProps {
  report: SEOAuditReport;
}

export default function RecommendationCards({ report }: RecommendationCardsProps) {
  const { addToast } = useSEO();
  const [activeTab, setActiveTab] = useState<'corrections' | 'aiStrategy'>('corrections');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AIRecommendationResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'actionPlan' | 'keywords' | 'content' | 'linking'>('actionPlan');

  // Reset local state when report changes
  useEffect(() => {
    setAiData(null);
    setExpandedRecId(null);
    if (activeTab === 'aiStrategy') {
      loadAIStrategy();
    }
  }, [report.id]);

  const loadAIStrategy = async () => {
    setLoadingAI(true);
    try {
      if (report.id === 'sample-google') {
        setAiData(MOCK_GOOGLE_RECOMMENDATIONS);
      } else if (report.id === 'sample-startup') {
        setAiData(MOCK_BAKERY_RECOMMENDATIONS);
      } else {
        const data = await getAIRecommendations(report.id);
        setAiData(data);
      }
    } catch (err: any) {
      console.error('Error generating AI strategy:', err);
      addToast(err.message || 'Failed to generate AI recommendations.', 'error');
      setActiveTab('corrections');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleTabChange = (tab: 'corrections' | 'aiStrategy') => {
    setActiveTab(tab);
    if (tab === 'aiStrategy' && !aiData) {
      loadAIStrategy();
    }
  };

  // Compile standard rule-based recommendation objects
  const list: { text: string; priority: 'high' | 'medium' | 'low'; type: string; solution: string }[] = [];

  // 1. Title Checks
  const titleMet = report.metrics.title;
  if (titleMet.status === 'error') {
    list.push({
      text: titleMet.message,
      priority: 'high',
      type: 'On-Page',
      solution: 'Inject a <title>Your Keyword-Rich Title</title> tag inside the <head> element. Keep it between 50 and 60 characters long.'
    });
  } else if (titleMet.status === 'warning') {
    list.push({
      text: titleMet.message,
      priority: 'medium',
      type: 'On-Page',
      solution: 'Modify the title to sit cleanly between 50 and 60 characters long. Avoid generic filler words.'
    });
  }

  // 2. Description Checks
  const descMet = report.metrics.description;
  if (descMet.status === 'error') {
    list.push({
      text: descMet.message,
      priority: 'high',
      type: 'On-Page',
      solution: 'Add a <meta name="description" content="A compelling summary of your content under 155 characters."> in your head tag.'
    });
  } else if (descMet.status === 'warning') {
    list.push({
      text: descMet.message,
      priority: 'medium',
      type: 'On-Page',
      solution: 'Adjust description size to sit between 110 and 150 characters long for optimum search page snippet rendering.'
    });
  }

  // 3. Heading hierarchy checks
  const headMet = report.metrics.headings;
  if (headMet.status === 'error') {
    list.push({
      text: headMet.message,
      priority: 'high',
      type: 'Markup Structure',
      solution: 'Ensure there is exactly one top-level <h1> tag on the page describing the primary focus. Convert other <h1> tags to <h2> elements.'
    });
  } else if (headMet.status === 'warning') {
    list.push({
      text: headMet.message,
      priority: 'medium',
      type: 'Markup Structure',
      solution: 'Review your heading order. Make sure <h2> subsection divisions follow <h1> and precede nested <h3> tags.'
    });
  }

  // 4. Broken Link Checks
  const linkMet = report.metrics.links;
  if (linkMet.status === 'error') {
    list.push({
      text: linkMet.message,
      priority: 'high',
      type: 'Crawling',
      solution: 'Inspect outbound link hrefs returning 4xx error codes. Replace outdated URLs or remove broken target anchor nodes.'
    });
  }

  // 5. Image Alt attributes checks
  const imgMet = report.metrics.images;
  if (imgMet.status === 'warning' && imgMet.missingAlt > 0) {
    list.push({
      text: imgMet.message,
      priority: 'medium',
      type: 'Accessibility',
      solution: 'Add descriptive alt="accessible context" properties to all <img> tags to assist screen readers and image-search bots.'
    });
  }

  // 6. Security and Tech checks
  const techMet = report.metrics.technical;
  if (!techMet.isHttps) {
    list.push({
      text: 'Insecure server connection detected (HTTP).',
      priority: 'high',
      type: 'Security',
      solution: 'Obtain an SSL certificate (e.g. from Let’s Encrypt) and enforce HTTP-to-HTTPS redirect rules in your server routing config.'
    });
  }
  if (!techMet.hasRobots) {
    list.push({
      text: 'Robots.txt configuration is missing.',
      priority: 'medium',
      type: 'Crawling',
      solution: 'Host a robots.txt file at your web root (e.g. yourdomain.com/robots.txt) declaring search engine User-agent permissions.'
    });
  }
  if (!techMet.hasSitemap) {
    list.push({
      text: 'Sitemap XML mapping index is missing.',
      priority: 'medium',
      type: 'Indexing',
      solution: 'Construct an XML sitemap listing your site’s URLs, and upload it as sitemap.xml to make content indexation immediate.'
    });
  }

  // Fallback defaults if the site is perfectly optimized
  if (list.length === 0) {
    list.push({
      text: 'Your page passes all core automated metric gates successfully.',
      priority: 'low',
      type: 'General',
      solution: 'Keep content updated, continue monitoring bounce rates, and consider structuring JSON-LD schema definitions.'
    });
  }

  const handleCopy = (solutionText: string, keyId: string) => {
    navigator.clipboard.writeText(solutionText);
    setCopiedIndex(keyId);
    addToast('Actionable details copied to clipboard!', 'success');
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2500);
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low' | 'Red' | 'Amber' | 'Yellow' | 'Green') => {
    const norm = priority.toLowerCase();
    if (norm === 'high' || norm === 'red') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (norm === 'medium' || norm === 'amber' || norm === 'yellow') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertOctagon className="h-4 w-4 text-rose-400 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />;
      case 'low':
        return <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Segmented Switcher */}
      <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-900">
        <button
          onClick={() => handleTabChange('corrections')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeTab === 'corrections'
              ? 'bg-gray-900 text-white border border-gray-800 shadow-inner'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Metric Corrections ({list.length})</span>
        </button>
        <button
          onClick={() => handleTabChange('aiStrategy')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeTab === 'aiStrategy'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>Gemini Pro Strategy Sheet</span>
        </button>
      </div>

      {/* TAB 1: Metric Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {list.map((item, index) => (
              <div
                key={index}
                className="bg-gray-950 border border-gray-900 rounded-2xl p-5 hover:border-gray-800 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-3">
                  <div className="flex items-center space-x-2.5">
                    {getPriorityIcon(item.priority)}
                    <span className="text-xs font-bold text-white leading-tight">
                      {item.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full uppercase font-bold ${getPriorityBadge(item.priority)}`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-900 border border-gray-800/60 px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-900/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Action Plan:</span>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.solution}</p>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(item.solution, `corr-${index}`)}
                    className="p-2 bg-gray-950 border border-gray-800 hover:border-emerald-500/20 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-emerald-400 cursor-pointer flex-shrink-0 transition-colors"
                    title="Copy snippet"
                  >
                    {copiedIndex === `corr-${index}` ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Gemini Pro AI Strategy */}
      {activeTab === 'aiStrategy' && (
        <div className="space-y-6">
          {loadingAI ? (
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Milling Crawled Metadata...</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">Gemini is evaluating schema files, header hierarchy, and assembling organic growth blueprints.</p>
              </div>
            </div>
          ) : aiData ? (
            <div className="space-y-6">
              
              {/* AI Score Breakdown Card Grid */}
              <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 lg:p-6 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
                
                <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest">AI Quality Index Forecast</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Technical Quality', value: aiData.scores.technical, color: 'bg-indigo-500' },
                    { label: 'On-Page Structure', value: aiData.scores.onPage, color: 'bg-emerald-500' },
                    { label: 'Content Depth', value: aiData.scores.content, color: 'bg-amber-500' },
                    { label: 'Accessibility', value: aiData.scores.accessibility, color: 'bg-cyan-500' },
                    { label: 'Server Speed', value: aiData.scores.performance, color: 'bg-purple-500' },
                    { label: 'Encrypted Security', value: aiData.scores.security, color: 'bg-rose-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-900/30 border border-gray-900/60 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 truncate max-w-[100px] block font-medium">{item.label}</span>
                        <span className="text-xs font-mono font-bold text-white">{item.value}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-navigation inside AI Strategist */}
              <div className="flex border-b border-gray-900 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: 'actionPlan', label: 'Tactical Fixes', icon: FileText },
                  { id: 'keywords', label: 'Keyword Targets', icon: Search },
                  { id: 'content', label: 'Copy Blueprints', icon: Lightbulb },
                  { id: 'linking', label: 'Link Strategy', icon: LinkIcon },
                ].map((subTab) => {
                  const Icon = subTab.icon;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveSubTab(subTab.id as any)}
                      className={`py-3 px-4 text-xs font-mono font-bold border-b-2 flex items-center space-x-1.5 flex-shrink-0 transition-colors uppercase cursor-pointer ${
                        activeSubTab === subTab.id
                          ? 'border-emerald-500 text-emerald-400 font-bold'
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* AI Strategy Sub-panels */}
              <div className="space-y-4">
                
                {/* SUB TAB 1: Recommendations Action Plan */}
                {activeSubTab === 'actionPlan' && (
                  <div className="space-y-3">
                    {aiData.recommendations.map((rec) => {
                      const isExpanded = expandedRecId === rec.id;
                      return (
                        <div
                          key={rec.id}
                          className="bg-gray-950 border border-gray-900 rounded-2xl p-4 lg:p-5 hover:border-gray-850/80 transition-all duration-300"
                        >
                          <div
                            onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-start space-x-3 pr-4">
                              <span className={`text-[10px] uppercase font-mono border rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 font-bold ${getPriorityBadge(rec.priority)}`}>
                                {rec.priority}
                              </span>
                              <div className="space-y-0.5">
                                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{rec.issue}</h4>
                                <p className="text-[10.5px] text-gray-500 font-mono">Category: <span className="uppercase text-emerald-400 font-bold">{rec.category}</span> | Diff: <span className="text-gray-400">{rec.difficulty}</span></p>
                              </div>
                            </div>
                            <button className="text-gray-500 hover:text-white p-1">
                              {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-900/60 space-y-4 text-xs font-sans animate-fade-in">
                              
                              {/* Problem statement */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <span className="font-mono font-bold text-gray-500 text-[10px] uppercase">Observations:</span>
                                <p className="md:col-span-3 text-gray-300 leading-relaxed font-sans">{rec.problem}</p>
                              </div>

                              {/* Why it matters */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <span className="font-mono font-bold text-gray-500 text-[10px] uppercase">Why It Matters:</span>
                                <p className="md:col-span-3 text-gray-400 leading-relaxed font-sans">{rec.whyItMatters}</p>
                              </div>

                              {/* Fix instructions */}
                              <div className="bg-gray-900/40 border border-gray-900 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest font-bold">Step-By-Step Solution Blueprint:</span>
                                  <button
                                    onClick={() => handleCopy(rec.stepByStepFix.join('\n'), rec.id)}
                                    className="p-1.5 bg-gray-950 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg"
                                    title="Copy code plan"
                                  >
                                    {copiedIndex === rec.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                </div>
                                <ol className="space-y-2 text-gray-300 pl-4 list-decimal">
                                  {rec.stepByStepFix.map((step, sIdx) => (
                                    <li key={sIdx} className="leading-relaxed pl-1">{step}</li>
                                  ))}
                                </ol>
                              </div>

                              {/* Improvement projection */}
                              <div className="flex items-center space-x-2.5 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                                <Trophy className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
                                <div className="text-[11px]">
                                  <span className="font-bold text-white block">Projected Business Impact:</span>
                                  <p className="text-gray-400 font-sans">{rec.estimatedImprovement}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUB TAB 2: Keywords Opportunities */}
                {activeSubTab === 'keywords' && (
                  <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">Organic Keyword Targets</h4>
                      <p className="text-[11px] text-gray-500">Gemini-extracted high-intent search terms tailored to current content vectors.</p>
                    </div>

                    <div className="overflow-x-auto border border-gray-900 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-900/40 border-b border-gray-900 font-mono text-[10px] text-gray-400 uppercase">
                            <th className="py-3 px-4 font-bold">Keyword Target</th>
                            <th className="py-3 px-4 font-bold text-center">Volume</th>
                            <th className="py-3 px-4 font-bold text-center">Difficulty (KD)</th>
                            <th className="py-3 px-4 font-bold text-center">CPC</th>
                            <th className="py-3 px-4 font-bold text-center">Intent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-900/60 font-sans">
                          {aiData.keywords.map((kw, idx) => (
                            <tr key={idx} className="hover:bg-gray-900/20">
                              <td className="py-3.5 px-4 font-bold text-white">{kw.keyword}</td>
                              <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-300">{kw.searchVolume}</td>
                              <td className="py-3.5 px-4 text-center font-mono">
                                <div className="flex items-center justify-center space-x-1.5">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    kw.difficulty > 60 ? 'bg-rose-500/10 text-rose-400' : kw.difficulty > 35 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                                  }`}>
                                    {kw.difficulty}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-gray-300">{kw.cpc}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full font-mono uppercase ${
                                  kw.intent === 'Transactional' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' :
                                  kw.intent === 'Commercial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                  kw.intent === 'Informational' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                                }`}>
                                  {kw.intent}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB TAB 3: Copy Blueprints */}
                {activeSubTab === 'content' && (
                  <div className="space-y-4">
                    
                    {/* Titles and Descriptions Card */}
                    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-900 pb-2.5">
                        <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">High-CTR Snippet Variants</span>
                        <span className="text-[10px] text-gray-500 font-mono">Click to copy suggestions</span>
                      </div>

                      <div className="space-y-4 text-xs font-sans">
                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold text-gray-500 uppercase block">Alternative SEO Meta Titles:</label>
                          <div className="space-y-2">
                            {aiData.seoTitles.map((titleStr, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-900/30 border border-gray-950/40 p-3 rounded-xl gap-4">
                                <p className="text-white font-semibold truncate leading-none">{titleStr}</p>
                                <button
                                  onClick={() => handleCopy(titleStr, `title-${idx}`)}
                                  className="p-1.5 bg-gray-950 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg cursor-pointer flex-shrink-0"
                                >
                                  {copiedIndex === `title-${idx}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="font-mono text-[10px] font-bold text-gray-500 uppercase block">Organic Meta Descriptions (CTR Optimized):</label>
                          <div className="space-y-2">
                            {aiData.metaDescriptions.map((descStr, idx) => (
                              <div key={idx} className="flex items-start justify-between bg-gray-900/30 border border-gray-950/40 p-3 rounded-xl gap-4">
                                <p className="text-gray-300 leading-relaxed font-sans">{descStr}</p>
                                <button
                                  onClick={() => handleCopy(descStr, `desc-${idx}`)}
                                  className="p-1.5 bg-gray-950 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg cursor-pointer flex-shrink-0 mt-0.5"
                                >
                                  {copiedIndex === `desc-${idx}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Headings Structure */}
                    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-gray-900 pb-2.5">
                        <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">Semantic Heading Architecture</span>
                      </div>

                      <div className="space-y-3 text-xs font-sans">
                        <div className="space-y-1 bg-gray-900/30 p-3.5 border border-gray-900/40 rounded-xl">
                          <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase">RECOMMENDED PRIMARY HEADER (H1):</span>
                          <p className="text-white font-bold font-sans text-sm">{aiData.h1h2Suggestions.h1[0] || 'Optimized Page Title Header'}</p>
                        </div>

                        <div className="space-y-2">
                          <span className="font-mono text-[10px] font-bold text-gray-500 uppercase block">RECOMMENDED SUBHEADINGS (H2 STRUCTURE):</span>
                          {aiData.h1h2Suggestions.h2.map((h2Str, idx) => (
                            <div key={idx} className="flex items-center space-x-2.5 bg-gray-900/30 p-3 border border-gray-900/40 rounded-xl">
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded font-mono font-bold text-[9px]">H2</span>
                              <p className="text-gray-300 font-semibold font-sans">{h2Str}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Blogs / FAQ Topics Proposals */}
                    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-gray-900 pb-2.5">
                        <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">Content Generation Schedule</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiData.faqBlogIdeas.map((idea, idx) => (
                          <div key={idx} className="bg-gray-900/30 border border-gray-900/55 p-4 rounded-xl flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                  idea.type === 'Blog' ? 'bg-purple-500/10 text-purple-400' : 'bg-pink-500/10 text-pink-400'
                                }`}>
                                  {idea.type}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-gray-200 leading-relaxed font-sans">{idea.questionOrTopic}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold">Target Keywords:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {idea.targetKeywords.map((tag, tIdx) => (
                                  <span key={tIdx} className="bg-gray-950 border border-gray-850 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* SUB TAB 4: Linking Strategies */}
                {activeSubTab === 'linking' && (
                  <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">Contextual Linking Rationale</h4>
                      <p className="text-[11px] text-gray-500">Suggested anchor mapping schemes to optimize keyword distribution models and pass equity juices.</p>
                    </div>

                    <div className="space-y-3.5">
                      {aiData.linkingSuggestions.map((linkS, idx) => (
                        <div key={idx} className="bg-gray-900/30 border border-gray-900/60 p-4 rounded-xl space-y-2.5 text-xs font-sans">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-gray-400 font-medium font-sans">Recommended Anchor copy:</span>
                            <span className="bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/10">"{linkS.anchorText}"</span>
                            <ArrowRight className="h-3.5 w-3.5 text-gray-650" />
                            <span className="text-gray-400 font-medium font-sans">Targeting Keyword:</span>
                            <span className="bg-blue-500/10 text-blue-400 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/10">"{linkS.targetKeyword}"</span>
                          </div>
                          
                          <p className="text-gray-400 leading-relaxed pl-3 border-l-2 border-gray-800 font-sans">{linkS.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}

// ==========================================
// MOCK HIGH-FIDELITY AI STRATEGY BLUEPRINTS
// ==========================================

const MOCK_GOOGLE_RECOMMENDATIONS: AIRecommendationResponse = {
  scores: {
    overall: 94,
    technical: 96,
    onPage: 92,
    content: 88,
    accessibility: 95,
    performance: 94,
    security: 100
  },
  recommendations: [
    {
      id: "google-rec-1",
      category: "content",
      issue: "Low Text-To-Code Content Density Ratio",
      problem: "The crawled home landing layout holds very little readable, indexable textual content (under 120 words), relying strictly on query interactions.",
      whyItMatters: "Search engine crawlers require rich, semantic textual bodies to fully establish query relevance mappings and award authority weights.",
      seoImpact: "Medium",
      priority: "Yellow",
      stepByStepFix: [
        "Incorporate a 150-250 word contextual footer summarizing your directory utilities and mission statement.",
        "Ensure targeted terms like 'secure global web search' or 'instant internet responses' are naturally integrated in text structures."
      ],
      estimatedImprovement: "+8% Long-Tail Search Indexing Impressions",
      difficulty: "Easy"
    },
    {
      id: "google-rec-2",
      category: "onPage",
      issue: "Compact Single-Word Meta Title",
      problem: "The landing title is 'Google' (6 characters), squandering potential on-page optimization keyword spots.",
      whyItMatters: "A properly formatted title tag between 50 and 60 characters permits you to weave high-volume brand qualifiers that increase search CTR.",
      seoImpact: "Medium",
      priority: "Yellow",
      stepByStepFix: [
        "Change the HTML <title> tag value to 'Google - Fast, Secure & Global Web Search Engine'.",
        "Keep the title strictly under 60 characters to avoid snippet punctuation truncation on organic engine result pages."
      ],
      estimatedImprovement: "+4.5% Click-Through Rate (CTR)",
      difficulty: "Easy"
    }
  ],
  keywords: [
    {
      keyword: "instant global search engine",
      searchVolume: "24.5K",
      difficulty: 54,
      intent: "Transactional",
      cpc: "$3.80",
      relevance: 98
    },
    {
      keyword: "best secure web search console",
      searchVolume: "8.4K",
      difficulty: 42,
      intent: "Commercial",
      cpc: "$2.15",
      relevance: 90
    },
    {
      keyword: "how to find safe information online",
      searchVolume: "1.2K",
      difficulty: 18,
      intent: "Informational",
      cpc: "$0.65",
      relevance: 85
    },
    {
      keyword: "google online search portal",
      searchVolume: "120K",
      difficulty: 65,
      intent: "Navigational",
      cpc: "$1.10",
      relevance: 100
    }
  ],
  seoTitles: [
    "Google - Fast, Secure & Global Web Search Engine",
    "Google Search Engine | Instant Answers & Safe Web Queries",
    "Explore the Web Safely with Google's Global Index Console"
  ],
  metaDescriptions: [
    "Search the world's information with Google. Experience lightning-fast, highly secure web searching, localized news updates, instant map routes, and authoritative organic answers.",
    "Access the world's most advanced search engine. Find instant web results, videos, secure articles, and images with the trusted speed of Google's global search index.",
    "Empower your daily web queries. Scan millions of pages instantly with Google's organic finder and discover precise answers, calculation tools, and real-time updates securely."
  ],
  h1h2Suggestions: {
    h1: ["Google Web Services & Global Indexing Console"],
    h2: [
      "Discover Smart Search Filters & Instant Organic Answers",
      "Manage Your Privacy Settings & Web Browsing Protections",
      "Connect with Tools, Maps, and Local Business Portals"
    ]
  },
  faqBlogIdeas: [
    {
      questionOrTopic: "How does Google secure search privacy and user browser cache data?",
      type: "FAQ",
      targetKeywords: ["google search privacy", "secure web browsing", "google cookies"]
    },
    {
      questionOrTopic: "The Evolution of Search: How Core Search Engine Algorithms Changed in 2026",
      type: "Blog",
      targetKeywords: ["seo history", "how search engines index pages", "ranking algorithms"]
    }
  ],
  linkingSuggestions: [
    {
      anchorText: "learn about secure search",
      targetKeyword: "google search privacy",
      reason: "Directs layout traffic seamlessly into privacy guidelines, reinforcing brand trust metrics."
    }
  ]
};

const MOCK_BAKERY_RECOMMENDATIONS: AIRecommendationResponse = {
  scores: {
    overall: 54,
    technical: 50,
    onPage: 45,
    content: 40,
    accessibility: 60,
    performance: 67,
    security: 0
  },
  recommendations: [
    {
      id: "bakery-rec-1",
      category: "security",
      issue: "Insecure HTTP Protocol Connection",
      problem: "No SSL/TLS certificate is present on your server. Your page is running on plaintext HTTP.",
      whyItMatters: "HTTPS is an absolute core ranking protocol, and browsers label insecure HTTP sites with alert warning banners that ruin customer trust.",
      seoImpact: "Critical",
      priority: "Red",
      stepByStepFix: [
        "Procure a free SSL Certificate using Let's Encrypt or your domain registrar panels.",
        "Set up a global 301 Redirect inside your server configuration routing all http:// traffic securely to https://.",
        "Update all absolute image and resource paths to use secure https:// links to avoid mixed content block warnings."
      ],
      estimatedImprovement: "Eliminates browser warning banners and restores basic search engine index authority",
      difficulty: "Medium"
    },
    {
      id: "bakery-rec-2",
      category: "onPage",
      issue: "Generic Title Tag Detected ('Home Page')",
      problem: "The HTML page title is set to 'Home Page', wasting the most high-weight on-page indexing property.",
      whyItMatters: "The meta title declares the primary purpose of your page to bot crawlers. Standard local intent keywords are absent.",
      seoImpact: "Critical",
      priority: "Red",
      stepByStepFix: [
        "Rewrite page title tag to: 'Artisanal Sourdough Breads & Fresh Pastries | [Your City] Bread Co.'",
        "Keep the length strictly under 60 characters to ensure perfect mobile and desktop viewport display."
      ],
      estimatedImprovement: "Vastly increases local map-pack search visibility and organic clicks",
      difficulty: "Easy"
    },
    {
      id: "bakery-rec-3",
      category: "content",
      issue: "Thin Word Count (Under 200 Words)",
      problem: "The parsed webpage contains less than 180 words of indexable text, providing insufficient contextual depth.",
      whyItMatters: "Content depth signals expertise. Search engine crawlers struggle to match thin sites with highly competitive local searches.",
      seoImpact: "High",
      priority: "Amber",
      stepByStepFix: [
        "Draft a compelling 300-word block detailing your stone-milled organic flour and 48-hour sourdough wild yeast fermentation process.",
        "Publish a daily baking list describing ingredients, wheat varieties, and baker specialties."
      ],
      estimatedImprovement: "+18% Sourdough & Fresh Breads query impressions",
      difficulty: "Easy"
    }
  ],
  keywords: [
    {
      keyword: "artisanal bakery sourdough near me",
      searchVolume: "4.8K",
      difficulty: 28,
      intent: "Transactional",
      cpc: "$1.40",
      relevance: 100
    },
    {
      keyword: "organic sourdough bread bakery",
      searchVolume: "1.6K",
      difficulty: 32,
      intent: "Commercial",
      cpc: "$0.95",
      relevance: 95
    },
    {
      keyword: "best local pastries and cakes",
      searchVolume: "950",
      difficulty: 22,
      intent: "Transactional",
      cpc: "$1.15",
      relevance: 90
    }
  ],
  seoTitles: [
    "Artisanal Sourdough & Fresh Pastries | [Your City] Bread Co.",
    "Organic Local Bakery | Handcrafted Breads & Croissants",
    "Best Sourdough Bread & French Pastry Kitchen in [Your City]"
  ],
  metaDescriptions: [
    "Savor the aroma of authentic, organic sourdough bread and golden pastries baked fresh every morning in [Your City]. Stop by today or place an order online!",
    "Welcome to [Your City]'s favorite artisan pastry kitchen. We mill local stone ground flour and use wild cultures to craft sourdough boules, croissants, and muffins.",
    "Indulge in fresh country loaves, cinnamon rolls, and specialty coffees baked with 100% organic local grains. Check out our daily baking schedule!"
  ],
  h1h2Suggestions: {
    h1: ["Artisanal Bakery & Stone-Milled Sourdough Kitchen"],
    h2: [
      "Our Daily Handcrafted Specialties & Fresh Loaves",
      "Baked with Organic Grains & Wild Ferments",
      "Visit Our Neighborhood Cafe or Order Online Today"
    ]
  },
  faqBlogIdeas: [
    {
      questionOrTopic: "Why is natural sourdough wild fermentation healthier than commercial breads?",
      type: "Blog",
      targetKeywords: ["sourdough health benefits", "wild yeast vs commercial", "digestible bread"]
    },
    {
      questionOrTopic: "What is your daily baking schedule and hot loaf release times?",
      type: "FAQ",
      targetKeywords: ["bakery schedule", "fresh hot bread hour", "bakery morning hours"]
    }
  ],
  linkingSuggestions: [
    {
      anchorText: "explore our daily sourdough menu",
      targetKeyword: "sourdough pastries menu",
      reason: "Smoothly shifts incoming landing traffic directly into active menu item pages."
    }
  ]
};
