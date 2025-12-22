import { getPool } from "./db-registry";

class DBCheck {
  static async checkConnection() {
    // check connection to database
    // ✅ CHECK DB CONNECTION
    try {
      const pool = getPool();
      await pool.query("SELECT 1");
      console.log("✅ Database connected successfully");
    } catch (err) {
      console.error("❌ Database connection failed", err);
      process.exit(1); // stop app if DB fail
    }
  }
}

DBCheck.checkConnection();