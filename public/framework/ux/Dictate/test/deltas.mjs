// The chat bubbles, replayed: a repeated, late or fixed line must never duplicate or scramble the text. Headless; nothing is posted.
//   node public/framework/ux/Dictate/test/deltas.mjs <base-url>
// Mounts one Widget (the chat thread every surface uses) and feeds it, through say() and stream(), the lines the live wire and
// the 1.5 s poll deliver: the same line twice, a line that arrives after a later one, a streamed reply that ends, its settled line,
// and a `fix` of it. Then the WHOLE sequence again, the way a reconnect or the poll replays it. Exit 1 on any failure.
import { pathToFileURL } from "url";

const [base = "http://monorepo.localhost"] = process.argv.slice(2);
const PW = process.env.PWENTRY ?? "C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(PW).href);
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
let failed = 0;
const check = (ok, msg) => { console.log(ok ? "ok  " : "FAIL", msg); if (!ok) failed++; };

await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.querySelector(".page"), null, { timeout: 20000 });
const out = await page.evaluate(async () => {
	const { View } = await import("/framework/core/View/View.js");
	const { default: Widget } = await import("/framework/ux/Dictate/Widget.js");
	const host = document.createElement("div");
	host.id = "deltas"; document.body.append(host);
	let w; new View({ el: host, capture: false }).append(() => { w = new Widget({ placeholder: "replay" }); });
	const t0 = Date.now() - 60000, at = s => new Date(t0 + s * 1000).toISOString();
	const owner = (s, text) => ({ chat: { at: at(s), from: { kind: "owner" }, via: "voice", text } });
	const smart = (s, text, fix) => ({ chat: { at: at(s), from: { kind: "assistant", id: "smart" }, text, ...(fix ? { fix: true } : {}) } });
	const seq = [
		["say", owner(1, "One.")],
		["say", owner(1, "One.")],                         // the poll repeats the live wire's line
		["say", owner(3, "Three.")],                       // arrives before the line said before it
		["say", owner(2, "Two.")],                         // late
		["stream", "smart", "Wri"], ["stream", "smart", "Writing"], ["stream", "smart", "Writing a reply"],
		["stream", "smart", ""],                           // the reply's text ended
		["say", smart(5, "Writing a reply.")],              // its settled line
		["say", smart(5, "Writing a reply.")],              // again
		["say", smart(5, "Writing a reply, fixed.", true)], // a fix of it
	];
	const play = () => { for (const [verb, a, b] of seq) verb === "say" ? w.say(a) : w.stream(a, b); };
	const read = () => {
		const box = host.querySelector(".ux-dictate-widget-bubbles");
		return [...box.children].map(b => ({ cls: b.className.includes("chatbox-you") ? "owner" : b.className.includes("chatbox-reply") ? "smart" : b.className,
			streaming: b.classList.contains("chatbox-streaming"), text: [...b.querySelectorAll(":scope > .chatbox-text")].map(t => t.textContent.replace(/\s*[🎤⌨]\s*$/u, "").trim()) }));   // the 🎤/⌨ badge is not the text
	};
	play(); const once = read();
	play(); const twice = read();
	return { once, twice };
});
console.log("  after one pass:", JSON.stringify(out.once));
const [ob, ...rest] = out.once;
check(ob?.cls === "owner" && JSON.stringify(ob.text) === JSON.stringify(["One.", "Two.", "Three."]), "the owner's bubble reads One. Two. Three.: the repeat drawn once, the late line in its place");
const replies = out.once.filter(b => b.cls === "smart");
check(replies.length === 1, `one reply bubble, not one per delta (${replies.length})`);
check(replies[0]?.text.join(" ") === "Writing a reply, fixed.", "the fix updated the reply in place: " + replies[0]?.text.join(" "));
check(!out.once.some(b => b.streaming), "no bubble is left blinking after its stream ended");
check(JSON.stringify(out.twice) === JSON.stringify(out.once), "replaying the whole sequence again changes nothing");
check(!errors.length, "no page errors: " + errors.join(" | "));
await browser.close();
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
