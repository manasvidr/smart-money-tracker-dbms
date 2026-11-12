import { listTransactions } from "@/lib/controllers/transactionController";

// GET /api/insider-transactions
export async function GET() {
  return listTransactions();
}
