import React, { useState } from 'react';
import { useSEO } from '../context/SEOContext';
import { 
  Check, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  ChevronRight,
  QrCode,
  Loader2
} from 'lucide-react';

export default function PlansPage() {
  const { user, upgradeUserPlan, claimFreePlan, navigate, adminSettings, addToast } = useSEO();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'binance' | 'card' | 'paypal'>('binance');
  const [txid, setTxid] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is not logged in, force dashboard or login view
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please login to configure subscription.</p>
        <button onClick={() => navigate('login')} className="mt-4 px-4 py-2 bg-emerald-500 rounded text-gray-950 font-bold text-xs">
          Login
        </button>
      </div>
    );
  }

  const handleSelectFree = async () => {
    setIsSubmitting(true);
    try {
      // Use claimFreePlan to activate the free basic tier instantly
      const success = await claimFreePlan();
      if (success) {
        navigate('dashboard');
      }
    } catch {
      addToast('Error setting basic plan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (paymentMethod === 'binance' && !txid.trim()) {
      addToast('Please enter your Binance TXID to verify.', 'error');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardName.trim())) {
      addToast('Please fill out all credit card parameters.', 'error');
      return;
    }
    if (paymentMethod === 'paypal' && !paypalEmail.trim()) {
      addToast('Please input your registered PayPal account.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      try {
        const submittedTxid = paymentMethod === 'binance' ? txid : `MOCK_PAY_${Date.now()}`;
        await upgradeUserPlan(selectedPlan, submittedTxid, paymentMethod);
        addToast(`Successfully upgraded to ${selectedPlan.toUpperCase()} Plan!`, 'success');
        setSelectedPlan(null);
        setTxid('');
        setCardNumber('');
        setCardName('');
        setPaypalEmail('');
        navigate('dashboard');
      } catch (err) {
        addToast('Payment authorization failed.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

  const activeMethodsCount = 1 + (adminSettings.cardEnabled ? 1 : 0) + (adminSettings.paypalEnabled ? 1 : 0);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
          Select Subscription Plan
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
          Scale your SEO auditing power. Basic users get 1 audit per day, while paid packages grant premium speed and high crawl allotments.
        </p>
      </div>

      {!selectedPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Basic Free */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-gray-900 text-gray-400 border border-gray-800 px-2 py-0.5 rounded font-mono font-bold">
                  STARTER
                </span>
                <h3 className="text-lg font-bold text-white uppercase">Basic Plan</h3>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-mono font-black text-white">$0</span>
                <span className="text-xs text-gray-500 font-mono">/ FREE forever</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>1 full crawl report every 24 hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Standard Crawl speed limit</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-600 line-through">
                  <span>Priority server threads</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-600 line-through">
                  <span>Export reports to CSV/PDF</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleSelectFree}
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Configuring...' : 'Activate Free Plan'}
            </button>
          </div>

          {/* Plan 2: Standard Plan */}
          <div className="bg-gray-950 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-emerald-500/5 shadow-2xl">
            <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-black px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20">
              POPULAR
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  PRO GROWER
                </span>
                <h3 className="text-lg font-bold text-white uppercase">Standard Plan</h3>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-mono font-black text-white">$5</span>
                <span className="text-xs text-gray-500 font-mono">/ one-month access</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>15 High-Speed crawl credits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Generous limits (no 24h wait)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Gemini AI Smart Recommendations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Report exporting enabled</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                setSelectedPlan('standard');
                // Select first available method
                if (adminSettings.binanceEnabled) setPaymentMethod('binance');
                else if (adminSettings.cardEnabled) setPaymentMethod('card');
                else if (adminSettings.paypalEnabled) setPaymentMethod('paypal');
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer"
            >
              Select Standard
            </button>
          </div>

          {/* Plan 3: Premium Plan */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/10 px-2 py-0.5 rounded font-mono font-bold">
                  ENTERPRISE
                </span>
                <h3 className="text-lg font-bold text-white uppercase">Premium Plan</h3>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-mono font-black text-white">$12</span>
                <span className="text-xs text-gray-500 font-mono">/ one-month access</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>99 Professional crawl credits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited sites + nested subdomains</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Priority servers (ultra-fast processing)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Custom white-label branding headers</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                setSelectedPlan('premium');
                // Select first available method
                if (adminSettings.binanceEnabled) setPaymentMethod('binance');
                else if (adminSettings.cardEnabled) setPaymentMethod('card');
                else if (adminSettings.paypalEnabled) setPaymentMethod('paypal');
              }}
              className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer"
            >
              Select Premium
            </button>
          </div>
        </div>
      ) : (
        /* Checkout workflow */
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-4">
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-gray-400 hover:text-white text-xs font-mono flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Plans</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-mono block">UPGRADING TO</span>
              <span className="text-sm font-black text-emerald-400 font-mono uppercase">
                {selectedPlan} Plan (${selectedPlan === 'premium' ? '12' : '5'})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 block font-bold">
              Choose Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-3">
              {adminSettings.binanceEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'binance'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-gray-900/40 border-gray-900 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Wallet className="h-5 w-5 mb-1.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Binance Pay</span>
                </button>
              )}

              {adminSettings.cardEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-gray-900/40 border-gray-900 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Card Payment</span>
                </button>
              )}

              {adminSettings.paypalEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                      : 'bg-gray-900/40 border-gray-900 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <DollarSign className="h-5 w-5 mb-1.5" />
                  <span className="text-[10px] font-mono font-bold uppercase">PayPal</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Binance Details */}
            {paymentMethod === 'binance' && (
              <div className="bg-gray-900/40 border border-gray-900 p-4 rounded-2xl space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-bold text-white block">Official Binance Payment Address</span>
                    <p className="text-[11px] font-mono bg-gray-950 p-2 rounded text-amber-400 break-all select-all border border-gray-900">
                      {adminSettings.binanceAddress || 'binance_pay_addr_rabby_seo_pro_2026'}
                    </p>
                    {adminSettings.binanceNetwork && (
                      <span className="text-[10px] text-gray-400 block font-mono">
                        Network: <span className="text-white font-bold">{adminSettings.binanceNetwork}</span>
                      </span>
                    )}
                    <span className="text-[9px] text-gray-500 font-sans block">
                      Transfer exactly <span className="text-white font-bold">${selectedPlan === 'premium' ? '12.00' : '5.00'} USDT</span> to the address above.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-900/40">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-400">
                    Binance Transaction ID (TXID) / পেমেন্ট রেফারেন্স আইডি
                  </label>
                  <input
                    type="text"
                    required
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                    placeholder="যেমনঃ 842095318257019"
                    className="w-full bg-gray-950 border border-gray-900 focus:border-amber-500 rounded-xl py-3 px-4 text-white placeholder-gray-700 outline-none font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Credit Card Details */}
            {paymentMethod === 'card' && (
              <div className="bg-gray-900/40 border border-gray-900 p-4 rounded-2xl space-y-4">
                {/* Dynamic Bank Information */}
                {(adminSettings.bankName || adminSettings.bankAccountNumber) ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5 text-xs text-left">
                    <span className="font-mono font-bold text-emerald-400 block text-[10px] uppercase tracking-wider">
                      Official Bank Account Information (ব্যাংক হিসাবের তথ্য)
                    </span>
                    {adminSettings.bankName && (
                      <div>
                        <span className="text-gray-500">ব্যাংকের নাম / Bank Name:</span>{' '}
                        <strong className="text-white">{adminSettings.bankName}</strong>
                      </div>
                    )}
                    {adminSettings.bankBranch && (
                      <div>
                        <span className="text-gray-500">শাখা / Branch:</span>{' '}
                        <strong className="text-white">{adminSettings.bankBranch}</strong>
                      </div>
                    )}
                    {adminSettings.bankAccountHolder && (
                      <div>
                        <span className="text-gray-500">হিসাবধারী / Account Holder:</span>{' '}
                        <strong className="text-white">{adminSettings.bankAccountHolder}</strong>
                      </div>
                    )}
                    {adminSettings.bankAccountNumber && (
                      <div>
                        <span className="text-gray-500">হিসাব নাম্বার / Account No:</span>{' '}
                        <strong className="text-emerald-300 font-mono select-all bg-gray-950 px-1 py-0.5 rounded border border-gray-900">{adminSettings.bankAccountNumber}</strong>
                      </div>
                    )}
                    <span className="text-[9px] text-gray-400 block pt-1 border-t border-gray-900/60 font-sans">
                      উপরে বর্ণিত ব্যাংকে টাকা পাঠিয়ে নিচের বক্সে আপনার কার্ডের তথ্য অথবা ব্যাংক পেমেন্ট রেফারেন্স প্রদান করুন।
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-500">
                    * Dual Currency Card Gateway is active.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Cardholder Name / প্রেরকের নাম বা ব্যাংক হিসাব</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Rabby Chowdhury"
                    className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Card Number / ব্যাংক ট্রানজেকশন নাম্বার</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010 অথবা ব্যাংক TXN ID"
                    className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-gray-400">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-3 text-white outline-none font-mono text-xs text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-gray-400">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-3 text-white outline-none font-mono text-xs text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Details */}
            {paymentMethod === 'paypal' && (
              <div className="bg-gray-900/40 border border-gray-900 p-4 rounded-2xl space-y-4">
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1 text-xs text-left">
                  <span className="font-mono font-bold text-blue-400 block text-[10px] uppercase tracking-wider">
                    Official PayPal Email (পেপাল ইমেইল এড্রেস)
                  </span>
                  <p className="text-[11px] font-mono bg-gray-950 p-2 rounded text-blue-400 select-all border border-gray-900">
                    {adminSettings.paypalEmail || 'payment@paypal.com'}
                  </p>
                  <span className="text-[9px] text-gray-500 font-sans block pt-1">
                    Please send payment of exactly <span className="text-white font-bold">${selectedPlan === 'premium' ? '12.00' : '5.00'} USD</span> to this email address.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-400">PayPal Registered Email / আপনার পেপাল ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="e.g. checkout@paypal.com"
                    className="w-full bg-gray-950 border border-gray-900 focus:border-blue-500 rounded-xl py-3 px-4 text-white outline-none font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Payment Upgrade...</span>
                </>
              ) : (
                <span>Confirm Purchase & Activate {selectedPlan}</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
