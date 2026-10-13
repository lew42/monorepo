/* node shoot.mjs — headless screenshots of every voice/chat surface into ux/Dictate/surfaces/. Reads only; never sends a sentence. */
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const OUT = REPO + "/public/framework/ux/Dictate/surfaces/", base = "http://monorepo.localhost";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser();
const only = process.argv[2];
const shots = [
	["drawer-ai-1920", 1920, "/framework/", async p => { await p.click(".drawer-menu"); await p.waitForSelector(".chatbox-compose-input"); }],
	["drawer-switch-session-1920", 1920, "/framework/", async p => { await p.click(".drawer-menu"); await p.click("text=Switch session"); }],
	["drawer-dictation-1920", 1920, "/framework/", async p => { await p.click(".drawer-menu"); await p.click(".drawer-tab:has-text('Dictation')"); await p.waitForTimeout(1500); }],
	["sheet-400", 400, "/framework/", async p => { await p.click(".drawer-rail-ai"); await p.waitForSelector(".drawer-rail-sheet"); }],
	["card-chat-1920", 1920, "/framework/ai/2026/10/13/every-voice-and-chat-surface-on-one-perm/", async p => { await p.click("text=Activity"); }],
	["session-page-1920", 1920, "/framework/ai/sessions/0467707f-3701-496d-8890-65a875cd1c8f/", async () => {}],
	["refine-1920", 1920, "/framework/ext/Refine/", async () => {}],
	["floating-mic-1920", 1920, "/framework/audio/push-to-talk/", async p => { await p.evaluate(() => document.querySelector(".ux-dictate-ptt-mic")?.classList.add("showing")); }],
	["devshell-1920", 1920, "/framework/", async p => { await p.keyboard.press("Control+Backslash"); await p.waitForTimeout(1500); }],
	["live-card-1920", 1920, "/framework/ai/", async () => {}],
];
for (const [name, w, url, act] of shots){
	if (only && !name.includes(only)) continue;
	const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 800 : 1000 }, hasTouch: w < 800, isMobile: w < 800, permissions: ["microphone"] });
	const p = await ctx.newPage();
	try { await p.goto(base + url, { waitUntil: "load" }); await p.waitForTimeout(1800); await act(p); await p.waitForTimeout(1200);
		await p.screenshot({ path: OUT + name + ".png" }); console.log("ok  ", name); }
	catch (e){ console.log("FAIL", name, String(e.message).split("\n")[0]); }
	await ctx.close();
}
await close();
