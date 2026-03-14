import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Building2, PieChart, TrendingUp, BarChart3, Map as MapIcon, Clock, Activity, Bell, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/ui/shared";
import { formatCurrency, formatCompactCurrency, cn } from "@/lib/utils";
import { Property } from "@/lib/data";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const MapWidget = dynamic<any>(() => import("@/components/ui/MapWidget"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-900/50 flex flex-col gap-4 items-center justify-center rounded-2xl border border-slate-800 animate-pulse">
            <MapIcon size={32} className="text-slate-600 mb-2" />
        </div>
    )
});

const LiveFeedItem = ({ text, time, icon: Icon, color }: any) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-700/50 group">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-lg", color)}>
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{text}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">{time}</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 animate-pulse"></div>
    </div>
);

const formatTimeAgo = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "Recently";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 0) return "Just now";
    if (seconds < 60) return `Just now`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 172800) return `Yesterday`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function LiveActivityFeed({ properties }: { properties: Property[] }) {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/user/notifications?limit=5")
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setNotifications(d); })
            .catch(() => { });
    }, []);

    // Derive real events from user's actual properties
    const propertyEvents: { text: string; time: Date; icon: any; color: string }[] = [];

    const sorted = [...(properties || [])]
        .filter(p => p && !p.isDemo)
        .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
        });

    sorted.slice(0, 2).forEach(p => {
        const createdAt = (p as any).createdAt || (p as any).created_at ? new Date((p as any).createdAt || (p as any).created_at) : new Date(Date.now() - Math.random() * 86400000 * 7);
        propertyEvents.push({
            text: `"${p.name}" added to your portfolio`,
            time: createdAt,
            icon: Plus,
            color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        });
    });

    // Value changes — properties worth more than purchase price
    properties.filter(p => !p.isDemo && (p.financials?.currentValue || 0) > (p.financials?.purchasePrice || 0)).slice(0, 1).forEach(p => {
        const gain = (((p.financials.currentValue || 0) - (p.financials.purchasePrice || 0)) / (p.financials.purchasePrice || 1) * 100).toFixed(1);
        propertyEvents.push({
            text: `${p.name} is up ${gain}% vs. purchase price`,
            time: new Date(Date.now() - 3600000 * 5),
            icon: TrendingUp,
            color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        });
    });

    // Cash flow events
    const cashflowProps = properties.filter(p => !p.isDemo && (p.financials?.monthlyRent || 0) > 0);
    if (cashflowProps.length > 0) {
        const totalRent = cashflowProps.reduce((s, p) => s + (p.financials?.monthlyRent || 0), 0);
        propertyEvents.push({
            text: `${formatCompactCurrency(totalRent, "USD", "en")}/mo rent across ${cashflowProps.length} propert${cashflowProps.length > 1 ? "ies" : "y"}`,
            time: new Date(Date.now() - 86400000),
            icon: BarChart3,
            color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        });
    }

    // Merge real notifications
    const notifEvents = notifications.map(n => ({
        text: n.title || n.message,
        time: new Date(n.created_at),
        icon: Bell,
        color: n.urgency === "critical"
            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            : n.urgency === "warning"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    }));

    const allEvents = [...notifEvents, ...propertyEvents]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 8);

    const displayEvents = allEvents.length > 0 ? allEvents : [{
        text: "Add your first property to see live activity here",
        time: new Date(),
        icon: ArrowUpRight,
        color: "bg-slate-700/50 text-slate-400 border border-slate-600/30",
    }];

    return (
        <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
            {displayEvents.map((event, i) => (
                <LiveFeedItem key={i} text={event.text} time={formatTimeAgo(event.time)} icon={event.icon} color={event.color} />
            ))}
        </div>
    );
}

interface RealEstateDashboardProps {
    properties: Property[];
    stats: any;
    t: any;
    currency: string;
    locale: string;
    setActiveTab?: (tab: string) => void;
    openAddModal?: () => void;
    removeProperty?: (id: string | number) => void;
    editProperty?: (prop: Property) => void;
}

