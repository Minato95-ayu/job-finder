import Database from "better-sqlite3";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../../../server/jobs.db");

const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT,
    company TEXT,
    category TEXT,
    location TEXT,
    state TEXT,
    type TEXT,
    experience TEXT,
    postedDays INTEGER,
    source TEXT,
    sourceKind TEXT,
    description TEXT,
    applyUrl TEXT,
    skills TEXT,
    fetchedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_score REAL DEFAULT 0,
    is_scam INTEGER DEFAULT 0,
    ai_analysis TEXT
  )
`);

// Migration: Ensure new columns exist in old databases
const columns = db.prepare("PRAGMA table_info(jobs)").all();
const columnNames = columns.map(c => c.name);

if (!columnNames.includes("ai_score")) {
  db.exec("ALTER TABLE jobs ADD COLUMN ai_score REAL DEFAULT 0");
}
if (!columnNames.includes("is_scam")) {
  db.exec("ALTER TABLE jobs ADD COLUMN is_scam INTEGER DEFAULT 0");
}
if (!columnNames.includes("ai_analysis")) {
  db.exec("ALTER TABLE jobs ADD COLUMN ai_analysis TEXT");
}

export default db;
