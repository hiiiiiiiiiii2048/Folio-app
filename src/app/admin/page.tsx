"use client";

import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Shield,
    Home,
    ArrowLeft,
    Search,
    Bell,
    Settings,
    HelpCircle,
    Server,
    Database,
    Cpu,
    Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { AdminSupportDashboard } from "@/components/ui/AdminSupportDashboard";
import { SettingsDropdown } from "@/components/ui/shared";
import { cn } from "@/lib/utils";

export default function AdminPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "123123") {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword("");
        }
    };

    const [activeTab, setActiveTab] = useState("Overview");

    const { isLoaded, isSignedIn } = useUser();

    if (!isMounted || !isLoaded) return null;

    if (!isAuthenticated) {
        // ... (password form stays same)
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#06080F] text-slate-200">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-m-md p-8 rounded-3xl border border-slate-800 bg-slate-950/40 backdrop-blur-2xl z-10 relative overflow-hidden"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
                            <Shield size={24} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Admin Authorization</h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Support Portal Node 01</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ACCESS KEY"
                                className={cn(
                                    "w-full bg-slate-900/50 border rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 transition-all text-center tracking-[0.5em] font-mono",
                                    error ? "border-rose-500 ring-rose-500 text-rose-500" : "border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/50"
                                )}
                                autoFocus
                            />
                            {error && (
                                <p className="text-[10px] text-rose-500 text-center mt-2 font-bold uppercase tracking-widest animate-pulse">Invalid Authorization Key</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-[0.2em]"
                        >
                            Establish Link
                        </button>
                    </form>

                    <Link href="/" className="flex items-center justify-center gap-2 mt-8 text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft size={10} /> Exit Secure Terminal
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#06080F] text-slate-200">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
                <div className="flex flex-col items-center gap-6 z-10 max-w-sm text-center">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/30">
                        <Shield size={32} className="text-blue-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Identity Required</h2>
                        <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-relaxed">
                            A secure Clerk session must be established to access the administrative command node.
                        </p>
                    </div>
                    <SignInButton mode="modal">
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-[0.2em] mt-4">
                            Establish Clerk Identity
                        </button>
                    </SignInButton>
                    <Link href="/" className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors mt-4">
                        Return to Public Node
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-screen overflow-hidden text-slate-200 z-10 relative bg-[#06080F] font-sans">
            {/* Dark Aesthetic Overlays */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#06080F] via-slate-900/80 to-blue-900/10 z-0 pointer-events-none"></div>

            {/* Internal Admin Sidebar */}
            <aside className="w-64 flex flex-col border-r border-slate-800/60 glass-panel bg-slate-950/40 backdrop-blur-2xl p-4 shrink-0 z-50">
                <div className="flex items-center gap-3 px-2 py-4 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-outfit text-xl font-bold tracking-tight text-white leading-tight">Folio</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest -mt-0.5">Admin Console</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                    <AdminSidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} />
                    <AdminSidebarItem icon={Database} label="User Records" active={activeTab === "User Records"} onClick={() => setActiveTab("User Records")} />
                    <AdminSidebarItem icon={Network} label="System Infrastructure" active={activeTab === "System Infrastructure"} onClick={() => setActiveTab("System Infrastructure")} />
                    <AdminSidebarItem icon={Server} label="API Logs" active={activeTab === "API Logs"} onClick={() => setActiveTab("API Logs")} />
                    <AdminSidebarItem icon={Cpu} label="AI Node Monitoring" active={activeTab === "AI Node Monitoring"} onClick={() => setActiveTab("AI Node Monitoring")} />

                    <div className="pt-8 pb-2 px-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Tools</span>
                    </div>
                    <AdminSidebarItem icon={Bell} label="Mass Notification" active={activeTab === "Mass Notification"} onClick={() => setActiveTab("Mass Notification")} />
                    <AdminSidebarItem icon={Settings} label="Global Config" active={activeTab === "Global Config"} onClick={() => setActiveTab("Global Config")} />
                    <AdminSidebarItem icon={HelpCircle} label="Support Tickets" active={activeTab === "Support Tickets"} onClick={() => setActiveTab("Support Tickets")} />
                </nav>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-800/40">
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-300 transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Portfolio
                    </Link>

                    <div className="px-3 py-2">
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1.5">System Clock</p>
                        <p className="text-sm font-mono text-blue-500/80 font-bold tracking-tighter">
                            {currentTime.toLocaleTimeString([], { hour12: false })}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Admin View */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 font-bold uppercase tracking-widest">Folio</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                        <span className="text-blue-400 font-bold uppercase tracking-widest">Internal Support</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <SettingsDropdown />
                        <div className="h-4 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-lg px-2 py-1">
                            <UserButton />
                            <div className="flex flex-col pr-1">
                                <span className="text-[10px] font-bold text-white leading-tight uppercase tracking-tight">Support Node 01</span>
                                <span className="text-[9px] text-emerald-500 font-bold leading-tight">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 relative z-0">
                    <AdminSupportDashboard activeTab={activeTab} />
                </div>
            </main>
        </div>
    );
}

function AdminSidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative",
                active
                    ? "text-blue-400 bg-blue-500/5"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
        >
            <Icon size={18} className={cn("transition-colors", active ? "text-blue-500" : "text-slate-500 group-hover:text-slate-400")} />
            <span className="flex-1 text-left">{label}</span>
            {active && (
                <motion.div
                    layoutId="active-dot"
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                ></motion.div>
            )}
        </button>
    );
}
