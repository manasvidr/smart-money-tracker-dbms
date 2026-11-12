import { getCompany } from "@/lib/controllers/companyController";

// GET /api/companies/[id]
export async function GET(request, context) {
  return getCompany(request, context);
}
