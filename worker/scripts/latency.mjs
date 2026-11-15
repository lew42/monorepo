// node scripts/latency.mjs — edit→other-client latency against the REAL staging Worker (https://staging.lew42.com).
// Staging has no dev sign-in, so this signs two session cookies itself with STAGING_SESSION_SECRET (from .dev.vars, gitignored)
// and inserts the matching session rows for the seeded users alice and bob. Needs PLAYWRIGHT_DIR like live.test.mjs.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { new_cookie_value, sha256 } from "../src/session.js";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "playwright");

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] || "https://staging.lew42.com";
const N = Number(process.env.EDITS || 30);
const secret = /STAGING_SESSION_SECRET=(\S+)/.exec(readFileSync(join(app, ".dev.vars"), "utf8"))?.[1];
if (!secret) throw new Error("STAGING_SESSION_SECRET missing from .dev.vars");

async function cookie_for(sub){
	const { token, value } = await new_cookie_value(secret);
	const sql = `INSERT INTO sessions (token_hash, user_id, created_at, expires_at) SELECT '${await sha256(token)}', id, ${Date.now()}, ${Date.now() + 3600_000} FROM users WHERE google_sub = '${sub}'`;
	const r = spawnSync("npx", ["wrangler", "d1", "execute", "DB", "--env", "staging", "--remote", "--command", `"${sql}"`], { cwd: app, shell: true, encoding: "utf8" });
	if (r.status !== 0) throw new Error("could not insert session: " + r.stdout + r.stderr);
	return value;
}

const browser = await chromium.launch();
async function person(sub){
	const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
	await ctx.addCookies([{ name: "sid", value: await cookie_for(sub), url: base, httpOnly: true, secure: true, sameSite: "Lax" }]);
	const page = await ctx.newPage();
	await page.goto(base);
	await page.waitForSelector("text=Welcome");
	return page;
}
const alice = await person("seed:alice"), bob = await person("seed:bob");

await alice.click("a:has-text('Docs')");
await alice.fill(".title-input", "Staging latency " + new Date().toISOString());
await alice.click("button:has-text('Create')");
await alice.waitForSelector("text=Nobody is editing");
await bob.goto(base + new URL(alice.url()).pathname);
await bob.waitForSelector("text=Nobody is editing");
await alice.click("button:has-text('Start editing')");
await alice.waitForSelector("text=You are editing");
await bob.waitForSelector("text=Alice Example is editing");

const now = "performance.timeOrigin + performance.now()";
await alice.evaluate(`(() => {
	const store = live_doc.store, orig = store.send.bind(store);
	window.__input = []; window.__send = [];
	document.querySelector(".doc-text").addEventListener("input", () => __input.push(${now}));
	store.send = m => { if (m.t === "lines") __send.push(${now}); return orig(m); };
})()`);
await bob.evaluate(`(() => {
	const store = live_doc.store, orig = store.message.bind(store);
	window.__frame = []; window.__applied = [];
	store.message = m => { if (m.t === "lines") __frame.push(${now}); return orig(m); };
	live_doc.on("read", () => __applied.push(${now}));
})()`);
for (let i = 0; i < N; i++){
	await alice.fill(".doc-text", "staging edit " + i);
	await bob.waitForFunction(i => document.querySelector(".doc-text").value === "staging edit " + i, i);
	await alice.waitForTimeout(150);
}
const t = { input: await alice.evaluate("__input"), send: await alice.evaluate("__send"), frame: await bob.evaluate("__frame"), applied: await bob.evaluate("__applied") };
const stats = list => { const s = [...list].sort((a, b) => a - b); return { median: +s[Math.floor(s.length / 2)].toFixed(1), p95: +s[Math.min(s.length - 1, Math.ceil(s.length * .95) - 1)].toFixed(1) }; };
// Both pages run in one process on this machine, so they share one clock; the numbers include the real trip to the nearest Cloudflare edge and back.
const rtt = await alice.evaluate("live_doc.store.rtts");
console.log(JSON.stringify({
	where: base, edits: N,
	"ping round trip, ms": stats(rtt),
	"send→arrives on other phone (wire, ms)": stats(t.frame.map((f, i) => f - t.send[i])),
	"keystroke→visible on other phone (total, ms)": stats(t.applied.map((a, i) => a - t.input[i])),
}, null, 1));
await alice.click("button:has-text('Done editing')");
await browser.close();
