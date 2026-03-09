"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileText, CheckCircle, Download, Link as LinkIcon, Loader2, ExternalLink, Sparkles, AlertCircle, Copy } from "lucide-react";
import Papa from "papaparse";
import { useSettings } from "@/components/ui/settings-provider";
import { Property, PropertyStatus } from "@/lib/data";


interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAssets: (assets: Property[]) => void;
    initialStatus?: PropertyStatus;
}

export function AddAssetModal({ isOpen, onClose, onAddAssets, initialStatus }: AddAssetModalProps) {
    const { t } = useSettings();
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"manual" | "import" | "link">("manual");
    const [listingUrl, setListingUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [scrapingError, setScrapingError] = useState("");
    const [showMagicPaste, setShowMagicPaste] = useState(false);
    const [magicText, setMagicText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [useAI, setUseAI] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [usageCount, setUsageCount] = useState(0);

    const isPro = subscription?.plan === "Pro" || subscription?.plan === "Enterprise";

    useEffect(() => {
        setIsMounted(true);
        const count = localStorage.getItem('follio_ai_usage_count') || "0";
        setUsageCount(parseInt(count, 10));
    }, []);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                const res = await fetch("/api/user/subscription");
                const data = await res.json();
                setSubscription(data);
            } catch (e) {
                console.error("Failed to fetch sub:", e);
            }
        };
        if (isOpen && isMounted) fetchSub();
    }, [isOpen, isMounted]);

    // Manual Entry State
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        lat: 0,
        lng: 0,
        type: "Single-family",
        status: initialStatus || "Lead / Prospect",
        units: 1,
        currentValue: 0,
        debt: 0,
        monthlyRent: 0,
        monthlyExpenses: 0,
        monthlyDebtService: 0,
        principalPayment: 0,
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
        // Debt specifics
        debtType: "Fixed",
        interestRate: 0,
        loanDurationMonths: 360,
        fixedTermRemainingMonths: 0,
        reserviceDate: "",
        acquisitionDate: "",
        bedrooms: 0,
        bathrooms: 0,
        yearBuilt: 0,
        lotSize: "",
        description: "",
    });

    useEffect(() => {
        if (isOpen && initialStatus) {
            setFormData(prev => ({ ...prev, status: initialStatus }));
        }
    }, [isOpen, initialStatus]);

    const parseNumeric = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    };

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Autocomplete State
    const [addressQuery, setAddressQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (addressQuery.length > 4) {
                try {
                    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (!MAPBOX_TOKEN) return;

                    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`);
                    const data = await res.json();

                    const mapboxSuggestions = data.features?.map((f: any) => ({
                        display_name: f.place_name,
                        lat: f.center[1].toString(), // Mapbox returns [lng, lat]
                        lon: f.center[0].toString()
                    })) || [];

                    setSuggestions(mapboxSuggestions);
                    if (mapboxSuggestions.length > 0) setShowSuggestions(true);
                } catch (e) {
                    console.error("Failed to fetch address:", e);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [addressQuery]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAsset: Property = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name || "Untitled Asset",
            address: formData.address || "No Address Provided",
            lat: formData.lat ? parseNumeric(formData.lat) : undefined,
            lng: formData.lng ? parseNumeric(formData.lng) : undefined,
            type: formData.type as any,
            status: formData.status as any,
            image: formData.image,
            units: parseNumeric(formData.units),
            financials: {
                purchasePrice: parseNumeric(formData.currentValue) * 0.8,
                renovationCost: 0,
                currentValue: parseNumeric(formData.currentValue),
                debt: parseNumeric(formData.debt),
                monthlyRent: parseNumeric(formData.monthlyRent),
                monthlyExpenses: parseNumeric(formData.monthlyExpenses),
                monthlyDebtService: parseNumeric(formData.monthlyDebtService),
                principalPayment: parseNumeric(formData.principalPayment),
                debtType: parseNumeric(formData.debt) > 0 ? formData.debtType : undefined,
                interestRate: parseNumeric(formData.debt) > 0 ? parseNumeric(formData.interestRate) : undefined,
                loanDurationMonths: parseNumeric(formData.debt) > 0 ? parseNumeric(formData.loanDurationMonths) : undefined,
                fixedTermRemainingMonths: parseNumeric(formData.debt) > 0 ? parseNumeric(formData.fixedTermRemainingMonths) : undefined,
                reserviceDate: parseNumeric(formData.debt) > 0 && formData.reserviceDate ? formData.reserviceDate : undefined,
            },
            acquisitionDate: formData.acquisitionDate || undefined,
            bedrooms: formData.bedrooms ? parseNumeric(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? parseNumeric(formData.bathrooms) : undefined,
            yearBuilt: formData.yearBuilt ? parseNumeric(formData.yearBuilt) : undefined,
            lotSize: formData.lotSize,
            description: formData.description,
        };
        onAddAssets([newAsset]);
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedAssets: Property[] = results.data.map((row: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: row.Name || row.name || "Imported Asset",
                    address: row.Address || row.address || "Imported Address",
                    type: (row.Type || row.type || "Single-family") as any,
                    status: (row.Status || row.status || "Lead / Prospect") as any,
                    image: row.Image || row.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
                    units: parseNumeric(row.Units || row.units || 1),
                    lat: row.Lat || row.lat ? parseNumeric(row.Lat || row.lat) : undefined,
                    lng: row.Lng || row.lng ? parseNumeric(row.Lng || row.lng) : undefined,
                    financials: {
                        purchasePrice: parseNumeric(row.PurchasePrice || row.purchasePrice || parseNumeric(row.CurrentValue || 0) * 0.8),
                        renovationCost: parseNumeric(row.RenovationCost || row.renovationCost || 0),
                        currentValue: parseNumeric(row.CurrentValue || row.currentValue || 0),
                        debt: parseNumeric(row.Debt || row.debt || 0),
                        monthlyRent: parseNumeric(row.MonthlyRent || row.monthlyRent || 0),
                        monthlyExpenses: parseNumeric(row.MonthlyExpenses || row.monthlyExpenses || 0),
                        monthlyDebtService: parseNumeric(row.MonthlyDebtService || row.monthlyDebtService || 0),
                        principalPayment: parseNumeric(row.PrincipalPayment || row.principalPayment || 0),
                        debtType: row.DebtType || row.debtType || "Fixed",
                        interestRate: parseNumeric(row.InterestRate || row.interestRate || 0),
                        loanDurationMonths: parseNumeric(row.LoanDurationMonths || row.loanDurationMonths || 360),
                        fixedTermRemainingMonths: parseNumeric(row.FixedTermRemainingMonths || row.fixedTermRemainingMonths || 0),
                        reserviceDate: row.ReserviceDate || row.reserviceDate || undefined,
                    },
                    acquisitionDate: row.AcquisitionDate || row.acquisitionDate || undefined,
                }));

                setTimeout(() => {
                    setIsImporting(false);
                    setImportSuccess(true);
                    setTimeout(() => {
                        onAddAssets(parsedAssets);
                        setImportSuccess(false);
                        onClose();
                    }, 1500);
                }, 1000);
            },
            error: () => {
                setIsImporting(false);
                alert("Error parsing CSV");
            }
        });
    };

    const downloadTemplate = () => {
        const csvContent = "Name,Address,Type,Status,Units,PurchasePrice,RenovationCost,CurrentValue,Debt,MonthlyRent,MonthlyExpenses,DebtType,InterestRate,LoanDurationMonths,FixedTermRemainingMonths,ReserviceDate,AcquisitionDate\nExample Condo,123 Main St,Condo,Active,1,400000,50000,500000,300000,4500,1200,Fixed,5.5,360,0,,2024-01-15\n";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "folio_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLinkImport = async () => {
        if (!listingUrl) return;
        setIsScraping(true);
        setScrapingError("");
        setShowMagicPaste(false);
        try {
            const res = await fetch("/api/assets/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: listingUrl }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Found a property - fill in the form and switch to manual
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                address: data.address || prev.address,
                currentValue: data.currentValue || prev.currentValue,
                image: data.image || prev.image,
            }));

            // Switch tabs so the user can review/edit
            setActiveTab("manual");
            setListingUrl("");
        } catch (e: any) {
            setScrapingError(e.message || "Failed to fetch property details.");
        } finally {
            setIsScraping(false);
        }
    };

    const handleMagicParse = () => {
        if (!magicText) return;

        // Use regex to find details in the pasted mess
        let price = 0;
        let address = "";

        // Look for $ symbols for price
        const priceMatch = magicText.match(/\$[\s]*[\d,]+/);
        if (priceMatch) {
            price = parseInt(priceMatch[0].replace(/[$,\s]/g, ""));
        }

        // Try to find address (very rough heuristic)
        const addressMatch = magicText.match(/\d+[\s\w\d,-]{5,}([\s\w,]{2,10})/);
        if (addressMatch) {
            address = addressMatch[0].trim();
        }

        setFormData(prev => ({
            ...prev,
            currentValue: price || prev.currentValue,
            address: address || prev.address,
            name: address.split(',')[0] || prev.name
        }));

        setActiveTab("manual");
        setShowMagicPaste(false);
        setMagicText("");
        setScrapingError("");
    };

    const handleExternalSolve = () => {
        if (!listingUrl) return;
        window.open(listingUrl, '_blank', 'width=1000,height=800');
        setShowMagicPaste(true);
    };

    const handleAISearch = async () => {
        if (!searchQuery) return;

        if (!isPro && usageCount >= 15) {
            setScrapingError("You have reached your 15 AI entry limit. Upgrade to Folio Pro to unlock unlimited AI property extraction.");
            return;
        }

        setIsScraping(true);
        setScrapingError("");
        setAiResult(null);
        setUseAI(true);
        try {
            const res = await fetch("/api/assets/ai-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Store result for preview
            setAiResult(data);

            // Still pre-fill form in case they switch to manual
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                address: data.address || prev.address,
                currentValue: data.currentValue || prev.currentValue,
                description: data.description || prev.description,
                status: initialStatus || "Lead / Prospect",
                type: (data.type || "Single-family") as any,
                image: data.image || prev.image,
                bedrooms: data.bedrooms || 0,
                bathrooms: data.bathrooms || 0,
                yearBuilt: data.yearBuilt || 0,
                lotSize: data.lotSize || ""
            }));

            // Increment AI usage limit (only for free users to track their 15)
            if (!isPro) {
                const newCount = usageCount + 1;
                setUsageCount(newCount);
                localStorage.setItem('follio_ai_usage_count', newCount.toString());
            }

        } catch (e: any) {
            setScrapingError(e.message || "AI failed to analyze property. Try a specific address.");
        } finally {
            setIsScraping(false);
            setUseAI(false);
        }
    };

    const confirmAIResult = () => {
        if (!aiResult) return;

        const val = parseNumeric(aiResult.currentValue);

        const newProperty: Property = {
            id: Math.random().toString(36).substring(7),
            name: aiResult.name || formData.name || "AI Generated Asset",
            address: aiResult.address || formData.address || "Unknown Address",
            status: initialStatus || "Lead / Prospect",
            type: aiResult.type || "Single-family",
            image: aiResult.image || formData.image,
            financials: {
                purchasePrice: val,
                currentValue: val,
                renovationCost: 0,
                debt: 0,
                monthlyRent: 0,
                monthlyExpenses: 0,
                monthlyDebtService: 0,
                principalPayment: 0
            },
            acquisitionDate: new Date().toISOString().split('T')[0],
            units: parseNumeric(aiResult.units) || 1,
            bedrooms: aiResult.bedrooms ? parseNumeric(aiResult.bedrooms) : undefined,
            bathrooms: aiResult.bathrooms ? parseNumeric(aiResult.bathrooms) : undefined,
            yearBuilt: aiResult.yearBuilt ? parseNumeric(aiResult.yearBuilt) : undefined,
            lotSize: aiResult.lotSize || formData.lotSize,
            description: aiResult.description || formData.description,
        };

        onAddAssets([newProperty]);
        onClose();
        setAiResult(null);
    };

    const editAIResult = () => {
        setActiveTab("manual");
        setAiResult(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-[95vw] sm:w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-900/50">
                            <h2 className="text-xl font-bold text-white">{t("addAssetModalTitle")}</h2>
                            <button onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex px-6 pt-4 gap-6 border-b border-slate-800">
                            <button
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "manual" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                                onClick={() => setActiveTab("manual")}
                            >
                                {t("manualEntry")}
                            </button>
                            <button
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "link" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                                onClick={() => setActiveTab("link")}
                            >
                                From Link
                            </button>
                            <button
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "import" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                                onClick={() => setActiveTab("import")}
                            >
                                {t("importSpreadsheet")}
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {activeTab === "manual" ? (
                                <form id="add-asset-form" onSubmit={handleManualSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("propertyName")}</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                                placeholder="e.g. Sunset Apartments"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("propertyAddress")}</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 relative z-10"
                                                placeholder="123 Ocean Drive"
                                                value={formData.address}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, address: e.target.value });
                                                    setAddressQuery(e.target.value);
                                                }}
                                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            />
                                            <AnimatePresence>
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 w-full top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                                    >
                                                        {suggestions.map((sbg, i) => (
                                                            <div
                                                                key={i}
                                                                className="px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors border-b border-slate-700/50 last:border-0"
                                                                onClick={() => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        address: sbg.display_name,
                                                                        lat: parseFloat(sbg.lat),
                                                                        lng: parseFloat(sbg.lon)
                                                                    });
                                                                    setShowSuggestions(false);
                                                                }}
                                                            >
                                                                {sbg.display_name}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("type")}</label>
                                            <select
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="Single-family">Single-family</option>
                                                <option value="Multi-family">Multi-family</option>
                                                <option value="Multi-unit">Multi-unit</option>
                                                <option value="Condo">Condo</option>
                                                <option value="Duplex">Duplex</option>
                                                <option value="Commercial">Commercial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("status")}</label>
                                            <select
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                                            >
                                                <option value="Lead / Prospect">Lead / Prospect</option>
                                                <option value="Under Analysis">Under Analysis</option>
                                                <option value="Offer Submitted">Offer Submitted</option>
                                                <option value="Under Contract">Under Contract</option>
                                                <option value="Incoming Asset">Incoming Asset</option>
                                                <option value="Active">Active</option>
                                                <option value="Renovation">Renovation</option>
                                                <option value="On Market">On Market</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("acquisitionDate")}</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 [color-scheme:dark]"
                                                value={formData.acquisitionDate}
                                                onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:col-span-2 mt-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("bedrooms")}</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                                                    value={formData.bedrooms || ""}
                                                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("bathrooms")}</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                                                    value={formData.bathrooms || ""}
                                                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("yearBuilt")}</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                                                    value={formData.yearBuilt || ""}
                                                    onChange={(e) => setFormData({ ...formData, yearBuilt: Number(e.target.value) })}
                                                    placeholder="e.g. 1990"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("lotSize")}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                                                    value={formData.lotSize || ""}
                                                    onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                                                    placeholder="e.g. 0.5 acres"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 md:col-span-2 border-t border-slate-800 mt-4">
                                            <h3 className="text-sm font-semibold text-slate-200 mb-4">{t("propertyInfo")}</h3>
                                            <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                                                <div className="w-full sm:w-32 h-32 rounded-xl border border-slate-700 bg-slate-950/50 overflow-hidden shrink-0">
                                                    <img
                                                        src={formData.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800";
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2 w-full">
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("propertyImage")}</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 font-mono text-[11px]"
                                                        placeholder="Paste image link here..."
                                                        value={formData.image}
                                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    />
                                                    <p className="text-[10px] text-slate-500 italic">This photo will represent the asset on your dashboard and map.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {["Multi-family", "Multi-unit", "Condo", "Duplex", "Commercial"].includes(formData.type) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                    className="space-y-2 md:col-span-2 lg:col-span-1"
                                                >
                                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("numberOfUnits")}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                                        placeholder="e.g. 50"
                                                        value={formData.units}
                                                        onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-200 mb-4">{t("simplifiedFinancials")}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("currentValue")}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                        value={formData.currentValue}
                                                        onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("debt")}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                        value={formData.debt}
                                                        onChange={(e) => setFormData({ ...formData, debt: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("monthlyRent")}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                        value={formData.monthlyRent}
                                                        onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("monthlyExpenses")}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                        value={formData.monthlyExpenses}
                                                        onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {formData.debt > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                                    className="pt-6 border-t border-slate-800"
                                                >
                                                    <h3 className="text-sm font-semibold text-slate-200 mb-4">{t("debtSpecifics")}</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("debtType")}</label>
                                                            <select
                                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                                value={formData.debtType}
                                                                onChange={(e) => setFormData({ ...formData, debtType: e.target.value })}
                                                            >
                                                                <option value="Fixed">{t("fixedRate")}</option>
                                                                <option value="Variable">{t("variableArm")}</option>
                                                                <option value="Interest Only">{t("interestOnly")}</option>
                                                                <option value="Balloon">{t("balloon")}</option>
                                                                <option value="Seller Financing">{t("sellerFinancing")}</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("interestRate")}</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-4 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                                    placeholder="e.g. 5.5"
                                                                    value={formData.interestRate || ""}
                                                                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("loanDuration")}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                                                placeholder="e.g. 360"
                                                                value={formData.loanDurationMonths || ""}
                                                                onChange={(e) => setFormData({ ...formData, loanDurationMonths: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("fixedTermRemaining")}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                                                placeholder="If ARM or Balloon, e.g. 60"
                                                                value={formData.fixedTermRemainingMonths || ""}
                                                                onChange={(e) => setFormData({ ...formData, fixedTermRemainingMonths: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("monthlyMortgage") || "Monthly Mortgage / Debt"}</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                                    value={formData.monthlyDebtService || ""}
                                                                    onChange={(e) => setFormData({ ...formData, monthlyDebtService: Number(e.target.value) })}
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("monthlyPrincipalPayment")}</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                                    value={formData.principalPayment || ""}
                                                                    onChange={(e) => setFormData({ ...formData, principalPayment: Number(e.target.value) })}
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("reserviceDate")}</label>
                                                            <input
                                                                type="date"
                                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 [color-scheme:dark]"
                                                                value={formData.reserviceDate}
                                                                onChange={(e) => setFormData({ ...formData, reserviceDate: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </form>
                            ) : activeTab === "link" ? (
                                <div className="space-y-6 py-4">
                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex gap-4 items-start mb-6 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16"></div>
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0 relative z-10">
                                            <Sparkles size={18} />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-sm font-semibold text-indigo-200">Magic Search 🪄</p>
                                            <p className="text-xs text-slate-400 mt-1">Found something? Just paste the **Address** or **URL** below. Our AI will search and pre-fill everything for you.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Address or Link</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                                    placeholder="e.g. 2384 Chebogue Rd, Yarmouth, NS"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                                                />
                                                <button
                                                    onClick={handleAISearch}
                                                    disabled={!searchQuery || isScraping}
                                                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition-all flex items-center gap-2 group shadow-lg shadow-indigo-500/20"
                                                >
                                                    {isScraping ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Thinking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={16} /> Search
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {isMounted && (
                                                <>
                                                    {usageCount >= 15 && !isPro ? (
                                                        <div className="mt-2 text-xs font-bold text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
                                                            You've reached your free 15/15 AI limits. Upgrade to Pro for unlimited AI additions.
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                                                            {!isPro
                                                                ? `${15 - usageCount} / 15 Free Generative Searches Remaining`
                                                                : "Unlimited Pro Search Active"}
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-slate-800/50">
                                                <button
                                                    onClick={() => setShowMagicPaste(!showMagicPaste)}
                                                    className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                                >
                                                    {showMagicPaste ? "Hide" : "Show"} Advanced Sync Assistant
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {aiResult && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-6 bg-slate-900 border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl"
                                                    >
                                                        <div className="relative h-48 sm:h-56">
                                                            <img
                                                                src={aiResult.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800"}
                                                                alt="Property Preview"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800";
                                                                }}
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 to-transparent">
                                                                <h4 className="text-white font-bold text-lg leading-tight">{aiResult.name}</h4>
                                                                <p className="text-slate-300 text-xs">{aiResult.address}</p>
                                                            </div>
                                                            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                                                <Sparkles size={12} /> {t("aiVerified")}
                                                            </div>
                                                        </div>
                                                        <div className="p-6 space-y-6">
                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t("marketValue")}</p>
                                                                    <p className="text-white font-bold text-lg">${Number(aiResult.currentValue || 0).toLocaleString()}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t("assetType")}</p>
                                                                    <p className="text-indigo-400 font-bold">{aiResult.type}</p>
                                                                </div>
                                                                {(aiResult.bedrooms || aiResult.bathrooms) && (
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t("bedsBaths")}</p>
                                                                        <p className="text-slate-200 font-bold">{aiResult.bedrooms || "-"}/{aiResult.bathrooms || "-"}</p>
                                                                    </div>
                                                                )}
                                                                {aiResult.yearBuilt && (
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t("yearBuilt")}</p>
                                                                        <p className="text-slate-200 font-bold">{aiResult.yearBuilt}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {aiResult.lotSize && (
                                                                <div className="bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/40 inline-flex items-center gap-2">
                                                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Lot Size:</span>
                                                                    <span className="text-xs text-slate-300 font-bold">{aiResult.lotSize}</span>
                                                                </div>
                                                            )}
                                                            <p className="text-slate-400 text-xs leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                                                                "{aiResult.description || "No further details discovered by AI."}"
                                                            </p>
                                                            <div className="flex gap-3 pt-2">
                                                                <button
                                                                    onClick={confirmAIResult}
                                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                                                >
                                                                    <CheckCircle size={16} /> Yes, Add Asset
                                                                </button>
                                                                <button
                                                                    onClick={editAIResult}
                                                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all border border-slate-700"
                                                                >
                                                                    Edit Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <AnimatePresence>
                                                {scrapingError && !showMagicPaste && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="mt-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs font-bold text-rose-300 uppercase tracking-wide">AI Error</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">{scrapingError}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleExternalSolve}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-all border border-slate-700"
                                                            >
                                                                <ExternalLink size={12} /> External Browser
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <AnimatePresence>
                                                {showMagicPaste && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-6 space-y-4"
                                                    >
                                                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest border-l-2 border-indigo-500 pl-3">
                                                            <Sparkles size={12} /> Sync Assistant Active
                                                        </div>
                                                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                                                            <ol className="text-[11px] text-slate-400 space-y-2 list-decimal ml-4">
                                                                <li>Solve any CAPTCHAs in the browser window.</li>
                                                                <li>Once the details load, **Select All** (Cmd+A) and **Copy**.</li>
                                                                <li>Paste the content below for instant parsing.</li>
                                                            </ol>
                                                            <textarea
                                                                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                                                                placeholder="Paste listing text here (Ctrl+V)"
                                                                value={magicText}
                                                                onChange={(e) => setMagicText(e.target.value)}
                                                            />
                                                            <button
                                                                onClick={handleMagicParse}
                                                                disabled={!magicText}
                                                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Copy size={14} /> Finish Sync
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/30 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Supported Platforms</p>
                                            <p className="text-xs text-slate-300 font-medium">Zillow, Realtor.ca, ViewPoint, MLS</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/30 text-center">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Included Assets</p>
                                            <p className="text-xs text-slate-300 font-medium">Photos, Price, Address, Specs</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />

                                    {importSuccess ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center text-emerald-400"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">{t("importSuccess")}</h3>
                                            <p className="text-slate-400 text-sm">Transferring to Portfolio Map...</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isImporting}
                                                className={`w-full max-w-md aspect-[2/1] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all ${isImporting ? 'border-slate-700 bg-slate-800/20 opacity-70' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/30 group cursor-pointer'}`}
                                            >
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isImporting ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'}`}>
                                                    {isImporting ? (
                                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                            <UploadCloud size={28} />
                                                        </motion.div>
                                                    ) : (
                                                        <UploadCloud size={28} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-200 mb-1">{isImporting ? "Importing..." : t("uploadFile")}</p>
                                                    <p className="text-xs text-slate-500">{t("uploadSubtext")}</p>
                                                </div>
                                            </button>

                                            <div className="mt-8 flex items-center gap-2">
                                                <button
                                                    onClick={downloadTemplate}
                                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                                                >
                                                    <Download size={14} /> {t("downloadTemplate")}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                {t("cancel")}
                            </button>
                            {activeTab === "manual" && (
                                <button
                                    form="add-asset-form"
                                    type="submit"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    {t("saveAsset")}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
