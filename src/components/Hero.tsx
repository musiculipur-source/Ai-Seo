import { useState, useEffect, FormEvent } from 'react';
import { Search, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartAudit: (url: string) => void;
  isLoading: boolean;
}

export default function Hero({ onStartAudit, isLoading }: HeroProps) {
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    'Establishing secure connection with domain...',
    'Scraping title tags, meta description, and robots.txt...',
    'Mapping heading hierarchies & verifying image alt tags...',
    'Analyzing mobile friendliness & measuring network latency...',
    'Feeding structured SEO metadata to Gemini...',
    'Compiling your tactical optimization blueprint...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!urlInput.trim()) {
      setErrorMsg('Please enter a website URL.');
      return;
    }

    // Basic URL validation
    let parsedUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(parsedUrl) && !/\./.test(parsedUrl)) {
      setErrorMsg('Please enter a valid website address (e.g., website.com).');
      return;
    }

    onStartAudit(parsedUrl);
  };

  const handleExampleClick = (example: string) => {
    setUrlInput(example);
    setErrorMsg('');
  };

  return (
    <div className="relative overflow-hidden py-16 sm:py-24 border-b border-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-gray-950 to-gray-950">
      {/* Visual glowing background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Sparkle Badge */}
        <div className="inline-flex items-center space-x-2 bg-gray-900/80 border border-gray-800 px-3.5 py-1.5 rounded-full mb-8 shadow-inner">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase font-sans">
            Next-Gen Full-Stack AI SEO Audit
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-tight mb-6">
          Maximize Organic Traffic With{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent">
            Instant AI SEO Auditing
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock pro-grade SEO intelligence. Scraping structural page metadata, analyzing headings, assessing mobile speeds, and serving customized Gemini action blueprints in seconds.
        </p>

        {/* Input Form Box */}
        <div className="max-w-2xl mx-auto mb-12">
          {!isLoading ? (
            <form onSubmit={handleSubmit} className="relative p-2 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl focus-within:border-emerald-500/50 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                <div className="flex items-center flex-1 px-3 py-2">
                  <Search className="h-5 w-5 text-gray-500 mr-2.5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter website domain or full URL (e.g., example.com)..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent text-white border-none outline-none focus:ring-0 placeholder-gray-500 text-sm sm:text-base font-sans"
                    id="seo-url-input"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:ml-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-gray-950 font-bold text-sm sm:text-base rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95"
                  id="seo-audit-submit-btn"
                >
                  <span>Start SEO Audit</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Loading State Feedback Card */
            <div className="bg-gray-900 border border-emerald-500/20 p-8 rounded-2xl shadow-2xl animate-pulse text-center glow-emerald">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Analyzing Search Alignment</h3>
              <p className="text-emerald-400 font-mono text-xs max-w-lg mx-auto h-8 flex items-center justify-center">
                {steps[loadingStep]}
              </p>
              
              {/* Dynamic Progress Bar */}
              <div className="w-full bg-gray-950 rounded-full h-1.5 mt-4 overflow-hidden border border-gray-800">
                <div 
                  className="bg-emerald-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-rose-400 text-xs text-left mt-2 pl-3 flex items-center font-sans">
              <span className="mr-1.5 font-bold">⚠️</span> {errorMsg}
            </p>
          )}
        </div>

        {/* Examples Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <span className="text-gray-500 font-sans">Quick examples:</span>
          {['wikipedia.org', 'news.ycombinator.com', 'google.com', 'reddit.com'].map((domain) => (
            <button
              key={domain}
              disabled={isLoading}
              onClick={() => handleExampleClick(domain)}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 rounded-full transition-all duration-200 cursor-pointer text-xs"
              id={`example-tag-${domain}`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
