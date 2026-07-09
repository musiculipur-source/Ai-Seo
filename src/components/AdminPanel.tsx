import React, { useState, useEffect } from 'react';
import { useSEO } from '../context/SEOContext';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Settings, 
  Coins, 
  RefreshCw, 
  Search, 
  ToggleLeft, 
  ToggleRight,
  UserCheck,
  ChevronDown,
  Sparkles,
  Smartphone,
  Check,
  Lock
} from 'lucide-react';

interface UserItem {
  email: string;
  name: string;
  plan: 'basic' | 'standard' | 'premium';
  credits: number;
  company?: string;
  joinedAt?: string;
  lastAuditTimestamp?: string;
}

interface AdminStats {
  totalUsers: number;
  totalAudits: number;
  activePremium: number;
  activeStandard: number;
  activeFree: number;
}

export default function AdminPanel() {
  const { user, adminSettings, updateAdminSettingsOnServer, addToast } = useSEO();
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAudits: 0,
    activePremium: 0,
    activeStandard: 0,
    activeFree: 0
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gateways toggles and details
  const [binanceOn, setBinanceOn] = useState(adminSettings.binanceEnabled);
  const [cardOn, setCardOn] = useState(adminSettings.cardEnabled);
  const [paypalOn, setPaypalOn] = useState(adminSettings.paypalEnabled);

  const [binanceAddress, setBinanceAddress] = useState(adminSettings.binanceAddress || '');
  const [binanceNetwork, setBinanceNetwork] = useState(adminSettings.binanceNetwork || '');
  const [paypalEmail, setPaypalEmail] = useState(adminSettings.paypalEmail || '');
  const [bankName, setBankName] = useState(adminSettings.bankName || '');
  const [bankBranch, setBankBranch] = useState(adminSettings.bankBranch || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(adminSettings.bankAccountHolder || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(adminSettings.bankAccountNumber || '');

  // Synchronize component state with administrative settings loaded from server
  useEffect(() => {
    setBinanceOn(adminSettings.binanceEnabled);
    setCardOn(adminSettings.cardEnabled);
    setPaypalOn(adminSettings.paypalEnabled);
    setBinanceAddress(adminSettings.binanceAddress || '');
    setBinanceNetwork(adminSettings.binanceNetwork || '');
    setPaypalEmail(adminSettings.paypalEmail || '');
    setBankName(adminSettings.bankName || '');
    setBankBranch(adminSettings.bankBranch || '');
    setBankAccountHolder(adminSettings.bankAccountHolder || '');
    setBankAccountNumber(adminSettings.bankAccountNumber || '');
  }, [adminSettings]);

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newPlan, setNewPlan] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [newCredits, setNewCredits] = useState(0);

  const fetchUsersData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data.users || []);
        setStats(data.stats || {
          totalUsers: 0,
          totalAudits: 0,
          activePremium: 0,
          activeStandard: 0,
          activeFree: 0
        });
      }
    } catch (err) {
      addToast('ডেটাবেস থেকে ব্যবহারকারী তালিকা লোড করতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await updateAdminSettingsOnServer({
        binanceEnabled: binanceOn,
        cardEnabled: cardOn,
        paypalEnabled: paypalOn,
        binanceAddress,
        binanceNetwork,
        paypalEmail,
        bankName,
        bankBranch,
        bankAccountHolder,
        bankAccountNumber
      });
      addToast('পেমেন্ট ও ব্যাংক অ্যাকাউন্ট সংক্রান্ত সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!', 'success');
    } catch {
      addToast('সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          plan: newPlan,
          credits: Number(newCredits)
        })
      });

      if (res.ok) {
        addToast(`সফলভাবে ${editingUser.name}-এর প্ল্যান এবং ক্রেডিট পরিবর্তন করা হয়েছে!`, 'success');
        setEditingUser(null);
        fetchUsersData();
      } else {
        addToast('ব্যবহারকারীর তথ্য পরিবর্তন করতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      addToast('সার্ভারের সাথে যোগাযোগ করতে ত্রুটি হয়েছে।', 'error');
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user || !user.isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Lock className="h-12 w-12 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-white uppercase font-mono">সংরক্ষিত এলাকা (Restricted)</h2>
        <p className="text-xs text-gray-500 font-sans">
          শুধুমাত্র সঠিক এডমিন ক্রেডেনশিয়ালধারী ব্যক্তিরাই এই নিয়ন্ত্রণ প্যানেলে প্রবেশ করতে পারবেন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-950 p-6 border border-gray-900 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/15 rounded text-[10px] font-bold font-mono">
              সিস্টেম হোস্ট
            </span>
            <span className="text-[10px] text-gray-500 font-mono">অপারেটর কনসোল</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-white">
            এডমিন সিস্টেম টার্মিনাল
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            পেমেন্ট গেটওয়ে নিয়ন্ত্রণ করুন, ব্যবহারকারীদের ক্রেডিট পরিবর্তন করুন এবং সম্পূর্ণ ডেটাবেস পরিচালনা করুন।
          </p>
        </div>
        <button
          onClick={fetchUsersData}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-gray-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>ডেটাবেস সিঙ্ক করুন</span>
        </button>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-950 border border-gray-900 p-4 rounded-2xl space-y-1 text-left">
          <span className="text-[10px] text-gray-500 font-mono block">মোট ব্যবহারকারী</span>
          <span className="text-xl font-mono font-black text-white">{stats.totalUsers}</span>
        </div>
        <div className="bg-gray-950 border border-gray-900 p-4 rounded-2xl space-y-1 text-left">
          <span className="text-[10px] text-gray-500 font-mono block">মোট অডিট সম্পন্ন</span>
          <span className="text-xl font-mono font-black text-white">{stats.totalAudits}</span>
        </div>
        <div className="bg-gray-950 border border-gray-900 p-4 rounded-2xl space-y-1 text-left">
          <span className="text-[10px] text-purple-400 font-mono block">প্রিমিয়াম প্ল্যান</span>
          <span className="text-xl font-mono font-black text-purple-400">{stats.activePremium}</span>
        </div>
        <div className="bg-gray-950 border border-gray-900 p-4 rounded-2xl space-y-1 text-left">
          <span className="text-[10px] text-emerald-400 font-mono block">স্ট্যান্ডার্ড প্ল্যান</span>
          <span className="text-xl font-mono font-black text-emerald-400">{stats.activeStandard}</span>
        </div>
        <div className="bg-gray-950 border border-gray-900 p-4 rounded-2xl space-y-1 text-left col-span-2 md:col-span-1">
          <span className="text-[10px] text-gray-400 font-mono block">ফ্রি বেসিক প্ল্যান</span>
          <span className="text-xl font-mono font-black text-gray-400">{stats.activeFree}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Gateways Panel */}
        <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl space-y-5 lg:col-span-1">
          <div className="border-b border-gray-900 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <Settings className="h-4 w-4 text-emerald-400" />
              <span>পেমেন্ট গেটওয়েসমূহ</span>
            </h2>
            <p className="text-[11px] text-gray-500 font-sans">ব্যবহারকারীদের আপগ্রেড করার জন্য সক্রিয় পেমেন্ট গেটওয়ে অন/অফ করুন।</p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            {/* Binance Details */}
            <div className="p-3 bg-gray-900/30 border border-gray-900 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">বাইনান্স পে (ক্রিপ্টো)</span>
                  <span className="text-[10px] text-gray-500">ইউএসডিটি ওয়ালেট ট্রান্সফার</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBinanceOn(!binanceOn)}
                  className="text-amber-500 hover:text-amber-400 transition-colors cursor-pointer text-xs"
                >
                  {binanceOn ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-700" />}
                </button>
              </div>
              {binanceOn && (
                <div className="space-y-2 pt-2 border-t border-gray-900/60 animate-fade-in text-[11px]">
                  <div className="space-y-1">
                    <span className="text-gray-400 block">বাইনান্স ওয়ালেট এড্রেস</span>
                    <input
                      type="text"
                      placeholder="যেমন: TYv3mX..."
                      value={binanceAddress}
                      onChange={(e) => setBinanceAddress(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">ওয়ালেট নেটওয়ার্ক (TRC20, BEP20)</span>
                    <input
                      type="text"
                      placeholder="যেমন: TRC20"
                      value={binanceNetwork}
                      onChange={(e) => setBinanceNetwork(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dual Currency / Bank details */}
            <div className="p-3 bg-gray-900/30 border border-gray-900 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">মাস্টার কার্ড / ডুয়েল কারেন্সি</span>
                  <span className="text-[10px] text-gray-500">সরাসরি ব্যাংকে পেমেন্ট গ্রহনের তথ্য</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCardOn(!cardOn)}
                  className="text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer text-xs"
                >
                  {cardOn ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-700" />}
                </button>
              </div>
              {cardOn && (
                <div className="space-y-2 pt-2 border-t border-gray-900/60 animate-fade-in text-[11px]">
                  <div className="space-y-1">
                    <span className="text-gray-400 block">ব্যাংকের নাম (Bank Name)</span>
                    <input
                      type="text"
                      placeholder="যেমন: Dutch Bangla Bank Ltd."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-white outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">শাখা বা ব্রাঞ্চ (Branch Name)</span>
                    <input
                      type="text"
                      placeholder="যেমন: Dhaka Main Branch"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-white outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">হিসাবধারীর নাম (Account Holder)</span>
                    <input
                      type="text"
                      placeholder="যেমন: Rabby Hossain"
                      value={bankAccountHolder}
                      onChange={(e) => setBankAccountHolder(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-white outline-none text-[11px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">হিসাব নাম্বার (Account Number)</span>
                    <input
                      type="text"
                      placeholder="যেমন: 123.456.7890"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div className="p-3 bg-gray-900/30 border border-gray-900 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">পেপাল পেমেন্ট (PayPal)</span>
                  <span className="text-[10px] text-gray-500">পেপাল অ্যাকাউন্ট ইমেইল</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPaypalOn(!paypalOn)}
                  className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer text-xs"
                >
                  {paypalOn ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-700" />}
                </button>
              </div>
              {paypalOn && (
                <div className="space-y-2 pt-2 border-t border-gray-900/60 animate-fade-in text-[11px]">
                  <div className="space-y-1">
                    <span className="text-gray-400 block">পেপাল ইমেইল এড্রেস</span>
                    <input
                      type="email"
                      placeholder="যেমন: payment@paypal.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-900 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-white outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
            >
              গেটওয়ে ও ব্যাংক সেটিংস সংরক্ষণ করুন
            </button>
          </div>
        </div>

        {/* User directory */}
        <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                সক্রিয় ব্যবহারকারী তালিকা
              </h2>
              <p className="text-[11px] text-gray-500 font-sans">ব্যবহারকারীদের ক্রেডিট ব্যালেন্স এবং প্ল্যান ম্যানুয়ালি পরিবর্তন করুন।</p>
            </div>

            <div className="relative w-full sm:w-48 text-xs font-sans">
              <input
                type="text"
                placeholder="অনুসন্ধান করুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-800 rounded-xl py-2 pl-8 pr-3 text-white placeholder-gray-600 outline-none"
              />
              <Search className="h-3.5 w-3.5 text-gray-600 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Desktop Table view / Responsive list view */}
          <div className="overflow-x-auto text-xs font-sans">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-600 py-12 font-mono">অনুসন্ধানের সাথে মিল পাওয়া যায়নি।</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-900 font-mono text-[10px] text-gray-500 uppercase">
                    <th className="py-2.5">ব্যবহারকারী তথ্য</th>
                    <th className="py-2.5">প্ল্যান</th>
                    <th className="py-2.5">ক্রেডিট</th>
                    <th className="py-2.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/40">
                  {filteredUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-900/10">
                      <td className="py-3 pr-2">
                        <div className="space-y-0.5 max-w-[140px] sm:max-w-none">
                          <span className="font-bold text-white block truncate">{u.name}</span>
                          <span className="text-[10px] text-gray-500 block truncate">{u.email}</span>
                          {u.company && (
                            <span className="text-[9px] bg-emerald-500/5 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold uppercase">
                              {u.company}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          u.plan === 'premium' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : u.plan === 'standard'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-gray-900 text-gray-400 border border-gray-800'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">{u.credits}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewPlan(u.plan);
                            setNewCredits(u.credits);
                          }}
                          className="px-2 py-1 bg-gray-900 hover:bg-emerald-500 hover:text-gray-950 text-emerald-400 text-[10px] font-mono rounded font-bold transition-all cursor-pointer border border-gray-800 hover:border-emerald-500"
                        >
                          পরিবর্তন করুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modify User Parameter Modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-5 animate-scale-up">
            <div className="border-b border-gray-900 pb-2">
              <h3 className="text-sm font-black text-white uppercase font-mono">
                ব্যবহারকারীর তথ্য পরিবর্তন করুন
              </h3>
              <p className="text-[11px] text-gray-500 truncate font-sans">কনফিগার করা হচ্ছে: {editingUser.email}</p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono font-bold text-gray-500 uppercase">সাবস্ক্রিপশন প্ল্যান</label>
                <select
                  value={newPlan}
                  onChange={(e) => {
                    const planValue = e.target.value as 'basic' | 'standard' | 'premium';
                    setNewPlan(planValue);
                    // Autofill credits
                    setNewCredits(planValue === 'premium' ? 99 : planValue === 'standard' ? 15 : 1);
                  }}
                  className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-3 text-white outline-none"
                >
                  <option value="basic">বেসিক (ফ্রি দৈনিক ১ বার অডিট)</option>
                  <option value="standard">স্ট্যান্ডার্ড (জনপ্রিয় $৫ - ১ মাস)</option>
                  <option value="premium">প্রিমিয়াম (এন্টারপ্রাইজ $১২ - ১ মাস)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-bold text-gray-500 uppercase">অডিট ক্রেডিট বরাদ্দ</label>
                <input
                  type="number"
                  required
                  value={newCredits}
                  onChange={(e) => setNewCredits(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-gray-950 border border-gray-900 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 rounded-xl text-xs uppercase font-mono cursor-pointer transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase font-mono cursor-pointer transition-colors"
                >
                  পরিবর্তন প্রয়োগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
