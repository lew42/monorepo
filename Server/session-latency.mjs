#!/usr/bin/env node
// Server/session-latency.mjs — measure the real-time path end to end, headless:
//   append a line to a (scratch) transcript -> time until the Sessions page, loaded in a fresh headless browser, shows the change.
//   node Server/session-latency.mjs [page-url]       default http://session-class5.localhost/framework/ai/sessions/
// It runs a SessionTailer over a scratch transcript folder; the tailer writes today's day index in this checkout's sessions/ tree,
// the dev server streams that file over its socket, and the page is the real one. Never touches a real transcript.
// Prints, per step, the time until the delta line is in the day file ("feed"), until it reaches the page ("wire") and until the page shows it ("page").
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import SessionTailer from "./SessionTailer.mjs";
import SessionDays from "./SessionDays.mjs";

const { chromium } = await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs");
const url = process.argv[2] || "http://session-class5.localhost/framework/ai/sessions/";
const id = crypto.randomUUID();
const base = fs.mkdtempSync(path.join(os.tmpdir(), "tail-"));
const dir = path.join(base, "c--code-lew42-latency"); fs.mkdirSync(dir);
const file = path.join(dir, id + ".jsonl");
const line = (type, extra) => JSON.stringify({ type, timestamp: new Date().toISOString(), ...extra }) + "\n";
const reply = (n, tokens) => line("assistant", { message: { id: "msg_" + n, model: "claude-sonnet-5", usage: { input_tokens: tokens, output_tokens: 10 }, content: [{ type: "text", text: "x" }] } });

const tailer = new SessionTailer({ base, log: m => console.log(m) }).start();
const feed = SessionDays.day_file(new Date().toISOString());
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(e.message));
await page.goto(url);
await page.waitForSelector(".sessions-row", { timeout: 30000 });
await page.waitForTimeout(2000);   // the live subscription answers
// note when each delta line reaches the page (before it is drawn), to split "wire" from "draw"
await page.evaluate(async () => {
	const { default: Session } = await import("/framework/ai/sessions/Session.js");
	const apply = Session.apply_delta; window.__arrived = [];
	Session.apply_delta = line => { window.__arrived.push([line.id, Date.now()]); return apply.call(Session, line); };
});

// resolves with Date.now() the moment the row for `id` shows `want` in its text
const watch = want => page.evaluate(([id, want]) => new Promise(resolve => {
	const check = () => { const row = document.querySelector(`a.sessions-row[href*="${id}"]`); if (row && row.textContent.includes(want)) { resolve(Date.now()); return true; } };
	if (check()) return;
	new MutationObserver((_, o) => { if (check()) o.disconnect(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
	setTimeout(() => resolve(null), 15000);
}), [id, want]);
// when does the tailer's delta line land in the day file? (polled every 2 ms)
const appended = () => new Promise(resolve => { const size = fs.statSync(feed).size; const iv = setInterval(() => { if (fs.statSync(feed).size > size){ clearInterval(iv); resolve(Date.now()); } }, 2); });

const results = {};
const step = async (name, want, write) => {
	const seen = watch(want), fed = appended(), t0 = Date.now();
	write();
	const t1 = await seen;
	const arrived = await page.evaluate(id => (window.__arrived.filter(a => a[0] === id).pop() ?? [])[1] ?? null, id);
	results[name] = { feed_ms: (await fed) - t0, wire_ms: arrived && arrived - t0, page_ms: t1 && t1 - t0 };
};
await step("new_session", "$2.00", () => fs.writeFileSync(file, line("user", { message: { content: "latency probe" } }) + reply(1, 1_000_000)));
await step("cost_update", "$4.00", () => fs.appendFileSync(file, reply(2, 1_000_000)));
await step("cost_update_again", "$6.00", () => fs.appendFileSync(file, reply(3, 1_000_000)));

console.log(JSON.stringify({ id, ...results, page_errors: errors }));
await browser.close();
await tailer.stop();
fs.rmSync(base, { recursive: true, force: true });
process.exit(Object.values(results).every(r => r.page_ms) ? 0 : 1);
