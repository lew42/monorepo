// node ink-dim.test.mjs [base-url] [shots-dir] — headless: proves views-fix item 1 (a clearly dimmer guess).
// Measures the computed colour of a guess (.chatbox-guess / .chat-v3-guess) and a sent line
// (.chatbox-text / .chat-v3-text.is-moving) in V1 and V3, light and dark, at 400x860, plus a shot each.
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://views-fix.localhost";
const shots = process.argv[3] ?? "C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/views-fix/shots";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const browser = await Browser.browser();

async function measure(view, url, inject, scheme){
	const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
	await page.emulateMedia({ colorScheme: scheme });
	await page.goto(url, { waitUntil: "networkidle" });
	await page.waitForSelector(inject.wait, { timeout: 15000 });
	const data = await page.evaluate(inject.fn);
	await page.screenshot({ path: `${shots}/${view}-${scheme}.png` });
	await page.close();
	return data;
}

const v1_inject = {
	wait: ".ux-dictate-widget-composer .chatbox-compose-input",
	fn: () => {
		const vars = getComputedStyle(document.documentElement);
		const host = document.querySelector(".ux-dictate-widget-bubbles") ?? document.body;
		const you = document.createElement("div"); you.className = "chatbox chatbox-you";
		const text = document.createElement("div"); text.className = "chatbox-text"; text.textContent = "This part is already sent. ";
		const guess = document.createElement("span"); guess.className = "chatbox-guess"; guess.textContent = "this part is still a guess";
		text.appendChild(guess); you.appendChild(text); host.appendChild(you);
		return {
			draft_var: vars.getPropertyValue("--draft-ink").trim(),
			final_var: vars.getPropertyValue("--final-ink").trim(),
			guess_color: getComputedStyle(guess).color,
			sent_color: getComputedStyle(text).color,
		};
	},
};

const v3_inject = {
	wait: ".chat-v3",
	fn: () => {
		const vars = getComputedStyle(document.documentElement);
		const host = document.querySelector(".chat-v3") ?? document.body;
		const card = document.createElement("div"); card.className = "chat-v3-card";
		const text = document.createElement("div"); text.className = "chat-v3-text is-moving"; text.textContent = "This part is already sent. ";
		const guess = document.createElement("span"); guess.className = "chat-v3-guess"; guess.textContent = "this part is still a guess";
		text.appendChild(guess); card.appendChild(text); host.appendChild(card);
		return {
			draft_var: vars.getPropertyValue("--draft-ink").trim(),
			final_var: vars.getPropertyValue("--final-ink").trim(),
			guess_color: getComputedStyle(guess).color,
			sent_color: getComputedStyle(text).color,
		};
	},
};

try {
	const results = {
		"V1-light": await measure("V1", `${base}/framework/ux/Dictate/`, v1_inject, "light"),
		"V1-dark": await measure("V1", `${base}/framework/ux/Dictate/`, v1_inject, "dark"),
		"V3-light": await measure("V3", `${base}/framework/ext/Chat/v3/`, v3_inject, "light"),
		"V3-dark": await measure("V3", `${base}/framework/ext/Chat/v3/`, v3_inject, "dark"),
	};
	for (const [k, r] of Object.entries(results)) console.log(k, JSON.stringify(r));

	for (const [k, r] of Object.entries(results)){
		check(`${k}: --draft-ink is the 45% mix`, r.draft_var.includes("45%"), r.draft_var);
		check(`${k}: guess colour differs from sent colour`, r.guess_color !== r.sent_color, r);
	}
} finally {
	await Browser.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
