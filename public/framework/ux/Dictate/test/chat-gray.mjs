// Proof: the gray guess words and the faded sent bubble carry a title, and the "cleaning…" mark stays full strength.
//   node public/framework/ux/Dictate/test/chat-gray.mjs <base-url> <shots-dir>
import fs from "fs";
import Browser from "../../../../../Server/Browser.mjs";
const [base = "http://monorepo.localhost", shots = "."] = process.argv.slice(2);
fs.mkdirSync(shots, { recursive: true });
const browser = await Browser.browser({}), page = await (await browser.newContext({ viewport: { width: 400, height: 500 } })).newPage();
await page.goto(base + "/framework/ext/drawer/", { waitUntil: "domcontentloaded" });
const out = await page.evaluate(async () => {
	const { chat } = await import("/framework/ext/Chat/Chat.js");
	const c = chat({ source: () => {} }), host = document.createElement("div");
	host.style.cssText = "position:fixed;inset:0;background:#fff;z-index:99999;padding:1em";
	document.body.append(host); (c.view?.el ?? c.el ?? c).nodeType ? host.append(c.view?.el ?? c.el ?? c) : null;
	c.live({ text: "this part is settled", settled: "this part is settled", guess: "and this still moving" });
	const guess = document.querySelector(".chatbox-guess");
	const g = { guess_title: guess?.title };
	c.live({ text: "" , sent: true });
	await new Promise(r => setTimeout(r, 2300));
	const sent = document.querySelector(".chatbox-live-sent"), mark = document.querySelector(".chatbox-live-mark");
	return { ...g, sent_title: sent?.title, mark: mark?.textContent, mark_opacity: mark && getComputedStyle(mark).opacity, text_opacity: sent && getComputedStyle(sent.querySelector(".chatbox-text")).opacity, bubble_opacity: sent && getComputedStyle(sent).opacity };
});
console.log(JSON.stringify(out, null, 1));
await page.screenshot({ path: shots + "/gray-labels.png" });
await browser.close();
