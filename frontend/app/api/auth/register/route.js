import { register } from "@/lib/controllers/authController";

// POST /api/auth/register — create a new analyst account.
export async function POST(request) {
  const body = await request.json();
  return register(body);
}
