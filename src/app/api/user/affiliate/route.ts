import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/user/affiliate — Get current user's affiliate profile and stats
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: affiliate, error } = await supabase
            .from("affiliates")
            .select(`
                *,
                conversions:affiliate_conversions(id, amount_usd, commission_earned, downline_earned, status, created_at, referred_user_id),
                payouts:affiliate_payouts(id, amount, status, paid_at)
            `)
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        if (affiliate) {
            // Fetch team members (people referred by this user who are also affiliates)
            const referredUserIds = affiliate.conversions
                ?.map((c: any) => c.referred_user_id)
                .filter(Boolean);

            if (referredUserIds && referredUserIds.length > 0) {
                const { data: team } = await supabase
                    .from("affiliates")
                    .select("id, name, email, total_conversions, created_at")
                    .in("user_id", referredUserIds);

                (affiliate as any).team = team || [];
            } else {
                (affiliate as any).team = [];
            }
        }

        return NextResponse.json(affiliate || null);
    } catch (err: any) {
        console.error("[User Affiliate GET]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/user/affiliate — Join the affiliate program
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if already an affiliate
        const { data: existing } = await supabase
            .from("affiliates")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (existing) {
            return NextResponse.json({ error: "Already an affiliate" }, { status: 400 });
        }

        const email = user.primaryEmailAddress?.emailAddress || "";
        const name = user.fullName || email.split("@")[0];

        // Auto-generate ref code
        const base = (name || email).slice(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, "");
        const ref_code = `${base}${Math.floor(Math.random() * 900 + 100)}`;

        const { data, error } = await supabase
            .from("affiliates")
            .insert([{
                user_id: userId,
                email,
                name,
                ref_code,
                tier: "standard",
                commission_pct: 30,
                downline_pct: 10,
                status: "active"
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("[User Affiliate POST]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
