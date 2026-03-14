"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    CreditCard,
    TrendingUp,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Mail,
    Activity,
    Shield,
    CheckCircle2,
    Clock,
    BarChart2,
    ArrowUpRight,
    UserCheck,
    AlertCircle,
    Cpu,
    Server,
    MessageSquare,
    Globe,
    ToggleLeft,
    Save,
    Send,
    Trash2,
    History,
    UserPlus,
    Bell,
    Check,
    Settings,
    HelpCircle,
    Home,
    LayoutDashboard
} from "lucide-react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Bar,
    BarChart,
    Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

const engagementData = [
    { day: "Mon", visits: 120, actives: 45 },
    { day: "Tue", visits: 150, actives: 52 },
    { day: "Wed", visits: 180, actives: 68 },
    { day: "Thu", visits: 140, actives: 48 },
    { day: "Fri", visits: 210, actives: 85 },
    { day: "Sat", visits: 90, actives: 30 },
    { day: "Sun", visits: 110, actives: 38 },
];

const mockUsers = [
    { id: "1", name: "Printsly Shop", email: "printslyshop@gmail.com", plan: "Free", visits: 1, properties: 0, health: 85, lastSeen: "3/11/2026, 10:33:21 PM", status: "idle", imageUrl: null },
    { id: "2", name: "David Sterling", email: "david@sterling-res.com", plan: "Pro", visits: 42, properties: 12, health: 94, lastSeen: "2 mins ago", status: "active", imageUrl: null },
    { id: "3", name: "Sarah Jenkins", email: "sjenkins@gmail.com", plan: "Free", visits: 8, properties: 2, health: 68, lastSeen: "5 hours ago", status: "idle", imageUrl: null },
    { id: "4", name: "Michael Chen", email: "m.chen@venture-capital.io", plan: "Enterprise", visits: 156, properties: 48, health: 88, lastSeen: "Just now", status: "active", imageUrl: null },
    { id: "5", name: "Emma Rodriguez", email: "emma.rod@outlook.com", plan: "Pro", visits: 24, properties: 5, health: 72, lastSeen: "1 day ago", status: "active", imageUrl: null },
    { id: "6", name: "Robert Wilson", email: "robert@wilson-partners.com", plan: "Free", visits: 2, properties: 1, health: 45, lastSeen: "3 days ago", status: "at-risk", imageUrl: null },
];

