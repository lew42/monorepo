// node scripts/live.test.mjs [base-url] — two headless browsers on one document: the editing lock, live edits, history on reload,
// the lock dropping when the editor leaves, and edit→other-client latency. Needs `wrangler dev` running (local sign-in).
// Staging has no dev sign-in: scripts/latency.mjs signs its own cookies for it.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR || "playwright");
const base = process.argv[2] || "http://localhost:8787";
const N = Number(process.env.EDITS || 20);

const browser = await chromium.launch();
const errors = [];
async function person(handle){
	const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
	const page = await ctx.newPage();
	page.on("pageerror", e => errors.push(handle + ": " + e.message));
	page.on("console", m => m.type() === "error" && !/gsi|accounts.google|ERR_/.test(m.text()) && errors.push(handle + ": " + m.text()));
	await page.goto(base);
	await page.waitForSelector("text=Sign in");
	await page.click("text=dev: " + handle);
	await page.waitForSelector("text=Welcome");
	return page;
}
const alice = await person("alice"), bob = await person("bob");

// alice makes a document
await alice.click("a:has-text('Docs')");
await alice.fill(".title-input", "Latency test " + Date.now());
await alice.click("button:has-text('Create')");
await alice.waitForSelector("text=Nobody is editing");
const path = new URL(alice.url()).pathname;
await bob.goto(base + path);
await bob.waitForSelector("text=Nobody is editing");

// the lock: alice takes it, bob is read-only
await alice.click("button:has-text('Start editing')");
await alice.waitForSelector("text=You are editing");
await bob.waitForSelector("text=alice is editing");
assert.equal(await bob.locator(".doc-text").evaluate(el => el.readOnly), true, "bob cannot type while alice edits");
assert.equal(await bob.locator("button:has-text('Start editing')").isDisabled(), true, "bob's Start editing is disabled");

// live edit arrives
await alice.fill(".doc-text", "hello from alice");
await bob.waitForFunction(() => document.querySelector(".doc-text")?.value === "hello from alice");

// latency: alice stamps her input and her send; bob stamps the frame arriving and the item applying it. One clock (this machine).
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
	await alice.fill(".doc-text", "edit number " + i);
	await bob.waitForFunction(i => document.querySelector(".doc-text").value === "edit number " + i, i);
	await alice.waitForTimeout(150);
}
const t = { input: await alice.evaluate("__input"), send: await alice.evaluate("__send"), frame: await bob.evaluate("__frame"), applied: await bob.evaluate("__applied") };
assert.equal(t.frame.length, N, "one line per edit (" + t.frame.length + " frames)");
const stats = list => { const s = [...list].sort((a, b) => a - b); return { median: +s[Math.floor(s.length / 2)].toFixed(1), p95: +s[Math.min(s.length - 1, Math.ceil(s.length * .95) - 1)].toFixed(1) }; };
const wire = t.frame.map((f, i) => f - t.send[i]);
const total = t.applied.map((a, i) => a - t.input[i]);
console.log("latency over", N, "edits, ms:", JSON.stringify({ "send→arrives (wire)": stats(wire), "keystroke→visible on other phone (total)": stats(total) }));

// history survives a reload, and the lock follows the editor
await bob.reload();
await bob.waitForFunction(i => document.querySelector(".doc-text")?.value === "edit number " + i, N - 1);
await alice.click("button:has-text('Done editing')");
await bob.waitForSelector("text=Nobody is editing");
await bob.click("button:has-text('Start editing')");
await bob.waitForSelector("text=You are editing");
await alice.waitForSelector("text=bob is editing");

// the editor walks to another page without pressing Done: the document's socket closes and the lock is released at once
await bob.click("a:has-text('Docs')");
await alice.waitForSelector("text=Nobody is editing", { timeout: 3000 });
await bob.waitForSelector("text=Documents");

// the editor's tab closes without pressing Done: the lock is released for everyone
await alice.click("button:has-text('Start editing')");
await alice.waitForSelector("text=You are editing");
await alice.close();
await bob.goto(base + path);
await bob.waitForSelector("text=Nobody is editing", { timeout: 20000 });

assert.deepEqual(errors, [], "no console errors");
await browser.close();
console.log("live.test ok");
