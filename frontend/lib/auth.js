import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Create a login token containing user id, username and roles.
export function signToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "2h" });
}

// Read the logged-in user from the cookie, or return null.
export async function getUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Returns an error Response if not logged in / wrong role, otherwise null.
export function checkAccess(user, allowedRoles) {
  if (!user)
    return Response.json({ error: "Please log in" }, { status: 401 });
  if (allowedRoles && !user.roles.some((r) => allowedRoles.includes(r)))
    return Response.json({ error: "Not allowed for your role" }, { status: 403 });
  return null;
}
