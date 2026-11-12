import { getUser, checkAccess } from "../auth.js";
import * as watchlistService from "../services/watchlistService.js";

// Handle GET /api/watchlist
export async function getWatchlist() {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const list = await watchlistService.getWatchlist(user.user_id);
  return Response.json(list);
}

// Handle POST /api/watchlist (DML 1: INSERT)
export async function addWatchlist(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  try {
    const { company_id, notes } = await request.json();
    if (!company_id) {
      return Response.json({ error: "company_id is required" }, { status: 400 });
    }
    await watchlistService.addToWatchlist(user.user_id, company_id, notes);
    return Response.json({ message: "Added to watchlist" }, { status: 201 });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Already in your watchlist" }, { status: 409 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Handle PUT /api/watchlist (DML 2: UPDATE)
export async function updateWatchlist(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { company_id, notes } = await request.json();
  if (!company_id) {
    return Response.json({ error: "company_id is required" }, { status: 400 });
  }

  const affected = await watchlistService.updateNote(user.user_id, company_id, notes);
  if (affected === 0) {
    return Response.json({ error: "Item not found in watchlist" }, { status: 404 });
  }
  return Response.json({ message: "Note updated successfully" });
}

// Handle DELETE /api/watchlist (DML 3: DELETE)
export async function deleteWatchlist(request) {
  const user = await getUser();
  const denied = checkAccess(user, ["ADMIN", "ANALYST"]);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const company_id = searchParams.get("company_id");
  if (!company_id) {
    return Response.json({ error: "company_id query param is required" }, { status: 400 });
  }

  const affected = await watchlistService.removeFromWatchlist(user.user_id, company_id);
  if (affected === 0) {
    return Response.json({ error: "Item not found in watchlist" }, { status: 404 });
  }
  return Response.json({ message: "Removed from watchlist" });
}
