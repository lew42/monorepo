// V1 chat: what is shown never jumps; new things go below (the owner, 2026-11-01).
//   node public/framework/ux/Dictate/test/v1-order.mjs <base-url> [shots-folder]
// Headless, phone sheet at 400x860, every Servex call stubbed. After EVERY step the chat is read, and no two pieces already on screen
// may ever swap places. Three runs:
//  1. the incident, replayed: test/v1-order-fixture.jsonl is session v-u48msei lines 1562-1640 (a smart reply, owner lines spoken while it
//     was read aloud, then the reply to the 21:05:44 line). The whole chat must be in arrival order, the last reply below every owner line.
//     (This run alone also passes on the old code: replaying finished lines never had the open-bubble state; run 2 is the one that fails there.)
//  2. the cause, live: an owner bubble is open (its draft piece grows inside it), a reply lands below it, the owner goes on talking.
//     Before: the next sentence merged into the owner bubble and pulled it DOWN past the reply, so the reply seemed to jump above it.
//     Now: the reply closes the owner bubble; the next words are a new bubble below the reply (ext/Chat/doc/notes.md#bubble-order).
//  3. a Task card (the assistant's, not hung under a bubble) lands below the open owner bubble: it counts as an arrival too.
// A shots folder (2nd argument) gets incident-400x860.png and live-400x860.png.
import fs from "fs";
import path from "path";

const [base = "http://monorepo.localhost", shots] = process.argv.slice(2);
const { default: Browser } = await import(new URL("../../../../../Server/Browser.mjs", import.meta.url).href);
const lines = fs.readFileSync(new URL("./v1-order-fixture.jsonl", import.meta.url), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const browser = await Browser.launch();
const kill = setTimeout(() => { console.log("FAIL killed after 120 s"); process.exit(2); }, 120000);
let all = true;
const check = (ok, what) => { console.log((ok ? "ok   " : "FAIL ") + what); if (!ok) all = false; };

const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
const json = (route, out) => route.fulfill({ status: 200, contentType: "application/json", headers: cors, body: JSON.stringify(out) }).catch(() => {});
await page.route(/\/api\/session\//, async route => {
	const req = route.request(), verb = req.url().split("/api/session/")[1].split("?")[0];
	if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
	if (verb.endsWith("/stream")) return route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors, body: "retry: 60000\n\n" });
	return json(route, verb === "new" || verb === "resume" ? { ok: true, session: "stub-session", file: "/stub-session.jsonl" } : { ok: true });
});
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: "" }));
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/log\/prompts/, r => json(r, {}));
await page.route(/\/api\/hitl/, r => json(r, { ok: true, marks: [{ mark: "ok" }] }));
await page.route(/\/api\/refine\/live/, r => json(r, { ok: true, slots: [], outline: { sections: [] } }));
await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.evaluate(async () => { const { default: Sheet } = await import("/framework/ext/drawer/Sheet.js"); window.$sheet = Sheet.of(); await window.$sheet.to("full", { listen: false }); });
await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 20000 });
await page.waitForTimeout(800);

// In the page: snap() = every piece (owner or reply; Recite's own trace line left out) in DOM order, as "OWNER text" / "REPLY text";
// `swaps` collects any two pieces that changed order relative to each other since they were first seen.
await page.evaluate(() => {
	const w = globalThis.$dictate_widget, seen = [], swaps = [];
	globalThis.$v1 = {
		w, swaps,
		reset(){ w.$thread.$bubbles.el.replaceChildren(); w.$thread.draft = null; seen.length = 0; swaps.length = 0; },
		snap(label){
			const now = [...w.$thread.$bubbles.el.querySelectorAll(".chatbox-you [data-re], .chatbox-reply [data-re]")]
				.filter(p => !p.closest(".chatbox-live") && !(p.textContent || "").includes("recite:"));
			for (const p of now) if (!seen.includes(p)) seen.push(p);
			const ids = now.map(p => seen.indexOf(p));
			for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (ids[i] > ids[j]) swaps.push(`${label}: piece #${ids[j]} is now above #${ids[i]}`);
			return now.map(p => (p.closest(".chatbox-you") ? "OWNER " : "REPLY ") + (p.querySelector(".chatbox-text")?.textContent ?? p.textContent).trim().slice(0, 30));
		},
		wait: ms => new Promise(r => setTimeout(r, ms)),
	};
});

