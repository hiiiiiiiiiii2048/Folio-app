const path = require("path");
const fs = require("fs");
const { Client } = require("pg");

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const idx = line.indexOf("=");
    if (idx > 0 && !line.trim().startsWith("#")) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

async function run() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error("SUPABASE_DB_URL not set. Set it in .env.local or run: SUPABASE_DB_URL=\"...\" node scripts/reload-pgrst-schema.js");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log("PostgREST schema reload requested. The properties table should appear in the REST API shortly.");
  } catch (err) {
    console.error("Reload error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
