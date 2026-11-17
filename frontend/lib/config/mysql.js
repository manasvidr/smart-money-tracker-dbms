import mysql from "mysql2/promise";

// One shared connection pool for the whole app.
const g = globalThis;
export const pool =
  g._mysqlPool ||
  (g._mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || undefined,
    database: process.env.MYSQL_DATABASE || "smart_money_tracker",
    waitForConnections: true,
    connectionLimit: 10,
  }));
