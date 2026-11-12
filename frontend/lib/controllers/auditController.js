import { getUser, checkAccess } from "../auth.js";
import * as auditService from "../services/auditService.js";

// Handle GET /api/audit-logs (ADMIN only)
export async function listAuditLogs() {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN"]);
  if (denied) return denied;

  const logs = await auditService.getAuditLogs();
  return Response.json(logs);
}
