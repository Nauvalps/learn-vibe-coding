import { app } from "./src/index";
import { db } from "./src/db";
import { users, sessions } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("Setting up test data...");

  // Delete test user if it exists
  await db.delete(sessions);
  await db.delete(users).where(eq(users.email, "test@example.com"));

  // Create test user
  await db.insert(users).values({
    name: "Test User",
    email: "test@example.com",
    password: "securepassword",
  });

  console.log("Testing /users/login...");
  
  const loginResponse = await app.handle(
    new Request("http://localhost:3000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "securepassword",
      }),
    })
  );

  const loginData: any = await loginResponse.json();
  console.log("Login Response Status:", loginResponse.status);
  console.log("Login Response Body:", loginData);

  if (loginResponse.status !== 200 || !loginData.data) {
    throw new Error("Login test failed");
  }

  const token = loginData.data;

  console.log("\nTesting /users/verify with access token...");
  const verifyResponse = await app.handle(
    new Request(`http://localhost:3000/users/verify?access_token=${token}`, {
      method: "GET",
    })
  );

  const verifyData: any = await verifyResponse.json();
  console.log("Verify Response Status:", verifyResponse.status);
  console.log("Verify Response Body:", verifyData);

  if (verifyResponse.status !== 200 || verifyData.data.email !== "test@example.com") {
    throw new Error("Verification test failed");
  }

  console.log("\nAll tests passed successfully! 🎉");
  process.exit(0);
}

runTest().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
