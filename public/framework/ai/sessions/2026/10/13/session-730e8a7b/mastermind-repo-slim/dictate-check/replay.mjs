/* node replay.mjs <session id> — headless: replay the owner's saved voice session file into the sheet and print the bubble order next to the file's order. */
import path from "node:path"; import fs from "node:fs"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const id = process.argv[2] || "v-jag436k";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const file = `/ai/${id}.jsonl`;
const want = fs.readFileSync(REPO + "/public" + file, "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.chat).map(l => `${l.chat.from.kind}${l.chat.from.id ? ":" + l.chat.from.id : ""}: ${l.chat.text.replace(/\s+/g, " ").slice(0, 50)}`);
const b = await browser(); const ctx = await b.newContext({ permissions: ["microphone"], viewport: { width: 400, height: 800 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
await p.addInitScript(() => {});
await p.goto("http://127.0.0.1:3104/framework/", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.evaluate(([k, v]) => sessionStorage.setItem(k, v), ["lew42-voice-session", JSON.stringify({ session: id, file })]);
await p.tap(".drawer-rail-ai"); await p.waitForTimeout(6000);
console.log("storage:", await p.evaluate(() => sessionStorage.getItem("lew42-voice-session")));
const got = await p.evaluate(() => [...document.querySelectorAll(".drawer-rail-sheet [class*=chatbox-you], .drawer-rail-sheet [class*=chatbox-reply]")].map(e => e.className.split(" ").filter(c => /you|reply/.test(c))[0] + ": " + e.textContent.replace(/\s+/g, " ").trim().slice(0, 50)));
console.log("FILE order:\n" + want.join("\n") + "\n\nUI order:\n" + got.join("\n"));
await p.screenshot({ path: path.join(HERE, "replay-400.png") }); await close();
