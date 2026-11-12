import {
  getWatchlist,
  addWatchlist,
  updateWatchlist,
  deleteWatchlist,
} from "@/lib/controllers/watchlistController";

// GET /api/watchlist
export async function GET() {
  return getWatchlist();
}

// POST /api/watchlist (DML 1: INSERT)
export async function POST(request) {
  return addWatchlist(request);
}

// PUT /api/watchlist (DML 2: UPDATE)
export async function PUT(request) {
  return updateWatchlist(request);
}

// DELETE /api/watchlist (DML 3: DELETE)
export async function DELETE(request) {
  return deleteWatchlist(request);
}
