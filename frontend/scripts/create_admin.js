import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local manually for script execution
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...values] = trimmed.split("=");
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join("=").trim();
      }
    }
  });
}

// Creates an admin user with a specified password
async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: node scripts/create_admin.js <password>");
    process.exit(1);
  }

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "smart_money_tracker",
  });

  try {
    const hash = await bcrypt.hash(password, 10);
    
    // Check if admin user already exists
    const [existing] = await pool.query("SELECT user_id FROM users WHERE username = 'admin'");
    let userId;

    if (existing.length > 0) {
      userId = existing[0].user_id;
      await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [hash, userId]);
      console.log(`Updated existing admin user (ID: ${userId}) password.`);
    } else {
      const [res] = await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ('admin', 'admin@smartmoney.local', ?)",
        [hash]
      );
      userId = res.insertId;
      console.log(`Created admin user (ID: ${userId}).`);
    }

    // Get ADMIN role id
    const [roles] = await pool.query("SELECT role_id FROM roles WHERE role_name = 'ADMIN'");
    if (roles.length === 0) {
      throw new Error("ADMIN role does not exist in roles table");
    }
    const adminRoleId = roles[0].role_id;

    // Assign role if not already assigned
    const [userRoles] = await pool.query(
      "SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?",
      [userId, adminRoleId]
    );
    if (userRoles.length === 0) {
      await pool.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, adminRoleId]);
      console.log("Assigned ADMIN role to user.");
    } else {
      console.log("ADMIN role already assigned.");
    }

    console.log("Admin setup complete!");
  } catch (err) {
    console.error("Error creating admin:", err.message);
  } finally {
    await pool.end();
  }
}

main();
