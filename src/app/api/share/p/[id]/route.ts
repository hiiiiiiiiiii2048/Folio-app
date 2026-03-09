import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fetchPropertiesDirect } from "@/lib/reload-pgrst-schema";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: userId } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('properties')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error?.code === 'PGRST205') {
            console.warn("Share API: PGRST205 — using direct DB fallback");
            const direct = await fetchPropertiesDirect(userId);
            if (direct !== null) {
                return NextResponse.json({ properties: direct });
            }
            return NextResponse.json({
                error: "Unable to load shared portfolio. Please try again later."
            }, { status: 503 });
        }

        if (error) {
            console.error("Shared Fetch Error:", error);
            throw error;
        }

        return NextResponse.json({ properties: data || [] });
    } catch (error: any) {
        console.error("Internal Shared View Error:", error);
        return NextResponse.json({ error: "Failed to fetch shared data" }, { status: 500 });
    }
}
