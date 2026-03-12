"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Search, Filter, Download, Play, Pause, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    endpoint: string;
    status: number;
    duration: string;
    message: string;
    type: "info" | "error" | "success";
}

const INITIAL_LOGS: LogEntry[] = [
    { id: "1", timestamp: "2026-03-11 21:40:02", method: "GET", endpoint: "/api/properties", status: 200, duration: "142ms", message: "Successfully fetched 12 properties", type: "success" },
    { id: "2", timestamp: "2026-03-11 21:40:05", method: "POST", endpoint: "/api/analytics/track", status: 201, duration: "84ms", message: "Event tracked successfully", type: "success" },
    { id: "3", timestamp: "2026-03-11 21:40:08", method: "GET", endpoint: "/api/user/settings", status: 304, duration: "12ms", message: "Not modified", type: "info" },
    { id: "4", timestamp: "2026-03-11 21:40:12", method: "PUT", endpoint: "/api/properties/prop-123", status: 403, duration: "25ms", message: "Unauthorized access attempt", type: "error" },
    { id: "5", timestamp: "2026-03-11 21:40:15", method: "GET", endpoint: "/api/notifications", status: 200, duration: "310ms", message: "Fetched 3 new alerts", type: "success" },
];

export function ApiLogsDashboard({ t }: { t: any }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLive, setIsLive] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/system/logs');
            const data = await res.json();
            setLogs(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
        if (!isLive) return;

        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [isLive]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col space-y-6 pb-20 pr-4"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-bold text-white mb-1.5 flex items-center gap-3">
                        <Terminal className="text-emerald-500" size={28} />
                        {t("apiLogsNav") || "API Logs"}
                    </h1>
                    <p className="text-slate-400 text-sm">Real-time stream of all incoming and outgoing API traffic.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                        {isLive ? <Pause size={16} /> : <Play size={16} />}
                        {isLive ? "LIVE STREAM" : "PAUSED"}
                    </button>
                    <button className="p-2 bg-slate-900 border border-slate-700 text-slate-400 rounded-xl hover:text-white transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col flex-1 glass-card border border-slate-700/40 rounded-2xl overflow-hidden bg-slate-950/50">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Filter logs by endpoint, method..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
                            <Filter size={14} /> Advanced Filters
                        </button>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden md:block">
                        Showing last 50 entries
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-xs custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-slate-900 text-slate-500 border-b border-slate-800">
                            <tr>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Timestamp</th>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Method</th>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Endpoint</th>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Status</th>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Latency</th>
                                <th className="text-left p-3 font-semibold uppercase tracking-widest">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {logs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-300 font-medium">{log.endpoint}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {log.type === 'success' && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                {log.type === 'error' && <AlertCircle size={12} className="text-rose-500" />}
                                                {log.type === 'info' && <Info size={12} className="text-blue-500" />}
                                                <span className={log.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-500">{log.duration}</td>
                                        <td className="p-3 text-slate-400 max-w-xs truncate group-hover:text-slate-200 transition-colors">
                                            {log.message}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
