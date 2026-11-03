// room-test.mjs — the two-context proof. Assumes the harness is already
// running (`npm run dev` in another terminal, wrangler dev on :8787).
//
// 1. alice and bob log in via the dev switch (/api/dev/login?as=<handle>) and
//    both open the room page — one Durable Object, two tabs.
// 2. alice sends; assert bob's DOM shows it within 2s (not just a screenshot).
// 3. eve (banned) tries to join — refused at connect.
// 4. an anonymous context opens the room — reads, but the composer is disabled.
//
// Playwright is a global npm install, not a repo dependency: the file:// import
// is the only one that resolves (.claude/skills/ui-test/SKILL.md).
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = "http://localhost:8787";
const ROOM_PATH = "/imagine/platform/local/room/";
const OUT = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
let pass = true;
const results = [];

function report(name, ok, detail) {
    results.push({ name, ok, detail });
    pass &&= ok;
    console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? ": " + detail : ""}`);
}

async function openAs(handle) {
    const context = await browser.newContext();
    const page = await context.newPage();
    if (handle) {
        await page.goto(`${BASE}/api/dev/login?as=${handle}&to=${ROOM_PATH}`);
    } else {
        await page.goto(`${BASE}${ROOM_PATH}`);
    }
    await page.waitForSelector(".local-room-log", { timeout: 5000 });
    return { context, page };
}

// --- alice + bob: the two-context message ---------------------------------
const alice = await openAs("alice");
const bob = await openAs("bob");

await alice.page.waitForFunction(
    () => document.querySelector(".local-room-status")?.textContent.startsWith("connected"),
    { timeout: 5000 }
).catch(() => {});
await bob.page.waitForFunction(
    () => document.querySelector(".local-room-status")?.textContent.startsWith("connected"),
    { timeout: 5000 }
).catch(() => {});

await alice.page.fill(".local-room-input", "hello from alice");
await alice.page.click(".local-room-send");

const bobSawIt = await bob.page.waitForFunction(
    () => document.querySelector(".local-room-log")?.textContent.includes("hello from alice"),
    { timeout: 2000 }
).then(() => true).catch(() => false);
report("bob sees alice's message within 2s", bobSawIt);

// alice's own echo lands over the same socket a beat later — wait for it so
// her screenshot shows the same line bob's does, not an empty log.
await alice.page.waitForFunction(
    () => document.querySelector(".local-room-log")?.textContent.includes("hello from alice"),
    { timeout: 2000 }
).catch(() => {});

await alice.page.screenshot({ path: path.join(OUT, "room-test-alice.png") });
await bob.page.screenshot({ path: path.join(OUT, "room-test-bob.png") });
console.log(`screenshots: ${path.join(OUT, "room-test-alice.png")}, ${path.join(OUT, "room-test-bob.png")}`);

// --- eve: banned, refused at connect ---------------------------------------
const eve = await openAs("eve");
await eve.page.waitForTimeout(1500);   // give the WS handshake time to fail
const eveStatus = await eve.page.textContent(".local-room-status");
report("eve (banned) is refused at connect", eveStatus.includes("offline"), `status: "${eveStatus}"`);

// --- anonymous: reads, cannot send ------------------------------------------
const anon = await openAs(null);
await anon.page.waitForTimeout(1000);
const composerDisabled = await anon.page.getAttribute(".local-room-send", "disabled");
report("anonymous composer is disabled", composerDisabled !== null, `disabled attr: ${composerDisabled}`);

const anonSeesAliceMessage = await anon.page.textContent(".local-room-log");
report("anonymous still sees the room's history (reads)", anonSeesAliceMessage.includes("hello from alice"));

for (const { context } of [alice, bob, eve, anon]) await context.close();
await browser.close();

console.log("\n" + (pass ? "ALL PASS" : "SOME FAILED"));
process.exit(pass ? 0 : 1);
