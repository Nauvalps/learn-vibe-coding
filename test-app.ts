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

  console.log("\nTesting /api/users/current with Bearer access token...");
  const currentResponse = await app.handle(
    new Request("http://localhost:3000/api/users/current", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
  );

  const currentData: any = await currentResponse.json();
  console.log("Current user Response Status:", currentResponse.status);
  console.log("Current user Response Body:", currentData);

  if (currentResponse.status !== 200 || currentData.data.email !== "test@example.com") {
    throw new Error("Get Current User test failed");
  }

  console.log("\nTesting NEGATIVE Scenario: /users/login with wrong password...");
  const wrongPassResponse = await app.handle(
    new Request("http://localhost:3000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    })
  );
  const wrongPassData: any = await wrongPassResponse.json();
  console.log("Wrong password Response Status:", wrongPassResponse.status);
  console.log("Wrong password Response Body:", wrongPassData);
  if (wrongPassResponse.status !== 401 || wrongPassData.message !== "Login failed") {
    throw new Error("Negative test for wrong password failed");
  }

  console.log("\nTesting NEGATIVE Scenario: /api/users/current with invalid token...");
  const invalidTokenResponse = await app.handle(
    new Request("http://localhost:3000/api/users/current", {
      method: "GET",
      headers: {
        "Authorization": "Bearer invalid-token"
      }
    })
  );
  const invalidTokenData: any = await invalidTokenResponse.json();
  console.log("Invalid token Response Status:", invalidTokenResponse.status);
  console.log("Invalid token Response Body:", invalidTokenData);
  if (invalidTokenResponse.status !== 401 || invalidTokenData.message !== "Unauthorized") {
    throw new Error("Negative test for invalid token failed");
  }

  console.log("\nAll tests (positive & negative) passed successfully! 🎉");
  process.exit(0);
}

runTest().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
