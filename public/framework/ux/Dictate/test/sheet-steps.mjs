// The phone sheet, step by step: open ✦ from the bottom strip (a real click), shot; then drag the sheet's top edge up
// 40 px at a time, a shot at every step, release at the top (the snap to full), shot. Headless only; Servex is stubbed
// (a seeded conversation, so the chat well has bubbles to show). Doc: ext/drawer/doc/sheet.md
//   node public/framework/ux/Dictate/test/sheet-steps.mjs <base-url> <shots dir> [width=400] [height=800]
import fs from "fs";

const [base = "http://monorepo.localhost", dir = "shots", W = "400", H = "800"] = process.argv.slice(2);
import Browser from "../../../../../Server/Browser.mjs";
fs.mkdirSync(dir, { recursive: true });
const browser = await Browser.browser({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
setTimeout(() => { console.log("FAIL killed after 180 s"); process.exit(2); }, 180000).unref();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, permissions: ["microphone"], hasTouch: true });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("pageerror", String(e).slice(0, 200)));

// A seeded conversation: owner lines and replies, long enough to scroll under the head and the foot.
const t0 = Date.now() - 600000, at = i => new Date(t0 + i * 20000).toISOString();
const said = [
	"Let's look at the phone sheet. I want one layout that just grows as I drag it up.",
	"(listening)",
	"The chat well goes edge to edge, with padding on the left and right only, and the bubbles scroll under the header and the footer.",
	"Got it: header and footer stay put, the well scrolls between them, no top or bottom padding.",
	"And the page behind the sheet should stay visible until it snaps open at the top.",
	"Yes. Below about 90% it stays a sheet over the page; past that it snaps to the full page.",
	"Good. Also, the little grey down arrow, I don't know what it does.",
	"It steps the sheet down one size. I'll either make that obvious or remove it.",
	"Reconnect has to work after Servex restarts, and every failure should go in a log I can open.",
];
const lines = said.map((text, i) => JSON.stringify({ chat: { at: at(i), session: "stub-session", from: i % 2 ? { kind: "assistant", id: "fast" } : { kind: "owner" }, via: i % 2 ? "text" : "voice", text } })).join("\n") + "\n";
const json = (r, body) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
// the live stream goes to the real Servex: an unknown session id just stays open and quiet
await page.route(/\/api\/session\/(new|resume|say|nav|floor|quiet|react|pause|select)/, r => json(r, { ok: true, session: "stub-session", file: "/stub-session.jsonl", at: new Date().toISOString() }));
await page.route(/\/api\/sessions\?/, r => json(r, { ok: true, sessions: [] }));
await page.route(/\/stub-session\.jsonl/, r => r.fulfill({ status: 200, contentType: "text/plain", body: lines }));
await page.addInitScript(() => {
	sessionStorage.setItem("lew42-voice-session", JSON.stringify({ session: "stub-session", file: "/stub-session.jsonl" }));
	try { localStorage.removeItem("lew42-drawer-rail-sheet-h-2"); } catch {}
});

await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-ai", { timeout: 20000 });
await page.waitForTimeout(1500);
let n = 0;
const shot = async label => {
	const f = `${dir}/sheet-${String(n++).padStart(3, "0")}.png`;
	await page.screenshot({ path: f });
	const top = await page.evaluate(() => Math.round(document.querySelector(".drawer-rail-sheet.on")?.getBoundingClientRect().top ?? -1));
	console.log(f, label, "sheet top", top);
};
await page.click(".drawer-rail-ai");
await page.waitForSelector(".drawer-rail-sheet.on", { timeout: 20000 });
await page.waitForTimeout(1500);
await shot("first click");

// the top edge: the grip if it shows, else the sheet's own top
const edge = async () => page.evaluate(() => {
	const s = document.querySelector(".drawer-rail-sheet.on");
	const g = [...s.querySelectorAll(".grip, [class*=grip]")].find(e => e.getBoundingClientRect().height);
	const r = (g ?? s).getBoundingClientRect();
	return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 2, 8)) };
});
let { x, y } = await edge();
await page.mouse.move(x, y);
await page.mouse.down();
while (y > 20){
	y = Math.max(y - 40, 4);
	await page.mouse.move(x, y, { steps: 4 });
	await page.waitForTimeout(250);
	await shot(`drag to y=${y}`);
}
await page.mouse.up();
await page.waitForTimeout(900);
await shot("released: snapped");

// and back down: from the default height, the grip down 40 px at a time to the compact strip
await page.evaluate(() => import("/framework/ext/drawer/Sheet.js").then(m => m.default.of().to("split")));
await page.waitForTimeout(900);
({ x, y } = await edge());
await shot("back to the default height");
await page.mouse.move(x, y);
await page.mouse.down();
while (y < +H - 100){
	y = Math.min(y + 40, +H - 80);
	await page.mouse.move(x, y, { steps: 4 });
	await page.waitForTimeout(250);
	await shot(`drag down to y=${y}`);
}
await page.mouse.up();
await page.waitForTimeout(900);
await shot("released: the compact strip");
await Browser.close();
process.exit(0);
