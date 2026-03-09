import { supabase } from './supabase';
import { Property, PropertyStatus } from './data';

export interface DbProperty {
    id?: string;
    user_id: string;
    name: string;
    address: string;
    status: string;
    type: string;
    image: string;
    units?: number;
    lat?: number;
    lng?: number;
    purchase_price: number;
    current_value: number;
    renovation_cost: number;
    debt: number;
    monthly_rent: number;
    monthly_expenses: number;
    monthly_debt_service: number;
    principle_payment: number;
    debt_type?: string;
    interest_rate?: number;
    loan_duration_months?: number;
    fixed_term_remaining_months?: number;
    reservice_date?: string;
    acquisition_date?: string;
    events?: any[];
    bedrooms?: number;
    bathrooms?: number;
    year_built?: number;
    lot_size?: string;
    description?: string;
}

export const mapDbToProperty = (db: any): Property => {
    if (!db || typeof db !== 'object') {
        return {
            id: Math.random().toString(36).substring(7),
            name: 'Corrupted Asset',
            address: 'Unknown',
            status: 'Lead / Prospect',
            type: 'Single-family',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
            financials: {
                purchasePrice: 0,
                currentValue: 0,
                renovationCost: 0,
                debt: 0,
                monthlyRent: 0,
                monthlyExpenses: 0,
                monthlyDebtService: 0,
                principalPayment: 0
            }
        } as Property;
    }

    return {
        id: db.id || '',
        name: db.name || 'Untitled',
        address: db.address || '',
        status: (db.status || 'Lead / Prospect') as PropertyStatus,
        type: db.type || 'Single-family',
        image: db.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
        units: db.units ? Number(db.units) : 1,
        lat: db.lat !== null && db.lat !== undefined ? Number(db.lat) : undefined,
        lng: db.lng !== null && db.lng !== undefined ? Number(db.lng) : undefined,
        financials: (() => {
            const n = (v: any) => (v != null && v !== '' ? Number(v) : 0);
            const val = (row: any, ...keys: string[]) => {
                for (const k of keys) {
                    const v = row?.[k];
                    if (v != null && v !== '') return Number(v);
                }
                return 0;
            };
            const flat = {
                purchasePrice: val(db, 'purchase_price', 'purchasePrice'),
                currentValue: val(db, 'current_value', 'currentValue'),
                renovationCost: val(db, 'renovation_cost', 'renovationCost'),
                debt: n(db?.debt),
                monthlyRent: val(db, 'monthly_rent', 'monthlyRent'),
                monthlyExpenses: val(db, 'monthly_expenses', 'monthlyExpenses'),
                monthlyDebtService: val(db, 'monthly_debt_service', 'monthlyDebtService'),
                principalPayment: val(db, 'principle_payment', 'principalPayment', 'principal_payment'),
            };
            if (flat.currentValue === 0 && flat.purchasePrice === 0 && db && typeof db === 'object') {
                for (const k of Object.keys(db)) {
                    if (/value|price/i.test(k)) {
                        const v = n((db as any)[k]);
                        if (v > 0) {
                            flat.currentValue = flat.purchasePrice = v;
                            break;
                        }
                    }
                }
            }
            const f = db.financials;
            if (f && typeof f === 'object' && flat.currentValue === 0 && flat.purchasePrice === 0) {
                return {
                    purchasePrice: n(f.purchasePrice ?? f.purchase_price),
                    currentValue: n(f.currentValue ?? f.current_value),
                    renovationCost: n(f.renovationCost ?? f.renovation_cost),
                    debt: n(f.debt),
                    monthlyRent: n(f.monthlyRent ?? f.monthly_rent),
                    monthlyExpenses: n(f.monthlyExpenses ?? f.monthly_expenses),
                    monthlyDebtService: n(f.monthlyDebtService ?? f.monthly_debt_service),
                    principalPayment: n(f.principalPayment ?? f.principal_payment ?? f.principle_payment),
                    debtType: f.debtType ?? f.debt_type ?? "Fixed",
                    interestRate: f.interestRate ?? (f.interest_rate != null ? Number(f.interest_rate) : undefined),
                    loanDurationMonths: f.loanDurationMonths ?? f.loan_duration_months ?? undefined,
                    fixedTermRemainingMonths: f.fixedTermRemainingMonths ?? f.fixed_term_remaining_months ?? undefined,
                    reserviceDate: f.reserviceDate ?? f.reservice_date ?? db.reservice_date,
                };
            }
            return {
                ...flat,
                debtType: db.debt_type ?? db.debtType ?? "Fixed",
                interestRate: db.interest_rate != null ? Number(db.interest_rate) : undefined,
                loanDurationMonths: db.loan_duration_months != null ? Number(db.loan_duration_months) : undefined,
                fixedTermRemainingMonths: db.fixed_term_remaining_months != null ? Number(db.fixed_term_remaining_months) : undefined,
                reserviceDate: db.reservice_date,
            };
        })(),
        acquisitionDate: db.acquisition_date,
        events: Array.isArray(db.events) ? db.events : [],
        bedrooms: db.bedrooms !== null ? Number(db.bedrooms) : undefined,
        bathrooms: db.bathrooms !== null ? Number(db.bathrooms) : undefined,
        yearBuilt: db.year_built !== null ? Number(db.year_built) : undefined,
        lotSize: db.lot_size,
        description: db.description,
    };
};

