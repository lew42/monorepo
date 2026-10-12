import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser(); const page = await (await b.newContext({ viewport: { width: +(process.env.W || 1400), height: 900 } })).newPage();
await page.goto(process.argv[2], { waitUntil: "load" }); await page.waitForTimeout(4000);
console.log(await page.evaluate(() => { const q = s => document.querySelectorAll(s).length; return { you: q(".chatbox-you"), reply: q(".chatbox-reply"), voicePrompts: q(".voice-prompt"), stages: q(".voice-stage:not([hidden])"), rawText: [...document.querySelectorAll(".voice-stage[data-stage=raw]")].length, entryTexts: [...document.querySelectorAll(".chatbox-you .chatbox-text")].map(e => e.textContent.slice(0, 80)) }; }));
await close();
