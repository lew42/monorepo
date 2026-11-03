// node ChatList.test.mjs [base-url] — headless: ChatList draws a session's real chat list (session.messages), one bubble per
// message, and redraws live when the file grows, including a card's icon/title/content (ask3-cards-by-id). Needs the global
// playwright and the dev server. fixture/session.jsonl is a small example session; the original is never touched.
import { browser as get_browser } from "../../../../../Server/Browser.mjs";
import { copyFileSync, appendFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? process.env.SITE_URL ?? "http://monorepo.localhost";
const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = here + "fixture/session.jsonl", live = `live-list-${process.pid}.jsonl`;
let pass = 0, fail = 0;
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

copyFileSync(fixture, here + "fixture/" + live);
const before = readFileSync(here + "fixture/" + live, "utf8");
const browser = await get_browser(), page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
const errors = []; page.on("pageerror", e => errors.push(String(e)));
const src = `/framework/ext/Chat/list/fixture/${live}`;

try {
	await page.goto(`${base}/framework/ext/Chat/list/?src=${src}`);
	await page.waitForSelector(".chatlist-msg", { timeout: 15000 });

	// A note (a plain Message, no card fields yet, already in the fixture) upgraded into a card by appending content to it,
	// through the same {content:{add}} shape an agent would use (finding 1): the list redraws it live, not only on reload.
	const note = `.chatlist-msg[data-id='m-1793600428185']`;
	check("the note exists with no content lines yet", await page.$(`${note} .chatlist-content`) === null);
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-1793600428185": { icon: "task", title: "Check the fix" } } }) + "\n");
	await page.waitForSelector(`${note} .chatlist-title, ${note} strong`, { timeout: 8000 }).catch(() => {});
	await page.waitForFunction(sel => document.querySelector(sel)?.textContent.includes("Check the fix"), note, { timeout: 8000 });
	check("upgrading it with a title/icon redraws it live", true);
	appendFileSync(here + "fixture/" + live, JSON.stringify({ messages: { "m-1793600428185": { content: { add: { title: "Confirm on a real phone" } } } } }) + "\n");
	await page.waitForFunction(sel => document.querySelector(sel + " .chatlist-content-line")?.textContent === "Confirm on a real phone", note, { timeout: 8000 });
	check("content appended to it draws as a line below it, live — not only after a reload (finding 1)", true);
	check("the icon is drawn, inline with the title", await page.$(`${note} .chatlist-head .chatlist-icon`) !== null);

	check("the fixture copy was only ever appended to", readFileSync(here + "fixture/" + live, "utf8").startsWith(before));
	check("no page errors", errors.length === 0, errors);
} finally {
	rmSync(here + "fixture/" + live, { force: true });
	await page.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
