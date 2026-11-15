// node worker/scripts/latency.mjs — edit→other-client latency against the REAL staging Worker (https://staging.lew42.com).
// Staging has no dev sign-in, so this signs two stateless session cookies itself with STAGING_SESSION_SECRET (worker/.dev.vars,
// gitignored, written by deploy.mjs when it creates the secret) for the seeded users alice and bob. Needs PLAYWRIGHT_DIR like live.test.mjs.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sign } from "../session.js";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const base = process.argv[2] || "https://staging.lew42.com";
const N = Number(process.env.EDITS || 30);
const secret = /STAGING_SESSION_SECRET=(\S+)/.exec(readFileSync(join(root, "worker", ".dev.vars"), "utf8"))?.[1];
if (!secret) throw new Error("STAGING_SESSION_SECRET missing from worker/.dev.vars");

async function cookie_for(provider_id){
	const sql = `SELECT id, token_epoch FROM users WHERE provider = 'seed' AND provider_id = '${provider_id}'`;
	const r = spawnSync("npx", ["wrangler", "d1", "execute", "DB", "--env", "staging", "--remote", "--json", "-c", "worker/wrangler.jsonc", "--command", `"${sql}"`], { cwd: root, shell: true, encoding: "utf8" });
	const row = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0]?.results?.[0];
	if (!row) throw new Error("no seeded user " + provider_id + " on staging (deploy with --seed): " + r.stdout + r.stderr);
	return await sign({ uid: row.id, te: row.token_epoch, exp: Math.floor(Date.now() / 1000) + 3600 }, secret);
}

const browser = await chromium.launch();
async function person(sub){
	const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
	await ctx.addCookies([{ name: "s", value: await cookie_for(sub), url: base, httpOnly: true, secure: true, sameSite: "Lax" }]);
	const page = await ctx.newPage();
	await page.goto(base + "/app/");
	await page.waitForSelector("text=Welcome");
	return page;
}
const alice = await person("alice"), bob = await person("bob");

await alice.click("a:has-text('Docs')");
await alice.fill(".title-input", "Staging latency " + new Date().toISOString());
await alice.click("button:has-text('Create')");
await alice.waitForSelector("text=Nobody is editing");
await bob.goto(base + "/app/" + new URL(alice.url()).hash);
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
