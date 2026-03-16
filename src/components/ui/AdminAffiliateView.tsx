"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, DollarSign, TrendingUp, Link2, Copy, Check, ChevronRight,
    Plus, Crown, Zap, Gift, BarChart2, ArrowUpRight, AlertCircle,
    Wallet, Send, RefreshCw, Star, Shield, X, ExternalLink, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

// Commission structure config
const COMMISSION_STRUCTURE = {
    standard: { direct: 30, downline: 10, label: "Standard", color: "blue" },
    elite: { direct: 40, downline: 10, label: "Elite", color: "amber" },
};

const MOCK_AFFILIATES = [
    {
        id: "aff-001", user_id: "demo_001", name: "David Sterling", email: "david@sterling-res.com",
        ref_code: "DAVID42", tier: "elite", commission_pct: 40, downline_pct: 10, status: "active",
        payout_email: "david@paypal.me", total_clicks: 1842, total_conversions: 48,
        total_earned: 5614.80, pending_payout: 980.00, created_at: "2026-01-15T00:00:00Z",
        conversions: [
            { id: "c1", amount_usd: 90, commission_earned: 36.00, status: "confirmed", created_at: "2026-03-10T10:00:00Z" },
            { id: "c2", amount_usd: 490, commission_earned: 196.00, status: "confirmed", created_at: "2026-03-08T10:00:00Z" },
            { id: "c3", amount_usd: 90, commission_earned: 36.00, status: "pending", created_at: "2026-03-14T10:00:00Z" },
        ],
        payouts: [
            { id: "p1", amount: 1200, status: "paid", paid_at: "2026-02-01T00:00:00Z" },
            { id: "p2", amount: 800, status: "paid", paid_at: "2026-03-01T00:00:00Z" },
        ],
    },
    {
        id: "aff-002", user_id: "demo_002", name: "Emma Rodriguez", email: "emma.rod@outlook.com",
        ref_code: "EMMAF5", tier: "standard", commission_pct: 30, downline_pct: 10, status: "active",
        payout_email: "emma@paypal.me", total_clicks: 612, total_conversions: 14,
        total_earned: 1215.60, pending_payout: 290.00, created_at: "2026-02-01T00:00:00Z",
        conversions: [
            { id: "c4", amount_usd: 90, commission_earned: 27.00, status: "confirmed", created_at: "2026-03-12T10:00:00Z" },
            { id: "c5", amount_usd: 90, commission_earned: 27.00, status: "pending", created_at: "2026-03-14T10:00:00Z" },
        ],
        payouts: [
            { id: "p3", amount: 290, status: "paid", paid_at: "2026-03-01T00:00:00Z" },
        ],
    },
    {
        id: "aff-003", user_id: "demo_003", name: "Michael Chen", email: "m.chen@venture-capital.io",
        ref_code: "MCHEN9", tier: "standard", commission_pct: 30, downline_pct: 10, status: "active",
        payout_email: null, total_clicks: 274, total_conversions: 5,
        total_earned: 435.00, pending_payout: 435.00, created_at: "2026-02-20T00:00:00Z",
        conversions: [
            { id: "c6", amount_usd: 490, commission_earned: 147.00, status: "confirmed", created_at: "2026-03-05T10:00:00Z" },
        ],
        payouts: [],
    },
];

