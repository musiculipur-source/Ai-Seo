import { useSEO } from '../context/SEOContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ToastNotification() {
  const { toasts, removeToast } = useSEO();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2.5 max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-2xl border flex items-start space-x-3 text-xs font-sans transition-all transform duration-300 translate-y-0 animate-fade-in ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                : isError
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-300'
                : 'bg-blue-950/90 border-blue-500/30 text-blue-300'
            }`}
          >
            {isSuccess && <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            {isError && <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />}
            {isInfo && <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />}

            <div className="flex-grow">
              <p className="font-semibold leading-normal">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 hover:bg-black/20 rounded transition-colors"
            >
              <X className="h-4 w-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
