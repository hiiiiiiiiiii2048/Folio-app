import { clerkClient, auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function calculateHealthScore(properties: any[]): number {
    const activeProperties = properties.filter(
        (p) => !["Lead / Prospect", "Under Analysis"].includes(p.status)
    );

    if (activeProperties.length === 0) return 100;

    const totalValue = activeProperties.reduce((sum, p) => sum + (Number(p.current_value) || 0), 0);
    const totalDebt = activeProperties.reduce((sum, p) => sum + (Number(p.debt) || 0), 0);
    const ltv = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;

    const monthlyIncome = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_rent) || 0), 0);
    const monthlyExpenses = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_expenses) || 0), 0);
    const monthlyDebtService = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_debt_service) || 0), 0);
    const netCashflow = monthlyIncome - monthlyExpenses - monthlyDebtService;
    const cashflowMargin = monthlyIncome > 0 ? (netCashflow / monthlyIncome) * 100 : 0;

    let score = 100;
    if (ltv > 85) score -= 30;
    else if (ltv > 75) score -= 20;
    else if (ltv > 65) score -= 10;

    if (cashflowMargin < 0) score -= 40;
    else if (cashflowMargin < 15) score -= 20;
    else if (cashflowMargin < 30) score -= 10;

    const variableDebt = activeProperties
        .filter((p) => p.debt_type === "Variable" || p.debt_type === "ARM")
        .reduce((sum, p) => sum + (Number(p.debt) || 0), 0);
    const variableDebtRatio = totalDebt > 0 ? variableDebt / totalDebt : 0;
    if (variableDebtRatio > 0.5) score -= 15;
    else if (variableDebtRatio > 0.25) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const client = await clerkClient();

        // Fetch all users
        const users = await client.users.getUserList({
            limit: 100,
            orderBy: "-created_at",
        });

        // Fetch all properties in one query (admin bypasses RLS)
        const { data: allProperties } = await supabaseAdmin
            .from("properties")
            .select("user_id, status, current_value, debt, monthly_rent, monthly_expenses, monthly_debt_service, debt_type, name, type, image");

        // Group properties by user_id
        const propertiesByUser = (allProperties || []).reduce((acc: Record<string, any[]>, prop) => {
            if (!acc[prop.user_id]) acc[prop.user_id] = [];
            acc[prop.user_id].push(prop);
            return acc;
        }, {});

        // Fetch all subscriptions
        const { data: allSubs } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan, status");
        const subsByUser = (allSubs || []).reduce((acc: Record<string, any>, sub) => {
            acc[sub.user_id] = sub;
            return acc;
        }, {});

        // Fetch real session counts for all users in parallel
        const sessionCounts = await Promise.all(
            users.data.map(async (clerkUser) => {
                try {
                    const sessions = await client.sessions.getSessionList({
                        userId: clerkUser.id,
                        limit: 500,
                    });
                    return { id: clerkUser.id, count: sessions.data?.length ?? 0 };
                } catch {
                    return { id: clerkUser.id, count: 0 };
                }
            })
        );
        const sessionCountMap = sessionCounts.reduce((acc: Record<string, number>, s) => {
            acc[s.id] = s.count;
            return acc;
        }, {});

        const formattedUsers = users.data.map((clerkUser) => {
            const userProps = propertiesByUser[clerkUser.id] || [];
            const sub = subsByUser[clerkUser.id];
            const healthScore = calculateHealthScore(userProps);
            const visitCount = sessionCountMap[clerkUser.id] ?? 0;

            const now = Date.now();
            const lastSignIn = clerkUser.lastSignInAt;
            let status = "idle";
            if (lastSignIn) {
                const diffMs = now - lastSignIn;
                if (diffMs < 5 * 60 * 1000) status = "active";
                else if (diffMs > 7 * 24 * 60 * 60 * 1000) status = "at-risk";
            }

            return {
                id: clerkUser.id,
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Anonymous",
                email: clerkUser.emailAddresses[0]?.emailAddress || "N/A",
                lastSeen: lastSignIn ? new Date(lastSignIn).toLocaleString() : "Never",
                createdAt: clerkUser.createdAt,
                imageUrl: clerkUser.imageUrl,
                properties: userProps.length,
                propertyDetails: userProps,
                plan: sub?.plan || "Free",
                health: healthScore,
                status,
                visits: visitCount,
                totalValue: userProps.reduce((s, p) => s + (Number(p.current_value) || 0), 0),
                totalDebt: userProps.reduce((s, p) => s + (Number(p.debt) || 0), 0),
                monthlyRent: userProps.reduce((s, p) => s + (Number(p.monthly_rent) || 0), 0),
                monthlyExpenses: userProps.reduce((s, p) => s + (Number(p.monthly_expenses) || 0), 0),
                netCashflow: userProps.reduce((s, p) => s + (Number(p.monthly_rent) || 0) - (Number(p.monthly_expenses) || 0) - (Number(p.monthly_debt_service) || 0), 0),
            };
        });

        return NextResponse.json(formattedUsers);
    } catch (error: any) {
        console.error("Failed to fetch admin users data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function calculateHealthScore(properties: any[]): number {
    const activeProperties = properties.filter(
        (p) => !["Lead / Prospect", "Under Analysis"].includes(p.status)
    );

    if (activeProperties.length === 0) return 100;

    const totalValue = activeProperties.reduce((sum, p) => sum + (Number(p.current_value) || 0), 0);
    const totalDebt = activeProperties.reduce((sum, p) => sum + (Number(p.debt) || 0), 0);
    const ltv = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;

    const monthlyIncome = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_rent) || 0), 0);
    const monthlyExpenses = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_expenses) || 0), 0);
    const monthlyDebtService = activeProperties.reduce((sum, p) => sum + (Number(p.monthly_debt_service) || 0), 0);
    const netCashflow = monthlyIncome - monthlyExpenses - monthlyDebtService;
    const cashflowMargin = monthlyIncome > 0 ? (netCashflow / monthlyIncome) * 100 : 0;

    let score = 100;

    // LTV penalty
    if (ltv > 85) score -= 30;
    else if (ltv > 75) score -= 20;
    else if (ltv > 65) score -= 10;

    // Cashflow penalty
    if (cashflowMargin < 0) score -= 40;
    else if (cashflowMargin < 15) score -= 20;
    else if (cashflowMargin < 30) score -= 10;

    // Variable debt penalty
    const variableDebt = activeProperties
        .filter((p) => p.debt_type === "Variable" || p.debt_type === "ARM")
        .reduce((sum, p) => sum + (Number(p.debt) || 0), 0);
    const variableDebtRatio = totalDebt > 0 ? variableDebt / totalDebt : 0;
    if (variableDebtRatio > 0.5) score -= 15;
    else if (variableDebtRatio > 0.25) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const client = await clerkClient();
        const users = await client.users.getUserList({
            limit: 100,
            orderBy: "-created_at",
        });

        // Fetch all properties for all users in a single query (admin bypass RLS)
        const { data: allProperties } = await supabaseAdmin
            .from("properties")
            .select("user_id, status, current_value, debt, monthly_rent, monthly_expenses, monthly_debt_service, debt_type, name, type, image");

        // Group properties by user_id
        const propertiesByUser = (allProperties || []).reduce((acc: Record<string, any[]>, prop) => {
            if (!acc[prop.user_id]) acc[prop.user_id] = [];
            acc[prop.user_id].push(prop);
            return acc;
        }, {});

        // Fetch all subscriptions
        const { data: allSubs } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, plan, status");
        const subsByUser = (allSubs || []).reduce((acc: Record<string, any>, sub) => {
            acc[sub.user_id] = sub;
            return acc;
        }, {});

        const formattedUsers = users.data.map((clerkUser) => {
            const userProps = propertiesByUser[clerkUser.id] || [];
            const sub = subsByUser[clerkUser.id];
            const healthScore = calculateHealthScore(userProps);

            const now = Date.now();
            const lastSignIn = clerkUser.lastSignInAt;
            let status = "idle";
            if (lastSignIn) {
                const diffMs = now - lastSignIn;
                if (diffMs < 5 * 60 * 1000) status = "active"; // within 5 min
                else if (diffMs > 7 * 24 * 60 * 60 * 1000) status = "at-risk"; // over 7 days
            }

            return {
                id: clerkUser.id,
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Anonymous",
                email: clerkUser.emailAddresses[0]?.emailAddress || "N/A",
                lastSeen: lastSignIn ? new Date(lastSignIn).toLocaleString() : "Never",
                createdAt: clerkUser.createdAt,
                imageUrl: clerkUser.imageUrl,
                properties: userProps.length,
                propertyDetails: userProps,
                plan: sub?.plan || "Free",
                health: healthScore,
                status,
                visits: 1, // will be replaced when user_activities table is populated
                // Computed financials for quick stats
                totalValue: userProps.reduce((s, p) => s + (Number(p.current_value) || 0), 0),
                totalDebt: userProps.reduce((s, p) => s + (Number(p.debt) || 0), 0),
                monthlyRent: userProps.reduce((s, p) => s + (Number(p.monthly_rent) || 0), 0),
                monthlyExpenses: userProps.reduce((s, p) => s + (Number(p.monthly_expenses) || 0), 0),
                netCashflow: userProps.reduce((s, p) => s + (Number(p.monthly_rent) || 0) - (Number(p.monthly_expenses) || 0) - (Number(p.monthly_debt_service) || 0), 0),
            };
        });

        return NextResponse.json(formattedUsers);
    } catch (error: any) {
        console.error("Failed to fetch admin users data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
