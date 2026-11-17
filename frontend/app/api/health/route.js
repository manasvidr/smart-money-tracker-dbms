import { pool } from "@/lib/config/mysql";
import { filingsCollection } from "@/lib/config/mongo";

// Health check: verifies MySQL and MongoDB connections.
export async function GET() {
  try {
    await pool.query("SELECT 1");
    const col = await filingsCollection();
    const count = await col.countDocuments();
    return Response.json({ mysql: "ok", mongo: count });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
