/* node order-proof.mjs <origin> [tag] — headless: scripted four owner sentences with assistant replies in between,
   arriving out of order the way the live widget delivers them (a reply drawn before the sentence's Whisper text is
   retagged to its true time). Asserts DOM order == time order (= session file order). Exit 0 pass, 1 fail. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const origin = process.argv[2], tag = process.argv[3] || "run";
const b = await browser(); const p = await (await b.newContext({ viewport: { width: 400, height: 800 } })).newPage();
p.on("pageerror", e => console.log("PAGEERROR", e.message));
await p.goto(origin + "/framework/", { waitUntil: "load" }); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
	const { div } = await import("/app.js"); const C = await import("/framework/ext/Chat/Chat.js");
	const $box = div(); $box.el.style.cssText = "width:380px;background:#fff;padding:8px"; document.body.prepend($box.el);
	const T0 = n => Date.UTC(2026, 9, 13, 12, 0, n * 30), T = Object.assign(n => new Date(T0(n)).toISOString(), {});          // 30 s apart: no merging
	const you = (text, n, id) => C.speak($box, { cls: "chatbox-you", who: "owner", text, sender: "owner", at: T(n), id: id ?? T0(n), join: false });
	const bot = (text, n) => C.speak($box, { cls: "chatbox-reply", who: "assistant", text, sender: "assistant", at: T(n), id: T0(n), join: false });
	// file order: 1 you, 2 bot, 3 you, 4 bot, 5 you, 6 bot, 7 you, 8 bot
	you("First sentence.", 1); bot("Reply to one.", 2);
	you("Third, said while the bot spoke, arrives late.", 3);   // late: bot(2) is already drawn... 4 follows
	bot("Reply to three.", 4);
	bot("Reply to five.", 6);                                   // reply drawn BEFORE its sentence (5) lands
	you("Fifth sentence, late.", 5);
	// seventh drawn with a provisional time (now), then retagged to its true time by the widget
	const late = you("Seventh, provisional time.", 99, "tmp"); C.retag_piece(late, "tmp", T(7));
	bot("Reply to seven.", 8);
	return [...$box.el.children].map(e => e.textContent.replace(/\s+/g, " ").trim().slice(0, 28) + " @" + ((e.dataset.at - T0(0)) / 30000));
});
const want = ["First sentence.", "Reply to one.", "Third, said while the bot spoke, ar", "Reply to three.", "Fifth sentence, late.", "Reply to five.", "Seventh, provisional time.", "Reply to seven."];
const norm = s => s.replace(/^[^A-Z]*/, "").replace(/\s*[🎤⌨].*$/u, "");
const got = r.map(norm); const ok = JSON.stringify(got.map(s => s.slice(0, 12))) === JSON.stringify(want.map(s => s.slice(0, 12)));
console.log(`[${tag}] DOM order:\n  ` + got.join("\n  ") + `\n[${tag}] ${ok ? "PASS" : "FAIL"}: DOM order ${ok ? "equals" : "differs from"} file order`);
await p.screenshot({ path: path.join(HERE, `order-${tag}.png`), clip: { x: 0, y: 0, width: 400, height: 640 } });
await close(); process.exit(ok ? 0 : 1);
