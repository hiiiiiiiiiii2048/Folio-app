"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    BarChart3,
    Briefcase,
    Building2,
    ChevronRight,
    Home,
    LayoutDashboard,
    Map as MapIcon,
    PieChart,
    Plus,
    Search,
    Settings,
    TrendingUp,
    Users,
    Bot,
    Share2,
    Menu,
    X,
    Shield,
    StickyNote,
    CreditCard,
    Server,
    Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { MOCK_PROPERTIES, getPortfolioStats, Property, PropertyStatus } from "@/lib/data";
import { PipelineColumn, SidebarItem, StatCard, SettingsDropdown, AnimatedLogo, NotificationDropdown, CloudSyncStatus } from "@/components/ui/shared";
import { useSettings } from "@/components/ui/settings-provider";
import { AddAssetModal } from "@/components/ui/add-asset-modal";
import { EditAssetModal } from "@/components/ui/EditAssetModal";
import { UserButton, useUser } from "@clerk/nextjs";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { RealEstateDashboard } from "@/components/dashboards/RealEstateDashboard";
import { CompanyDashboard } from "@/components/dashboards/CompanyDashboard";
import { StocksDashboard } from "@/components/dashboards/StocksDashboard";
import { CollectionDashboard } from "@/components/dashboards/CollectionDashboard";
import { PortfolioMapDashboard } from "@/components/dashboards/PortfolioMapDashboard";
import { ReportsDashboard } from "@/components/dashboards/ReportsDashboard";
import { CollaboratorsDashboard } from "@/components/dashboards/CollaboratorsDashboard";
import { AgentsDashboard } from "@/components/dashboards/AgentsDashboard";
import { BillingDashboard } from "@/components/dashboards/BillingDashboard";
import { SystemInfrastructureDashboard } from "@/components/dashboards/SystemInfrastructureDashboard";
import { ApiLogsDashboard } from "@/components/dashboards/ApiLogsDashboard";
import { FeatureRequestPopup } from "@/components/ui/FeatureRequestPopup";
import { SharePortfolioModal } from "@/components/ui/SharePortfolioModal";
import { PortfolioHealthModal } from "@/components/ui/PortfolioHealthModal";
import { TutorialOverlay } from "@/components/ui/TutorialOverlay";
import { NotesSection } from "@/components/dashboards/NotesSection";
import { supabaseService, mapPropertyToDb } from "@/lib/supabase-service";
import { supabase } from "@/lib/supabase";

const performanceData = [
    { month: "Jan", value: 1.2, cashflow: 8500 },
    { month: "Feb", value: 1.25, cashflow: 8800 },
    { month: "Mar", value: 1.28, cashflow: 8800 },
    { month: "Apr", value: 1.35, cashflow: 9200 },
    { month: "May", value: 1.48, cashflow: 11000 },
    { month: "Jun", value: 1.55, cashflow: 11500 },
    { month: "Jul", value: 1.62, cashflow: 12200 },
    { month: "Aug", value: 1.7, cashflow: 12500 },
];

