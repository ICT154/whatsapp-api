const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("--- START MEDIA RESILIENCE & RETRY VERIFICATION ---");

// 1. Verify Baileys messages-send.js patch
const baileysSendFile = path.resolve(__dirname, "../node_modules/@whiskeysockets/baileys/lib/Socket/messages-send.js");
assert(fs.existsSync(baileysSendFile), "Baileys messages-send.js should exist");
const bContent = fs.readFileSync(baileysSendFile, "utf8");
assert(
  bContent.includes("/* WA_GATEWAY_PATCHED_MEDIA_CONN */"),
  "Baileys messages-send.js must include WA_GATEWAY_PATCHED_MEDIA_CONN patch"
);
console.log("PASS: 1. Baileys refreshMediaConn timeout recovery patch is present");

// 2. Verify wa-multi-session Socket/index.js patch
const waSocketFile = path.resolve(__dirname, "../node_modules/wa-multi-session/dist/Socket/index.js");
assert(fs.existsSync(waSocketFile), "wa-multi-session Socket/index.js should exist");
const waContent = fs.readFileSync(waSocketFile, "utf8");
assert(
  waContent.includes("/* WA_GATEWAY_PATCHED_SOCKET_OPTS */"),
  "wa-multi-session Socket/index.js must include WA_GATEWAY_PATCHED_SOCKET_OPTS patch"
);
assert(
  waContent.includes("getMessage: async"),
  "wa-multi-session must have getMessage handler for retry receipts"
);
assert(
  waContent.includes("/* WA_GATEWAY_PATCHED_UPSERT_CACHE */"),
  "wa-multi-session must have WA_GATEWAY_PATCHED_UPSERT_CACHE for message store"
);
console.log("PASS: 2. wa-multi-session socket getMessage handler and upsert cache are present");

// 3. Test in-memory gateway message store
process.env.PORT = "5098";
require("../index.js");
assert(typeof global.saveGatewayMessage === "function", "global.saveGatewayMessage must be defined");
assert(typeof global.getGatewayMessage === "function", "global.getGatewayMessage must be defined");

const testMsg = { conversation: "Halo tes enkripsi" };
global.saveGatewayMessage("test-msg-123", testMsg);

(async () => {
  const retrieved = await global.getGatewayMessage("main", { id: "test-msg-123" });
  assert.deepStrictEqual(retrieved, testMsg, "Retrieved message must match cached message");
  console.log("PASS: 3. Gateway message store properly saves and retrieves messages for Baileys getMessage");
  console.log("--- ALL RESILIENCE & RETRY CHECKS PASSED (3/3) ---");
  process.exit(0);
})();
