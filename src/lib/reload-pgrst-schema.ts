import { Client } from "pg";

const pgConfig = {
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
};

/**
 * Sends NOTIFY pgrst, 'reload schema' to fix PGRST205.
 */
export async function reloadPgrstSchema(): Promise<boolean> {
    if (!pgConfig.connectionString) return false;
    const client = new Client(pgConfig);
    try {
        await client.connect();
        await client.query("NOTIFY pgrst, 'reload schema'");
        return true;
    } catch {
        return false;
    } finally {
        await client.end();
    }
}

/**
 * Fetches properties directly from Postgres, bypassing PostgREST (fixes PGRST205).
 */
export async function fetchPropertiesDirect(userId: string): Promise<any[] | null> {
    if (!pgConfig.connectionString) return null;
    const client = new Client(pgConfig);
    try {
        await client.connect();
        const res = await client.query(
            `SELECT * FROM public.properties WHERE user_id = $1 ORDER BY created_at DESC NULLS LAST`,
            [userId]
        );
        const rows = res.rows || [];
        if (rows.length > 0) {
            const sample = rows[0] as Record<string, unknown>;
            console.log("[Share] Direct fetch:", rows.length, "rows. Sample keys:", Object.keys(sample));
            const valKeys = ["current_value", "currentValue", "purchase_price", "purchasePrice", "financials"];
            const vals = valKeys.map(k => `${k}=${JSON.stringify(sample[k])}`).join(", ");
            console.log("[Share] Sample financial fields:", vals);
        }
        return rows;
    } catch (err) {
        console.error("Direct DB fetch error:", err);
        return null;
    } finally {
        await client.end();
    }
}

/**
 * Fetches subscription row directly from Postgres, bypassing PostgREST.
 */
export async function fetchSubscriptionDirect(userId: string): Promise<Record<string, unknown> | null> {
    if (!pgConfig.connectionString) return null;
    const client = new Client(pgConfig);
    try {
        await client.connect();
        const res = await client.query(
            `SELECT * FROM public.subscriptions WHERE user_id = $1 LIMIT 1`,
            [userId]
        );
        return (res.rows?.[0] as Record<string, unknown>) || null;
    } catch (err) {
        console.error("Direct subscription fetch error:", err);
        return null;
    } finally {
        await client.end();
    }
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Inserts a property directly via pg (bypasses PostgREST).
 */
export async function insertPropertyDirect(row: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    if (!pgConfig.connectionString) return null;
    const client = new Client(pgConfig);
    try {
        await client.connect();
        const id = (typeof row.id === "string" && uuidRegex.test(row.id)) ? row.id : crypto.randomUUID();
        const res = await client.query(
            `INSERT INTO public.properties (
                id, user_id, name, address, status, type, image, units, lat, lng,
                purchase_price, current_value, renovation_cost, debt,
                monthly_rent, monthly_expenses, monthly_debt_service, principle_payment,
                debt_type, interest_rate, loan_duration_months, fixed_term_remaining_months, reservice_date,
                acquisition_date, events, bedrooms, bathrooms, year_built, lot_size, description
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
            RETURNING *`,
            [
                id,
                row.user_id ?? "",
                row.name ?? "Untitled",
                row.address ?? "",
                row.status ?? "Lead / Prospect",
                row.type ?? "Single-family",
                row.image ?? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
                row.units ?? 1,
                row.lat ?? null,
                row.lng ?? null,
                Number(row.purchase_price ?? row.purchasePrice ?? 0),
                Number(row.current_value ?? row.currentValue ?? 0),
                Number(row.renovation_cost ?? row.renovationCost ?? 0),
                Number(row.debt ?? 0),
                Number(row.monthly_rent ?? row.monthlyRent ?? 0),
                Number(row.monthly_expenses ?? row.monthlyExpenses ?? 0),
                Number(row.monthly_debt_service ?? row.monthlyDebtService ?? 0),
                Number(row.principle_payment ?? row.principalPayment ?? row.principal_payment ?? 0),
                row.debt_type ?? row.debtType ?? null,
                row.interest_rate ?? row.interestRate ?? null,
                row.loan_duration_months ?? row.loanDurationMonths ?? null,
                row.fixed_term_remaining_months ?? row.fixedTermRemainingMonths ?? null,
                row.reservice_date ?? null,
                row.acquisition_date ?? row.acquisitionDate ?? null,
                JSON.stringify(row.events ?? []),
                row.bedrooms ?? null,
                row.bathrooms ?? null,
                row.year_built ?? row.yearBuilt ?? null,
                row.lot_size ?? row.lotSize ?? null,
                row.description ?? null,
            ]
        );
        return res.rows?.[0] as Record<string, unknown> ?? null;
    } catch (err: any) {
        console.error("Direct property insert error:", err?.message || err);
        throw err;
    } finally {
        await client.end();
    }
}
