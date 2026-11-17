import { listAuditLogs } from "@/lib/controllers/auditController";

// GET /api/audit-logs (ADMIN only)
export async function GET() {
  return listAuditLogs();
}
