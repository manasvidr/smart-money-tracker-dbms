import {
  listTransactions,
  updateTransaction,
} from "@/lib/controllers/transactionController";

// GET /api/insider-transactions
export async function GET() {
  return listTransactions();
}

// PATCH /api/insider-transactions (ADMIN only: fires audit trigger)
export async function PATCH(request) {
  return updateTransaction(request);
}

