"use client";

import { useEffect, useState, use } from "react";
import { RealEstateDashboard } from "@/components/dashboards/RealEstateDashboard";
import { getPortfolioStats, Property } from "@/lib/data";
import { useSettings } from "@/components/ui/settings-provider";
import { mapDbToProperty } from "@/lib/supabase-service";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioMapDashboard } from "@/components/dashboards/PortfolioMapDashboard";
import { cn } from "@/lib/utils";

export default function SharedPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = use(params);
    const { t, currency, locale } = useSettings();
    const [properties, setProperties] = useState<Property[]>([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sharedName, setSharedName] = useState("Shared Portfolio View");
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchSharedData = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // 1. Handle URL name override
                const urlParams = new URLSearchParams(window.location.search);
                const nameParam = urlParams.get("name");
                if (nameParam) {
                    setSharedName(nameParam);
                }

                // 2. Fetch via Server-side API to bypass RLS and handle schema issues
                const response = await fetch(`/api/share/p/${userId}`);
                const result = await response.json();

                if (response.ok && result.properties) {
                    const rawCount = result.properties.length;
                    // Map database snake_case columns to frontend Property shape (including financials)
                    const mapped = result.properties.map((dbProp: any) => ({
                        ...mapDbToProperty(dbProp),
                        isDemo: false
                    }));
                    const totalVal = mapped.reduce((s: number, p: Property) => s + (p.financials?.currentValue || p.financials?.purchasePrice || 0), 0);
                    if (rawCount > 0 && totalVal === 0) {
                        console.warn("[Share] Got", rawCount, "properties but total value is $0. Sample row keys:", result.properties[0] ? Object.keys(result.properties[0]) : []);
                    }
                    setProperties(mapped);
                } else {
                    if (response.ok && Array.isArray(result.properties) && result.properties.length === 0) {
                        console.warn("[Share] API returned 0 properties for user. Data may exist only in your browser (localStorage) and not in the cloud. Ensure assets are synced before sharing.");
                    } else {
                        console.error("Shared Fetch Error Response:", result);
                    }
                    setProperties([]);
                }
            } catch (error) {
                console.error("Error fetching shared portfolio:", error);
                setProperties([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSharedData();
    }, [userId]);

    const stats = getPortfolioStats(properties);

    return (
        <div className="flex w-full h-screen overflow-hidden text-slate-200 bg-slate-950 relative">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: (isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -280,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(
                    "fixed inset-y-0 left-0 w-[280px] h-full flex flex-col border-r border-slate-800/60 glass-panel bg-slate-950/95 backdrop-blur-2xl p-4 shrink-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300",
                    !isSidebarOpen && "hidden lg:flex"
                )}
            >
                <div className="flex items-center justify-between px-2 py-4 mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                borderRadius: ["20%", "40%", "20%"]
                            }}
                            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                            className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
                        >
                            <LayoutDashboard size={18} className="text-white" />
                        </motion.div>
                        <span className="font-outfit text-xl font-bold tracking-wide text-white">Follio</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => { setActiveTab("portfolio"); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'portfolio' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'}`}
                    >
                        Map View
                    </button>
                </nav>

                <div className="mt-auto p-4 border-t border-slate-800/50 flex flex-col items-center">
                    <p className="text-xs text-slate-500 text-center mb-3 font-medium">Powered by Follio</p>
                    <a
                        href="/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        Create Your Own
                    </a>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-md z-10 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-all bg-slate-800/40 rounded-lg border border-slate-700/50"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 min-w-0">
                            <span className="truncate max-w-[120px] xs:max-w-none">{sharedName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[7px] sm:text-[10px] font-black bg-blue-500/20 text-blue-400 shrink-0 border border-blue-500/20">READ-ONLY</span>
                        </h1>
                    </div>
                    <a href="/signup" target="_blank" rel="noopener noreferrer" className="hidden xs:flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all text-[10px] sm:text-xs font-medium text-slate-200 group">
                        Built with Follio
                        <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8 z-0 relative">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-medium animate-pulse">Loading shared portfolio...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                                <LayoutDashboard size={32} className="text-slate-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">No portfolio data yet</h2>
                            <p className="text-slate-400 text-sm mb-4">
                                The portfolio owner&apos;s assets may not be synced yet. Ask them to open their dashboard to sync their data.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-[1400px] mx-auto w-full">
                            {activeTab === "dashboard" && (
                                <RealEstateDashboard
                                    properties={properties}
                                    stats={stats}
                                    t={t}
                                    currency={currency}
                                    locale={locale}
                                    setActiveTab={setActiveTab}
                                    openAddModal={() => { }}
                                    removeProperty={() => { }}
                                />
                            )}
                            {activeTab === "portfolio" && (
                                <PortfolioMapDashboard
                                    properties={properties}
                                    t={t}
                                    currency={currency}
                                    locale={locale}
                                    openAddModal={() => { }}
                                    removeProperty={() => { }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
