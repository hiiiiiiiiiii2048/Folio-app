import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        // Calculate a simulated health score based on load and memory
        const memUsagePercent = (usedMem / totalMem) * 100;
        const loadPercent = (loadAvg[0] / cpus.length) * 100;

        const stats = {
            cpuUsage: Math.round(loadPercent),
            ramUsed: (usedMem / (1024 * 1024 * 1024)).toFixed(2),
            ramTotal: (totalMem / (1024 * 1024 * 1024)).toFixed(2),
            ramUsagePercent: Math.round(memUsagePercent),
            storageUsed: "1.2", // Simulating storage as os module doesn't provide easy disk info without child_process
            storageTotal: "5.0",
            dbLatency: Math.floor(Math.random() * 20) + 10, // Simulated latency
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            cpus: cpus.length,
            status: "optimal",
            lastUpdated: new Date().toISOString()
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Infrastructure API Error:", error);
        return NextResponse.json({ error: "Failed to fetch system stats" }, { status: 500 });
    }
}
