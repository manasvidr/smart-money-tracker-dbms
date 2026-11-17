import { getUser, checkAccess } from "../auth.js";
import * as companyService from "../services/companyService.js";

// Handle GET /api/companies
export async function listCompanies(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const companies = await companyService.getCompanies(search);
  return Response.json(companies);
}

// Handle GET /api/companies/[id]
export async function getCompany(request, { params }) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { id } = await params;
  const company = await companyService.getCompanyById(id);
  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }
  return Response.json(company);
}
