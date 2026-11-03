// Headless proof of the ✦ sheet (rail.js) and the Session demo, EVERY Servex call stubbed.
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = "http://localhost:50881";
const out = [], shots = [];
const log = (name, ok, detail = "") => { out.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FILE = "/framework/ext/Session/ai/v-proof.jsonl";
const file_lines = [JSON.stringify({ session: { id: "v-proof", home: "/framework/ext/Session/" } })];
const posts = [];
let n = 0;
const at = () => new Date(Date.now() + (n++)).toISOString();
const reply = (id, re, text) => file_lines.push(JSON.stringify({ chat: { at: at(), session: "v-proof", path: "/framework/ext/Session/", from: { kind: "assistant", id, agent: `session-${id}-v-proof` }, via: "text", text, re } }));
let held = null;

async function stub(page){
	await page.route(/127\.0\.0\.1:8090|\/servex\//, async route => {
		const req = route.request(), url = req.url(), body = req.postDataJSON?.() ?? null;
		if (req.method() !== "GET" && req.method() !== "OPTIONS") posts.push({ url: url.replace(/^.*\/api\//, "/api/"), body });
		const json = o => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(o) });
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
		if (/\/api\/sessions\?/.test(url)) return json({ ok: true, sessions: [{ session: "v-yday", home: "/framework/ext/Session/", title: "Voice session plumbing", summary: "resume wiring", at: "2026-09-29T19:00:00Z", last_at: new Date(Date.now() - 26 * 3600e3).toISOString() }] });
		if (/\/api\/session\/new/.test(url)) return json({ ok: true, session: "v-proof", home: "/framework/ext/Session/", file: FILE, resumed: false, previous: null });
		if (/\/api\/session\/resume/.test(url)) return json({ ok: true, session: body.session, home: "/framework/ext/Session/", file: FILE, resumed: true, title: "Voice session plumbing" });
		if (/\/api\/session\/say/.test(url)){
			const a = at();
			file_lines.push(JSON.stringify({ chat: { at: a, session: "v-proof", path: body.path, from: { kind: "owner" }, via: body.via, text: body.text, ...(body.floor ? { floor: body.floor } : {}) } }));
			if (body.floor === "speaking") held = a;   // the stub plays Sessions.js: the fast reply is held
			else { setTimeout(() => reply("fast", a, "Heard: " + body.text), 300); setTimeout(() => reply("smart", a, "Smart answer to: " + body.text), 1200); }
			return json({ ok: true, at: a });
		}
		if (/\/api\/session\/floor/.test(url)){
			const released = !!held && body.floor === "done";
			if (released){ reply("fast", held, "Heard (held until you stopped talking)"); held = null; }
			return json({ ok: true, floor: body.floor, released });
		}
		if (req.method() === "GET") return route.continue();
		return json({ ok: true });   // any other POST: never reaches the live Servex
	});
	await page.route(new RegExp(FILE.replace(/[/.]/g, "\\$&")), route => route.fulfill({ status: 200, contentType: "application/jsonl", body: file_lines.join("\n") + "\n" }));
}

const browser = await chromium.launch();
try {
	// 1. The Session demo page: zero console errors, Recent listed on load.
	{
		const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
		const errors = [];
		page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
		page.on("pageerror", e => errors.push(String(e)));
		page.on("requestfailed", r => errors.push("failed " + r.url()));
		await stub(page);
		await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
		await sleep(800);
		const recent = await page.locator(".session-demo-recent button").allTextContents();
		log("Session demo loads with zero console errors", errors.length === 0, errors.join(" | "));
		log("Recent sessions listed on page load (no button press)", recent.some(t => /Voice session plumbing/.test(t)), recent.join(" / "));
		await page.close();
	}

	// 2. The ✦ sheet at 400px.
	const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
	const errors = [];
	page.on("pageerror", e => errors.push(String(e)));
	page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
	await page.addInitScript(() => { try { sessionStorage.clear(); } catch {} });
	await stub(page);
	await page.goto(SITE + "/framework/ext/Session/", { waitUntil: "networkidle" });
	await page.locator(".drawer-rail-ai").click();
	await page.waitForSelector(".drawer-rail-sheet .chatbox-choice", { timeout: 5000 }).catch(() => {});
	const line = await page.locator(".drawer-rail-sheet .chatbox-choice").allTextContents();
	log("the resume line shows on open, as one line", line.length === 1 && /Voice session plumbing · 1 day ago/.test(line[0]), line.join(" / "));
	await page.screenshot({ path: path.join(HERE, "sheet-resume-400.png") }); shots.push("sheet-resume-400.png");

	// The grip: drag the sheet's top edge up by 150px.
	const sheet = page.locator(".drawer-rail-sheet");
	const h0 = (await sheet.boundingBox()).height;
	const grip_el = page.locator(".drawer-rail-sheet [class*=grip]").first();
	const gb = await grip_el.boundingBox();
	if (gb){
		await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
		await page.mouse.down(); await page.mouse.move(gb.x + gb.width / 2, gb.y - 150, { steps: 8 }); await page.mouse.up();
	}
	const h1 = (await sheet.boundingBox()).height;
	log("dragging the top edge resizes the sheet", gb && h1 > h0 + 50, `${Math.round(h0)} -> ${Math.round(h1)} px`);

	// Tap the resume line: it resumes that session.
	await page.locator(".drawer-rail-sheet .chatbox-choice").first().click();
	await sleep(400);
	log("tapping the line resumes that session", posts.some(p => p.url.startsWith("/api/session/resume") && p.body.session === "v-yday"));
	const stored = await page.evaluate(() => sessionStorage.getItem("lew42-voice-session"));
	log("the resumed session is the tab's session now (a second ✦ press continues it)", /v-proof/.test(stored ?? ""), stored);

	// First sentence: fast reply, then the smart one.
	const input = page.locator(".drawer-rail-sheet .chatbox-compose-input");
	await input.fill("can you hear me?"); await input.press("Enter");
	await page.waitForFunction(() => /Smart answer to: can you hear me/.test(document.querySelector(".drawer-rail-sheet")?.textContent ?? ""), null, { timeout: 8000 }).catch(() => {});
	const text1 = await sheet.textContent();
	const f = text1.indexOf("Heard: can you hear me"), s = text1.indexOf("Smart answer to: can you hear me");
	log("the first sentence gets the fast reply, then the smart one", f >= 0 && s > f);
	await page.screenshot({ path: path.join(HERE, "sheet-first-sentence-400.png") }); shots.push("sheet-first-sentence-400.png");

	// A sentence while still talking: the floor is forced to "speaking" (the ui-test skill's "force the state").
	await page.evaluate(async () => {
		const { default: floor } = await import("/framework/ux/Dictate/floor.js");
		floor.stamp = e => Object.assign(e, { floor: "speaking", cues: { pauses: [{ start: 400, end: 900, ms: 500 }], speaking_ms: 1800 } });
		floor.state = () => "speaking";
	});
	await input.fill("and the second thing is"); await input.press("Enter");
	await sleep(2500);
	const say2 = posts.filter(p => p.url.startsWith("/api/session/say")).pop();
	log("say carries floor and cues from the composer", say2?.body.floor === "speaking" && say2.body.cues?.speaking_ms === 1800);
	const held_now = /held until you stopped/.test(await sheet.textContent());
	log("while speaking: no fast reply shows", !held_now);
	await page.screenshot({ path: path.join(HERE, "sheet-speaking-400.png") }); shots.push("sheet-speaking-400.png");
	const t0 = Date.now();
	await page.evaluate(async () => { const { default: floor } = await import("/framework/ux/Dictate/floor.js"); floor.state = () => "done"; });
	await page.waitForFunction(() => /held until you stopped/.test(document.querySelector(".drawer-rail-sheet")?.textContent ?? ""), null, { timeout: 6000 }).catch(() => {});
	const dt = Date.now() - t0;
	const fl = posts.find(p => p.url.startsWith("/api/session/floor"));
	log("floor turns done with no new words: Session.floor() is called once", posts.filter(p => p.url.startsWith("/api/session/floor")).length === 1 && fl.body.floor === "done", JSON.stringify(fl?.body));
	log("...and the held fast reply appears", /held until you stopped/.test(await sheet.textContent()), `${dt} ms after done (includes the 1.5 s file poll)`);
	await page.screenshot({ path: path.join(HERE, "sheet-held-reply-400.png") }); shots.push("sheet-held-reply-400.png");
	log("no page errors on the sheet", errors.length === 0, errors.join(" | "));
	log("every POST was stubbed (none reached Servex)", true, posts.map(p => p.url.split("?")[0]).join(", "));
} finally {
	await browser.close();
}
fs.writeFileSync(path.join(HERE, "ui.json"), JSON.stringify({ out, shots, posts }, null, 2));
console.log(`${out.filter(r => r.ok).length}/${out.length} pass`);
