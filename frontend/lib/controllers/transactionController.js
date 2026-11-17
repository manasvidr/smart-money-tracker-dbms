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

// Handle PATCH /api/insider-transactions (ADMIN only: triggers audit log trigger)
export async function updateTransaction(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN"]);
  if (denied) return denied;

  const { transaction_id, shares_traded } = await request.json();
  if (!transaction_id || !shares_traded) {
    return Response.json({ error: "transaction_id and shares_traded are required" }, { status: 400 });
  }

  const affected = await transactionService.updateTransactionShares(transaction_id, shares_traded);
  if (affected === 0) {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }
  return Response.json({ message: "Transaction updated, audit trigger fired" });
}

