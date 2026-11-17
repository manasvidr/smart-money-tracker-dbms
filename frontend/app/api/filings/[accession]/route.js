import {
  getFiling,
  updateStatus,
  removeFiling,
} from "@/lib/controllers/filingController";

// GET /api/filings/[accession]
export async function GET(request, context) {
  return getFiling(request, context);
}

// PATCH /api/filings/[accession] (ADMIN only)
export async function PATCH(request, context) {
  return updateStatus(request, context);
}

// DELETE /api/filings/[accession] (ADMIN only)
export async function DELETE(request, context) {
  return removeFiling(request, context);
}
