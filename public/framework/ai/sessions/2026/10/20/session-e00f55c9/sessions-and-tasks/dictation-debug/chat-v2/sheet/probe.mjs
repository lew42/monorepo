// The ✦ sheet with the v2 chip, headless at 400 px: node probe.mjs [base]. Shots land beside this file: 1 old chat, 2 Chat v2 on, 3 back off.
import { browser } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import { fileURLToPath } from "node:url";
const BASE = process.argv[2] || "http://chatv2-sheet.localhost";
const OUT = fileURLToPath(new URL(".", import.meta.url));
const b = await browser();
const ctx = await b.newContext({ viewport: { width: 400, height: 800 }, permissions: [] });
const page = await ctx.newPage();
const errs = []; page.on("response", r => r.status() === 404 && errs.push("404 " + r.url())); page.on("pageerror", e => errs.push(e.message)); page.on("console", m => m.type() === "error" && errs.push("console: " + m.text()));
await page.addInitScript(() => sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "v-probe", file: "/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl" })));
await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
await page.click(".drawer-rail-ai");
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + "1-v1.png" });
const chip = page.locator(".drawer-rail-sheet-v2-chip");
console.log("chip", await chip.count(), await chip.getAttribute("aria-pressed"));
await chip.click();
await page.waitForTimeout(2500);
console.log("after", await chip.getAttribute("aria-pressed"), "v2 prompts", await page.locator(".drawer-rail-sheet-v2 .chat-v2-prompt").count(),
  "thread visible", await page.locator(".drawer-rail-sheet-panel .ux-dictate-widget-thread").first().isVisible().catch(() => "none"),
  "stored", await page.evaluate(() => localStorage.getItem("lew42.sheet.chat_view")));
await page.screenshot({ path: OUT + "2-v2.png" });
await page.reload({ waitUntil: "networkidle" }); if (!(await page.locator(".drawer-rail-sheet-panel.on").count())) await page.click(".drawer-rail-ai"); await page.waitForTimeout(2500);
console.log("reload pressed", await chip.getAttribute("aria-pressed"), "v2 prompts", await page.locator(".drawer-rail-sheet-v2 .chat-v2-prompt").count());
await chip.click(); await page.waitForTimeout(500);
console.log("off: v2 box", await page.locator(".drawer-rail-sheet-v2").count(), "thread visible", await page.locator(".drawer-rail-sheet-panel .ux-dictate-widget-thread").first().isVisible().catch(() => "none"));
await page.screenshot({ path: OUT + "3-off.png" });
console.log("errors", JSON.stringify(errs.slice(0, 8)));
await b.close();
