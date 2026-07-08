import { ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const productLinks = ['SEO Scraper', 'AI Analyzer', 'Speed Diagnostic', 'Crawl Health'];
  const devLinks = ['Express API', 'Vite Bundle', 'Gemini Models', 'TS Schema'];
  const futureLinks = ['Apify Spiders', 'PDF Exporting', 'User Accounts', 'SaaS Stripe'];

  return (
    <footer className="bg-gray-950 border-t border-gray-900 py-12 px-4 sm:px-6 relative z-10 text-gray-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="font-display font-bold text-sm text-white tracking-tight">
                SEO Audit <span className="text-emerald-400">AI Pro</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Next-generation high-performance structural scraper and intelligent Gemini recommendations engine designed for search-oriented SaaS teams.
            </p>
            {/* Socials */}
            <div className="flex space-x-2.5">
              <a href="https://github.com/seo_audit_pro" className="p-2 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 text-gray-400 hover:text-emerald-400 rounded-xl transition-all">
                <Github className="h-3.5 w-3.5" />
              </a>
              <a href="https://twitter.com/seo_audit_pro" className="p-2 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 text-gray-400 hover:text-emerald-400 rounded-xl transition-all">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="https://linkedin.com" className="p-2 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 text-gray-400 hover:text-emerald-400 rounded-xl transition-all">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Core Engine */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Engine</h4>
            <ul className="space-y-2 text-xs">
              {productLinks.map((item, index) => (
                <li key={index}>
                  <a href="#home" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Technical Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Architecture</h4>
            <ul className="space-y-2 text-xs">
              {devLinks.map((item, index) => (
                <li key={index}>
                  <span className="cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Future Integrations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Future Blueprint</h4>
            <ul className="space-y-2 text-xs">
              {futureLinks.map((item, index) => (
                <li key={index}>
                  <span className="text-gray-600 italic cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono">
          <span className="mb-4 sm:mb-0">
            &copy; 2026 SEO Audit AI Pro Container Inc. All rights reserved.
          </span>
          <div className="flex space-x-4">
            <span className="text-emerald-500 font-bold">● ONLINE</span>
            <span className="text-gray-600">v1.0.0 (Node 22, React 19)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
