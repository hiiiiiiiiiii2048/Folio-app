"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, TrendingUp, Calendar, ArrowRightLeft, DollarSign, Wallet, Building2, CheckCircle2, Link2, ExternalLink, Settings, CreditCard } from "lucide-react";
import { formatCurrency, formatCompactCurrency, cn } from "@/lib/utils";
import { Property } from "@/lib/data";

const timelineData = [
    { month: "Jan", value: 4.2, equity: 1.8, cashflow: 38500 },
    { month: "Feb", value: 4.25, equity: 1.85, cashflow: 38800 },
    { month: "Mar", value: 4.28, equity: 1.9, cashflow: 39500 },
    { month: "Apr", value: 4.35, equity: 1.95, cashflow: 41200 },
    { month: "May", value: 4.48, equity: 2.1, cashflow: 42000 },
    { month: "Jun", value: 4.55, equity: 2.15, cashflow: 43500 },
    { month: "Jul", value: 4.62, equity: 2.22, cashflow: 44200 },
    { month: "Aug", value: 4.7, equity: 2.3, cashflow: 46000 },
    { month: "Sep", value: 4.85, equity: 2.45, cashflow: 48500 },
    { month: "Oct", value: 5.1, equity: 2.7, cashflow: 50200 },
    { month: "Nov", value: 5.25, equity: 2.9, cashflow: 52000 },
    { month: "Dec", value: 5.4, equity: 3.1, cashflow: 54500 },
];

const rentCollectionData = [
    { property: "The Highland", collected: 12500, pending: 0, total: 12500 },
    { property: "Sunset Ridge", collected: 8000, pending: 800, total: 8800 },
    { property: "Downtown Loft", collected: 3100, pending: 0, total: 3100 },
    { property: "Lakeview Office", collected: 18000, pending: 4000, total: 22000 },
    { property: "Coastal Condo", collected: 4200, pending: 0, total: 4200 },
];

interface ReportsDashboardProps {
    properties: Property[];
    stats: any;
    t: any;
    currency: string;
    locale: string;
}

