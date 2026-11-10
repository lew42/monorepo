// node probe.mjs [host] — host defaults to the live site; pass a worktree url (http://localhost:<port>) to shoot a branch.
// Shots land in ./shots/ beside this file (gitignored machine output). The repo root is 11 folders up.
const root = new URL("../../../../../../../../../../../", import.meta.url);
const { default: Browser } = await import(new URL("Server/Browser.mjs", root));
const host = process.argv[2] ?? "http://monorepo.localhost";
const { fileURLToPath } = await import("node:url");
const out = name => fileURLToPath(new URL("shots/" + name, import.meta.url));

const browser = await Browser.browser();
const page = await browser.newPage({ viewport: { width: 400, height: 900 } });
const errs = [];
page.on("console", msg => { if (msg.type() === "error") errs.push(msg.text()); });
page.on("pageerror", e => errs.push("pageerror: " + e.message));
const t0 = Date.now();
await page.goto(host + "/live/session/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const svHtml = await page.evaluate(() => document.querySelector("main, .page")?.outerHTML?.slice(0, 3000) ?? document.body.innerHTML.slice(0, 1000));
console.log("load ms:", Date.now() - t0);
console.log("errs:", JSON.stringify(errs, null, 2));
console.log("svHtml:", svHtml);
await page.screenshot({ path: out("probe-400.png"), fullPage: true });
await page.setViewportSize({ width: 1200, height: 900 });
await page.screenshot({ path: out("probe-1200.png"), fullPage: true });
await page.setViewportSize({ width: 400, height: 1400 });
await page.click("summary:has-text('Place every sentence')");
await page.waitForTimeout(200);
await page.locator("text=Child sessions").scrollIntoViewIfNeeded();
await page.screenshot({ path: out("probe-detail-400.png"), fullPage: true });
await Browser.close();
