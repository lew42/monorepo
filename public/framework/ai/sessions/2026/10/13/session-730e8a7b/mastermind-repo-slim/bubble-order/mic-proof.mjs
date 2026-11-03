/* node mic-proof.mjs <origin> — one saved voice session (public/ai/v-proof-bubble.jsonl, owner + assistant lines), three surfaces:
   the 400 px ✦ phone sheet, the desktop drawer chat, and the Refine page must all show the owner's words. Exit 0 pass. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const origin = process.argv[2], id = "v-proof-bubble", file = `/ai/${id}.jsonl`, WORDS = "Please refine this sentence about the weather";
const b = await browser(); const out = {};
async function open(name, vp, url, act){
	const ctx = await b.newContext({ viewport: vp, hasTouch: !!vp.touch, isMobile: !!vp.touch }); const p = await ctx.newPage();
	p.on("pageerror", e => console.log(name, "PAGEERROR", e.message));
	await p.addInitScript(([k, v]) => sessionStorage.setItem(k, v), ["lew42-voice-session", JSON.stringify({ session: id, file })]);
	await p.goto(origin + url, { waitUntil: "load" }); await p.waitForTimeout(2500);
	await act?.(p); await p.waitForTimeout(5000);
	out[name] = await p.evaluate(([w, SEL]) => (document.querySelector(SEL) ?? document.body).innerText.includes(w), [WORDS, name === "refine-page" ? ".refine-demo" : "body"]);
	await p.screenshot({ path: path.join(HERE, `mic-${name}.png`) }); await ctx.close();
}
await open("phone-sheet", { width: 400, height: 800, touch: true }, "/framework/", p => p.tap(".drawer-rail-ai"));
await open("desktop-chat", { width: 1400, height: 900 }, "/framework/", async p => { await p.getByText("☰", { exact: true }).first().click({ timeout: 4000 }).catch(() => {}); await p.locator(".drawer-tab", { hasText: /^AI/ }).first().click({ timeout: 5000 }).catch(e => console.log("no AI tab:", e.message.slice(0, 80))); });
await open("refine-page", { width: 1400, height: 900 }, "/framework/ext/Refine/");
console.log(JSON.stringify(out)); const ok = Object.values(out).every(Boolean);
console.log(ok ? "PASS: the same words on all three surfaces" : "FAIL"); await close(); process.exit(ok ? 0 : 1);