export function AdminSupportDashboard({ activeTab = "Overview" }: { activeTab?: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPlan, setFilterPlan] = useState("All");
    const [usersData, setUsersData] = useState<any[]>(mockUsers);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await fetch("/api/admin/users");
                const data = await response.json();

                if (response.ok && Array.isArray(data)) {
                    console.log("Admin: Successfully fetched users:", data.length);
                    setUsersData(data);
                } else {
                    const errMsg = data.error || "Failed to parse user data";
                    console.error("Admin: Error fetching users:", errMsg);
                    setFetchError(errMsg);
                    // Keep mock users as fallback but keep it marked as not live
                }
            } catch (error: any) {
                console.error("Admin: Fatal error fetching users:", error);
                setFetchError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = usersData.filter(user => {
        const name = user.name || "";
        const email = user.email || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === "All" || user.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    // Calculate real stats
    const totalUsers = usersData.length;
    const payingUsersCount = usersData.filter(u => u.plan === "Pro" || u.plan === "Enterprise").length;
    const mrrValue = usersData.reduce((acc, u) => {
        if (u.plan === "Pro") return acc + 29;
        if (u.plan === "Enterprise") return acc + 99;
        return acc;
    }, 0);

    const mrrFormatted = formatCurrency(mrrValue);

    if (activeTab === "Mass Notification") return <AdminNotificationsView />;
    if (activeTab === "Global Config") return <AdminConfigView />;
    if (activeTab === "Support Tickets") return <AdminSupportTicketsView />;

    return (
        <div className="space-y-8 pb-12">
            <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-outfit font-bold text-white mb-1">Folio Overview</h1>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Performance Matrix</p>
                                    {fetchError ? (
                                        <span className="text-[8px] font-black text-rose-500 uppercase bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Sync Error</span>
                                    ) : !isLoading && usersData !== mockUsers ? (
                                        <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Live Sync Active</span>
                                    ) : (
                                        <span className="text-[8px] font-black text-amber-500 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Demo Mode</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-800 flex items-center gap-2">
                                    <BarChart2 size={12} /> System Report
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Users" value={totalUsers.toString()} trend="+12.4%" icon={Users} color="blue" />
                            <StatCard label="Paying MRR" value={mrrFormatted} trend={`${payingUsersCount} users`} icon={CreditCard} color="emerald" />
                            <StatCard label="Engagement" value="72.4%" trend="+2.1%" icon={Activity} color="purple" />
                            <StatCard label="Open Tickets" value="24" trend="-5.2%" icon={AlertCircle} color="amber" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800/60 relative overflow-hidden bg-slate-950/20 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Traffic (7D)</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visits</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={engagementData}>
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                            <YAxis hide domain={[0, 'auto']} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#f8fafc' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm space-y-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Architecture</h3>
                                <div className="space-y-5">
                                    <ProgressItem label="Server Capacity" value={65} color="bg-blue-500" />
                                    <ProgressItem label="Database Load" value={24} color="bg-emerald-500" />
                                    <ProgressItem label="Storage usage" value={88} color="bg-amber-500" />
                                </div>
                                <div className="pt-6 border-t border-slate-800/60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Clusters 100% UP</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-2 font-mono italic">Node: us-east-1-main</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "User Records" && (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-outfit font-bold text-white">Registered Folio Users</h1>
                                <span className="bg-slate-800 text-slate-400 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-slate-700">
                                    {usersData.length}
                                </span>
                                {fetchError && (
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                        <AlertCircle size={10} /> {fetchError}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search email or name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black tracking-widest focus:outline-none focus:border-blue-500 transition-all w-64 text-slate-300"
                                    />
                                </div>
                                <select
                                    value={filterPlan}
                                    onChange={(e) => setFilterPlan(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all text-slate-400"
                                >
                                    <option value="All">All Plans</option>
                                    <option value="Free">Free</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl border border-slate-800/60 bg-[#0A0C14]/80 overflow-hidden shadow-2xl relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Registry...</span>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-900/30">
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Props</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Visits</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engagement</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Activity</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                                        <Search size={32} className="text-slate-600 mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active entities detected in node</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-blue-500/5 transition-colors group cursor-pointer"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-sm font-black shadow-lg overflow-hidden shrink-0"
                                                            style={{ background: user.imageUrl ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                                        >
                                                            {user.imageUrl ? (
                                                                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-slate-900 text-xs font-black">
                                                                    {(user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-white leading-tight truncate">{user.name}</div>
                                                            <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                                                            user.status === "active" ? "bg-emerald-500 shadow-emerald-500/50" :
                                                                "bg-slate-700 shadow-slate-700/20"
                                                        )}></div>
                                                        <span className={cn(
                                                            "text-[10px] font-bold capitalize",
                                                            user.status === "active" ? "text-slate-200" : "text-slate-500"
                                                        )}>
                                                            {user.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-tighter",
                                                        user.plan === "Enterprise" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                            user.plan === "Pro" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                                "bg-slate-800/50 text-slate-500 border-slate-700/50"
                                                    )}>
                                                        {user.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center font-bold text-xs text-slate-300">
                                                    {user.properties}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-white">{user.visits}</span>
                                                        <span className="text-[9px] font-bold text-slate-600 uppercase">Total</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                                                            <span className="text-slate-500">Health</span>
                                                            <span className={cn(
                                                                user.health > 80 ? "text-emerald-400" :
                                                                    user.health > 60 ? "text-amber-400" : "text-rose-400"
                                                            )}>{user.health}%</span>
                                                        </div>
                                                        <div className="w-24 h-1 bg-slate-900 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${user.health}%` }}
                                                                className={cn(
                                                                    "h-full rounded-full",
                                                                    user.health > 80 ? "bg-emerald-500" :
                                                                        user.health > 60 ? "bg-amber-500" : "bg-rose-500"
                                                                )}
                                                            ></motion.div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-[10px] text-slate-400 font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={12} className="text-slate-600" />
                                                        {user.lastSeen}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/dashboard?viewUserId=${user.id}`}
                                                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all shadow-sm"
                                                            title="Inspect Node"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </Link>
                                                        <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all shadow-sm">
                                                            <Mail size={14} />
                                                        </button>
                                                        <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all shadow-sm">
                                                            <MoreVertical size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <AnimatePresence>
                            {selectedUser && (
                                <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}



                {activeTab === "AI Node Monitoring" && (
                    <motion.div
                        key="ai-monitoring"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-2xl font-outfit font-bold text-white">AI Neural Network</h1>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Generative Inference Monitor</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-6">
                                <div className="glass-card p-6 rounded-3xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Endpoints</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800/60">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                                    <Cpu size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-200">Gemini 2.5 Pro</span>
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Primary Node</span>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800/60 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-800 rounded-xl text-slate-500">
                                                    <Cpu size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-500">GPT-4o (Manual)</span>
                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Redundant</span>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-6 rounded-3xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Quota Load</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-2xl font-bold text-white tracking-tighter">8,421</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Hits</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-indigo-400">84.2%</p>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Monthly Limit 10K</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 w-[84.2%] transition-all duration-1000"></div>
                                        </div>
                                        <p className="text-[9px] text-slate-600 mt-2 italic font-mono uppercase">System resets in: T-74:12:08</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 glass-card p-6 rounded-3xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm overflow-hidden relative group">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Inference Latency Spectrum</h3>
                                <div className="h-56 flex items-end gap-1.5 px-4 mb-4">
                                    {[...Array(32)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${20 + Math.random() * 80}%` }}
                                            transition={{ repeat: Infinity, duration: 2 + Math.random(), repeatType: "reverse", delay: i * 0.03 }}
                                            className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500/10 border-t border-indigo-500/30 rounded-t-sm"
                                        ></motion.div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800/60">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Average P50</p>
                                        <p className="text-xl font-bold text-white tracking-tighter">420ms</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Average P99</p>
                                        <p className="text-xl font-bold text-indigo-400 tracking-tighter">1.2s</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Error Freq</p>
                                        <p className="text-xl font-bold text-emerald-400 tracking-tighter">0.02%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {(activeTab === "System Infrastructure" || activeTab === "API Logs") && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[60vh] flex flex-col items-center justify-center text-center opacity-40"
                    >
                        <Server size={42} className="text-slate-700 mb-6" />
                        <h2 className="text-xl font-black text-slate-500 uppercase tracking-[0.4em]">Node Encrypted</h2>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-3 px-10 max-w-sm leading-relaxed">
                            Access restricted to hardware administrator Level 4. Contact system architecture for biometric clearance.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


function UserDetailDrawer({ user, onClose }: { user: any; onClose: () => void }) {
    const healthColor =
        user.health > 80 ? "text-emerald-400" :
            user.health > 60 ? "text-amber-400" : "text-rose-400";
    const healthBg =
        user.health > 80 ? "bg-emerald-500" :
            user.health > 60 ? "bg-amber-500" : "bg-rose-500";
    const healthLabel =
        user.health > 80 ? "Excellent" :
            user.health > 60 ? "Fair" : "At Risk";

    const ltv = user.totalValue > 0
        ? ((user.totalDebt / user.totalValue) * 100).toFixed(1)
        : "N/A";

    const formatK = (v: number) => {
        if (!v) return "$0";
        if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
        return `$${v.toFixed(0)}`;
    };

    const props: any[] = user.propertyDetails || [];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="relative w-full max-w-lg bg-[#080A12] border-l border-white/5 h-full flex flex-col shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-sm font-black shadow-lg overflow-hidden shrink-0"
                            style={{ background: user.imageUrl ? "transparent" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                        >
                            {user.imageUrl ? (
                                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-sm font-black">
                                    {(user.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">{user.name}</h3>
                            <p className="text-[11px] text-slate-500 truncate max-w-48">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">

                    {/* —— LIVE PORTFOLIO HEALTH BANNER —— */}
                    <div className="mx-5 mt-5 p-4 rounded-2xl bg-slate-900/50 border border-white/5 relative overflow-hidden">
                        <div
                            className={`absolute inset-x-0 top-0 h-0.5 ${healthBg}`}
                            style={{ width: `${user.health}%` }}
                        />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Live Portfolio Health</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-bold ${healthColor}`}>{user.health}</span>
                                    <span className="text-slate-500 text-sm font-bold">/ 100</span>
                                </div>
                                <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${healthColor}`}>{healthLabel}</p>
                            </div>
                            <div className="w-20 h-20 relative shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                                    <circle
                                        cx="18" cy="18" r="15" fill="none"
                                        stroke={user.health > 80 ? '#10b981' : user.health > 60 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="3"
                                        strokeDasharray={`${(user.health / 100) * 94.2} 94.2`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-sm font-bold ${healthColor}`}>{user.health}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* —— FINANCIAL METRICS —— */}
                    <div className="px-5 mt-4 grid grid-cols-3 gap-3">
                        {[
                            { label: "Portfolio Value", value: formatK(user.totalValue), icon: TrendingUp, color: "text-blue-400" },
                            { label: "Total Debt", value: formatK(user.totalDebt), icon: CreditCard, color: "text-rose-400" },
                            { label: "Net Cashflow", value: formatK(user.netCashflow), icon: Activity, color: user.netCashflow >= 0 ? "text-emerald-400" : "text-rose-400" },
                        ].map((m, i) => (
                            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-xl p-3">
                                <m.icon size={13} className={`${m.color} mb-1.5`} />
                                <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold leading-tight mt-0.5">{m.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* —— KEY RATIOS —— */}
                    <div className="px-5 mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Portfolio LTV</span>
                            <span className="text-sm font-bold text-white">{ltv}{ltv !== "N/A" ? "%" : ""}</span>
                        </div>
                        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Properties</span>
                            <span className="text-sm font-bold text-white">{user.properties}</span>
                        </div>
                        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Rent</span>
                            <span className="text-sm font-bold text-emerald-400">{formatK(user.monthlyRent)}</span>
                        </div>
                        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Exp.</span>
                            <span className="text-sm font-bold text-rose-400">{formatK(user.monthlyExpenses)}</span>
                        </div>
                    </div>

                    {/* —— PROPERTIES BREAKDOWN —— */}
                    {props.length > 0 && (
                        <div className="px-5 mt-5">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Home size={12} className="text-blue-500" /> Property Registry ({props.length})
                            </h4>
                            <div className="space-y-2">
                                {props.map((p: any, idx: number) => {
                                    const pLtv = p.current_value > 0 ? Math.round((p.debt / p.current_value) * 100) : 0;
                                    const pHealth = p.current_value > 0 ? (pLtv < 65 ? 90 : pLtv < 80 ? 70 : 45) : 100;
                                    const statusColors: Record<string, string> = {
                                        "Active": "text-emerald-400",
                                        "Rented": "text-blue-400",
                                        "Renovation": "text-amber-400",
                                        "Vacant": "text-rose-400",
                                    };
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                                                {p.image ? (
                                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Home size={14} className="text-slate-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                                                <p className={`text-[10px] font-bold ${statusColors[p.status] || 'text-slate-500'}`}>{p.status}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-bold text-white">{pLtv}% LTV</p>
                                                <p className="text-[9px] text-slate-600">{formatK(p.current_value)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {props.length === 0 && (
                        <div className="mx-5 mt-5 p-6 rounded-xl bg-slate-900/20 border border-white/5 text-center">
                            <Home size={28} className="text-slate-700 mx-auto mb-2" />
                            <p className="text-[11px] text-slate-600 uppercase tracking-widest font-bold">No properties in portfolio</p>
                        </div>
                    )}

                    {/* —— ACCOUNT INFO —— */}
                    <div className="px-5 mt-5 mb-5">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Account Node</h4>
                        <div className="bg-slate-900/30 rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-[11px] text-slate-400">Clerk ID</span>
                                <span className="text-[10px] font-mono text-slate-600 truncate max-w-36">{user.id}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-[11px] text-slate-400">Plan</span>
                                <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                                    user.plan === "Enterprise" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
                                        user.plan === "Pro" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                                            "text-slate-500 bg-slate-800/50 border-slate-700/50"
                                )}>{user.plan}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-[11px] text-slate-400">Last Sign-in</span>
                                <span className="text-[10px] text-slate-500">{user.lastSeen}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-[11px] text-slate-400">Status</span>
                                <div className="flex items-center gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full",
                                        user.status === "active" ? "bg-emerald-500" :
                                            user.status === "at-risk" ? "bg-rose-500" : "bg-slate-600"
                                    )} />
                                    <span className="text-[10px] text-slate-400 capitalize">{user.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-white/5 flex gap-3 bg-slate-900/20 shrink-0">
                    <Link
                        href={`/dashboard?viewUserId=${user.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center transition-all border border-white/5"
                    >
                        View Portfolio
                    </Link>
                    <button className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
                        Send Message
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: 'blue' | 'emerald' | 'purple' | 'amber' }) {
    const colors = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    };

    return (
        <div className="glass-card p-6 rounded-3xl border border-slate-800/60 bg-slate-950/20 backdrop-blur-sm transition-all hover:bg-slate-900/40 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl border", colors[color])}>
                    <Icon size={18} />
                </div>
                <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter", trend.startsWith('+') ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10")}>
                    {trend}
                </span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{value}</h3>
        </div>
    );
}

function ProgressItem({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pr-1">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-200">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
}

// --- SUB-VIEWS ---

function AdminNotificationsView() {
    const [scope, setScope] = useState("global");
    const [urgency, setUrgency] = useState("info");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const urgencyColors = {
        info: { active: "bg-blue-600/20 text-blue-400 border-blue-500/40", dot: "bg-blue-500" },
        warning: { active: "bg-amber-600/20 text-amber-400 border-amber-500/40", dot: "bg-amber-500" },
        critical: { active: "bg-rose-600/20 text-rose-400 border-rose-500/40", dot: "bg-rose-500" },
    };

    const scopeLabels: Record<string, string> = {
        global: "Global (All Registered Users)",
        pro: "Pro Plan Subscribers",
        inactive: "Inactive Users (> 30 days)",
        new: "New Signups (Last 7 days)",
    };

    // Fetch broadcast history
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch("/api/admin/broadcast");
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error("Failed to fetch history:", e);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleTransmit = async () => {
        if (!subject.trim() || !message.trim()) {
            setError("Subject and message are required.");
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message, urgency, scope }),
            });

            const data = await res.json();

            if (res.status === 401) {
                throw new Error("Unauthorized. Please ensure you are signed into your Follio account.");
            }

            if (!res.ok) throw new Error(data.error || "Broadcast mission failed at terminal.");

            setSent(true);
            setSubject("");
            setMessage("");
            await fetchHistory();
            setTimeout(() => setSent(false), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsSending(false);
        }
    };

    const urgencyConfig = urgencyColors[urgency as keyof typeof urgencyColors];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-2 flex items-center gap-3">
                        <Bell className="text-indigo-400" />
                        Mass Notifications
                    </h1>
                    <p className="text-slate-400">Broadcast system-wide alerts or targeted messages to your users.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        error ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    )} />
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        error ? "text-rose-400" : "text-emerald-400"
                    )}>
                        {error ? "Transmission Interference" : "Dispatch System Online"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Compose Form --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-slate-700/40 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Send size={100} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-6">Dispatch Broadcast</h3>
                        <div className="space-y-5">
                            {/* Receiver Scope */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Receiver Scope</label>
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-200"
                                >
                                    {Object.entries(scopeLabels).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Alert Urgency</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["info", "warning", "critical"] as const).map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => setUrgency(u)}
                                            className={cn(
                                                "py-2.5 rounded-xl border text-xs font-bold capitalize transition-all",
                                                urgency === u
                                                    ? urgencyColors[u].active
                                                    : "border-slate-700 bg-slate-900 text-slate-500 hover:bg-slate-800"
                                            )}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Platform Update: New AI Features"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-200 placeholder:text-slate-600"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Message Payload</label>
                                <textarea
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your broadcast message here..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-200 resize-none placeholder:text-slate-600"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}

                            {/* Transmit Button */}
                            <button
                                onClick={handleTransmit}
                                disabled={isSending || sent}
                                className={cn(
                                    "w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg group",
                                    sent
                                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-600/10"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Transmitting...
                                    </>
                                ) : sent ? (
                                    <>
                                        <Check size={18} /> Broadcast Sent!
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        Initiate Transmission
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Broadcast History --- */}
                <div className="lg:col-span-2">
                    <div className="glass-card rounded-3xl border border-slate-700/40 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                <History size={20} className="text-slate-500" />
                                Broadcast History
                            </h3>
                            <button
                                onClick={fetchHistory}
                                className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                            {historyLoading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3">
                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading transmission logs...</span>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 opacity-40">
                                    <Bell size={36} className="text-slate-600" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No broadcasts dispatched yet</p>
                                </div>
                            ) : (
                                history.map((item) => {
                                    const urg = item.urgency as keyof typeof urgencyColors;
                                    const dotClass = urgencyColors[urg]?.dot || "bg-slate-500";
                                    return (
                                        <div key={item.id} className="p-6 hover:bg-white/5 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px]", dotClass)} />
                                                    <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors truncate">{item.subject}</h4>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-4">
                                                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-4 ml-5 line-clamp-2">{item.message}</p>
                                            <div className="flex items-center gap-6 ml-5 flex-wrap">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    <Users size={14} /> {item.recipients?.toLocaleString()} Recipients
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
                                                    <CheckCircle2 size={14} /> Delivered
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-tighter",
                                                    urg === "critical" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        urg === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {item.urgency}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                                                    {scopeLabels[item.scope] || item.scope}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminConfigView() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-2 flex items-center gap-3">
                        <Settings className="text-slate-400" />
                        Global Configuration
                    </h1>
                    <p className="text-slate-400">Modify platform behavior, feature flags, and system limits in real-time.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-3">
                    <Save size={18} /> Deploy Changes
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 rounded-3xl border border-slate-700/40 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Infrastructure Control</h3>
                    <div className="space-y-6">
                        <ConfigToggle label="Maintenance Mode" description="Disable public access to all dashboards" />
                        <ConfigToggle label="New User Registration" description="Allow new accounts to be established" checked />
                        <ConfigToggle label="Public Sharing Link" description="Global enable/disable shared views" checked />
                        <ConfigToggle label="Internal Debug Mode" description="Enable verbose server-side logging" />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-700/40 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">AI Engine Parameters</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-300">Free AI Search Token Pool</label>
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">15 Credits</span>
                            </div>
                            <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            <p className="text-[10px] text-slate-500 mt-2">Maximum free hits before pro-lockout</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-2">Default Gemini Node</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all text-slate-400">
                                <option>gemini-2.5-flash (Standard)</option>
                                <option>gemini-1.5-pro (High Detail)</option>
                                <option>gemini-ultra-pro (Internal Test)</option>
                            </select>
                        </div>
                        <ConfigToggle label="Strict JSON Validation" description="Verify AI output schemas before returning" checked />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-700/40 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Global Localization</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-2">Primary Currency Node</label>
                            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 transition-all text-slate-400">
                                <option>USD ($) - United States</option>
                                <option>EUR (€) - European Union</option>
                                <option>GBP (£) - United Kingdom</option>
                            </select>
                        </div>
                        <ConfigToggle label="Automatic Geolocation" description="Detect user locale from IP address" checked />
                        <ConfigToggle label="Allow Regional Overrides" description="Let users choose their own dashboard locale" checked />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfigToggle({ label, description, checked = false }: { label: string, description: string, checked?: boolean }) {
    const [isActive, setIsActive] = useState(checked);
    return (
        <div className="flex items-start justify-between gap-4 group cursor-pointer" onClick={() => setIsActive(!isActive)}>
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{label}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{description}</p>
            </div>
            <div className={cn(
                "w-10 h-5 rounded-full relative transition-all border shrink-0",
                isActive ? "bg-indigo-600 border-indigo-400" : "bg-slate-800 border-slate-700"
            )}>
                <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm transition-all",
                    isActive ? "right-1" : "left-1"
                )}></div>
            </div>
        </div>
    );
}

function AdminSupportTicketsView() {
    const tickets = [
        { id: "T-4821", user: "Sarah Jenkins", email: "sjenkins@gmail.com", issue: "AI Search failing on Zillow URLs", priority: "High", status: "Open", time: "12m ago" },
        { id: "T-4819", user: "Michael Chen", email: "m.chen@venture-capital.io", issue: "Request for Enterprise plan custom limits", priority: "Medium", status: "In Progress", time: "1h ago" },
        { id: "T-4815", user: "Robert Wilson", email: "robert@wilson-partners.com", issue: "Unable to delete old portfolio node", priority: "Low", status: "Resolved", time: "4h ago" },
    ];
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-2 flex items-center gap-3">
                        <HelpCircle className="text-blue-400" />
                        Support Command Center
                    </h1>
                    <p className="text-slate-400">Review and resolve issues reported by the Folio community.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-slate-700 flex items-center gap-2">
                        <Filter size={16} /> All Tickets
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                        New Ticket
                    </button>
                </div>
            </div>
            <div className="glass-card rounded-3xl border border-slate-700/40 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800/50 bg-slate-950/20">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ticket ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requester</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issue Description</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Priority</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Command</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-5 font-mono text-xs text-blue-400 font-bold">{ticket.id}</td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{ticket.user}</span>
                                        <span className="text-[10px] text-slate-500">{ticket.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs text-slate-300 font-medium">{ticket.issue}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                                        ticket.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                            ticket.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-slate-800 text-slate-500 border-slate-700"
                                    )}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            ticket.status === "Open" ? "bg-rose-500 animate-pulse" :
                                                ticket.status === "In Progress" ? "bg-blue-500" : "bg-emerald-500"
                                        )}></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ticket.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-[10px] text-slate-500 font-medium">
                                    {ticket.time}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                                            <MessageSquare size={14} />
                                        </button>
                                        <button className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                                            <Check size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unresolved</p>
                        <p className="text-xl font-bold text-white">8 Units</p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Resolution</p>
                        <p className="text-xl font-bold text-white">4.2 Hours</p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</p>
                        <p className="text-xl font-bold text-white">Optimal</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
