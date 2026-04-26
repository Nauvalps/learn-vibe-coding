import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

try {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  console.log("Connected successfully!");
  await connection.end();
} catch (error) {
  console.error("Connection failed:", error);
}
