// check7.mjs — throwaway script, not part of the repo's real test suite.
// Live confirmation of check 7 (cross-mount double-send), now that the dev
// server is back up. Builds TWO real chat() mounts (both {keep:true}, the
// same combination push-to-talk's hidden mount and a page's own visible
// widget both use) into hidden divs on one real page, feeds the SAME text
// through both via the real entry point (Widget.submit -> deliver ->
// Session.say), and counts actual POST /api/session/say requests.
import { browser, close } from "../../../../../../../../../../Server/browser.mjs";

const BASE = "http://push-to-talk.localhost";
const PAGE_URL = BASE + "/framework/ux/Hotkeys/";

async function main(){
	const b = await browser();
	const context = await b.newContext({ viewport: { width: 1920, height: 1080 } });
	const page = await context.newPage();

	const sayRequests = [];
	page.on("request", req => {
		if (req.method() === "POST" && req.url().includes("/api/session/say")) {
			sayRequests.push(req.url());
		}
	});

	await page.goto(PAGE_URL, { waitUntil: "load" });
	await page.waitForFunction(() => !!window.app);
	await page.evaluate(() => window.app.ready);
	await page.waitForTimeout(300);

	const result = await page.evaluate(async () => {
		const mod = await import("/framework/ux/Dictate/chat.js");
		const chat = mod.default;

		const d1 = document.createElement("div");
		const d2 = document.createElement("div");
		d1.style.position = "fixed"; d1.style.top = "-999em";
		d2.style.position = "fixed"; d2.style.top = "-999em";
		document.body.appendChild(d1);
		document.body.appendChild(d2);

		const m1 = chat(d1, { keep: true });
		const m2 = chat(d2, { keep: true });

		// Give both mounts a moment to attach/ensure their session before sending.
		await new Promise(r => setTimeout(r, 300));

		const text = "check-7 probe " + Date.now();

		// Fire both as if two separate mics heard the SAME utterance at the same time.
		const p1 = m1.panel.submit(text, "voice");
		const p2 = m2.panel.submit(text, "voice");
		await Promise.allSettled([p1, p2]);
		await new Promise(r => setTimeout(r, 500));

		return { text, sent: true };
	});

	await page.waitForTimeout(300);

	console.log("JSON_RESULT " + JSON.stringify({
		text: result.text,
		say_request_count: sayRequests.length,
		say_requests: sayRequests,
	}));

	await context.close();
	await close();
}

main().catch(e => { console.error("CHECK7 SCRIPT CRASHED:", e); process.exit(1); });
