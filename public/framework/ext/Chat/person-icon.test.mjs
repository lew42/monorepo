// node person-icon.test.mjs [base-url] — headless: proves the owner's 👤 avatar (roles.js:60-69,
// who_label()) says, in its own tooltip, that it is not a button and never touches dictation/voice
// mode (owner item 27, 2026-11-01: "the owner thinks it turns voice mode off").
import Browser from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://views-fix.localhost";
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

const browser = await Browser.browser();
const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));

try {
	await page.goto(`${base}/framework/ext/Chat/`, { waitUntil: "networkidle" });
	const result = await page.evaluate(async () => {
		const { who_label } = await import("/framework/ext/Chat/roles.js");
		const mine = who_label("owner"), other = who_label("fast");
		return { mine_title: mine.el.title, mine_aria: mine.el.getAttribute("aria-label"), other_title: other.el.title };
	});
	console.log(JSON.stringify(result));

	check("the owner's avatar says it is not a button", result.mine_title.includes("Not a button"), result.mine_title);
	check("the owner's avatar says it never turns voice mode off", /never turns dictation or voice mode off/.test(result.mine_title), result.mine_title);
	check("aria-label matches the title", result.mine_aria === result.mine_title);
	check("another role's tooltip is untouched (just the name)", result.other_title === "Fast assistant", result.other_title);
	check("no page errors", errors.length === 0, errors);
} finally {
	await Browser.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
