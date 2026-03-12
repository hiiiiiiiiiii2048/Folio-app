import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: fetch notifications for the currently logged-in user
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(30);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: mark notification(s) as read
export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids } = await req.json(); // array of notification IDs, or "all"

        if (ids === "all") {
            await supabaseAdmin
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", userId);
        } else if (Array.isArray(ids)) {
            await supabaseAdmin
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", userId)
                .in("id", ids);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