export function RealEstateDashboard({
    properties,
    stats,
    t,
    currency,
    locale,
    setActiveTab,
    openAddModal,
    removeProperty,
    editProperty
}: RealEstateDashboardProps) {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
        return () => clearInterval(timer);
    }, []);

    const totalVal = stats?.totalValue ?? stats?.projectedTotalValue ?? 0;
    const chartData = totalVal > 0
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m, i) => ({
            month: m,
            value: (totalVal / 1e6) * (0.7 + 0.3 * (i / 7)),
            cashflow: stats?.monthlyCashflow ?? 0,
        }))
        : [{ month: "Now", value: 0, cashflow: 0 }];
    const chartMax = totalVal > 0 ? Math.ceil((totalVal * 1.2) / 1e6) : 1;

    return (
        <motion.div
            key="dashboard-realestate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto space-y-4 sm:space-y-8 pb-10"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-white mb-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                        {t("dashboardHeader")}
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-full px-3 py-1 scale-90 sm:scale-95 origin-left">
                            <Clock size={12} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">{currentTime} LIVE</span>
                        </div>
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm">{t("dashboardSubtext")} <span className="text-emerald-400 font-medium">12.4%</span> {t("thisQuarter")}</p>
                </div>
            </div>

            {properties.some(p => p.isDemo) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <Activity size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{t("viewingDemo")}</p>
                            <p className="text-xs text-slate-400">{t("demoDataDesc")}</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                        {t("addRealAsset")}
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatCard
                    title={t("totalPropertyValue")}
                    supertext={`${t("projectedWithPipeline")}: ${formatCurrency(stats.projectedTotalValue, currency, locale)}`}
                    value={formatCurrency(stats.totalValue, currency, locale)}
                    subtext={`${t("liquidation30Day")}: ${formatCurrency(stats.totalValue * 0.8, currency, locale)}`}
                    trend="+5.2%"
                    icon={Building2}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title={t("totalEquity")}
                    supertext={`${t("projectedWithPipeline")}: ${formatCurrency(stats.projectedEquity, currency, locale)}`}
                    value={formatCurrency(stats.equity, currency, locale)}
                    trend="+8.1%"
                    icon={PieChart}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    title={t("totalDebt")}
                    supertext={`${t("projectedWithPipeline")}: ${formatCurrency(stats.projectedTotalDebt, currency, locale)}`}
                    value={formatCurrency(stats.totalDebt, currency, locale)}
                    trend="-2.4%"
                    icon={TrendingUp}
                    color="text-amber-400"
                    bg="bg-amber-500/10"
                    trendDown
                />
                <StatCard
                    title={t("monthlyCashflow")}
                    supertext={`${t("projectedWithPipeline")}: ${formatCurrency(stats.projectedMonthlyCashflow, currency, locale)}`}
                    value={formatCurrency(stats.monthlyCashflow, currency, locale)}
                    trend="+14.5%"
                    icon={BarChart3}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-outfit font-semibold text-white">{t("portfolioValueTime")}</h2>
                        <div className="flex gap-2">
                            {["1M", "3M", "6M", "1Y", "ALL"].map(k => (
                                <button key={k} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors", k === "1Y" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50")}>
                                    {k}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] min-h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, chartMax]}
                                    tickFormatter={(val) => {
                                        const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$';
                                        return chartMax >= 1 ? `${sym}${val}M` : `${sym}${val}`;
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#bae6fd' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/30 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-outfit font-semibold text-white">{t("activePipeline")}</h2>
                        <button
                            onClick={() => setActiveTab?.("pipeline")}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                            {t("viewAll")}
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {properties.slice(0, 5).map((prop) => (
                            <div
                                key={prop.id}
                                onClick={() => editProperty?.(prop)}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer group relative"
                            >
                                <img
                                    src={prop.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                                    alt={prop.name}
                                    className="w-12 h-12 rounded-lg object-cover shadow-md"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800";
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors pr-6">{prop.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-slate-400 truncate text-ellipsis">{prop.type === "Multi-unit" ? t("multiUnit") : prop.type === "Multi-family" ? t("multifamily") : prop.type === "Duplex" ? t("duplex") : prop.type === "Condo" ? t("condo") : prop.type === "Commercial" ? t("commercial") : t("singleFamily")} {prop.units && prop.units > 1 && <span className="text-slate-500">({prop.units} {(t("numberOfUnits") || "Units").split(' ')[0]})</span>}</p>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm",
                                            ["Incoming", "Incoming Asset"].includes(prop.status) ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                                                prop.status === "Renovation" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                                                    "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                        )}>
                                            {prop.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeProperty?.(prop.id); }}
                                    className="absolute top-2 right-2 p-1.5 bg-rose-500/10 text-rose-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20"
                                    title={t("removeAsset")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => openAddModal?.()}
                        className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 font-medium text-sm hover:text-white hover:border-slate-500 hover:bg-slate-800/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> {t("addToPipeline")}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mini Map Section */}
                <div className="glass-card rounded-2xl border border-slate-700/30 overflow-hidden flex flex-col min-h-[350px] sm:min-h-[400px]">
                    <div className="p-6 border-b border-slate-800/40 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                                <MapIcon size={18} className="text-blue-400" />
                                {t("portfolioMapHeader")}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Quick geographic overview of assets</p>
                        </div>
                        <button
                            onClick={() => setActiveTab?.("map")}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors border border-slate-700"
                        >
                            <MapIcon size={16} />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <MapWidget properties={properties} activeFilter="all" />
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="glass-card rounded-2xl border border-slate-700/30 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-6 border-b border-slate-800/40 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-emerald-400" />
                                Live Portfolio Activity
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Real-time alerts and portfolio events</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <LiveActivityFeed properties={properties} />
                </div>
            </div>
        </motion.div >
    );
}
