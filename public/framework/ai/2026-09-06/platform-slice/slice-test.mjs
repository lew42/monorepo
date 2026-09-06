// slice-test.mjs — the four nouns, in a real browser, asserted not eyeballed.
// Assumes the harness is running: PORT=8097 API_PORT=8201 npm run dev
//
// 1. anonymous opens the topic world  -> the like button renders, disabled
// 2. carol signs in, opens it, clicks -> the count goes up, "mine" is set
// 3. reload                           -> the count is still there (a D1 row)
// 4. a page INSIDE the topic          -> its own independent count
// 5. sign out                         -> the count still renders, button off
import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:8201";
const TOPIC = "/imagine/platform/topic/";
const INSIDE = "/imagine/platform/topic/space/general/";
const OUT = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));

const fails = [];
const check = (label, ok, got) => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${got === undefined ? "" : `  (${got})`}`);
    if (!ok) fails.push(label);
};

const browser = await chromium.launch();

// The columns host keeps every ancestor column on screen, so a page INSIDE the
// topic shows the topic's button too — `which` picks first (the topic's) or
// last (the deepest open column's).
async function likeButton(page, which = "first") {
    await page.waitForFunction(
        () => [...document.querySelectorAll(".platform-like")].every(b => !/…/.test(b.textContent)) &&
              document.querySelectorAll(".platform-like").length > 0,
        null, { timeout: 8000 });
    const b = page.locator(".platform-like")[which]();
    return { text: (await b.textContent()).trim(), disabled: await b.isDisabled() };
}

// 1 — anonymous
const anon = await browser.newContext();
let page = await anon.newPage();
await page.goto(BASE + TOPIC, { waitUntil: "networkidle" });
let b = await likeButton(page);
check("anonymous: the like button renders", /[♥♡]/.test(b.text), b.text);
check("anonymous: it is disabled", b.disabled);
const anonCount = Number(b.text.replace(/\D/g, ""));

// 2 — carol signs in and likes
const carol = await browser.newContext();
page = await carol.newPage();
await page.goto(`${BASE}/api/dev/login?as=carol&to=${encodeURIComponent(TOPIC)}`, { waitUntil: "networkidle" });
check("carol: landed on the topic after the dev login", page.url().endsWith(TOPIC), page.url());
b = await likeButton(page);
const before = Number(b.text.replace(/\D/g, ""));
check("carol: the button is enabled when signed in", !b.disabled, b.text);

await page.locator(".platform-like").first().click();
await page.waitForFunction(
    (n) => { const el = document.querySelector(".platform-like"); return el && Number(el.textContent.replace(/\D/g, "")) === n; },
    before + 1, { timeout: 8000 });
b = await likeButton(page);
check("carol: the count went up by one", Number(b.text.replace(/\D/g, "")) === before + 1, b.text);
check("carol: the heart is filled (mine)", b.text.includes("\u2665"), b.text);
await page.screenshot({ path: path.join(OUT, "slice-topic-liked.png"), fullPage: false });

// 3 — reload: the row is real
await page.reload({ waitUntil: "networkidle" });
b = await likeButton(page);
check("carol: the like survived a reload (a D1 row, not a store())", b.text.includes("\u2665") && Number(b.text.replace(/\D/g, "")) === before + 1, b.text);

// 4 — a page inside the topic has its OWN count, keyed on its own url
await page.goto(BASE + INSIDE, { waitUntil: "networkidle" });
const topicBtn = await likeButton(page, "first");
let insideBtn = await likeButton(page, "last");
check("inside: the topic's button and the inside page's are both on screen",
    topicBtn.text !== insideBtn.text, `${topicBtn.text} vs ${insideBtn.text}`);
check("inside: the inside page starts at its own count, not the topic's",
    Number(insideBtn.text.replace(/\D/g, "")) === 0, insideBtn.text);

await page.locator(".platform-like").last().click();
await page.waitForFunction(
    () => /♥/.test([...document.querySelectorAll(".platform-like")].at(-1).textContent),
    null, { timeout: 8000 });
insideBtn = await likeButton(page, "last");
check("inside: liking it moves its count and not the topic's",
    insideBtn.text.includes("♥ 1") && (await likeButton(page, "first")).text === topicBtn.text,
    `${(await likeButton(page, "first")).text} vs ${insideBtn.text}`);
await page.screenshot({ path: path.join(OUT, "slice-inside.png"), fullPage: false });

// 5 — anonymous sees carol's like
page = await anon.newPage();
await page.goto(BASE + TOPIC, { waitUntil: "networkidle" });
b = await likeButton(page);
check("anonymous: sees the signed-in user's like", Number(b.text.replace(/\D/g, "")) === anonCount + 1, b.text);
check("anonymous: still cannot click", b.disabled);

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join("; ")}` : "\nall passed");
process.exit(fails.length ? 1 : 0);
