export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    endpoint: string;
    status: number;
    duration: string;
    message: string;
    type: "info" | "error" | "success";
}

// Global variable to persist logs between hot reloads in development
let globalLogs: LogEntry[] = [];

if (process.env.NODE_ENV === 'development') {
    if (!(global as any).apiLogs) {
        (global as any).apiLogs = [];
    }
    globalLogs = (global as any).apiLogs;
}

export const logger = {
    addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
        const newLog: LogEntry = {
            ...log,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };

        globalLogs.unshift(newLog);

        // Keep only last 100 logs
        if (globalLogs.length > 100) {
            globalLogs.pop();
        }

        return newLog;
    },

    getLogs: () => {
        return [...globalLogs];
    }
};
