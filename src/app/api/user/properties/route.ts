import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fetchPropertiesDirect, insertPropertyDirect } from "@/lib/reload-pgrst-schema";
import { mapDbToProperty, mapPropertyToDb } from "@/lib/supabase-service";
import { Property } from "@/lib/data";

/**
 * Fetches the authenticated user's properties.
 * Uses direct DB fallback when PostgREST returns PGRST205.
 */
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from("properties")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        let rows: any[] = data || [];
        if (error?.code === "PGRST205") {
            const direct = await fetchPropertiesDirect(userId);
            rows = direct ?? [];
        } else if (error) {
            throw error;
        }

        const properties = rows.map(mapDbToProperty);
        return NextResponse.json({ properties });
    } catch (err: any) {
        console.error("[Properties API Error]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * Adds a property via admin client (bypasses RLS).
 * Use when client-side supabase insert fails.
 */
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const property = body as Property;
        const dbProp = mapPropertyToDb(property, userId) as unknown as Record<string, unknown>;

        let savedRow: Record<string, unknown> | null = null;
        const { data, error } = await supabaseAdmin
            .from("properties")
            .insert([dbProp])
            .select();

        if (error?.code === "PGRST205") {
            savedRow = await insertPropertyDirect(dbProp);
            if (!savedRow) {
                console.error("[Properties API] insertPropertyDirect returned null - check server logs for Direct property insert error");
                return NextResponse.json(
                    { error: "Direct insert failed. Ensure SUPABASE_DB_URL points to the same project as NEXT_PUBLIC_SUPABASE_URL (yhfwbukaoevpclgzyvre)." },
                    { status: 500 }
                );
            }
        } else if (error) {
            console.error("[Properties API] Insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            savedRow = data?.[0] as Record<string, unknown> ?? null;
        }

        const saved = savedRow ? mapDbToProperty(savedRow) : property;
        return NextResponse.json({ property: saved });
    } catch (err: any) {
        console.error("[Properties API] POST error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
