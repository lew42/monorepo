/* node ui-proof.mjs [origin] — headless proof of the two browser halves (no Servex needed, its answers are stubbed at the network):
 *   1. Cards stage: a "To board" button per card; pressing it POSTs /api/voice/card and the button becomes a link to the board card.
 *   2. Dictate status line: an SSE message from /api/whisper/stream saying Whisper is restarting shows on the status line at once.
 * Origin defaults to the worktree's private site; pass http://monorepo.localhost after the merge. */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../..");
const ORIGIN = process.argv[2] || "http://localhost:51720";
const { browser, close } = await import(pathToFileURL(REPO + "/Server/browser.mjs").href);
const b = await browser();
const results = [], check = (name, ok, detail = "") => { results.push(ok); console.log((ok ? "PASS " : "FAIL ") + name + (detail ? " - " + detail : "")); };
try {
	const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
	const errs = [];

	{ // 1 — cards stage
		const page = await ctx.newPage();
		page.on("pageerror", e => errs.push(e.message));
		let posted = null;
		await page.route("**/api/voice/card", async route => {
			if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });
			posted = JSON.parse(route.request().postData());
			await route.fulfill({ contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, id: "x", fresh: true, card: "2026/10/12/demo", card_url: "/framework/ai/2026/10/12/demo/" }) });
		});
		await page.goto(ORIGIN + "/framework/ext/Refine/", { waitUntil: "load" });
		await page.evaluate(async () => {
			const { default: VoiceFlow } = await import("/framework/ext/Refine/stages/VoiceFlow.js");
			const flow = new VoiceFlow(); flow.session = "11111111-2222-3333-4444-555555555555";
			document.body.prepend(flow.view.el);
			flow.read([{ content: { add: { id: "voice-tdemo1", type: "voice-prompt", raw: "a b", raw_final: true, clean: ["A thing.", "Another thing."], clean_final: true, cards: [{ title: "First card", items: ["do x", "do y"], cites: [1, 2], tags: [] }, { title: "Second card", items: ["do z"], cites: [2] }] } } }]);
			window.__flow = flow;
		});
		await page.waitForSelector(".voice-board", { timeout: 5000 });
		const n = await page.$$eval("button.voice-board", e => e.length);
		check("1. one To board button per card", n === 2, n + " buttons");
		await page.click("button.voice-board");
		await page.waitForSelector("a.voice-board", { timeout: 5000 });
		const href = await page.$eval("a.voice-board", e => e.getAttribute("href"));
		check("1. press posts the card and the button becomes a link", href === "/framework/ai/2026/10/12/demo/" && posted?.session === "11111111-2222-3333-4444-555555555555" && posted?.index === 0 && posted?.title === "First card" && posted?.prompt === "tdemo1", JSON.stringify(posted) + " -> " + href);
		check("1. the other card still has its button", (await page.$$eval("button.voice-board", e => e.length)) === 1);
		await page.screenshot({ path: path.join(process.env.OUT || HERE, "cards-to-board.png") });
	}

	{ // 2 — whisper status stream
		const page = await ctx.newPage();
		page.on("pageerror", e => errs.push(e.message));
		const w = { ok: true, status: "restarting", port: 8187, crashes: 1, last_crash: { at: new Date().toISOString(), code: 1 }, said: "" };
		await page.route("**/api/whisper/stream", route => route.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "access-control-allow-origin": "*", "cache-control": "no-cache" }, body: "data: " + JSON.stringify(w) + "\n\n" }));
		await page.goto(ORIGIN + "/framework/ux/Dictate/", { waitUntil: "load" });
		await page.waitForFunction(() => /Servex is restarting it/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
		const said = await page.evaluate(() => (document.body.innerText.match(/[^\n]*Servex is restarting it[^\n]*/) ?? [""])[0]);
		check("2. a pushed 'restarting' shows on the status line without polling", /Servex is restarting it/.test(said), said.slice(0, 140));
		await page.screenshot({ path: path.join(process.env.OUT || HERE, "whisper-stream.png") });
	}
	check("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
} finally { await close(); }
console.log(results.every(Boolean) ? "\nALL PASS" : "\nSOME FAILED");
process.exit(results.every(Boolean) ? 0 : 1);
