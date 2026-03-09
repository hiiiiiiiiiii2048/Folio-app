import { NextResponse } from "next/server";
import { reloadPgrstSchema } from "@/lib/reload-pgrst-schema";

/**
 * Reloads PostgREST schema cache (fixes PGRST205).
 * Requires SUPABASE_DB_URL in .env.local - get it from:
 * Supabase Dashboard → Settings → Database → Connection string (URI)
 */
export async function POST() {
    if (!process.env.SUPABASE_DB_URL) {
        return NextResponse.json(
            {
                error: "SUPABASE_DB_URL not set",
                hint: "Add it to .env.local from Supabase Dashboard → Settings → Database → Connection string (URI). Use the 'Transaction' pooler URL.",
            },
            { status: 503 }
        );
    }

    const ok = await reloadPgrstSchema();
    if (!ok) {
        return NextResponse.json({ error: "Failed to reload schema" }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Schema reload requested" });
}
