import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as authService from "@/lib/services/authService";
import { signToken, getUser } from "@/lib/auth";
import { cookies } from "next/headers";

// Register a new user as ANALYST.
export async function register(body) {
  const { username, email, password } = body;

  if (!username || !email || !password)
    return Response.json({ error: "All fields are required" }, { status: 400 });
  if (password.length < 6)
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const existing = await authService.findByUsername(username);
  if (existing)
    return Response.json({ error: "Username already taken" }, { status: 409 });

  const emailExists = await authService.findByEmail(email);
  if (emailExists)
    return Response.json({ error: "Email already registered" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const userId = await authService.createUser(username, email, hash);
  await authService.assignRole(userId, "ANALYST");
  return Response.json({ message: "Registered successfully", user_id: userId }, { status: 201 });
}

// Log in and set an httpOnly cookie.
export async function login(body) {
  const { username, password } = body;
  if (!username || !password)
    return Response.json({ error: "Username and password required" }, { status: 400 });

  const user = await authService.findByUsername(username);
  if (!user)
    return Response.json({ error: "Invalid credentials" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return Response.json({ error: "Invalid credentials" }, { status: 401 });

  const roles = await authService.getUserRoles(user.user_id);
  const token = signToken({ user_id: user.user_id, username: user.username, roles });

  const res = NextResponse.json({ message: "Logged in", username: user.username, roles });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });
  return res;
}

// Log out by deleting the cookie.
export async function logout() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

// Return the current logged-in user.
export async function me() {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Not logged in" }, { status: 401 });
  return Response.json({ user_id: user.user_id, username: user.username, roles: user.roles });
}
