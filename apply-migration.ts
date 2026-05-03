import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

async function apply() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    console.log("Adding password column...");
    try {
      await connection.query("ALTER TABLE users ADD password varchar(255) NOT NULL;");
    } catch (e: any) {
      console.log("Password column already exists or failed:", e.message);
    }

    console.log("Adding access_token column...");
    try {
      await connection.query("ALTER TABLE users ADD access_token varchar(255);");
    } catch (e: any) {
      console.log("access_token column already exists or failed:", e.message);
    }

    console.log("Creating sessions table...");
    try {
      await connection.query(`
        CREATE TABLE sessions (
          id varchar(255) NOT NULL,
          user_id bigint(20) unsigned NOT NULL,
          token varchar(255) NOT NULL,
          created_at timestamp DEFAULT CURRENT_TIMESTAMP,
          expired_at timestamp NULL DEFAULT NULL,
          CONSTRAINT sessions_id PRIMARY KEY(id),
          CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
      `);
    } catch (e: any) {
      console.log("Sessions table already exists or failed:", e.message);
    }

    console.log("Migrations applied successfully!");
  } finally {
    await connection.end();
  }
}

apply().catch(console.error);
