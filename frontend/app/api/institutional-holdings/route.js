import { listHoldings } from "@/lib/controllers/institutionController";

// GET /api/institutional-holdings
export async function GET() {
  return listHoldings();
}
