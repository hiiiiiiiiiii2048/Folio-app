import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const logs = logger.getLogs();
        return NextResponse.json(logs);
    } catch (error) {
        console.error("Logs API Error:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

// Optional: allow adding logs via POST (for testing or client-side logs)
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const newLog = logger.addLog(data);
        return NextResponse.json(newLog);
    } catch (error) {
        return NextResponse.json({ error: "Invalid log data" }, { status: 400 });
    }
}
