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
    console.error("SUPABASE_DB_URL not set in .env.local");
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'properties'
      );
    `);
    const exists = tableCheck.rows[0]?.exists;
    console.log("Table public.properties exists:", exists);

    if (exists) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'properties' 
        ORDER BY ordinal_position
      `);
      console.log("\nColumns:", cols.rows.map(r => r.column_name).join(", "));
      const count = await client.query("SELECT COUNT(*) FROM public.properties");
      console.log("Row count:", count.rows[0].count);
    }

    // Reload schema
    await client.query("NOTIFY pgrst, 'reload schema'");
    console.log("\nNOTIFY pgrst, 'reload schema' sent.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
