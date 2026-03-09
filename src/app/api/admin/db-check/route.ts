import { NextResponse } from "next/server";
import { Client } from "pg";

/**
 * Diagnostics: check DB connection and properties table.
 */
export async function GET(req: Request) {
    const dbUrl = process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
        return NextResponse.json({
            ok: false,
            error: "SUPABASE_DB_URL not set",
        });
    }

    const projectRef = dbUrl.match(/postgres\.([a-z0-9]+)\./)?.[1] || "?";
    const appRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\./)?.[1] || "?";

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        const tableCheck = await client.query(`
            SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties')
        `);
        const tableExists = tableCheck.rows?.[0]?.exists ?? false;

        let rowCount = 0;
        if (tableExists) {
            const countRes = await client.query(`SELECT COUNT(*) as c FROM public.properties`);
            rowCount = parseInt(String(countRes.rows?.[0]?.c ?? 0), 10);
        }

        return NextResponse.json({
            ok: true,
            dbProjectRef: projectRef,
            appProjectRef: appRef,
            match: projectRef === appRef,
            tableExists,
            totalProperties: rowCount,
        });
    } catch (err: any) {
        return NextResponse.json({
            ok: false,
            error: err.message,
            dbProjectRef: projectRef,
            appProjectRef: appRef,
        });
    } finally {
        await client.end();
    }
}
