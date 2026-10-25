// The flicker, measured: do the owner's words stay on screen from the moment they appear until they are sent and answered?
//   node public/framework/ux/Dictate/test/flicker.mjs <base-url> [shots-dir] [plain|clean]
// Headless, phone sheet at 400, every Servex call stubbed (nothing is posted). The mic is driven by hand, so the run is the same every
// time: Whisper's growing guess word by word, its final, the clean-up for that sentence (scenario "clean" only), a pause that sends
// everything, and talking on while that send is still open (Servex answers `say` after SAY_MS). A shot every ~150 ms, and at each shot
// the owner's words in the chat, as a multiset of plain words.
// The proof is two numbers that must agree: words that left the screen between shot N and N+1, and those the clean-up explains
// (a word the cleaned text really dropped or changed). Anything else is a word that flickered. Exit 1 when they differ.
import fs from "fs";
import path from "path";

const [base = "http://monorepo.localhost", shots_arg, only] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const shots_root = shots_arg ?? path.resolve(here, "../../../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/shots");
const SAY_MS = 3000;      // Servex's answer to session/say: slow, the way a busy Servex is (its limit is 10 s)
const REFINE_MS = 900;    // the live refine's answer (scenario "clean")
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);   // the shared launcher: no window
const browser = await Browser.launch();
const kill = setTimeout(() => { console.log("FAIL killed after 240 s"); process.exit(2); }, 240000);

// What is said, and what the clean-up makes of it. A word in `raw` but not in `clean` is one the clean-up may take away.
const SENTENCES = [
	{ raw: "So um the first thing is the flicker.", clean: "The first thing is the flicker." },
	{ raw: "Words should stay where they are.", clean: "Words should stay where they are." },
	{ raw: "And then the uh second thing comes along.", clean: "Then the second thing comes along." },
];
const norm = t => String(t).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
const count = ws => ws.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map());
// unfill() in Mic.js drops these before they ever reach the chat, so they are never on screen to lose
const FILLERS = new Set("ah uh um er erm hmm mm".split(" "));
const cleanable = new Set(SENTENCES.flatMap(s => { const c = new Set(norm(s.clean)); return norm(s.raw).filter(w => !c.has(w) && !FILLERS.has(w)); }));

