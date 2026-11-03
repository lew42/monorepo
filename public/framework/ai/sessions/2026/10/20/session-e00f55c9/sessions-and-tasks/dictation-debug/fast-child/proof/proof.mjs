import { browser } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL(".", import.meta.url)), BASE = "http://monorepo.localhost";
const b = await browser();
for (const w of [1920]){
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } }), page = await ctx.newPage();
  await page.addInitScript(() => { sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "v-uw6epgr", file: "/framework/ai/sessions/2026/10/25/v-uw6epgr/session.jsonl" })); localStorage.setItem("lew42.sheet.chat_view", "v2"); });
  await page.goto(BASE + "/framework/ux/Dictate/", { waitUntil: "networkidle" });
  if (await page.locator(".drawer-rail-ai").isVisible()) await page.click(".drawer-rail-ai");
  await page.waitForTimeout(2000);
  const chip = page.locator(".drawer-rail-sheet-v2-chip");
  if (await chip.count() && (await chip.getAttribute("aria-pressed")) !== "true") { await chip.click(); await page.waitForTimeout(2500); }
  const prompts = page.locator(".chat-v2-prompt");
  console.log(w, "prompts", await prompts.count(), JSON.stringify(await prompts.allInnerTexts()).slice(0, 400));
  await page.screenshot({ path: OUT + `v2-${w}.png` });
  await ctx.close();
}
await b.close();