function DashboardContent() {
    const { user, isLoaded } = useUser();
    const searchParams = useSearchParams();
    const viewUserId = searchParams.get("viewUserId");
    const effectiveUserId = viewUserId || user?.id;

    const [activeTab, setActiveTab] = useState("dashboard");
    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
    const [initialStatus, setInitialStatus] = useState<PropertyStatus | undefined>(undefined);
    const [isMounted, setIsMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'error'>('synced');

    useEffect(() => {
        setIsMounted(true);
        if (isLoaded) {
            if (effectiveUserId) {
                const fetchFromSupabase = async () => {
                    console.log(`[Persistence] Fetching for user: ${effectiveUserId}`);
                    setSyncStatus('loading');
                    setDbError(null);

                    // 1. Pre-load from LocalStorage for instant UI
                    const CACHE_KEY = `folio_props_v2_${effectiveUserId}`; // Versioned key to force purge old data
                    const stored = localStorage.getItem(CACHE_KEY);
                    let localData: Property[] = [];
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                // STRICT FILTER: Never load demo data from cache
                                localData = parsed.filter(p => !p.isDemo && !p.id.startsWith('prop-'));

                                if (localData.length > 0) {
                                    console.log(`[Persistence] Initializing with ${localData.length} ACTUAL assets from LocalStorage`);
                                    setProperties(localData);
                                    setIsLoading(false);
                                }
                            }
                        } catch (e) {
                            console.error("[Persistence] LocalStorage Parse Error:", e);
                        }
                    }

                    try {
                        let data: Property[] | null = null;
                        try {
                            data = await supabaseService.getProperties(effectiveUserId);
                        } catch (supaErr: any) {
                            if (supaErr?.code === 'PGRST205' || supaErr?.message?.includes('schema')) {
                                console.log(`[Persistence] Supabase schema error, trying /api/user/properties...`);
                                const res = await fetch('/api/user/properties');
                                if (res.ok) {
                                    const json = await res.json();
                                    data = json.properties || [];
                                    console.log(`[Persistence] API fallback returned ${data.length} assets`);
                                }
                                if (!data) throw supaErr;
                            } else throw supaErr;
                        }
                        console.log(`[Persistence] Cloud returned ${data?.length || 0} assets`);

                        // PRIORITY MERGE: Cloud Data + Local Pending Sync Data
                        if (data && data.length > 0) {
                            const dbIds = new Set(data.map(p => p.id));
                            const pendingSync = localData.filter(p => !dbIds.has(p.id) && !p.isDemo && !p.id.startsWith('prop-'));

                            if (pendingSync.length > 0) {
                                console.log(`[Persistence] Merging ${pendingSync.length} unsynced local assets with cloud data`);
                            }

                            const final = [...data, ...pendingSync];
                            setProperties(final);
                            localStorage.setItem(`folio_props_v2_${effectiveUserId}`, JSON.stringify(final));
                        } else if (localData.length > 0 && localData.some(p => !p.isDemo && !p.id.startsWith('prop-'))) {
                            console.log(`[Persistence] Cloud empty but LocalStorage has real assets. Syncing local to cloud in background...`);
                            setProperties(localData);
                            const toSync = localData.filter(x => !x.isDemo && !x.id.startsWith('prop-'));
                            (async () => {
                                for (const p of toSync) {
                                    try {
                                        const res = await fetch('/api/user/properties', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(p),
                                        });
                                        if (res.ok) {
                                            const json = await res.json();
                                            const saved = json.property;
                                            setProperties(prev => prev.map(x => x.id === p.id ? saved : x));
                                            console.log(`[Persistence] Synced ${p.name} to cloud`);
                                        } else {
                                            const err = await res.json().catch(() => ({}));
                                            console.error(`[Persistence] Sync failed for ${p.name}:`, res.status, err);
                                            setSyncStatus('error');
                                            setDbError(err?.error || `Sync failed: ${res.status}`);
                                        }
                                    } catch (e: any) {
                                        console.error(`[Persistence] Sync error for ${p.name}:`, e);
                                        setSyncStatus('error');
                                        setDbError(e?.message || 'Sync failed');
                                    }
                                }
                            })();
                        } else {
                            console.log(`[Persistence] No cloud or local assets found. Showing mock data.`);
                            setProperties(MOCK_PROPERTIES.map(p => ({ ...p, isDemo: true })));
                        }
                        setSyncStatus('synced');
                    } catch (e: any) {
                        console.error("[Persistence] Cloud Fetch Error:", e);
                        setSyncStatus('error');
                        setDbError(e.message || "Failed to reach cloud database");

                        // Fallback to local if fetch fails
                        if (localData.length > 0) {
                            console.log(`[Persistence] Fallback to LocalStorage due to fetch error`);
                            setProperties(localData);
                        } else {
                            setProperties(MOCK_PROPERTIES.map(p => ({ ...p, isDemo: true })));
                        }
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchFromSupabase();
            } else {
                console.log("[Persistence] Guest session detected. Showing mock data.");
                setProperties(MOCK_PROPERTIES.map(p => ({ ...p, isDemo: true })));
                setIsLoading(false);
                setSyncStatus('synced');
            }
        }
    }, [isLoaded, effectiveUserId]);

    useEffect(() => {
        // PERMANENCE SYNC: Only save to local storage if we are 100% sure we have user data
        // We never want to overwrite a user's local cache with generic MOCK_PROPERTIES.
        const hasRealData = properties.length > 0 && properties.some(p => !p.isDemo && !p.id.startsWith('prop-'));

        if (isLoaded && effectiveUserId && hasRealData) {
            console.log("Persistence Sync: Saving actual user assets to local storage");
            localStorage.setItem(`folio_props_v2_${effectiveUserId}`, JSON.stringify(properties));
        }
    }, [properties, effectiveUserId, isLoaded]);

    const openAddModal = (status?: PropertyStatus) => {
        setInitialStatus(status);
        setIsAddModalOpen(true);
    };

    const editProperty = (prop: Property) => {
        setEditingProperty(prop);
        setIsEditModalOpen(true);
    };

    const removeProperty = async (id: string | number) => {
        setProperties(prev => prev.filter(p => String(p.id) !== String(id)));
        if (effectiveUserId && typeof id === 'string' && id.length > 30) { // Assume UUID is from Supabase
            try {
                await supabaseService.deleteProperty(id, effectiveUserId);
            } catch (e) {
                console.error("Delete Supabase error:", e);
            }
        }
    };

    const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (effectiveUserId && id.length > 30) {
            try {
                await supabaseService.updateProperty(id, updates, effectiveUserId);
            } catch (e) {
                console.error("Update Supabase error:", e);
            }
        }
    };

    const stats = getPortfolioStats(properties);
    const { t, currency, locale, portfolioType, portfolioName, setPortfolioName } = useSettings();

    // Dynamic Portfolio Health Calculation
    const ltv = stats.totalValue > 0 ? (stats.totalDebt / stats.totalValue) * 100 : 0;
    const cashflowMargin = stats.monthlyIncome > 0 ? (stats.monthlyCashflow / stats.monthlyIncome) * 100 : 0;

    let healthScore = 100;
    if (ltv > 85) healthScore -= 30;
    else if (ltv > 75) healthScore -= 20;
    else if (ltv > 65) healthScore -= 10;

    if (cashflowMargin < 0) healthScore -= 40;
    else if (cashflowMargin < 15) healthScore -= 20;
    else if (cashflowMargin < 30) healthScore -= 10;

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    let healthStatus = t("healthExcellent");
    let healthColor = "text-emerald-400";
    let bgHealthColor = "bg-emerald-400";
    if (healthScore < 50) {
        healthStatus = t("healthAtRisk");
        healthColor = "text-rose-400";
        bgHealthColor = "bg-rose-400";
    } else if (healthScore < 75) {
        healthStatus = t("healthFair");
        healthColor = "text-amber-400";
        bgHealthColor = "bg-amber-400";
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedProperties = Array.from(properties);
        const propertyIndex = updatedProperties.findIndex(p => p.id === draggableId);
        if (propertyIndex !== -1) {
            const newStatus = destination.droppableId as PropertyStatus;
            updatedProperties[propertyIndex].status = newStatus;
            setProperties(updatedProperties);

            // Sync to Supabase
            if (effectiveUserId && draggableId.length > 30) {
                try {
                    await supabaseService.updateProperty(draggableId, { status: newStatus }, effectiveUserId);
                } catch (e) {
                    console.error("Sync Supabase error:", e);
                }
            }
        }
    };

    const handleAddAsset = async (newAssets: Property[]) => {
        if (!effectiveUserId) {
            setProperties(prev => [...newAssets, ...prev.filter(p => !p.isDemo)]);
            return setActiveTab("dashboard");
        }

        setSyncStatus('loading');

        // 1. IMMEDIATE LOCAL STATE & CACHE UPDATE
        const localAssets = newAssets.map(a => ({
            ...a,
            isDemo: false,
            id: a.id || `local-${Math.random().toString(36).substring(7)}`
        }));

        setProperties(prev => {
            const filteredPrev = prev.filter(p => !p.isDemo);
            const updated = [...localAssets, ...filteredPrev];
            localStorage.setItem(`folio_props_v2_${effectiveUserId}`, JSON.stringify(updated));
            return updated;
        });

        setActiveTab("dashboard");

        // 2. BACKGROUND CLOUD SYNC
        for (const asset of localAssets) {
            console.log(`[Persistence] Background syncing asset: ${asset.name}`);
            try {
                let saved: Property | null = null;
                try {
                    saved = await supabaseService.addProperty(asset, effectiveUserId);
                } catch (supaErr: any) {
                    if (supaErr?.code === 'PGRST205' || supaErr?.message?.includes('schema')) {
                        const res = await fetch('/api/user/properties', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(asset),
                        });
                        if (res.ok) {
                            const json = await res.json();
                            saved = json.property;
                            console.log(`[Persistence] API insert confirmed for: ${asset.name}`);
                        }
                    }
                    if (!saved) throw supaErr;
                }
                if (saved) {
                    console.log(`[Persistence] Sync confirmed for: ${asset.name}`);
                    setProperties(prev => {
                        const updated = prev.map(p => p.id === asset.id ? saved! : p);
                        localStorage.setItem(`folio_props_v2_${effectiveUserId}`, JSON.stringify(updated));
                        return updated;
                    });
                }
            } catch (e) {
                console.error(`[Persistence] Cloud sync failed for ${asset.name}:`, e);
                setSyncStatus('error');
            }
        }

        setSyncStatus('synced');
    };

    return (
        <div className="flex w-full h-screen overflow-hidden text-slate-200 z-10 relative bg-slate-950">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            borderRadius: ["20%", "40%", "20%"]
                        }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity
                        }}
                        className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <AnimatedLogo size={16} />
                    </motion.div>
                    <input
                        type="text"
                        value={portfolioName}
                        onChange={(e) => setPortfolioName(e.target.value)}
                        className="font-outfit font-bold text-lg text-white bg-transparent border-none focus:outline-none w-32 truncate placeholder:text-slate-500"
                        placeholder="My Portfolio"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <CloudSyncStatus status={isLoading ? 'loading' : dbError ? 'error' : 'synced'} />
                    <NotificationDropdown />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    x: isMounted && (typeof window !== 'undefined' && window.innerWidth < 1024) ? (isSidebarOpen ? 0 : -280) : 0
                }}
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 w-64 flex flex-col border-r border-slate-800/60 glass-panel bg-slate-950/90 lg:bg-slate-950/40 backdrop-blur-2xl p-4 shrink-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
                    !isSidebarOpen && "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex items-center justify-between px-2 py-4 mb-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                borderRadius: ["20%", "40%", "20%"]
                            }}
                            transition={{
                                duration: 3,
                                ease: "easeInOut",
                                repeat: Infinity
                            }}
                            className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20"
                        >
                            <AnimatedLogo size={18} />
                        </motion.div>
                        <input
                            type="text"
                            value={portfolioName}
                            onChange={(e) => setPortfolioName(e.target.value)}
                            className="font-outfit text-xl font-bold tracking-wide text-white bg-transparent border-none focus:outline-none w-[130px] truncate placeholder:text-slate-500 hover:bg-slate-800/50 rounded px-1 -ml-1 transition-colors group-hover:bg-slate-800/50"
                            placeholder="My Portfolio"
                        />
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <SidebarItem icon={Home} label={t("dashboardNav")} active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={MapIcon} label={t("portfolioMapNav")} active={activeTab === "portfolio"} onClick={() => { setActiveTab("portfolio"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={Briefcase} label={t("pipelineNav")} active={activeTab === "pipeline"} onClick={() => { setActiveTab("pipeline"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={Bot} label={t("agentsNav" as any) || "AgentS"} active={activeTab === "agents"} onClick={() => { setActiveTab("agents"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={Users} label={t("collaboratorsNav")} active={activeTab === "collaborators"} onClick={() => { setActiveTab("collaborators"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={StickyNote} label={t("notesNav" as any) || "Notes"} active={activeTab === "notes"} onClick={() => { setActiveTab("notes"); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={BarChart3} label={t("reportsNav")} active={activeTab === "reports"} onClick={() => { setActiveTab("reports"); setIsSidebarOpen(false); }} />

                    <div className="pt-4 pb-2 px-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Management</span>
                    </div>
                    {/* <Link href="/admin">
                        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-blue-500/80 hover:text-blue-400 hover:bg-blue-500/5 border border-transparent hover:border-blue-500/20">
                            <Shield size={18} className="text-blue-500/60 group-hover:text-blue-500 transition-colors" />
                            Internal Support
                        </div>
                    </Link> */}
                </nav>

                <div className="mt-auto pt-4 space-y-2 border-t border-slate-800/40">
                    <div
                        className="p-4 rounded-xl glass bg-slate-800/30 mb-4 border border-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-all shadow-lg group"
                        onClick={() => { setIsHealthModalOpen(true); setIsSidebarOpen(false); }}
                        title="Click to see Portfolio Health Explainer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors tracking-wide">{t("portfolioHealth")}</p>
                            <span className={`text-xs font-bold ${healthColor}`}>{healthScore}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                            <div className={`${bgHealthColor} h-1.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${healthScore}%` }}></div>
                        </div>
                        <p className={`text-xs ${healthColor} flex items-center gap-1.5 font-medium`}>
                            <TrendingUp size={12} /> {healthStatus}
                        </p>
                    </div>
                    <SidebarItem icon={CreditCard} label="Billing" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />
                    <SidebarItem icon={Settings} label={t("settingsNav")} />
                    <div className="flex items-center gap-3 px-2 py-3 mt-2 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer group">
                        <UserButton />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName || user?.primaryEmailAddress?.emailAddress || t("profileLabel")}</p>
                            <p className="text-xs text-slate-400 truncate">{t("leadInvestor")}</p>
                        </div>
                    </div>
                </div>
            </motion.aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 lg:pt-0">
                <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-slate-800/40 bg-slate-900/20 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="hover:text-slate-200 cursor-pointer transition-colors">{t("workspace")}</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-100 font-medium">
                            {activeTab === "dashboard" ? t("dashboardNav") : activeTab === "portfolio" ? t("portfolioMapNav") : activeTab === "pipeline" ? t("pipelineNav") : activeTab === "collaborators" ? t("collaboratorsNav") : activeTab === "agents" ? (t("agentsNav" as any) || "AgentS") : activeTab === "notes" ? (t("notesNav" as any) || "Notes") : activeTab === "billing" ? "Billing" : t("reportsNav")}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <CloudSyncStatus status={syncStatus} />
                        <NotificationDropdown />
                        <SettingsDropdown />
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t("searchPlaceholder")}
                                    className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all w-64 text-slate-200 placeholder:text-slate-500"
                                />
                            </div>
                            <button onClick={() => setIsShareModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-lg flex items-center gap-2 border border-slate-700">
                                <Share2 size={16} className="text-blue-400" /> {t("share" as any) || "Share"}
                            </button>
                            <button onClick={() => openAddModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                                <Plus size={16} /> {t("addAsset")}
                            </button>
                            <FeatureRequestPopup />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8 z-0 relative">
                    {isLoading ? (
                        <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 180, 360],
                                    borderRadius: ["20%", "40%", "20%"]
                                }}
                                transition={{
                                    duration: 2,
                                    ease: "easeInOut",
                                    repeat: Infinity
                                }}
                                className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/20"
                            >
                                <AnimatedLogo size={32} />
                            </motion.div>
                            <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">Synchronizing Portfolio</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === "dashboard" && (
                                <>
                                    {portfolioType === "realEstate" && (
                                        <RealEstateDashboard
                                            properties={properties}
                                            stats={stats}
                                            t={t}
                                            currency={currency}
                                            locale={locale}
                                            setActiveTab={setActiveTab}
                                            openAddModal={openAddModal}
                                            removeProperty={removeProperty}
                                            editProperty={editProperty}
                                        />
                                    )}
                                    {portfolioType === "company" && (
                                        <CompanyDashboard
                                            properties={properties}
                                            stats={stats}
                                            t={t}
                                            currency={currency}
                                            locale={locale}
                                            setActiveTab={setActiveTab}
                                            openAddModal={openAddModal}
                                        />
                                    )}
                                    {portfolioType === "stocks" && (
                                        <StocksDashboard
                                            properties={properties}
                                            stats={stats}
                                            t={t}
                                            currency={currency}
                                            locale={locale}
                                            setActiveTab={setActiveTab}
                                            openAddModal={openAddModal}
                                        />
                                    )}
                                    {portfolioType === "collection" && (
                                        <CollectionDashboard
                                            properties={properties}
                                            stats={stats}
                                            t={t}
                                            currency={currency}
                                            locale={locale}
                                            setActiveTab={setActiveTab}
                                            openAddModal={openAddModal}
                                        />
                                    )}
                                </>
                            )}
                            {activeTab === "portfolio" && (
                                <PortfolioMapDashboard
                                    properties={properties}
                                    t={t}
                                    currency={currency}
                                    locale={locale}
                                    openAddModal={openAddModal}
                                    removeProperty={removeProperty}
                                    editProperty={editProperty}
                                    updateProperty={handleUpdateProperty}
                                />
                            )}

                            {activeTab === "pipeline" && (
                                <motion.div
                                    key="pipeline"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="mb-8">
                                        <h1 className="text-3xl font-outfit font-bold text-white mb-2">{t("pipelineHeader")}</h1>
                                        <p className="text-slate-400">{t("pipelineSubtext")}</p>
                                    </div>

                                    {isMounted && (
                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 pipeline-scroll">
                                                <PipelineColumn
                                                    id="Lead / Prospect"
                                                    title={t("leadProspect")}
                                                    properties={properties.filter(p => p.status === "Lead / Prospect")}
                                                    onAddClick={() => openAddModal("Lead / Prospect")}
                                                    onEditClick={editProperty}
                                                />
                                                <PipelineColumn
                                                    id="Under Analysis"
                                                    title={t("underAnalysis")}
                                                    properties={properties.filter(p => p.status === "Under Analysis")}
                                                    onAddClick={() => openAddModal("Under Analysis")}
                                                    onEditClick={editProperty}
                                                    onRemove={removeProperty}
                                                />
                                                <PipelineColumn
                                                    id="Offer Submitted"
                                                    title={t("offerSubmitted")}
                                                    properties={properties.filter(p => p.status === "Offer Submitted")}
                                                    onAddClick={() => openAddModal("Offer Submitted")}
                                                    onEditClick={editProperty}
                                                    onRemove={removeProperty}
                                                />
                                                <PipelineColumn
                                                    id="Under Contract"
                                                    title={t("underContract")}
                                                    properties={properties.filter(p => p.status === "Under Contract")}
                                                    onAddClick={() => openAddModal("Under Contract")}
                                                    onEditClick={editProperty}
                                                    onRemove={removeProperty}
                                                />
                                                <PipelineColumn
                                                    id="Incoming Asset"
                                                    title={t("incomingAsset")}
                                                    properties={properties.filter(p => p.status === "Incoming Asset")}
                                                    onAddClick={() => openAddModal("Incoming Asset")}
                                                    onEditClick={editProperty}
                                                    onRemove={removeProperty}
                                                />
                                                <PipelineColumn
                                                    id="Secured Asset"
                                                    title={t("securedAsset") || "Secured Asset"}
                                                    properties={properties.filter(p => ["Secured Asset", "Active", "Renovation"].includes(p.status))}
                                                    onAddClick={() => openAddModal("Secured Asset")}
                                                    onEditClick={editProperty}
                                                    onRemove={removeProperty}
                                                />
                                            </div>
                                        </DragDropContext>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "reports" && (
                                <ReportsDashboard
                                    properties={properties}
                                    stats={stats}
                                    t={t}
                                    currency={currency}
                                    locale={locale}
                                />
                            )}

                            {activeTab === "notes" && user && (
                                <NotesSection userId={user.id} t={t} />
                            )}

                            {activeTab === "collaborators" && (
                                <CollaboratorsDashboard />
                            )}

                            {activeTab === "agents" && (
                                <AgentsDashboard />
                            )}

                            {activeTab === "billing" && (
                                <BillingDashboard />
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </main>

            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddAssets={handleAddAsset}
                initialStatus={initialStatus}
            />
            <EditAssetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                property={editingProperty}
                onUpdate={handleUpdateProperty}
                onRemove={removeProperty}
            />
            <SharePortfolioModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
            <PortfolioHealthModal
                isOpen={isHealthModalOpen}
                onClose={() => setIsHealthModalOpen(false)}
                properties={properties}
                currency={currency}
                locale={locale}
            />
            <Suspense fallback={null}>
                <TutorialOverlay />
            </Suspense>
        </div>
    );
}

export default function HomeDashboard() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-bold tracking-widest animate-pulse">ESTABLISHING SECURE CONNECTION...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
