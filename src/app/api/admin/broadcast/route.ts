import { NextResponse } from "next/server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subject, message, urgency = "info", scope = "global" } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });
        }

        // 1. Fetch all Clerk users
        const client = await clerkClient();
        const { data: allUsers } = await client.users.getUserList({ limit: 500, orderBy: "-created_at" });

        // 2. Optionally narrow the recipient list by scope
        let recipients = allUsers;

        if (scope === "pro") {
            // Fetch pro/enterprise user IDs from subscriptions table
            const { data: subs } = await supabaseAdmin
                .from("subscriptions")
                .select("user_id, plan")
                .in("plan", ["Pro", "Enterprise"]);
            const proIds = new Set((subs || []).map((s: any) => s.user_id));
            recipients = allUsers.filter(u => proIds.has(u.id));
        } else if (scope === "new") {
            // Signed up in the last 7 days
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            recipients = allUsers.filter(u => u.createdAt && u.createdAt > sevenDaysAgo);
        } else if (scope === "inactive") {
            // Last sign-in over 30 days ago
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            recipients = allUsers.filter(u => !u.lastSignInAt || u.lastSignInAt < thirtyDaysAgo);
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: "No matching recipients for this scope." }, { status: 400 });
        }

        // 3. Create a broadcast log entry
        const broadcastId = crypto.randomUUID();
        await supabaseAdmin.from("notification_broadcasts").insert({
            id: broadcastId,
            subject,
            message,
            urgency,
            scope,
            recipients: recipients.length,
        });

        // 4. Insert one notification row per recipient
        const rows = recipients.map((u) => ({
            user_id: u.id,
            title: subject,
            message,
            urgency,
            scope,
            is_read: false,
            broadcast_id: broadcastId,
        }));

        // Batch insert in chunks of 100 to avoid payload limits
        const CHUNK = 100;
        for (let i = 0; i < rows.length; i += CHUNK) {
            const { error } = await supabaseAdmin.from("notifications").insert(rows.slice(i, i + CHUNK));
            if (error) {
                console.error("Broadcast insert error:", error);
                return NextResponse.json({ error: "Failed to insert notifications", details: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, recipients: recipients.length, broadcastId });
    } catch (error: any) {
        console.error("Broadcast error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: fetch broadcast history for the admin panel
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("notification_broadcasts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
