import { me } from "@/lib/controllers/authController";

// GET /api/auth/me — return the logged-in user info.
export async function GET() {
  return me();
}
