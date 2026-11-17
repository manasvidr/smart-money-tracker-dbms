import mysql from "mysql2/promise";

// One shared connection pool for the whole app.
const g = globalThis;
export const pool =
  g._mysqlPool ||
  (g._mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  }));
