import { getUser, checkAccess } from "../auth.js";
import * as transactionService from "../services/transactionService.js";

// Handle GET /api/insider-transactions
export async function listTransactions() {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const transactions = await transactionService.getInsiderTransactions();
  return Response.json(transactions);
}