async function run(scenario){
	const dir = path.join(shots_root, scenario);
	fs.mkdirSync(dir, { recursive: true });
	for (const f of fs.readdirSync(dir)) if (f.endsWith(".png")) fs.unlinkSync(path.join(dir, f));
	const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
	const page = await ctx.newPage();
	const errors = [], lines = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
	const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
	await page.route(/\/api\/session\//, async route => {
		const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
		if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
		if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
		let body = {}; try { body = JSON.parse(req.postData() ?? "{}"); } catch {}
		if (verb === "say"){   // written at once (the poll sees it), answered late
			const at = new Date().toISOString();
			lines.push({ chat: { at, from: { kind: "owner" }, via: "voice", text: body.text } });
			await new Promise(r => setTimeout(r, SAY_MS));
			return json(route, { ok: true, at });
		}
		return json(route, verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : { ok: true });
	});
	await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: lines.map(l => JSON.stringify(l)).join("\n") }));
	await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
	await page.route(/\/log\/prompts/, r => json(r, {}));
	await page.route(/\/api\/hitl/, async r => { await new Promise(res => setTimeout(res, 300)); json(r, { ok: true, marks: [{ mark: "ok" }] }); });
	await page.route(/\/api\/refine\/live/, async r => {
		let body = {}; try { body = JSON.parse(r.request().postData() ?? "{}"); } catch {}
		await new Promise(res => setTimeout(res, REFINE_MS));
		// the refined slots: the cleaned sentences the text holds, numbered
		const slots = SENTENCES.filter(s => norm(body.text).join(" ").includes(norm(s.clean).slice(-3).join(" "))).map((s, i) => ({ n: i + 1, clean: s.clean, raw: s.raw }));
		json(r, { ok: true, slots, outline: { sections: [] } });
	});
	await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
	await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
	await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
	await page.waitForTimeout(800);

	// The owner's words on screen right now: every owner bubble and the growing draft, badges and avatars left out.
	await page.evaluate(() => {
		globalThis.$flicker_words = () => {
			const t = globalThis.$dictate_widget?.$thread?.el;
			if (!t) return "";
			const out = [];
			for (const b of t.querySelectorAll(".chatbox-you")){
				const copy = b.cloneNode(true);
				copy.querySelectorAll(".chatbox-who, .chatbox-via, .chatbox-mark, .chatbox-failed, .chatbox-reacts, .chatbox-pieces, .chatbox-from, button").forEach(n => n.remove());
				if (b.matches(".ux-dictate-swallowed:not(.open)")) copy.querySelectorAll(":scope > [data-re]").forEach(n => n.remove());   // folded under a summary: not visible
				for (const p of copy.querySelectorAll(".chatbox-text, .ux-dictate-summary-text")) out.push(p.textContent.trim());
			}
			return out.filter(Boolean).join(" | ");
		};
	});

	// The script, run inside the page, not awaited: the shots below run beside it.
	await page.evaluate(({ SENTENCES, scenario }) => {
		const m = globalThis.$dictate_widget.dictate, wait = ms => new Promise(r => setTimeout(r, ms));
		m.state = "listening";   // the mic is "on": consume_sent keeps listening, arm() sends on its own rules
		if (scenario === "clean") m.revise = "clean"; else m.revise = false;
		let chunk = 0;
		const say = async s => {
			const words = s.raw.replace(/[.!?]$/, "").split(" ");
			for (let n = 1; n <= words.length; n++){ m.partial_text = words.slice(0, n).join(" "); m.draw_caption(); await wait(220); }
			const id = ++chunk;
			m.partial_text = "";
			m.log_prompt(s.raw.replace(/\b(um|uh)\b ?/g, "").replace(/\s+/g, " ").trim(), id);   // Whisper's final (Dictate.commit unfills before log_prompt)
			if (scenario === "clean"){ await wait(400); m.on_revised(s.clean, { chunk_id: id }); }
		};
		globalThis.$flicker_done = (async () => {
			await wait(300);
			await say(SENTENCES[0]);
			await say(SENTENCES[1]);
			await wait(300);
			m.send_screen();          // a natural pause: everything on screen goes out
			await wait(250);
			await say(SENTENCES[2]);  // talking on while that send is still open
			await wait(300);
			m.send_screen();
			await wait(8000);         // both sends answered, echoes in
			return true;
		})();
	}, { SENTENCES, scenario });

	const frames = [];
	const t0 = Date.now();
	while (Date.now() - t0 < 20000){
		const tick = Date.now();
		const words = await page.evaluate(() => globalThis.$flicker_words());
		const n = frames.length;
		const file = path.join(dir, String(n).padStart(3, "0") + ".png");
		await page.locator(".drawer-rail-sheet.on .ux-dictate-widget-thread").screenshot({ path: file }).catch(() => {});
		frames.push({ n, ms: tick - t0, words });
		if (await page.evaluate(() => globalThis.$flicker_done && Promise.race([globalThis.$flicker_done, new Promise(r => setTimeout(() => r(false), 0))]))) break;
		const left = 150 - (Date.now() - tick);
		if (left > 0) await page.waitForTimeout(left);
	}

	// N -> N+1: every word that left the screen, and whether the clean-up explains it
	let gone = 0, explained = 0, moved = 0;
	const events = [], moves = [];
	for (let i = 0; i + 1 < frames.length; i++){
		const a = count(norm(frames[i].words)), b = count(norm(frames[i + 1].words));
		for (const [w, k] of a){
			const lost = k - (b.get(w) ?? 0);
			if (lost <= 0) continue;
			gone += lost;
			const ok = scenario === "clean" && cleanable.has(w);
			if (ok) explained += lost;
			else events.push({ from: i, to: i + 1, ms: frames[i + 1].ms, word: w, lost });
		}
		// words on both shots that changed their order (a piece drawn before the words it follows): both minus their longest common run
		const x = norm(frames[i].words), y = norm(frames[i + 1].words), cy = count(y);
		const both = [...count(x)].reduce((s, [w, k]) => s + Math.min(k, cy.get(w) ?? 0), 0);
		const L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
		for (let a = 1; a <= x.length; a++) for (let c = 1; c <= y.length; c++) L[a][c] = x[a - 1] === y[c - 1] ? L[a - 1][c - 1] + 1 : Math.max(L[a - 1][c], L[a][c - 1]);
		const m = both - L[x.length][y.length];
		if (m > 0){ moved += m; moves.push({ from: i, to: i + 1, ms: frames[i + 1].ms, words: frames[i + 1].words.slice(0, 120) }); }
	}
	const sent = lines.map(l => l.chat.text);
	const sent_row = await page.evaluate(async () => (await import("/framework/ux/Dictate/DictateHealth.js")).default.layers.sent.why);
	const final_words = frames.at(-1)?.words ?? "";
	const report = { scenario, frames: frames.length, every_ms: Math.round((frames.at(-1)?.ms ?? 0) / Math.max(1, frames.length - 1)),
		words_gone: gone, explained_by_clean: explained, agree: gone === explained, words_moved: moved, flickers: events.slice(0, 40), moves: moves.slice(0, 20), sent, sent_row, final_words, errors };
	fs.writeFileSync(path.join(dir, "frames.json"), JSON.stringify(frames, null, 1));
	fs.writeFileSync(path.join(dir, "numbers.json"), JSON.stringify(report, null, 1));
	console.log(`${report.agree ? "ok  " : "FAIL"} ${scenario}: ${frames.length} shots every ~${report.every_ms} ms; words that left the screen ${gone}, explained by the clean-up ${explained}`);
	for (const e of events.slice(0, 8)) console.log(`       shot ${e.from}->${e.to} (${e.ms} ms): "${e.word}" vanished`);
	console.log(`${moved ? "FAIL" : "ok  "} ${scenario}: words that changed place between two shots ${moved}`);
	for (const e of moves.slice(0, 4)) console.log(`       shot ${e.from}->${e.to} (${e.ms} ms): "${e.words}"`);
	const last = norm(final_words).join(" "), want = norm(SENTENCES.map(s => scenario === "clean" ? s.clean : s.raw).join(" ")).filter(w => !FILLERS.has(w)).join(" ");
	const ok_end = last === want;
	console.log(`${ok_end ? "ok  " : "FAIL"} ${scenario}: the chat ends with every sentence once, in order ("${last.slice(0, 120)}")`);
	const timed = /on screen at once, sent [0-9.]+ s later .*Servex took it in [0-9.]+ s/.test(sent_row ?? "");
	console.log(`${timed ? "ok  " : "FAIL"} ${scenario}: the Debug tab's Sent row times each step: ${sent_row}`);
	console.log(`${errors.length ? "FAIL" : "ok  "} ${scenario}: no page errors${errors.length ? " — " + errors[0] : ""}`);
	await ctx.close();
	return report.agree && !moved && ok_end && timed && !errors.length;
}

let all = true;
for (const s of ["plain", "clean"]) if (!only || only === s) all = (await run(s)) && all;
clearTimeout(kill);
await browser.close();
process.exit(all ? 0 : 1);
