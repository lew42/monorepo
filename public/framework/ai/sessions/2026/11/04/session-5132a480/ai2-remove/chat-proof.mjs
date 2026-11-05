import { browser } from "../../../../../../../../../Server/Browser.mjs";
const base = process.argv[2];
const b = await browser();
const p = await b.newPage();
const errs = [];
p.on("pageerror", e => errs.push("pageerror " + e.message));
p.on("response", r => r.status() >= 400 && /\.js/.test(r.url()) && errs.push(r.status() + " " + r.url()));
await p.goto(base + "/framework/dev/DevBar/?chat=open", { waitUntil: "load" });
await p.waitForTimeout(3000);
const r = await p.evaluate(async () => {
	const chat = await import("/framework/dev/DevBar/chat.js");
	const live = await import("/framework/ai/rail/live.js");
	return { chat_exports: Object.keys(chat), AgentTalk: typeof live.AgentTalk, panel: [...document.querySelectorAll("[class*=chat]")].length, chat_text: !!document.querySelector("[class*=chat]") };
});
console.log(JSON.stringify(r), "| js/page errors:", JSON.stringify(errs));
await b.close();
