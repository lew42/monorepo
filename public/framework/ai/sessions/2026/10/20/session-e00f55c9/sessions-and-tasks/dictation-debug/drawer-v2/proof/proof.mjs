// Desktop drawer AI tab with Chat v2 on (1920, 3440) and the ✦ sheet with v2 on (400): node proof.mjs [base]
import { browser } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL(".", import.meta.url)), BASE = process.argv[2] || "http://dictation-drawer-v2.localhost";
const b = await browser(), errs = [];
for (const [w, h] of [[1920, 1000], [3440, 1200], [400, 800]]){
  const ctx = await b.newContext({ viewport: { width: w, height: h } }), page = await ctx.newPage();
  page.on("pageerror", e => errs.push(w + " " + e.message));
  await page.addInitScript(() => { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "v-probe", file: "/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl" })); localStorage.setItem("lew42.sheet.chat_view", "v2"); });
  await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
  if (w < 1000) await page.click(".drawer-rail-ai");
  await page.waitForTimeout(2500);
  console.log(w, "chip", await page.locator(".drawer-rail-sheet-v2-chip").count(), "prompts", await page.locator(".chat-v2-prompt").count());
  await page.screenshot({ path: OUT + `v2-${w}.png` });
  await ctx.close();
}
console.log("errors", JSON.stringify(errs)); await b.close();
