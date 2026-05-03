import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [tables]: any = await connection.query("SHOW TABLES;");
    console.log("Existing tables:", tables);

    const [columns]: any = await connection.query("DESCRIBE users;");
    console.log("Users schema:", columns);
  } finally {
    await connection.end();
  }
}

check().catch(console.error);
