import { pool } from "../config/mysql.js";

// Find a user by username.
export async function findByUsername(username) {
  const [rows] = await pool.query(
    "SELECT user_id, username, email, password_hash FROM users WHERE username = ?",
    [username]
  );
  return rows[0] || null;
}

// Find a user by email.
export async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT user_id FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
}

// Create a new user and return the inserted id.
export async function createUser(username, email, passwordHash) {
  const [result] = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash]
  );
  return result.insertId;
}

// Assign a role to a user by role name.
export async function assignRole(userId, roleName) {
  const [roles] = await pool.query(
    "SELECT role_id FROM roles WHERE role_name = ?",
    [roleName]
  );
  if (!roles[0]) throw new Error("Role not found: " + roleName);
  await pool.query(
    "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
    [userId, roles[0].role_id]
  );
}

// Get all role names for a user.
export async function getUserRoles(userId) {
  const [rows] = await pool.query(
    `SELECT r.role_name
       FROM user_roles ur
       JOIN roles r ON r.role_id = ur.role_id
      WHERE ur.user_id = ?`,
    [userId]
  );
  return rows.map((r) => r.role_name);
}
