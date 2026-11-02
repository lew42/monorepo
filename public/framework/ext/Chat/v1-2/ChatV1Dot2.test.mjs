// node ChatV1Dot2.test.mjs [base-url] [shots-dir] — headless proof for Chat V1.2: a dictated Prompt grows sentence by sentence, each
// `sent` mark moves the one ✓ forward, the ✓ is dim while words wait and lit green once the assistant has them all, there is no 🧠,
// and stop() leaves plain V1.2. Drives ChatV1Dot2.read() with lines in the page (no file, no live Servex); run with FENCE_SERVEX=1.
import { browser as get_browser } from "../../../../../Server/Browser.mjs";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost", shots = process.argv[3];
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const T = ms => new Date(Date.parse("2026-11-02T14:00:00.000-06:00") + ms).toISOString();
const sentence = (n, text, ms) => n === 1
	? { sentences: { add: { id: "s-1", at: T(ms), text, via: "voice" } }, messages: { add: { type: "Prompt", id: "m-1", by: "owner", at: T(ms), sentences: ["s-1"] } } }
	: { sentences: { add: { id: "s-" + n, at: T(ms), text, via: "voice" } }, messages: { "m-1": { sentences: { push: "s-" + n } } } };
const sent = ms => ({ messages: { "m-1": { sent: { fast: { at: T(ms) } } } } });
const S = [["Can you check the build?", 0], ["I think the cursor is lagging behind.", 3000], ["Maybe it is the cache.", 6000]];

const b = await get_browser(), page = await b.newPage({ viewport: { width: 360, height: 740 }, userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36" });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
await page.goto(`${base}/framework/ext/Chat/v1-2/`, { waitUntil: "networkidle" });
await page.evaluate(async () => {
	const { default: ChatV1Dot2 } = await import("/framework/ext/Chat/v1-2/ChatV1Dot2.js");
	const { div } = await import("/framework/core/View/View.js");
	document.body.replaceChildren();
	const $box = div.c("chat-v1-2"); document.body.append($box.el);
	window.c = new ChatV1Dot2({ $box });
});
const feed = line => page.evaluate(l => window.c.read([l]), line);
const state = () => page.evaluate(() => {
	const cur = [...document.querySelectorAll(".chat-cursor")], one = cur[0];
	return {
		cursors: cur.length,
		after: one?.closest("[data-re]")?.dataset.re ?? null,
		waiting: one?.classList.contains("chat-cursor-waiting") ?? null,
		unsent: [...document.querySelectorAll(".chat-unsent")].map(n => n.dataset.re),
		brains: document.querySelectorAll(".chat-smart-cursor").length,
		bubbles: document.querySelectorAll(".chatbox").length,
		opacity: one ? Number(getComputedStyle(one).opacity) : null,
		color: one ? getComputedStyle(one).color : null,
		ok: getComputedStyle(document.documentElement).getPropertyValue("--ok").trim(),
		text: document.querySelector(".chatbox-you")?.textContent ?? "",
	};
});
const settle = () => page.waitForTimeout(800);   // the .6s dim/lit transition

try {
	await feed({ session: { id: "v-test", kind: "voice", at: T(0) } });
	await feed(sentence(1, ...S[0]));
	let s = await state();
	check("a dictated sentence is drawn in one owner bubble", s.bubbles === 1 && s.text.includes("Can you check the build?"), s);
	check("nothing is sent yet: no ✓, the sentence waits (dimmed)", s.cursors === 0 && s.unsent.join() === "s-1", s);

	await feed(sentence(2, ...S[1]));
	s = await state();
	check("the Prompt grows into the SAME bubble, both sentences still after the cursor", s.bubbles === 1 && s.cursors === 0 && s.unsent.join() === "s-1,s-2", s);

	await feed(sent(S[0][1]));
	s = await state(); await settle();
	check("sent #1: the ✓ sits after sentence 1, sentence 2 still waits", s.cursors === 1 && s.after === "s-1" && s.unsent.join() === "s-2", s);
	check("…and the ✓ is dimmed while words wait", s.waiting === true && (await state()).opacity < 0.5, await state());

	await feed(sentence(3, ...S[2]));
	await feed(sent(S[1][1]));
	s = await state(); await settle();
	check("sent #2: the ✓ moved forward to the end of sentence 2 (still ONE ✓), sentence 3 waits", s.cursors === 1 && s.after === "s-2" && s.unsent.join() === "s-3", s);

	await feed(sent(S[2][1]));
	await settle();
	s = await state();
	check("sent #3: the ✓ is after the last sentence, nothing waits", s.cursors === 1 && s.after === "s-3" && s.unsent.length === 0 && s.waiting === false, s);
	check("…and the ✓ is lit: full opacity, the --ok green", s.opacity === 1 && s.color.replace(/\s/g, "").length > 0, s);
	const green = await page.evaluate(() => { const probe = document.createElement("span"); probe.style.color = "var(--ok)"; document.body.append(probe); const c = getComputedStyle(probe).color; probe.remove(); return c; });
	check("…the lit colour IS --ok", s.color === green, { got: s.color, green });
	check("no 🧠 anywhere", s.brains === 0, s);

	await feed({ messages: { "m-1": { clean: { "s-1": "Can you check the build, please?" } } } });
	s = await state();
	check("a cleaned sentence updates in place, the ✓ stays after sentence 3", s.text.includes("build, please?") && s.cursors === 1 && s.after === "s-3" && s.bubbles === 1, s);

	await feed({ messages: { add: { id: "m-2", type: "Reply", by: "smart", at: T(7000), text: "Looking at the build now.", re: { to: "s-1" } } } });
	s = await state();
	check("a Reply lands as its own bubble; the owner's ✓ is untouched", s.bubbles === 2 && s.cursors === 1 && s.after === "s-3", s);
	if (shots) { mkdirSync(shots, { recursive: true }); await page.screenshot({ path: `${shots}/v1-2-360.png` }); }

	await page.evaluate(() => window.c.send_cursor.stop());
	s = await state();
	check("stop() removes the ✓ and the dimming, the bubble stays plain V1.2", s.cursors === 0 && s.unsent.length === 0 && s.bubbles === 2, s);
	await page.evaluate(() => window.c.send_cursor.start());
	check("start() brings it back", (await state()).cursors === 1);
	check("no page errors", errors.length === 0, errors);
} catch (e) { fail++; console.log("FAIL threw", e); }
console.log(`${pass} passed, ${fail} failed`);
await b.close?.();
process.exit(fail ? 1 : 0);
