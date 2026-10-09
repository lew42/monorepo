#!/usr/bin/env node
// Server/session-latency.mjs — measure the real-time path end to end, headless:
//   append a line to a (scratch) transcript -> time until the Sessions page, in a fresh headless browser, shows the change.
//   node Server/session-latency.mjs
// It starts a PRIVATE dev server from this checkout (SESSION_TAIL=1 and SESSION_TAIL_DIR=a scratch transcript folder, so it never
// reads a real transcript), loads the real Sessions page from it, then writes fake transcript lines. Per step it prints:
//   wire_ms  until the changed snapshot reaches the page over the dev socket (before it is drawn)
//   page_ms  until the row on the page shows it
//   file_ms  until the session's own index.json holds it (the single writer waits for 5 s of quiet)
// The scratch session's folder under sessions/ is removed at the end.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const { chromium } = await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs");
const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 9000 + Math.floor(Math.random() * 900);
const id = crypto.randomUUID();
const base = fs.mkdtempSync(path.join(os.tmpdir(), "tail-"));
const dir = path.join(base, "c--code-lew42-latency"); fs.mkdirSync(dir);
const file = path.join(dir, id + ".jsonl");
const line = (type, extra) => JSON.stringify({ type, timestamp: new Date().toISOString(), ...extra }) + "\n";
const reply = (n, tokens) => line("assistant", { message: { id: "msg_" + n, model: "claude-sonnet-5", usage: { input_tokens: tokens, output_tokens: 10 }, content: [{ type: "text", text: "x" }] } });

const server = spawn(process.execPath, ["server.js"], { cwd: repo, windowsHide: true, stdio: "ignore", env: { ...process.env, PORT: String(port), SESSION_TAIL: "1", SESSION_TAIL_DIR: base } });
const url = `http://localhost:${port}/framework/ai/sessions/`;
for (let i = 0; i < 100; i++){ try { if ((await fetch(url)).ok) break; } catch {} await new Promise(r => setTimeout(r, 300)); }

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
const own = path.join(repo, "public/framework/ai/sessions", stamp, id, "index.json");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(e.message));
await page.goto(url);
await page.waitForSelector(".sessions-row", { timeout: 30000 });
await page.waitForTimeout(2500);   // the socket subscription answers
await page.evaluate(async () => {
	const { default: AISession } = await import("/framework/ai/AISession/AISession.js");
	const apply = AISession.apply_delta; window.__arrived = [];
	AISession.apply_delta = snap => { window.__arrived.push([snap.id, Date.now()]); return apply.call(AISession, snap); };
});

const watch = want => page.evaluate(([id, want]) => new Promise(resolve => {
	const check = () => { const row = document.querySelector(`a.sessions-row[href*="${id}"]`); if (row && row.textContent.includes(want)) { resolve(Date.now()); return true; } };
	if (check()) return;
	new MutationObserver((_, o) => { if (check()) o.disconnect(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
	setTimeout(() => resolve(null), 15000);
}), [id, want]);
const in_file = usd => new Promise(resolve => { const t = Date.now(); const iv = setInterval(() => {
	try { if (Math.round(JSON.parse(fs.readFileSync(own, "utf8")).usd) === usd) { clearInterval(iv); resolve(Date.now()); } } catch {}
	if (Date.now() - t > 30000){ clearInterval(iv); resolve(null); } }, 5); });

const results = {};
const step = async (name, want, usd, write) => {
	const seen = watch(want), filed = in_file(usd), t0 = Date.now();
	write();
	const [t1, t2] = [await seen, await filed];
	const arrived = await page.evaluate(([id, t0]) => (window.__arrived.find(a => a[0] === id && a[1] >= t0) ?? [])[1] ?? null, [id, t0]);
	results[name] = { wire_ms: arrived && arrived - t0, page_ms: t1 && t1 - t0, file_ms: t2 && t2 - t0 };
};
await step("new_session", "$2.00", 2, () => fs.writeFileSync(file, line("user", { message: { content: "latency probe" } }) + reply(1, 1_000_000)));
await step("cost_update", "$4.00", 4, () => fs.appendFileSync(file, reply(2, 1_000_000)));
await step("cost_update_again", "$6.00", 6, () => fs.appendFileSync(file, reply(3, 1_000_000)));
console.log(JSON.stringify({ id, ...results, page_errors: errors }));
await browser.close();
server.kill();
fs.rmSync(base, { recursive: true, force: true });
fs.rmSync(path.dirname(own), { recursive: true, force: true });
process.exit(Object.values(results).every(r => r.page_ms) ? 0 : 1);
