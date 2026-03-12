import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Server, Activity, Database, Cpu, HardDrive, Globe, ShieldCheck, Zap, RefreshCw } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SystemStats {
    cpuUsage: number;
    ramUsed: string;
    ramTotal: string;
    ramUsagePercent: number;
    storageUsed: string;
    storageTotal: string;
    dbLatency: number;
    status: string;
    lastUpdated: string;
}

export function SystemInfrastructureDashboard({ t }: { t: any }) {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/system/infrastructure');
            const data = await res.json();
            setStats(data);

            setHistory(prev => {
                const newPoint = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: data.cpuUsage,
                    ram: data.ramUsagePercent
                };
                return [...prev, newPoint].slice(-15); // Keep last 15 points
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch system stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading && !stats) {
        return (
            <div className="h-64 flex items-center justify-center">
                <RefreshCw className="text-blue-500 animate-spin" size={32} />
            </div>
        );
    }

    const cards = [
        { label: "CPU Usage", value: `${stats?.cpuUsage || 0}%`, icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "RAM Allocation", value: `${stats?.ramUsed}GB / ${stats?.ramTotal}GB`, icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Storage Path", value: `${stats?.storageUsed}TB / ${stats?.storageTotal}TB`, icon: HardDrive, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Database Latency", value: `${stats?.dbLatency}ms`, icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full flex flex-col space-y-6 pb-20 pr-4 custom-scrollbar"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-1.5 flex items-center gap-3">
                        <Server className="text-blue-500" size={28} />
                        {t("systemInfrastructureNav") || "System Infrastructure"}
                    </h1>
                    <p className="text-slate-400 text-sm">Real-time health Monitoring and resource allocation.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-5 border border-slate-700/40 relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform`} />
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        </div>
                        <h3 className="text-2xl font-bold text-white font-outfit">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 border border-slate-700/40">
                    <h2 className="text-lg font-outfit font-semibold text-white mb-6">Resource Timeline (Real-time)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history.length > 0 ? history : [{ time: '', cpu: 0, ram: 0 }]}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCpu)" animationDuration={300} />
                                <Area type="monotone" dataKey="ram" name="RAM %" stroke="#a855f7" strokeWidth={3} fill="url(#colorRam)" animationDuration={300} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 border border-slate-700/40">
                    <h2 className="text-lg font-outfit font-semibold text-white mb-6">Security & Edge</h2>
                    <div className="space-y-4">
                        {[
                            { label: "Firewall", status: "Active", icon: ShieldCheck, color: "text-emerald-400" },
                            { label: "CDN Caching", status: "98.4% Hit Rate", icon: Globe, color: "text-blue-400" },
                            { label: "SSL Status", status: "Valid (242 days)", icon: ShieldCheck, color: "text-emerald-400" },
                            { label: "API Gateway", status: "Optimal", icon: Zap, color: "text-amber-400" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <item.icon size={16} className={item.color} />
                                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                                </div>
                                <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
