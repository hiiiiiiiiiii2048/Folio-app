import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { insertPropertyDirect } from "@/lib/reload-pgrst-schema";
import { mapPropertyToDb } from "@/lib/supabase-service";
import { Property } from "@/lib/data";

/**
 * Attempts to sync one test property. Returns the raw result for debugging.
 */
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const property = body as Property;
    const dbProp = mapPropertyToDb(property, userId) as unknown as Record<string, unknown>;

    try {
        const saved = await insertPropertyDirect(dbProp);
        return NextResponse.json({
            success: !!saved,
            saved: saved ? "yes" : "no",
            error: saved ? null : "insertPropertyDirect returned null - check server terminal for details",
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message,
        }, { status: 500 });
    }
}
