import { app } from "./src/index";
import { db } from "./src/db";
import { users, sessions } from "./src/models/users-model";
import { eq } from "drizzle-orm";

async function runTest() {
  console.log("Setting up test data...");

  // Delete test user if it exists
  await db.delete(sessions);
  await db.delete(users).where(eq(users.email, "test@example.com"));

  console.log("Testing /users/register...");
  const registerResponse = await app.handle(
    new Request("http://localhost:3000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "TestUser",
        email: "test@example.com",
        password: "securepassword",
      }),
    })
  );

  const registerData: any = await registerResponse.json();
  console.log("Register Response Status:", registerResponse.status);
  console.log("Register Response Body:", registerData);

  if (registerResponse.status !== 200 || !registerData.user) {
    throw new Error("Register test failed");
  }

  console.log("\nTesting /users/login...");
  
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

  console.log("\nTesting /api/users/logout with valid token...");
  const logoutResponse = await app.handle(
    new Request("http://localhost:3000/api/users/logout", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
  );
  const logoutData: any = await logoutResponse.json();
  console.log("Logout Response Status:", logoutResponse.status);
  console.log("Logout Response Body:", logoutData);
  if (logoutResponse.status !== 200 || logoutData.data !== "OK") {
    throw new Error("Logout test failed");
  }

  console.log("\nTesting NEGATIVE Scenario: /users/register with 300 characters name...");
  const longName = "a".repeat(300);
  const registerLongNameResponse = await app.handle(
    new Request("http://localhost:3000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: longName,
        email: "longname@example.com",
        password: "securepassword",
      }),
    })
  );
  
  console.log("Register long name Response Status:", registerLongNameResponse.status);
  
  if (registerLongNameResponse.status !== 400 && registerLongNameResponse.status !== 422) {
    throw new Error("Negative test for long name registration failed. Expected 400 or 422 status.");
  }

  console.log("\nAll tests (positive & negative) passed successfully! 🎉");
  process.exit(0);
}

runTest().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
