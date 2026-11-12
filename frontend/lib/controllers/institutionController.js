import { getUser, checkAccess } from "../auth.js";
import * as institutionService from "../services/institutionService.js";

// Handle GET /api/institutional-holdings
export async function listHoldings() {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const holdings = await institutionService.getInstitutionalHoldings();
  return Response.json(holdings);
}