const getFallbackImage = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("multi")) return "https://images.unsplash.com/photo-1460317442991-0ec239387146?auto=format&fit=crop&q=80&w=800";
    if (t.includes("condo") || t.includes("town")) return "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=800";
    if (t.includes("commercial")) return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800";
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"; // Modern House
};

export const mapPropertyToDb = (prop: Property, userId: string): DbProperty => {
    const f = prop.financials || {};
    return {
        user_id: userId,
        name: prop.name || 'Untitled',
        address: prop.address || '',
        status: prop.status || 'Lead / Prospect',
        type: prop.type || 'Single-family',
        image: prop.image || getFallbackImage(prop.type || 'Single-family'),
        units: prop.units || 1,
        lat: prop.lat,
        lng: prop.lng,
        purchase_price: Number(f.purchasePrice || 0),
        current_value: Number(f.currentValue || 0),
        renovation_cost: Number(f.renovationCost || 0),
        debt: Number(f.debt || 0),
        monthly_rent: Number(f.monthlyRent || 0),
        monthly_expenses: Number(f.monthlyExpenses || 0),
        monthly_debt_service: Number(f.monthlyDebtService || 0),
        principle_payment: Number(f.principalPayment || 0),
        debt_type: f.debtType,
        interest_rate: f.interestRate,
        loan_duration_months: f.loanDurationMonths,
        fixed_term_remaining_months: f.fixedTermRemainingMonths,
        reservice_date: f.reserviceDate,
        acquisition_date: prop.acquisitionDate,
        events: prop.events || [],
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        year_built: prop.yearBuilt,
        lot_size: prop.lotSize,
        description: prop.description,
    };
};

export const supabaseService = {
    async getProperties(userId: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapDbToProperty);
    },

    async addProperty(property: Property, userId: string) {
        const dbProp = mapPropertyToDb(property, userId);
        const { data, error } = await supabase
            .from('properties')
            .insert([dbProp])
            .select();

        if (error) {
            console.error("Supabase insert error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn("Supabase insert returned no data, returning original property with local ID");
            return { ...property, id: property.id || Math.random().toString(36).substring(7) };
        }

        return data?.[0] ? mapDbToProperty(data[0]) : { ...property, id: property.id || Math.random().toString(36).substring(7) };
    },

    async updateProperty(id: string, updates: Partial<Property>, userId: string) {
        // This is complex because of nested financials. 
        // For simplicity in the dashboard (status drag-drop), let's handle just status for now
        // or a full object update if needed.

        let dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
        if (updates.lng !== undefined) dbUpdates.lng = updates.lng;

        if (updates.financials) {
            const f = updates.financials;
            if (f.currentValue !== undefined) dbUpdates.current_value = f.currentValue;
            if (f.debt !== undefined) dbUpdates.debt = f.debt;
            if (f.purchasePrice !== undefined) dbUpdates.purchase_price = f.purchasePrice;
            if (f.renovationCost !== undefined) dbUpdates.renovation_cost = f.renovationCost;
            if (f.monthlyRent !== undefined) dbUpdates.monthly_rent = f.monthlyRent;
            if (f.monthlyExpenses !== undefined) dbUpdates.monthly_expenses = f.monthlyExpenses;
            if (f.monthlyDebtService !== undefined) dbUpdates.monthly_debt_service = f.monthlyDebtService;
            if (f.principalPayment !== undefined) dbUpdates.principle_payment = f.principalPayment;
            if (f.debtType !== undefined) dbUpdates.debt_type = f.debtType;
            if (f.interestRate !== undefined) dbUpdates.interest_rate = f.interestRate;
            if (f.loanDurationMonths !== undefined) dbUpdates.loan_duration_months = f.loanDurationMonths;
            if (f.fixedTermRemainingMonths !== undefined) dbUpdates.fixed_term_remaining_months = f.fixedTermRemainingMonths;
            if (f.reserviceDate !== undefined) dbUpdates.reservice_date = f.reserviceDate;
        }

        if (updates.events) dbUpdates.events = updates.events;
        if (updates.acquisitionDate) dbUpdates.acquisition_date = updates.acquisitionDate;
        if (updates.address) dbUpdates.address = updates.address;
        if (updates.type) dbUpdates.type = updates.type;
        if (updates.units) dbUpdates.units = updates.units;
        if (updates.image) dbUpdates.image = updates.image;

        const { data, error } = await supabase
            .from('properties')
            .update(dbUpdates)
            .eq('id', id)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error("Supabase update error:", error);
            throw error;
        }
        if (!data || data.length === 0) throw new Error("No property updated or accessible.");
        return mapDbToProperty(data[0]);
    },

    async deleteProperty(id: string, userId: string) {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
};