// 1. the incident
const final = await page.evaluate(async lines => {
	const { w, snap, wait } = globalThis.$v1;
	let last = [];
	for (const l of lines){
		const entry = l.chat ? { chat: l.chat } : l.place ? { place: l.place } : l.sent ? { sent: l.sent } : null;
		if (!entry) continue;
		w.say(entry);
		await wait(30);
		last = snap(l.chat?.at?.slice(11, 23) ?? Object.keys(entry)[0]);
	}
	return last;
}, lines);
console.log("       incident replayed, final chat:\n         " + final.map(s => JSON.stringify(s)).join("\n         "));
const incident_swaps = await page.evaluate(() => [...globalThis.$v1.swaps]);
// the whole order, not only the end: the chat lines in the file (the arrival order; `fix` lines only reword) are the expected order
const want = lines.filter(l => l.chat && !l.chat.fix && !(l.chat.text ?? "").startsWith("recite:"))
	.map(l => (l.chat.from?.kind === "owner" ? "OWNER " : "REPLY ") + l.chat.text.replace(/^#+\s*/, "").slice(0, 10));
check(final.length === want.length && final.every((s, i) => s.startsWith(want[i])),
	"incident: the whole chat is in arrival order (" + want.map(s => s.split(" ")[0][0]).join("") + ")" + (final.length === want.length ? "" : ` — drew ${final.length} pieces, the file has ${want.length}`));
const last_reply = final.findLastIndex(s => s.startsWith("REPLY")), last_owner = final.findLastIndex(s => s.startsWith("OWNER"));
check(final.length > 2 && last_reply === final.length - 1 && last_owner === final.length - 2,
	"incident: the 21:05:48 reply (it arrived after the owner's 21:05:44 line) is the last bubble, below every owner line");
check(!incident_swaps.length, "incident: no piece on screen ever swapped places with another" + (incident_swaps.length ? " — " + incident_swaps.join("; ") : ""));
if (shots){ fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, "incident-400x860.png") }); }

// 2. the cause, live
await page.evaluate(() => globalThis.$v1.reset());
const live = await page.evaluate(async () => {
	const { w, snap, wait } = globalThis.$v1, t = w.$thread, out = {};
	const iso = ms => new Date(Date.now() + ms).toISOString();
	w.say({ chat: { at: iso(0), from: { kind: "owner" }, via: "voice", text: "First thing I said." } });
	await wait(50); out.a = snap("owner A");
	t.live({ text: "and I am still", settled: "and I am still" });        // the draft grows inside owner bubble A
	await wait(50);
	w.say({ chat: { at: iso(100), from: { kind: "assistant", id: "smart" }, via: "text", text: "A reply that landed meanwhile." } });
	await wait(50); out.b = snap("reply lands");
	t.live({ text: "and I am still talking", settled: "and I am still talking" });
	await wait(50);
	w.show_out({ text: "and I am still talking.", at: iso(300) });       // the sentence leaves the draft
	await wait(80); out.c = snap("owner goes on");
	w.say({ chat: { at: iso(500), from: { kind: "assistant", id: "smart" }, via: "text", text: "A second reply." } });
	await wait(50); out.d = snap("second reply");
	out.swaps = [...globalThis.$v1.swaps];
	return out;
});
console.log("       live run, final chat:\n         " + live.d.map(s => JSON.stringify(s)).join("\n         "));
check(live.b.length === 2 && live.b[0].startsWith("OWNER") && live.b[1].startsWith("REPLY"), "live: a reply lands below the open owner bubble");
check(live.c.length === 3 && live.c[0].startsWith("OWNER First") && live.c[1].startsWith("REPLY") && live.c[2].startsWith("OWNER and I am still talking"),
	"live: the owner goes on talking after the reply: a new owner bubble BELOW the reply; the first bubble does not move down past it");
check(live.d.length === 4 && live.d[3].startsWith("REPLY A second"), "live: the next reply goes to the bottom, below the newest owner line");
check(!live.swaps.length, "live: no piece on screen ever swapped places with another" + (live.swaps.length ? " — " + live.swaps.join("; ") : ""));
if (shots) await page.screenshot({ path: path.join(shots, "live-400x860.png"), clip: { x: 0, y: 140, width: 400, height: 720 } });

// 3. a Task card (not hung under a bubble) lands below the open owner bubble: the next sentence starts below it too
await page.evaluate(() => globalThis.$v1.reset());
const task = await page.evaluate(async () => {
	const { w, wait } = globalThis.$v1, t = w.$thread, iso = ms => new Date(Date.now() + ms).toISOString();
	const rows = () => [...t.$bubbles.el.children].filter(b => b.classList.contains("chatbox") && !b.classList.contains("chatbox-live"))
		.map(b => (b.classList.contains("chatbox-task") ? "TASK " : b.classList.contains("chatbox-you") ? "OWNER " : "REPLY ") + (b.querySelector(".chatbox-text")?.textContent ?? "").trim().slice(0, 30));
	w.say({ chat: { at: iso(0), from: { kind: "owner" }, via: "voice", text: "First thing I said." } });
	await wait(50);
	t.show_task({ id: "t-1", label: "A task from the assistant", phase: "open" });
	await wait(50);
	w.say({ chat: { at: iso(300), from: { kind: "owner" }, via: "voice", text: "And another sentence." } });
	await wait(80);
	return rows();
});
check(task.length === 3 && task[0].startsWith("OWNER First") && task[1].startsWith("TASK") && task[2].startsWith("OWNER And another"),
	"task card: it lands below the open owner bubble and stays there; the next sentence is a new bubble below it — " + task.map(s => JSON.stringify(s)).join(" | "));

check(!errors.length, "no page error" + (errors.length ? " — " + errors[0] : ""));
await ctx.close();
clearTimeout(kill);
await browser.close();
process.exit(all ? 0 : 1);
