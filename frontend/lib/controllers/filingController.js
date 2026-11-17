import { getUser, checkAccess } from "../auth.js";
import * as filingService from "../services/filingService.js";

// Handle GET /api/filings
export async function listFilings(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const filings = await filingService.getFilings(ticker);
  return Response.json(filings);
}

// Handle GET /api/filings/[accession]
export async function getFiling(request, { params }) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { accession } = await params;
  const filing = await filingService.getFilingByAccession(accession);
  if (!filing) {
    return Response.json({ error: "Filing not found" }, { status: 404 });
  }
  return Response.json(filing);
}

// Handle PATCH /api/filings/[accession] (ADMIN only)
export async function updateStatus(request, { params }) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN"]);
  if (denied) return denied;

  const { accession } = await params;
  const body = await request.json();
  if (!body.parsed_status) {
    return Response.json({ error: "parsed_status is required" }, { status: 400 });
  }

  const modified = await filingService.updateFilingStatus(accession, body.parsed_status);
  return Response.json({ message: "Status updated", modified_count: modified });
}

// Handle DELETE /api/filings/[accession] (ADMIN only)
export async function removeFiling(request, { params }) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN"]);
  if (denied) return denied;

  const { accession } = await params;
  const deleted = await filingService.deleteFiling(accession);
  return Response.json({ message: "Filing deleted", deleted_count: deleted });
}
