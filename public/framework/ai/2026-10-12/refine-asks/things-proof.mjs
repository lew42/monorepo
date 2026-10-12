/* node things-proof.mjs [origin] — headless: render a VoicePrompt with spoken words, check ThingsStage turns names into links, shoot 4 widths. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../..");
const ORIGIN = process.argv[2] || "http://monorepo.localhost";
const { browser } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser({}), ctx = await b.newContext({ viewport: { width: 1200, height: 900 } }), page = await ctx.newPage(), errs = [];
page.on("pageerror", e => errs.push(e.message));
// serve this checkout's stage files to the live site (a worktree has no session data)
for (const f of fs.readdirSync(path.join(REPO, "public/framework/ext/Refine/stages")).filter(n => /\.(js|css|json)$/.test(n)))
	await page.route("**/framework/ext/Refine/stages/" + f, route => route.fulfill({ path: path.join(REPO, "public/framework/ext/Refine/stages", f), contentType: f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : "application/json" }));
await page.goto(`${ORIGIN}/framework/ai/`, { waitUntil: "load" });
const out = await page.evaluate(async () => {
	const { default: VoicePrompt } = await import("/framework/ext/Refine/stages/VoicePrompt.js");
	const { default: ThingsStage } = await import("/framework/ext/Refine/stages/ThingsStage.js");
	await ThingsStage.loading;
	const raw = "so where is Dictate. the page should show a flag when it is unclear and the Page class needs a Tree. I think the push-to-talk button, or design tool, matters.";
	const p = new VoicePrompt("voice-proof", { raw }), v = new VoicePrompt.View({ prompt: p });
	const box = document.createElement("div"); box.id = "things-proof"; box.style.cssText = "position:fixed;inset:0;overflow:auto;background:Canvas;color:CanvasText;z-index:99999;padding:1em";
	box.append(v.el); document.body.append(box);
	const p2 = new VoicePrompt("voice-proof2", { raw, clean: ["So where is Dictate.", "The page should show a flag.", "The Page class needs a Tree."], cards: [{ title: "Dictate", items: ["where it is"], cites: [1], clarity: 0.9, tags: ["dictate"] }, { title: "Page flag", items: ["show a flag"], cites: [2, 3], clarity: 0.4, tags: [] }] });
	box.append(new VoicePrompt.View({ prompt: p2 }).el);
	const bars = box.querySelectorAll(".voice-stage[data-stage=cards] .voice-bar").length;
	return { bars, names: ThingsStage.find(raw).map(t => t.name), links: [...box.querySelectorAll(".voice-stage[data-stage=things] a")].map(a => a.getAttribute("href")), hidden: box.querySelector(".voice-stage[data-stage=things]").hidden, none: ThingsStage.find("the page should show a tree of cards").map(t => t.name) };
});
console.log(JSON.stringify(out));
for (const w of [400, 1200, 1920, 3440]){
	await page.setViewportSize({ width: w, height: 900 });
	const over = await page.$eval("#things-proof", e => e.scrollWidth > e.clientWidth);
	console.log("width", w, "overflow:", over);
	await page.screenshot({ path: path.join(HERE, `things-proof-${w}.png`) });
}
await page.setViewportSize({ width: 1200, height: 900 }); await page.locator(".voice-stage[data-stage=cards]").last().screenshot({ path: path.join(HERE, "cards-meters.png") });
console.log("errors:", errs);
await b.close();
