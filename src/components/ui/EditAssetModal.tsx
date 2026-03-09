"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, History, Plus, MessageSquare, Phone, Mail, Users, CheckCircle2, Calendar, MapPin, Building2, Trash2 } from "lucide-react";
import { Property, PropertyEvent, PropertyStatus } from "@/lib/data";
import { useSettings } from "@/components/ui/settings-provider";
import { cn } from "@/lib/utils";

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onUpdate: (id: string, updates: Partial<Property>) => Promise<void>;
    onRemove?: (id: string | number) => void;
}

export function EditAssetModal({ isOpen, onClose, property, onUpdate, onRemove }: EditAssetModalProps) {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<"info" | "financials" | "crm">("info");
    const [formData, setFormData] = useState<Partial<Property>>({});
    const [finData, setFinData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // CRM New Event State
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        content: "",
        type: "note" as PropertyEvent["type"]
    });

    const parseNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    };

    useEffect(() => {
        if (property) {
            setFormData({
                name: property.name,
                address: property.address,
                type: property.type,
                status: property.status,
                image: property.image,
                units: property.units,
                acquisitionDate: property.acquisitionDate || "",
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                yearBuilt: property.yearBuilt,
                lotSize: property.lotSize,
                description: property.description,
            });
            setFinData({ ...property.financials });
        }
    }, [property]);

    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isOpen) setIsDeleting(false);
    }, [isOpen]);

    if (!property) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onUpdate(property.id, {
                ...formData,
                financials: finData as any
            });
            onClose();
        } catch (error) {
            console.error("Failed to update property:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.content) return;

        const event: PropertyEvent = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            ...newEvent
        };

        const updatedEvents = [event, ...(property.events || [])];
        await onUpdate(property.id, { events: updatedEvents });
        setNewEvent({ title: "", content: "", type: "note" });
        setShowAddEvent(false);
    };

    const getEventIcon = (type: PropertyEvent["type"]) => {
        switch (type) {
            case "note": return <MessageSquare size={14} className="text-blue-400" />;
            case "call": return <Phone size={14} className="text-green-400" />;
            case "email": return <Mail size={14} className="text-purple-400" />;
            case "meeting": return <Users size={14} className="text-amber-400" />;
            case "task": return <CheckCircle2 size={14} className="text-rose-400" />;
            case "status_change": return <History size={14} className="text-slate-400" />;
            default: return <MessageSquare size={14} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl border border-slate-700 overflow-hidden shrink-0">
                                    <img src={property.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-none mb-1">{property.name}</h2>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-md">
                                        <MapPin size={12} className="text-blue-500/50" /> {property.address}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-slate-800 bg-slate-900/30">
                            {[
                                { id: "info", label: t("propertyName"), icon: <Building2 size={14} /> },
                                { id: "financials", label: t("simplifiedFinancials"), icon: <Plus size={14} /> },
                                { id: "crm", label: t("events"), icon: <History size={14} />, badge: property.events?.length }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "py-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all",
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-400"
                                            : "border-transparent text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.badge ? (
                                        <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-md text-[10px]">{tab.badge}</span>
                                    ) : null}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {activeTab === "info" && (
                                    <motion.form
                                        key="info-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("propertyName")}</label>
                                                <input
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("propertyAddress")}</label>
                                                <input
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("type")}</label>
                                                <select
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                >
                                                    <option value="Single-family">Single-family</option>
                                                    <option value="Multi-family">Multi-family</option>
                                                    <option value="Condo">Condo</option>
                                                    <option value="Commercial">Commercial</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("status")}</label>
                                                <select
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Lead / Prospect">Lead / Prospect</option>
                                                    <option value="Under Analysis">Under Analysis</option>
                                                    <option value="Renovation">Renovation</option>
                                                    <option value="Sold">Sold</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("acquisitionDate")}</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium [color-scheme:dark]"
                                                    value={formData.acquisitionDate}
                                                    onChange={e => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("propertyName")} Image URL</label>
                                                <input
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.image}
                                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("bedrooms")}</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.bedrooms || ""}
                                                    onChange={e => setFormData({ ...formData, bedrooms: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("bathrooms")}</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.bathrooms || ""}
                                                    onChange={e => setFormData({ ...formData, bathrooms: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("yearBuilt")}</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.yearBuilt || ""}
                                                    onChange={e => setFormData({ ...formData, yearBuilt: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("lotSize")}</label>
                                                <input
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={formData.lotSize || ""}
                                                    onChange={e => setFormData({ ...formData, lotSize: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("description")}</label>
                                                <textarea
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium min-h-[100px]"
                                                    value={formData.description || ""}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </motion.form>
                                )}

                                {activeTab === "financials" && (
                                    <motion.div
                                        key="fin-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("currentValue")}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.currentValue}
                                                    onChange={e => setFinData({ ...finData, currentValue: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("debt")}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.debt}
                                                    onChange={e => setFinData({ ...finData, debt: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("monthlyRent")}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.monthlyRent}
                                                    onChange={e => setFinData({ ...finData, monthlyRent: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("monthlyExpenses")}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.monthlyExpenses}
                                                    onChange={e => setFinData({ ...finData, monthlyExpenses: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("monthlyMortgage") || "Monthly Mortgage / Debt"}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.monthlyDebtService || 0}
                                                    onChange={e => setFinData({ ...finData, monthlyDebtService: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t("monthlyPrincipalPayment")}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/40 rounded-xl pl-8 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                                    value={finData.principalPayment || 0}
                                                    onChange={e => setFinData({ ...finData, principalPayment: parseNumeric(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "crm" && (
                                    <motion.div
                                        key="crm-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t("events")}</h3>
                                            <button
                                                onClick={() => setShowAddEvent(!showAddEvent)}
                                                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <Plus size={16} /> {t("addEvent")}
                                            </button>
                                        </div>

                                        {showAddEvent && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4"
                                            >
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("eventTitle")}</label>
                                                        <input
                                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                                                            placeholder="e.g. Discussed renovation"
                                                            value={newEvent.title}
                                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("eventType")}</label>
                                                        <select
                                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
                                                            value={newEvent.type}
                                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                                        >
                                                            <option value="note">{t("note")}</option>
                                                            <option value="call">{t("call")}</option>
                                                            <option value="email">{t("email")}</option>
                                                            <option value="meeting">{t("meeting")}</option>
                                                            <option value="task">{t("task")}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("eventContent")}</label>
                                                    <textarea
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 min-h-[80px]"
                                                        placeholder="Add details here..."
                                                        value={newEvent.content}
                                                        onChange={e => setNewEvent({ ...newEvent, content: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setShowAddEvent(false)}
                                                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                                                    >
                                                        {t("cancel")}
                                                    </button>
                                                    <button
                                                        onClick={handleAddEvent}
                                                        className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                                    >
                                                        {t("addEvent")}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-4">
                                            {property.events && property.events.length > 0 ? (
                                                property.events.map((event, idx) => (
                                                    <div key={event.id} className="relative pl-8 pb-4">
                                                        {idx !== property.events!.length - 1 && (
                                                            <div className="absolute left-[13px] top-6 bottom-0 w-px bg-slate-800" />
                                                        )}
                                                        <div className="absolute left-0 top-1 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center">
                                                            {getEventIcon(event.type)}
                                                        </div>
                                                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-sm font-bold text-white leading-none">{event.title}</h4>
                                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                    <Calendar size={10} /> {new Date(event.date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{event.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                                                    <History size={48} className="text-slate-700 mb-4" />
                                                    <p className="text-slate-400 font-bold mb-1">{t("noEvents")}</p>
                                                    <p className="text-xs text-slate-600 max-w-[240px]">{t("addNote")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
                            {isDeleting ? (
                                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{t("permanentDelete")}</span>
                                    <button
                                        onClick={() => {
                                            onRemove?.(property.id);
                                            onClose();
                                        }}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
                                    >
                                        {t("confirmDeleteAction")}
                                    </button>
                                    <button
                                        onClick={() => setIsDeleting(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsDeleting(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500/20 transition-all border border-transparent hover:border-rose-500/30"
                                >
                                    <Trash2 size={16} /> {t("deleteAsset")}
                                </button>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className={cn(
                                        "px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl flex items-center gap-2 transition-all",
                                        isSaving ? "bg-blue-600 opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95"
                                    )}
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {t("saveChanges")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