export function AdminAffiliateView() {
    const [affiliates, setAffiliates] = useState<any[]>(MOCK_AFFILIATES);
    const [isLoading, setIsLoading] = useState(true);
    const [dbMissing, setDbMissing] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState<any>(MOCK_AFFILIATES[0]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [payoutAmount, setPayoutAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("paypal");
    const [isProcessingPayout, setIsProcessingPayout] = useState(false);
    const [newAffiliate, setNewAffiliate] = useState({ name: "", email: "", tier: "standard", payout_email: "" });
    const [isCreating, setIsCreating] = useState(false);

    const fetchAffiliates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/affiliates");
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setAffiliates(data);
                setSelectedAffiliate(data[0]);
            } else if (data?.error?.includes("does not exist")) {
                setDbMissing(true);
            }
        } catch (e) {
            // keep mock data
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAffiliates(); }, []);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(`https://follio.app/signup?ref=${code}`);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handlePayout = async () => {
        if (!selectedAffiliate || !payoutAmount) return;
        setIsProcessingPayout(true);
        try {
            await fetch(`/api/admin/affiliates/${selectedAffiliate.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(payoutAmount), method: payoutMethod }),
            });
            setShowPayoutModal(false);
            setPayoutAmount("");
            await fetchAffiliates();
        } finally {
            setIsProcessingPayout(false);
        }
    };

    const handleToggleStatus = async (affiliate: any) => {
        const newStatus = affiliate.status === "active" ? "paused" : "active";
        try {
            await fetch(`/api/admin/affiliates/${affiliate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setAffiliates(prev => prev.map(a => a.id === affiliate.id ? { ...a, status: newStatus } : a));
            if (selectedAffiliate?.id === affiliate.id) setSelectedAffiliate((p: any) => ({ ...p, status: newStatus }));
        } catch (e) { }
    };

    const handlePromoteToElite = async (affiliate: any) => {
        try {
            await fetch(`/api/admin/affiliates/${affiliate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tier: "elite", commission_pct: 40 }),
            });
            setAffiliates(prev => prev.map(a => a.id === affiliate.id ? { ...a, tier: "elite", commission_pct: 40 } : a));
            if (selectedAffiliate?.id === affiliate.id) setSelectedAffiliate((p: any) => ({ ...p, tier: "elite", commission_pct: 40 }));
        } catch (e) { }
    };

    const handleCreateAffiliate = async () => {
        if (!newAffiliate.email.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/affiliates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newAffiliate, user_id: `manual_${Date.now()}` }),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewAffiliate({ name: "", email: "", tier: "standard", payout_email: "" });
                await fetchAffiliates();
            }
        } finally {
            setIsCreating(false);
        }
    };

    const filteredAffiliates = affiliates.filter(a =>
        (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.ref_code || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Aggregate stats
    const totalEarned = affiliates.reduce((s, a) => s + (a.total_earned || 0), 0);
    const totalPending = affiliates.reduce((s, a) => s + (a.pending_payout || 0), 0);
    const totalConversions = affiliates.reduce((s, a) => s + (a.total_conversions || 0), 0);
    const totalClicks = affiliates.reduce((s, a) => s + (a.total_clicks || 0), 0);
    const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-2 flex items-center gap-3">
                        <Gift className="text-purple-400" />
                        Affiliate Program
                    </h1>
                    <p className="text-slate-400 text-sm">Multi-tier Team Builder · 30% direct commission · 10% on partner referral earnings · <span className="text-emerald-400 font-medium">Anytime Payouts</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchAffiliates()}
                        className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
                    >
                        <Plus size={16} /> Add Affiliate
                    </button>
                </div>
            </div>

            {/* Commission Structure Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-900/5 border border-blue-500/20 space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Standard Tier</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">30%</span>
                        <span className="text-xs text-slate-400">direct commission</span>
                    </div>
                    <p className="text-[11px] text-slate-500">+ <span className="text-blue-400 font-bold">10%</span> of partner-team commissions</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-600/10 to-amber-900/5 border border-amber-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                        <Crown size={12} className="text-amber-400" />
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Elite Tier</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">40%</span>
                        <span className="text-xs text-slate-400">direct commission</span>
                    </div>
                    <p className="text-[11px] text-slate-500">+ <span className="text-amber-400 font-bold">10%</span> of partner-team commissions</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-900/5 border border-purple-500/20 space-y-1">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Team Earnings Structure</p>
                    <div className="flex items-center gap-3 py-2">
                        <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-1">
                                <Star size={14} className="text-purple-400" />
                            </div>
                            <p className="text-[9px] text-slate-500">You</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-600" />
                        <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-1">
                                <Users size={12} className="text-blue-400" />
                            </div>
                            <p className="text-[9px] text-slate-500">L1 Affiliate</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-600" />
                        <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center mx-auto mb-1">
                                <Users size={12} className="text-slate-400" />
                            </div>
                            <p className="text-[9px] text-slate-500">Sub-Partner</p>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">1 level deep. Follio retains 60–70% of subscription revenue.</p>
                </div>
            </div>

            {/* DB Missing Banner */}
            {dbMissing && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-start gap-4">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="uppercase tracking-widest mb-1">Table not found — showing demo data</p>
                        <p className="font-normal text-amber-300/70 leading-relaxed">
                            Run the migration: <code className="font-mono bg-amber-500/10 px-1 rounded">supabase/migrations/20260314_affiliate_system.sql</code> in your Supabase SQL Editor, then refresh.
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Affiliates", value: affiliates.length.toString(), sub: `${affiliates.filter(a => a.tier === "elite").length} elite`, icon: Users, color: "purple" },
                    { label: "Total Commissions", value: `$${totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "all-time paid", icon: DollarSign, color: "emerald" },
                    { label: "Pending Payouts", value: `$${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "awaiting transfer", icon: Wallet, color: "amber" },
                    { label: "Conversion Rate", value: `${convRate}%`, sub: `${totalConversions} total sales`, icon: TrendingUp, color: "blue" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm"
                    >
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center mb-3 border",
                            stat.color === "purple" && "bg-purple-500/10 border-purple-500/20 text-purple-400",
                            stat.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                            stat.color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                            stat.color === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                        )}>
                            <stat.icon size={16} />
                        </div>
                        <p className="text-2xl font-black text-white font-mono mb-0.5">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* LEFT: Affiliate List */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, code..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-slate-300 placeholder:text-slate-600"
                        />
                    </div>

                    <div className="space-y-2.5">
                        {filteredAffiliates.map(affiliate => (
                            <button
                                key={affiliate.id}
                                onClick={() => setSelectedAffiliate(affiliate)}
                                className={cn(
                                    "w-full text-left p-5 rounded-2xl border transition-all group",
                                    selectedAffiliate?.id === affiliate.id
                                        ? "bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 text-white text-[11px] font-black">
                                            {(affiliate.name || affiliate.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{affiliate.name || "—"}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{affiliate.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {affiliate.tier === "elite" && (
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                                <Crown size={8} /> Elite
                                            </span>
                                        )}
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            affiliate.status === "active" ? "bg-emerald-500" : "bg-slate-600"
                                        )} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <code className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                        ?ref={affiliate.ref_code}
                                    </code>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleCopyCode(affiliate.ref_code); }}
                                        className="p-1 rounded text-slate-600 hover:text-purple-400 transition-colors"
                                    >
                                        {copiedCode === affiliate.ref_code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">{affiliate.total_clicks.toLocaleString()}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-wider">Clicks</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">{affiliate.total_conversions}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-wider">Sales</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-emerald-400">${affiliate.pending_payout.toFixed(0)}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-wider">Pending</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredAffiliates.length === 0 && (
                            <div className="p-8 rounded-2xl border border-slate-800/40 text-center">
                                <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">No affiliates match</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Detail Panel */}
                <div className="lg:col-span-3">
                    {selectedAffiliate ? (
                        <motion.div
                            key={selectedAffiliate.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            className="glass-card rounded-3xl border border-slate-700/40 shadow-2xl overflow-hidden"
                        >
                            {/* Affiliate Header */}
                            <div className="p-8 border-b border-slate-800/60">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-500/20">
                                            {(selectedAffiliate.name || selectedAffiliate.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-bold text-white">{selectedAffiliate.name || "—"}</h2>
                                                {selectedAffiliate.tier === "elite" ? (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Crown size={9} /> Elite
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest">
                                                        Standard
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400">{selectedAffiliate.email}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <code className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                                    follio.app/signup?ref={selectedAffiliate.ref_code}
                                                </code>
                                                <button
                                                    onClick={() => handleCopyCode(selectedAffiliate.ref_code)}
                                                    className="text-slate-500 hover:text-purple-400 transition-colors"
                                                >
                                                    {copiedCode === selectedAffiliate.ref_code ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {selectedAffiliate.tier === "standard" && (
                                            <button
                                                onClick={() => handlePromoteToElite(selectedAffiliate)}
                                                className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                                            >
                                                <Crown size={12} /> Promote Elite
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleStatus(selectedAffiliate)}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                selectedAffiliate.status === "active"
                                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                            )}
                                        >
                                            {selectedAffiliate.status === "active" ? "Pause" : "Activate"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Commission Breakdown */}
                            <div className="grid grid-cols-4 divide-x divide-slate-800/60 border-b border-slate-800/60">
                                {[
                                    { label: "Direct Cut", value: `${selectedAffiliate.commission_pct}%`, color: "text-purple-400" },
                                    { label: "Team Referral Bonus", value: `${selectedAffiliate.downline_pct}%`, color: "text-blue-400" },
                                    { label: "Total Earned", value: `$${(selectedAffiliate.total_earned || 0).toLocaleString()}`, color: "text-white" },
                                    { label: "Pending", value: `$${(selectedAffiliate.pending_payout || 0).toFixed(2)}`, color: "text-amber-400" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-5 text-center">
                                        <p className={cn("text-xl font-bold font-mono mb-1", stat.color)}>{stat.value}</p>
                                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-8">

                                {/* Payout Info */}
                                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Payout Details</h3>
                                        <button
                                            onClick={() => { setPayoutAmount(selectedAffiliate.pending_payout.toFixed(2)); setShowPayoutModal(true); }}
                                            disabled={selectedAffiliate.pending_payout <= 0}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Send size={12} /> Pay Out ${selectedAffiliate.pending_payout.toFixed(2)}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">PayPal / Payout Email</p>
                                            <p className="text-sm text-slate-300 font-mono">{selectedAffiliate.payout_email || <span className="text-slate-600 italic">Not set</span>}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Member Since</p>
                                            <p className="text-sm text-slate-300">{new Date(selectedAffiliate.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                                        </div>
                                    </div>

                                    {/* Payout History */}
                                    {selectedAffiliate.payouts?.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-slate-800/60">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Payout History</p>
                                            {selectedAffiliate.payouts.map((p: any) => (
                                                <div key={p.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">{new Date(p.paid_at || p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                                    <span className="font-bold text-emerald-400">${p.amount.toFixed(2)}</span>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                                                        p.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                    )}>{p.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Conversions */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        Recent Conversions ({selectedAffiliate.conversions?.length || 0})
                                    </h3>
                                    {selectedAffiliate.conversions?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedAffiliate.conversions.slice(0, 5).map((conv: any, i: number) => (
                                                <div key={conv.id || i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div>
                                                        <p className="text-xs font-bold text-white">${conv.amount_usd}/mo subscription</p>
                                                        <p className="text-[10px] text-slate-500">{new Date(conv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-emerald-400">+${(conv.commission_earned || 0).toFixed(2)}</p>
                                                            <p className="text-[9px] text-slate-600">commission</p>
                                                        </div>
                                                        <span className={cn(
                                                            "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest",
                                                            conv.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                        )}>{conv.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 rounded-xl border border-slate-800/40 text-center">
                                            <ArrowUpRight size={24} className="text-slate-700 mx-auto mb-2" />
                                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">No conversions yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800/40 rounded-3xl opacity-40">
                            <Gift size={42} className="text-slate-700 mb-6" />
                            <p className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Select an Affiliate</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payout Modal */}
            <AnimatePresence>
                {showPayoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-slate-950 border border-slate-700/60 rounded-3xl shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Send Payout</h2>
                                    <p className="text-xs text-slate-500 mt-1">To: {selectedAffiliate?.payout_email || "No payout email set"}</p>
                                </div>
                                <button onClick={() => setShowPayoutModal(false)} className="p-2 rounded-xl text-slate-600 hover:text-white bg-slate-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Amount (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={payoutAmount}
                                            onChange={e => setPayoutAmount(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-slate-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["paypal", "stripe"].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setPayoutMethod(m)}
                                                className={cn(
                                                    "py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    payoutMethod === m
                                                        ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400"
                                                        : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowPayoutModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayout}
                                    disabled={isProcessingPayout || !payoutAmount}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessingPayout ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Send Payment</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Affiliate Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-slate-950 border border-slate-700/60 rounded-3xl shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Add Affiliate</h2>
                                    <p className="text-xs text-slate-500 mt-1">A unique referral link will be auto-generated</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl text-slate-600 hover:text-white bg-slate-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Full Name</label>
                                    <input value={newAffiliate.name} onChange={e => setNewAffiliate(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Doe" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-slate-200 placeholder:text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Email *</label>
                                    <input type="email" value={newAffiliate.email} onChange={e => setNewAffiliate(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-slate-200 placeholder:text-slate-600" autoFocus />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Payout Email (PayPal)</label>
                                    <input value={newAffiliate.payout_email} onChange={e => setNewAffiliate(p => ({ ...p, payout_email: e.target.value }))} placeholder="paypal@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-slate-200 placeholder:text-slate-600" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Tier</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: "standard", label: "Standard (30%)", icon: Shield },
                                            { key: "elite", label: "Elite (40%)", icon: Crown },
                                        ].map(t => (
                                            <button
                                                key={t.key}
                                                onClick={() => setNewAffiliate(p => ({ ...p, tier: t.key }))}
                                                className={cn(
                                                    "py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                                                    newAffiliate.tier === t.key
                                                        ? t.key === "elite"
                                                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                                            : "bg-purple-600/10 border-purple-500/40 text-purple-400"
                                                        : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
                                                )}
                                            >
                                                <t.icon size={12} /> {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">Cancel</button>
                                <button
                                    onClick={handleCreateAffiliate}
                                    disabled={isCreating || !newAffiliate.email.trim()}
                                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    {isCreating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Plus size={14} /> Add Affiliate</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
