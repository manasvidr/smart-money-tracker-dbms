import { listFilings } from "@/lib/controllers/filingController";

// GET /api/filings
export async function GET(request) {
  return listFilings(request);
}
