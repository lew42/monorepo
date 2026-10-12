/* node .../phone-proof.mjs [scratch] — the phone flow, headless, at 400 px wide with touch:
 * a private Servex (:8190) + the worktree's dev server (:8211); the browser's calls to Servex (:8090) are routed to the private one.
 * It types into the Refine page the way the keyboard (or the app's own dictation) does, presses Refine, and watches the session page
 * fill with the five stages at 400 px. Prints when each stage showed; saves a shot per width. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const SCRATCH = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "phone-proof-")));
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), say = s => console.log(`[${String(Date.now() - t0).padStart(6)}ms] ${s}`);
const local = path.join(SCRATCH, "localappdata");
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "phone proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8190", SERVEX_PROXY_PORT: "8189", SERVEX_PROXY_INTERNAL: "8188", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8187" };
for (const k of ["SERVEX_HOME", "SERVEX_NO_ASSISTANT", "SERVEX_NO_LAYERS", "SERVEX_NO_MONITOR", "PORT"]) delete env[k];
const kids = [];
const run = (cmd, args, e) => { const c = spawn(cmd, args, { cwd: REPO, env: e, stdio: "ignore", windowsHide: true }); kids.push(c); return c; };
const kill = () => kids.forEach(c => { try { execFileSync("taskkill", ["/PID", String(c.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {} });
process.on("exit", kill);
const wait = async url => { for (let i = 0; i < 80; i++){ try { if ((await fetch(url)).ok) return; } catch {} await sleep(500); } throw new Error("no answer: " + url); };
run(process.execPath, ["Servex/index.js"], env);
run(process.execPath, ["server.js"], { ...process.env, NO_SUPERVISE: "1", PORT: "8211", HOST: process.env.LAN_HOST ? "0.0.0.0" : "127.0.0.1" });
const LAN = process.env.LAN_HOST, WEB = `http://${LAN || "127.0.0.1"}:8211`;   // LAN_HOST=10.0.0.135 loads the pages the way the phone does: Servex calls go to <origin>/servex
try {
	await wait("http://127.0.0.1:8190/api/agents"); await wait("http://127.0.0.1:8211/framework/");
	const session = randomUUID();
	const b = await browser();
	const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
	await ctx.route(LAN ? `${WEB}/servex/**` : "http://127.0.0.1:8090/**", async route => {
		const req = route.request(); if (req.url().includes("/api/voice")) say("browser -> /api/voice " + (JSON.parse(req.postData() || "{}").text || "").length + " chars"); const u = LAN ? req.url().replace(`${WEB}/servex`, "http://127.0.0.1:8190") : req.url().replace(":8090", ":8190");
		const res = await route.fetch({ url: u }).catch(() => null);
		if (!res) return route.abort();
		await route.fulfill({ response: res, headers: { ...res.headers(), "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
	});
	// Playwright's route.fetch cannot carry a never-ending SSE body, so the stream goes straight to the private Servex (the dev proxy in front of it is plain http-proxy, not exercised here).
	if (LAN) await ctx.addInitScript(() => { const E = window.EventSource; window.EventSource = function(u, o){ return new E(String(u).replace(location.origin + "/servex", "http://127.0.0.1:8190"), o); }; });
	const refine = await ctx.newPage(); const errs = [];
	refine.on("pageerror", e => errs.push(e.message));
	await refine.goto(`${WEB}/framework/ext/Refine/?session=${session}`, { waitUntil: "load" });
	await sleep(2500);
	const watch = await refine.$eval(".refine-watch", e => e.getAttribute("href")).catch(() => null);
	say("watch link: " + watch);
	const watcher = await ctx.newPage();
	watcher.on("response", r => { if (r.url().includes(session.slice(0, 8)) && r.url().includes("page.jsonl")) say("watcher " + r.status() + " " + r.url()); }); watcher.on("pageerror", e => say("watcher pageerror " + e.message));
	await watcher.goto(`${WEB}/framework/ai/sessions/${session}/`, { waitUntil: "load" });
	const seen = {}; const poll = setInterval(async () => {
		try { for (const s of await watcher.$$eval(".voice-stage:not([hidden])", els => els.map(e => e.className.split(" ")[0]))) if (!seen[s]) { seen[s] = Date.now() - t0; say("stage visible on session page: " + s); } } catch {}
	}, 150);
	await refine.tap("textarea");
	await refine.keyboard.type("so I want the phone to show my words on the session page as I speak, and then tidy them into points and one finished prompt", { delay: 15 });
	say("typed");
	await sleep(1500);
	await refine.tap(".refine-go");
	say("pressed Refine");
	await sleep(45000);
	clearInterval(poll);
	console.log("stage times (ms since start):", JSON.stringify(seen), "page errors:", errs.slice(0, 3));
	const o = await watcher.evaluate(() => document.documentElement.scrollWidth - innerWidth);
	console.log("horizontal overflow at 400:", o);
	await watcher.screenshot({ path: path.join(SCRATCH, "phone-session-400.png"), fullPage: true });
	await refine.screenshot({ path: path.join(SCRATCH, "phone-refine-400.png") });
	console.log("SESSION", session);
} finally { kill(); await close(); }
