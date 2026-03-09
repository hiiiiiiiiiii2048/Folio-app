"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Search,
    Settings,
    Globe,
    Coins,
    Briefcase,
    ChevronDown,
    Plus,
    Trash2,
    LayoutDashboard
} from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Property } from "@/lib/data";
import { cn, formatCompactCurrency } from "@/lib/utils";
import { useSettings } from "@/components/ui/settings-provider";
import { Language, Currency } from "@/lib/translations";

export function AnimatedLogo({ size = 18 }: { size?: number }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.15, 1],
            }}
            transition={{
                duration: 2.5,
                ease: "easeInOut",
                repeat: Infinity
            }}
        >
            <LayoutDashboard size={size} className="text-white" />
        </motion.div>
    );
}

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const notifications = [
        { id: 1, type: "success", title: "Milestone Reached! 🎉", message: "Portfolio Equity crossed $1M", time: "2h ago", read: false },
        { id: 2, type: "alert", title: "Agent Prospector", message: "Found a new multi-family deal in Phoenix", time: "5h ago", read: true },
        { id: 3, type: "info", title: "Rent Collected", message: "14/15 expected rents collected for this month", time: "1d ago", read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right">
                        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
                            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                                <Bell size={16} className="text-blue-400" /> Notifications
                            </h3>
                            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Mark all as read</button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No new notifications
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map(notif => (
                                        <div key={notif.id} className={`p-4 border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-500/5' : ''}`}>
                                            <div className="mt-0.5 shrink-0">
                                                {notif.type === "success" && <CheckCircle2 size={16} className="text-emerald-400" />}
                                                {notif.type === "alert" && <AlertTriangle size={16} className="text-amber-400" />}
                                                {notif.type === "info" && <TrendingUp size={16} className="text-blue-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-slate-200' : 'text-slate-300'}`}>{notif.title}</p>
                                                    <span className="text-[10px] text-slate-500 shrink-0">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-tight">{notif.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-800/80 bg-slate-900/95 text-center">
                            <button className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors">
                                View all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function SettingsDropdown() {
    const { language, currency, portfolioType, setLanguage, setCurrency, setPortfolioType } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const portfolioLabels = {
        realEstate: "Real Estate",
        company: "Company",
        stocks: "Stocks",
        collection: "Collection"
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full hover:bg-slate-800 hover:border-slate-700 transition-all group"
            >
                <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2 mr-0.5">
                    <Briefcase size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-tighter">
                        {portfolioLabels[portfolioType as keyof typeof portfolioLabels]}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Globe size={14} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{language}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-700 mx-0.5"></div>
                    <span className="text-[10px] font-bold text-slate-300">{currency}</span>
                </div>
                <ChevronDown size={14} className={cn("text-slate-500 transition-transform duration-300", isOpen ? "rotate-180 text-blue-400" : "")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-3 border-b border-slate-800/60 bg-slate-950/20">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Workspace Settings</p>
                    </div>

                    <div className="p-4 space-y-5">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Briefcase size={12} className="text-blue-400" /> Portfolio Domain
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(portfolioLabels).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setPortfolioType(key as any); }}
                                        className={cn(
                                            "px-2 py-1.5 rounded-lg text-xs font-medium transition-all border text-left",
                                            portfolioType === key
                                                ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                                                : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Globe size={12} className="text-blue-400" /> Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="en">English (US)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="zh">中文 (Chinese)</option>
                                <option value="ja">日本語 (Japanese)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Coins size={12} className="text-blue-400" /> Base Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as Currency)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="USD">United States Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                                <option value="JPY">Japanese Yen (¥)</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 text-center">
                        <p className="text-[9px] text-slate-600 uppercase font-medium">Auto-Syncing with Cloud Profile</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CloudSyncStatus({ status }: { status: 'loading' | 'error' | 'synced' }) {
    if (status === 'loading') return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Syncing...
        </div>
    );
    if (status === 'error') return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Data Saved
        </div>
    );
    return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Data Saved
        </div>
    );
}

export function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
        >
            <Icon size={18} className={cn("transition-colors", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
            {label}
        </button>
    );
}

export function StatCard({ title, value, trend, icon: Icon, color, bg, trendDown, supertext, subtext }: any) {
    return (
        <div className="glass-card rounded-2xl p-5 border border-slate-700/30 group hover:border-slate-600/50 transition-colors flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", bg, color)}>
                        <Icon size={20} />
                    </div>
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded-md bg-opacity-20",
                        trendDown ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"
                    )}>
                        {trend}
                    </span>
                </div>
                <div>
                    <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-tight mb-1">{title}</p>
                    {supertext && <p className="text-[9px] text-emerald-400/80 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{supertext}</p>}
                    <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight break-all">{value}</h3>
                    {subtext && <p className="text-[10px] text-rose-400/80 font-medium mt-1.5 leading-snug">{subtext}</p>}
                </div>
            </div>
        </div>
    );
}

export function PipelineColumn({
    id,
    title,
    properties,
    onAddClick,
    onEditClick,
    onRemove
}: {
    id: string,
    title: string,
    properties: Property[],
    onAddClick?: () => void,
    onEditClick?: (prop: Property) => void,
    onRemove?: (id: string | number) => void
}) {
    const { t, currency, locale } = useSettings();

    return (
        <div className="w-[280px] sm:w-[320px] shrink-0 flex flex-col glass-card rounded-2xl border border-slate-700/40 overflow-hidden bg-slate-900/30">
            <div className="p-4 border-b border-slate-800/60 bg-slate-950/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-200">{title}</h3>
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">{properties.length}</span>
                </div>
                <button
                    onClick={onAddClick}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                    <Plus size={16} />
                </button>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                            "p-4 flex-1 space-y-3 min-h-[500px] transition-colors",
                            snapshot.isDraggingOver ? "bg-blue-500/5" : ""
                        )}
                    >
                        {properties.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                                <span className="text-sm text-slate-500 font-medium">{t("noDeals")}</span>
                            </div>
                        )}

                        {properties.map((prop, index) => (
                            <Draggable key={prop.id} draggableId={prop.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => onEditClick?.(prop)}
                                        className={cn(
                                            "bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-slate-500 transition-all group relative",
                                            snapshot.isDragging ? "shadow-2xl shadow-blue-500/20 border-blue-500/50 scale-[1.02] bg-slate-800" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{prop.type}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-slate-200 font-bold text-xs">
                                                    {formatCompactCurrency(prop.financials?.currentValue || 0, currency, locale)}
                                                </span>
                                                <div className="h-0.5 w-full bg-blue-500/20 mt-0.5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-1/3" />
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-slate-100 mb-1">{prop.name}</h4>
                                        <p className="text-xs text-slate-500 mb-3 truncate">{prop.address}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold">JD</div>
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 border-2 border-slate-800 flex items-center justify-center text-[8px] font-bold">MK</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {prop.units && prop.units > 1 && (
                                                    <span className="text-[10px] text-slate-400 font-medium">{prop.units} units</span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete ${prop.name}?`)) {
                                                            onRemove?.(prop.id);
                                                        }
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