export function ReportsDashboard({ properties, stats, t, currency, locale }: ReportsDashboardProps) {
    return (
        <motion.div
            key="dashboard-reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col space-y-6 overflow-y-auto pb-20 pr-4 custom-scrollbar"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 mb-2">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-1.5 flex items-center gap-3">
                        <BarChart3 className="text-purple-500" size={28} />
                        {t("reportsHeader" as any) || "Analytics & Reports"}
                    </h1>
                    <p className="text-slate-400 text-sm">{t("reportsSubtext" as any) || "Real-time performance metrics and financial integrations."}</p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                        <Calendar size={16} /> {t("yearToDate" as any) || "Year to Date"}
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
                        {t("exportPdf" as any) || "Export PDF"}
                    </button>
                </div>
            </div>

            {/* Top KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                <div className="glass-card rounded-2xl p-5 border border-slate-700/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-slate-400 font-medium">{t("ytdValueGrowth" as any) || "YTD Value Growth"}</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-4 font-outfit">+{formatCompactCurrency(1200000, currency, locale)}</h3>
                    <p className="text-emerald-400 text-sm font-medium mt-2 flex items-center gap-1">+28.5% <span className="text-slate-500 font-normal">vs last year</span></p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-700/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                            <DollarSign size={20} />
                        </div>
                        <p className="text-slate-400 font-medium">{t("netOperatingIncome" as any) || "Net Operating Income"}</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-4 font-outfit">{formatCurrency(stats.monthlyCashflow * 12, currency, locale)}</h3>
                    <p className="text-emerald-400 text-sm font-medium mt-2 flex items-center gap-1">+12.4% <span className="text-slate-500 font-normal">vs target</span></p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-700/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                            <CreditCard size={20} />
                        </div>
                        <p className="text-slate-400 font-medium">{t("debtPayment" as any) || "Debt Payments"}</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-4 font-outfit">{formatCurrency(stats.totalMonthlyDebtService, currency, locale)}</h3>
                    <p className="text-slate-500 text-xs mt-2">{formatCurrency(stats.totalMonthlyPrincipal, currency, locale)} straight to principal</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-700/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                            <Wallet size={20} />
                        </div>
                        <p className="text-slate-400 font-medium">{t("rentCollectionRate" as any) || "Rent Collection Rate"}</p>
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-4 font-outfit">
                        {stats.monthlyIncome > 0 ? (Math.min(100, (stats.monthlyIncome / stats.monthlyIncome) * 100).toFixed(1)) : "0"}%
                    </h3>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div className="bg-purple-500 h-1.5 rounded-full w-[100%]"></div>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">{formatCurrency(stats.monthlyIncome, currency, locale)} total expected</p>
                </div>
            </div>

            {/* Hemorrhaging Warning */}
            {stats.monthlyCashflow < 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                            <TrendingUp size={28} className="text-white rotate-180" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-rose-400 uppercase tracking-tighter flex items-center gap-2">
                                {t("hemorrhaging" as any) || "Hemorrhaging Detected"}
                            </h3>
                            <p className="text-slate-300 text-sm font-medium">
                                {stats.monthlyIncome === 0 ? t("noRentalIncomeWarning" as any) : "Monthly expenses and debt exceed income."}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-rose-400 text-3xl font-black font-outfit">
                            -{formatCurrency(Math.abs(stats.monthlyCashflow), currency, locale)}
                            <span className="text-sm font-bold text-slate-500 ml-2">/ MO</span>
                        </p>
                        <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mt-1">{t("monthlyLoss" as any) || "MONTHLY LOSS"}</p>
                    </div>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Timeline Analytics */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-outfit font-semibold text-white">{t("portfolioGrowthTimeline" as any) || "Portfolio Growth Timeline"}</h2>
                            <p className="text-xs text-slate-400">{t("portfolioGrowthSubtext" as any) || "Total Asset Value vs Equity"}</p>
                        </div>
                        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                            <option>Value & Equity</option>
                            <option>Cashflow</option>
                            <option>Debt Paydown</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}M`} />
                                <Tooltip
                                    cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '13px' }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="value" name="Total Value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                <Area yAxisId="left" type="monotone" dataKey="equity" name="Total Equity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rent Collection Analytics */}
                <div className="glass-card rounded-2xl p-6 border border-slate-700/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-outfit font-semibold text-white">{t("rentCollectionRealTime" as any) || "Rent Collection Real-Time"}</h2>
                            <p className="text-xs text-slate-400">{t("rentCollectionRealTimeSubtext" as any) || "Current Month Status (Expected vs Pending)"}</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rentCollectionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                <YAxis type="category" dataKey="property" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '12px' }}
                                />
                                <Bar dataKey="collected" name="Collected" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="pending" name="Pending" stackId="a" fill="#334155" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Accounting Integrations Section */}
            <div className="glass-card rounded-2xl border border-slate-700/40 overflow-hidden">
                <div className="bg-slate-900/80 border-b border-slate-700/40 p-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                            <ArrowRightLeft size={18} className="text-emerald-400" />
                            {t("financialDataSync" as any) || "Financial Data Sync"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">{t("financialDataSyncSubtext" as any) || "Connect Follio to your preferred accounting software for automated real-time analytics."}</p>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* QuickBooks */}
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="font-extrabold text-green-600 text-xl tracking-tight">qb</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-200">QuickBooks</h3>
                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={10} /> Connected</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-white transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Syncing operating expenses, rental income, and vendor payments daily. Last sync: <span className="text-slate-300">2 hours ago</span>
                        </p>
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700">
                            Manage Connection
                        </button>
                    </div>

                    {/* Xero */}
                    <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900/40 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#13B5EA] rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="font-extrabold text-white text-xl">X</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-200">Xero</h3>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><Link2 size={10} /> Disconnected</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                Import bank feeds, reconcile transactions, and automate P&L generation for your portfolio.
                            </p>
                        </div>
                        <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20 flex items-center justify-center gap-2">
                            Connect Xero <ExternalLink size={12} />
                        </button>
                    </div>

                    {/* AppFollio / Property Mgmt */}
                    <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900/40 relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#2D3139] rounded-xl flex items-center justify-center shadow-lg border border-slate-700">
                                        <Building2 size={24} className="text-[#00A1D6]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-200">AppFollio / Buildium</h3>
                                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><Link2 size={10} /> Disconnected</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                Import tenant rent rolls, lease expirations, and work order expenses directly into Follio.
                            </p>
                        </div>
                        <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-500/20 flex items-center justify-center gap-2">
                            Connect PM Software <ExternalLink size={12} />
                        </button>
                    </div>

                </div>
            </div>

        </motion.div>
    );
}
