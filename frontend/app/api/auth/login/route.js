import { login } from "@/lib/controllers/authController";

// POST /api/auth/login — authenticate and set cookie.
export async function POST(request) {
  const body = await request.json();
  return login(body);
}
