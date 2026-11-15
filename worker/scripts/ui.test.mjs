// node worker/scripts/ui.test.mjs [base-url] — drives the local app at /app/ in headless Chromium: dev sign-in, pages, sign-out. Needs `wrangler dev` running.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "playwright");
const base = process.argv[2] || "http://localhost:8787";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => m.type() === "error" && !/gsi|accounts.google|ERR_/.test(m.text()) && errors.push(m.text()));

await page.goto(base + "/app/");
await page.waitForSelector("text=Sign in");
await page.click("text=dev: admin");
await page.waitForSelector("text=Welcome");
assert.ok(await page.locator("text=Admin").count(), "admin link shows for admin");
await page.click("a:has-text('Profile')");
await page.waitForSelector("th:has-text('Signed in with')");
await page.click("a:has-text('Admin')");
await page.waitForSelector("th:has-text('Last login')");
await page.screenshot({ path: process.env.SHOT || "ui-admin.png" });
await page.reload();
await page.waitForSelector("th:has-text('Last login')");   // session survives a reload, the route is in the hash
await page.click("text=Sign out");
await page.waitForSelector("text=Sign in");
await page.click("text=dev: bob");
await page.waitForSelector("text=Welcome");
assert.equal(await page.locator("a:has-text('Admin')").count(), 0, "a moderator sees no Admin link");
const manifest = await (await page.request.get(base + "/app/manifest.webmanifest")).json();
assert.equal(manifest.display, "standalone");
assert.equal(manifest.scope, "/app/");
await page.evaluate(() => navigator.serviceWorker.ready);
assert.deepEqual(errors, []);
console.log("ui.test ok");
await browser.close();
