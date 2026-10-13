// node proof.mjs <base>  — presses New session on desktop drawer and 400px sheet; shoots mic-open indicator.
import { browser as launch, close } from "file:///C:/Code/lew42/monorepo/Server/browser.mjs";
const base = process.argv[2], out = "C:/Code/lew42/worktrees/dictate-indicator/public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-session/shots/";
const b = await launch();
const res = {};
async function surface(name, w, h, open){
  const ctx = await b.newContext({ viewport: { width: w, height: h }, permissions: ["microphone"] });
  const p = await ctx.newPage(); await p.addInitScript(() => sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "v-proof-fake", file: "/framework/ai/proof-fake.jsonl" }))); const errs = [];
  p.on("pageerror", e => errs.push(String(e))); p.on("requestfailed", r => /.(js|css)$/.test(r.url()) && errs.push("req " + r.url()));
  await p.goto(base + "/framework/", { waitUntil: "networkidle" });
  await open(p);
  await p.waitForTimeout(800);
  const mi = await p.evaluate(async () => {
    const M = (await import("/framework/ux/Dictate/MicIndicator.js")).default;
    M.set_open(true); M.set_level(0.6);   // the exact setter Dictate.set_state/on_level call (fake mic may not reach Whisper)
    await new Promise(r => setTimeout(r, 200));
    return [...document.querySelectorAll(".ux-dictate-mic-indicator")].map(e => ({ cls: e.className, shown: getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0 }));
  });
  const btns = await p.evaluate(() => [...document.querySelectorAll(".ux-dictate-chat-new-session")].map(e => e.textContent));
  await p.screenshot({ path: `${out}${name}-${w}.png` });
  if (btns.length){
    const cur = () => p.evaluate(async () => { const c = (await import("/framework/ux/Dictate/chat.js")).default; return { session: c.current(), shows_line: !!globalThis.$dictate_widget.el.innerText.includes("proof line before"), url: location.pathname + location.search }; });
    await p.evaluate(() => globalThis.$dictate_widget.say({ chat: { at: new Date().toISOString(), from: { kind: "owner" }, text: "proof line before New session" } }));
    await p.waitForTimeout(300);
    const before = await cur();
    await p.evaluate(() => document.querySelector(".ux-dictate-chat-new-session").click());
    await p.waitForTimeout(800);
    res[name + "-" + w + "-press"] = { before, after: await cur() };
  }
  res[name + "-" + w] = { mi, btns, errs };
  await ctx.close();
}
await surface("sheet", 400, 800, async p => { await p.click(".drawer-rail-ai"); await p.waitForSelector(".drawer-rail-sheet .ux-dictate-widget, .drawer .ux-dictate-widget", { timeout: 10000, state: "attached" }); });
await surface("collapsed", 400, 800, async p => {});   // dot on the collapsed ✦ button
await surface("drawer", 1200, 800, async p => { await p.click(".drawer-menu"); await p.waitForSelector(".drawer-rail-sheet .ux-dictate-widget, .drawer .ux-dictate-widget", { timeout: 10000, state: "attached" }); });
await surface("closed-menu", 1200, 800, async p => {});
console.log(JSON.stringify(res, null, 1));
await close();
