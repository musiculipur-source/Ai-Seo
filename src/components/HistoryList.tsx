import { useState, useEffect, MouseEvent } from 'react';
import { AuditHistoryItem } from '../../shared/types';
import { getHistoryList, deleteReport } from '../services/api';
import { Database, Trash2, Eye, Calendar, ShieldCheck, Loader2, Play } from 'lucide-react';

interface HistoryListProps {
  onSelectReport: (id: string) => void;
  onNavigateHome: () => void;
  refreshTrigger: number;
}

export default function HistoryList({ onSelectReport, onNavigateHome, refreshTrigger }: HistoryListProps) {
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getHistoryList();
      setHistory(data);
    } catch (err) {
      setErrorMsg('Could not contact backend container to retrieve history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteReport(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete report.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
        <span className="text-sm font-mono text-gray-500">Loading historical audit index...</span>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-950 min-h-[60vh] px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8 border-b border-gray-900 pb-5">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Database className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Persistent Audit Vault</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Secure, chronological index of past crawl scores and Gemini summaries stored on the server.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-sans mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        {history.length > 0 ? (
          <div className="space-y-3" id="history-items-container">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectReport(item.id)}
                className="p-4 sm:p-5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.005] cursor-pointer group"
                id={`history-row-${item.id}`}
              >
                {/* Site details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <span className="text-sm font-display font-bold text-white group-hover:text-emerald-300 transition-colors truncate block max-w-xs sm:max-w-md">
                      {item.url}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-[10px] font-mono text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="hidden sm:inline bg-gray-950 border border-gray-800 px-2 py-0.5 rounded text-gray-400">ID: {item.id}</span>
                  </div>
                </div>

                {/* Score & Controls */}
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className={`px-3 py-1.5 rounded-xl border font-display font-black text-sm flex items-center justify-center ${getScoreColor(item.overallScore)}`}>
                    <span className="text-xs font-mono font-medium text-gray-500 mr-1">Score:</span>
                    <span>{item.overallScore}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReport(item.id);
                      }}
                      className="p-2 bg-gray-950 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-gray-800 rounded-xl transition-colors cursor-pointer"
                      title="Inspect full report"
                      id={`inspect-btn-${item.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 bg-gray-950 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-gray-800 rounded-xl transition-colors cursor-pointer"
                      title="Delete report"
                      id={`delete-btn-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 border border-dashed border-gray-800 rounded-2xl text-center flex flex-col items-center justify-center" id="history-empty-state">
            <div className="p-4 bg-gray-900 rounded-full mb-4 border border-gray-800">
              <Database className="h-8 w-8 text-gray-600" />
            </div>
            <h4 className="text-md font-display font-bold text-white mb-1.5">No audits analyzed yet</h4>
            <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto mb-6 leading-relaxed">
              Run your very first SEO Audit report directly on the main auditor dashboard. Results will store durably onto the server container workspace.
            </p>
            <button
              onClick={onNavigateHome}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              id="history-cta-btn"
            >
              <Play className="h-3.5 w-3.5 fill-gray-950" />
              <span>Launch First Audit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
