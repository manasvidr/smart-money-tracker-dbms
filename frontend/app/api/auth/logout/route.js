import { logout } from "@/lib/controllers/authController";

// POST /api/auth/logout — clear the auth cookie.
export async function POST() {
  return logout();
}
