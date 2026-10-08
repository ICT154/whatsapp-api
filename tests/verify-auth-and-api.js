const axios = require("axios");
const http = require("http");

// Atur port test
process.env.PORT = "5099";
process.env.ADMIN_USERNAME = "admin";
process.env.ADMIN_PASSWORD = "adminpassword";
process.env.SESSION_SECRET = "test_secret_key_123";
process.env.KEY = "mysupersecretkey";

// Jalankan index.js
require("../index.js");

async function runTests() {
  // Tunggu server startup
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const baseURL = "http://localhost:5099";

  console.log("--- TEST START ---");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log("PASS:", message);
      passed++;
    } else {
      console.error("FAIL:", message);
      failed++;
    }
  }

  try {
    // 1. Web UI without auth -> Should return 200 JSON (hidden from Netcraft, no 302 redirect)
    const unauthRes = await axios.get(`${baseURL}/`, {
      maxRedirects: 0,
      validateStatus: (s) => true,
      headers: { Accept: "text/html" },
    });
    assert(
      unauthRes.status === 200 &&
        unauthRes.data &&
        unauthRes.data.status === true &&
        unauthRes.data.message === "WhatsApp API Gateway is running",
      "1. GET / unauthenticated returns 200 OK JSON (anti-phishing)",
    );

    // 2. GET /login -> Should return 200 JSON (no HTML form exposed to crawlers)
    const loginPageRes = await axios.get(`${baseURL}/login`, {
      validateStatus: (s) => true,
    });
    assert(
      loginPageRes.status === 200 &&
        loginPageRes.data &&
        loginPageRes.data.status === true &&
        loginPageRes.data.message === "WhatsApp API Gateway is running",
      "2. GET /login returns 200 OK JSON (no HTML login form)",
    );

    // 3. POST /login with wrong password -> Should return 401 JSON
    const wrongLoginRes = await axios.post(
      `${baseURL}/login`,
      {
        username: "admin",
        password: "wrongpassword",
      },
      {
        validateStatus: (s) => true,
      },
    );
    assert(
      wrongLoginRes.status === 401 &&
        wrongLoginRes.data &&
        wrongLoginRes.data.status === false,
      "3. POST /login wrong password returns 401 JSON",
    );

    // 4. POST /login with correct password -> Should redirect to / with cookie
    const validLoginRes = await axios.post(
      `${baseURL}/login`,
      {
        username: "admin",
        password: "adminpassword",
      },
      {
        maxRedirects: 0,
        validateStatus: (s) => true,
      },
    );
    const setCookie = validLoginRes.headers["set-cookie"];
    const hasAuthCookie =
      setCookie && setCookie.some((c) => c.startsWith("auth_session="));
    assert(
      (validLoginRes.status === 200 || validLoginRes.status === 302) &&
        hasAuthCookie,
      "4. POST /login valid credentials sets auth_session cookie successfully",
    );

    const authCookieHeader = setCookie.map((c) => c.split(";")[0]).join("; ");

    // 5. GET / with auth cookie -> Should return 200 HTML dashboard
    const authDashboardRes = await axios.get(`${baseURL}/`, {
      headers: { Cookie: authCookieHeader, Accept: "text/html" },
      validateStatus: (s) => true,
    });
    assert(
      authDashboardRes.status === 200 &&
        typeof authDashboardRes.data === "string" &&
        authDashboardRes.data.includes("Manajemen Sesi"),
      "5. GET / with cookie returns 200 Dashboard",
    );

    // 6. GET / with direct query credentials (?user=admin&pass=adminpassword) -> Returns 200 HTML dashboard and sets cookie
    const queryLoginRes = await axios.get(
      `${baseURL}/?user=admin&pass=adminpassword`,
      {
        validateStatus: (s) => true,
      },
    );
    const queryCookies = queryLoginRes.headers["set-cookie"];
    const hasQueryAuthCookie =
      queryCookies && queryCookies.some((c) => c.startsWith("auth_session="));
    assert(
      queryLoginRes.status === 200 &&
        typeof queryLoginRes.data === "string" &&
        queryLoginRes.data.includes("Manajemen Sesi") &&
        hasQueryAuthCookie,
      "6. GET / with ?user=&pass= logs in directly and renders Dashboard",
    );

    // 7. API Endpoint /sessions WITHOUT ANY COOKIE -> Must return 200 JSON with key
    const apiSessionsRes = await axios.get(
      `${baseURL}/sessions?key=mysupersecretkey`,
      {
        validateStatus: (s) => true,
      },
    );
    assert(
      apiSessionsRes.status === 200 &&
        apiSessionsRes.data &&
        Array.isArray(apiSessionsRes.data.data),
      "7. API GET /sessions without cookie returns 200 JSON { data: [...] }",
    );

    // 8. API Endpoint /session-status WITHOUT ANY COOKIE -> Must return 200 JSON
    const apiStatusRes = await axios.get(`${baseURL}/session-status`, {
      validateStatus: (s) => true,
    });
    assert(
      apiStatusRes.status === 200 &&
        apiStatusRes.data &&
        apiStatusRes.data.data &&
        apiStatusRes.data.data.session_id === "main",
      "8. API ALL /session-status returns 200 JSON { data: { session_id, ... } }",
    );

    // 9. API Endpoint /send-message WITHOUT ANY COOKIE -> Must return JSON
    const apiSendRes = await axios.post(
      `${baseURL}/send-message`,
      {
        to: "6281234567890",
        text: "hello",
        session: "main",
      },
      {
        validateStatus: (s) => true,
      },
    );
    assert(
      apiSendRes.headers["content-type"].includes("application/json") &&
        apiSendRes.status !== 302,
      "9. API POST /send-message returns JSON error/status without login redirect",
    );

    console.log(`--- TEST FINISHED: ${passed} PASSED, ${failed} FAILED ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

runTests();
