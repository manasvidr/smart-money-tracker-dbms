import { listCompanies } from "@/lib/controllers/companyController";

// GET /api/companies
export async function GET(request) {
  return listCompanies(request);
}
