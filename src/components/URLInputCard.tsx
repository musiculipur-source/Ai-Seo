import React, { useState } from 'react';
import { useSEO } from '../context/SEOContext';
import { Search, Loader2, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

interface URLInputCardProps {
  onStartAudit?: (url: string) => void;
}

export default function URLInputCard({ onStartAudit }: URLInputCardProps) {
  const { triggerAudit, isLoading, user } = useSEO();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (val: string): boolean => {
    if (!val) {
      setError('Website URL is required.');
      return false;
    }
    // Clean string checks
    const trimmed = val.trim();
    if (!trimmed.includes('.') || trimmed.length < 4) {
      setError('Please provide a realistic website address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateUrl(url)) return;

    let targetUrl = url.trim();
    // Default prefix if not present
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      if (onStartAudit) {
        onStartAudit(targetUrl);
      } else {
        await triggerAudit(targetUrl);
      }
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Crawl failed. Make sure the site allows scrapers.');
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-mono w-max">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>REAL-TIME ELEMENT SCAVENGER</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white">
            Audit any website instantly
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Enter any domain name to inspect title attributes, image accessibility tags, link health parameters, robots configurations, and receive tactical AI recommendation strategies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. apple.com or https://news.ycombinator.com"
              disabled={isLoading}
              className="w-full bg-gray-900/50 border border-gray-800 focus:border-emerald-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-gray-950" />
                <span>SCANNING META NODES...</span>
              </>
            ) : (
              <>
                <span>LAUNCH AI AUDIT</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-center space-x-2.5 animate-fade-in">
            <ShieldAlert className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {user && (
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono border-t border-gray-900 pt-4">
            <span>DEDUCTS 1 AUDIT CREDIT PER SCAN</span>
            <span>REMAINING: {user.credits} CREDITS</span>
          </div>
        )}
      </div>
    </div>
  );
}
