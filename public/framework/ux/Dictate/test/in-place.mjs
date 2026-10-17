// Proof for the voice assistant plan (doc/voice-assistant.md), slices b and c. Headless only, never the owner's tabs.
//   PWENTRY=<playwright/index.mjs> node public/framework/ux/Dictate/test/in-place.mjs <base-url> [shots dir]
// b. Fake mic (jfk.wav) into a bare Widget (no Servex, no agents): the words grow inside the bubble, and when the sentence
//    is sent the settled text sits exactly where the draft was (same top, no extra bubble, no faded copy).
// c. The fixture session file's lines are drawn, then {place} lines: same = nothing, paragraph = split, card = a card.
//    Coverage: every owner sentence appears exactly once in the thread.
import { pathToFileURL } from "url";
import fs from "fs";

const [base = "http://monorepo.localhost", shots] = process.argv.slice(2);
const wav = process.env.WAV ?? new URL("../../../ai/recordings/jfk.wav", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const fixture = new URL("../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/fixture/v-fixture.jsonl", import.meta.url);
const all = fs.readFileSync(fixture, "utf8").trim().split("\n").map(l => JSON.parse(l));
const lines = all.filter(l => l.chat), places = all.filter(l => l.place).map(l => l.place);
const { chromium } = await import(pathToFileURL(process.env.PWENTRY).href);
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 200 s"); process.exit(2); }, 200000);
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

for (const width of [400, 1200]){
	const ctx = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["microphone"] });
	const page = await ctx.newPage();
	const errors = [];
	page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
	await page.goto(base + "/framework/start/", { waitUntil: "domcontentloaded" }).catch(() => {});
	await page.evaluate(async () => {
		document.body.innerHTML = '<div id="box" style="max-width:40em;margin:1em auto"></div>';
		const { View } = await import("/framework/core/View/View.js");
		const { default: Widget } = await import("/framework/ux/Dictate/Widget.js");
		window.sent = [];
		new View({ el: document.getElementById("box"), capture: false }).append(() => {
			window.w = new Widget({ placeholder: "say something", deliver: e => { window.sent.push(e.text); return true; } });
		});
		// a first owner sentence already in the thread, so the dictated one joins its bubble
		window.w.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, via: "voice", text: "First, an earlier sentence." } });
	});

	// b. dictate: watch the draft, then the send
	await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click();
	let draft = null, after = null;
	for (let i = 0; i < 160 && !after; i++){
		await page.waitForTimeout(250);
		const s = await page.evaluate(() => {
			const d = document.querySelector(".ux-dictate-draft-piece, .chatbox-draft");
			const bubbles = document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox").length;
			return { draft: d ? { top: Math.round(d.getBoundingClientRect().top), inside: d.classList.contains("ux-dictate-draft-piece"), text: d.textContent } : null,
				bubbles, sent: window.sent.length, faded: document.querySelectorAll(".chatbox-live-sent").length,
				last_top: (() => { const ps = document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox > .chatbox-text"); return ps.length ? Math.round(ps[ps.length - 1].getBoundingClientRect().top) : null; })() };
		});
		if (s.draft && !s.sent) draft = s;
		if (draft && s.sent) after = s;
		if (i % 20 === 19) console.log("    ", width, i, JSON.stringify(s).slice(0, 160));
	}
	if (shots) await page.screenshot({ path: `${shots}/in-place-${width}.png` });
	check(!!draft, `${width}: the words grew in the chat (draft ${draft?.draft?.inside ? "inside the last bubble" : "in its own bubble"})`);
	check(!!after, `${width}: the sentence was sent`);
	if (draft && after){
		check(draft.draft.inside, `${width}: the draft is the last piece of the bubble it joins`);
		check(after.bubbles === draft.bubbles, `${width}: no extra bubble on send (${draft.bubbles} -> ${after.bubbles})`);
		check(after.faded === 0, `${width}: no faded copy left behind`);
		check(Math.abs(after.last_top - draft.draft.top) <= 2, `${width}: the settled words sit where the draft was (top ${draft.draft.top} -> ${after.last_top})`);
	}
	await page.locator(".chatbox-mic .ux-dictate-btn, .chatbox-mic button").first().click().catch(() => {});

	// c. the fixture, then placements
	const out = await page.evaluate(([lines, places]) => {
		const count = () => document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox").length;
		w.reset();
		lines.forEach(l => w.say({ chat: l.chat }));
		const n0 = count();
		w.say({ place: { re: lines[1].chat.at, to: "same" } });
		const n1 = count();
		places.forEach(p => w.say({ place: p }));   // the fixture's own line, written by the item tool: "paragraph" on the third
		const np = count();
		w.say({ place: { re: lines[2].chat.at, to: "card", where: "up", title: "Inbox labels" } });
		const bubbles = [...document.querySelectorAll(".ux-dictate-widget-bubbles > .chatbox")];
		const text = bubbles.map(b => b.textContent).join(" | ");
		return { n0, n1, np, n2: bubbles.length, card: bubbles.filter(b => b.classList.contains("ux-dictate-placed-card")).length, text };
	}, [lines, places]);
	if (shots) await page.screenshot({ path: `${shots}/placed-${width}.png` });
	check(out.n0 === 1 && out.n1 === 1, `${width}: three close sentences join one bubble; "same" changes nothing`);
	check(out.np === 2, `${width}: the fixture's item-tool line ("paragraph") split the third sentence off (${out.np} bubbles)`);
	check(out.n2 === 2 && out.card === 1, `${width}: "card" moved the third sentence into a card of its own`);
	const missing = lines.filter(l => out.text.split(l.chat.text).length !== 2);
	check(!missing.length, `${width}: coverage, every sentence appears exactly once${missing.length ? " (missing: " + missing.map(l => l.chat.text).join("; ") + ")" : ""}`);
	check(!errors.length, `${width}: no page errors ${errors.join(" ")}`);
	await ctx.close();
}
clearTimeout(kill);
await browser.close();
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
