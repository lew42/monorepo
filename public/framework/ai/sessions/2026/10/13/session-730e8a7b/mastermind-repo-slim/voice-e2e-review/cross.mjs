// node cross.mjs <session>... — the same session on the phone sheet (400) and the desktop drawer (1200): do they show the same bubbles? No mic (permission denied).
import fs from "node:fs";
import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const OUT = "C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/8d2cdcd2-c42a-452a-a348-5af50c8fc52d/scratch/cross-";
const b = await browser();
const files = ["framework/ux/Dictate/chat.js", "framework/ext/drawer/rail.js", "framework/ext/drawer/rail.css"];
const res = {};
for (const id of process.argv.slice(2)){
	for (const [name, opts, open, root] of [["phone", { viewport: { width: 400, height: 800 }, isMobile: true, hasTouch: true }, p => p.tap(".drawer-rail-ai"), ".drawer-rail-sheet.on"], ["desk", { viewport: { width: 1200, height: 800 } }, p => p.click(".drawer-menu"), ".drawer"]]){
		const ctx = await b.newContext(opts);
		if (process.env.OVERLAY) await ctx.route(u => files.some(f => new URL(u).pathname === "/" + f), r => { const f = files.find(f => new URL(r.request().url()).pathname === "/" + f); r.fulfill({ status: 200, contentType: f.endsWith(".css") ? "text/css" : "text/javascript", body: fs.readFileSync(process.env.OVERLAY + "/public/" + f) }); });
		const p = await ctx.newPage();
		await p.addInitScript(v => sessionStorage.setItem("lew42-voice-session", v), JSON.stringify({ session: id, file: `/framework/ai/${id}.jsonl` }));
		await p.goto("http://monorepo.localhost/framework/", { waitUntil: "load" }); await p.waitForTimeout(2000);
		await open(p); await p.waitForTimeout(5000);
		res[id + " " + name] = await p.evaluate(root => [...document.querySelector(root).querySelectorAll(".chatbox-you, .chatbox-reply")].map(e => e.textContent.replace(/\s+/g, " ").trim()), root);
		await p.screenshot({ path: OUT + id + "-" + name + ".png" }); await ctx.close();
	}
	const a = res[id + " phone"].join("\n"), d = res[id + " desk"].join("\n");
	console.log(id, "phone", res[id + " phone"].length, "desk", res[id + " desk"].length, a === d ? "SAME TEXT" : "DIFFERENT");
	if (a !== d) console.log("PHONE:\n" + a + "\nDESK:\n" + d);
}
await close();
