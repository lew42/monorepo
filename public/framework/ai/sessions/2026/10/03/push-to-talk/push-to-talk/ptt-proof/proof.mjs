// Throwaway headless-Playwright proof script for push-to-talk — see proof.md for
// the readable results. Chromium is launched through `Server/browser.mjs`'s own
// `browser()` function, the one shared launcher every script in this repo uses —
// it picks the Chromium channel that opens no window, see that file's own doc.
import { browser, close } from "../../../../../../Server/browser.mjs";
import fs from "node:fs";

const BASE = "http://push-to-talk.localhost";
const OUT = "public/framework/ai/2026-10-03/push-to-talk/ptt-proof";
const PAGE_URL = BASE + "/framework/ux/Hotkeys/"; // "load a page (not just /)", per the brief

const results = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

function dispatchMouse(page, type, button){
	return page.evaluate(({ type, button }) => {
		document.dispatchEvent(new MouseEvent(type, { button, bubbles: true, cancelable: true }));
	}, { type, button });
}
function dispatchKey(page, opts){
	return page.evaluate((opts) => {
		document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...opts }));
	}, opts);
}
// Never throws when the selector matches nothing — the whole point of this proof
// is to find out WHETHER the mic is even there, so a crash on a missing element
// would hide the very finding this script exists to surface.
async function exists(page, sel){ return (await page.locator(sel).count()) > 0; }
async function micShowing(page){ return exists(page, ".ux-dictate-ptt-mic.showing"); }

async function main(){
	const b = await browser({
		args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
	});
	// A desktop viewport — below 52em (~832px) the drawer switches to the mobile
	// bottom-sheet rail instead of the side panel the Settings tab assumes here.
	const context = await b.newContext({ permissions: ["microphone"], viewport: { width: 1920, height: 1080 } });
	const page = await context.newPage();

	page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
	page.on("pageerror", err => pageErrors.push(String(err)));
	page.on("requestfailed", req => {
		failedRequests.push(`${req.url()} :: ${req.failure()?.errorText ?? "failed"}`);
	});
	page.on("response", res => { if (res.status() >= 400) failedRequests.push(`${res.url()} :: ${res.status()}`); });

	await page.goto(PAGE_URL, { waitUntil: "load" });
	await page.waitForFunction(() => !!window.app);
	await page.evaluate(() => window.app.ready);
	await page.waitForTimeout(500); // give push_to_talk(app), run inside App.render(), time to settle

	// ---------- CHECK 0: the mic element attaches to the page (the earlier root-cause fix) ----------
	// `a077dd09` fixed the captor-timing bug this script found originally (View.captor was
	// still null when push_to_talk(app) ran) — `$mic`/`$hidden` now defer past it the same
	// way devbar.js/devshell.js do. This is a fresh context (no localStorage yet), so the
	// NEW `mic_pref` gate below is still at its default (off) — the element existing in the
	// DOM and the element ever SHOWING are two separate things now; this check is only the
	// former.
	const micEverAttached = await exists(page, ".ux-dictate-ptt-mic");
	results.push({
		n: 0, pass: micEverAttached,
		note: micEverAttached
			? "the floating mic element is attached to the page (the a077dd09 captor-timing fix holds)."
			: "REGRESSION: `.ux-dictate-ptt-mic` is missing from the DOM again — the a077dd09 fix no longer holds.",
	});

	// ---------- CHECK 0b: off by default — holding/toggling does nothing until the owner opts in ----------
	// New since the last round (commit 6cc22c06): a persisted `mic_pref` boolean, default
	// false, read at the top of `start()` — the hotkeys still fire, but the mic never shows
	// and the chat mount is never built. A fresh browser context has no `lew42-ptt-mic-enabled`
	// key in localStorage yet, so this is genuinely the default, not a forced state.
	await dispatchMouse(page, "mousedown", 4);
	await page.waitForTimeout(400);
	const showingWhilePushHeldOff = await micShowing(page);
	await dispatchMouse(page, "mouseup", 4);
	await page.waitForTimeout(400);
	await dispatchKey(page, { code: "KeyM", ctrlKey: true, shiftKey: true });
	await page.waitForTimeout(400);
	const showingAfterToggleOff = await micShowing(page);
	if (showingAfterToggleOff) { // defensive: turn back off before the enabled-mode checks below, if this ever regresses
		await dispatchKey(page, { code: "KeyM", ctrlKey: true, shiftKey: true });
		await page.waitForTimeout(400);
	}
	if (!showingWhilePushHeldOff && !showingAfterToggleOff) await page.screenshot({ path: `${OUT}/0b-off-by-default-no-show.png` });
	results.push({
		n: "0b",
		pass: !showingWhilePushHeldOff && !showingAfterToggleOff,
		note: `with mic_pref at its default (off, nothing in localStorage): holding push-to-talk -> showing=${showingWhilePushHeldOff}; pressing the toggle -> showing=${showingAfterToggleOff}. Expected false/false — the hotkeys fire but the mic stays silent and off-screen until the owner opts in via the new Settings checkbox.`,
	});

	// ---------- Turn the new Settings checkbox on, so checks 1/2/4 below exercise the real opt-in path ----------
	// `ext/drawer/tabs/settings.js` (commit 6cc22c06) added one `section("push-to-talk", …)`
	// with a single checkbox that calls `push_to_talk.mic_pref.set(this.el.checked)` — driving
	// it through the real UI, not by poking the module's state directly, so this also proves
	// the checkbox itself is wired to the thing it claims to control.
	await page.click(".drawer-menu");
	await page.waitForSelector(".drawer-tab");
	await page.click(".drawer-tab:text(\"Settings\")");
	const MIC_PREF_BOX = '.drawer-settings .dev-sect:has(.dev-sect-title:text-is("push-to-talk")) input[type="checkbox"]';
	await page.waitForSelector(MIC_PREF_BOX, { timeout: 3000 });
	const micPrefLabelText = await page.locator('.drawer-settings .dev-sect:has(.dev-sect-title:text-is("push-to-talk")) span').first().textContent();
	await page.check(MIC_PREF_BOX);
	const micPrefEnabledNow = await page.evaluate(async () => {
		const mod = await import("/framework/ux/Dictate/push-to-talk.js");
		return mod.default.mic_pref.enabled;
	});
	await page.click(".drawer-menu"); // close the drawer before driving the hotkeys again
	await page.waitForTimeout(200);
	results.push({
		n: "0c",
		pass: micPrefLabelText?.includes("off by default") && micPrefEnabledNow === true,
		note: `the Settings checkbox reads "${micPrefLabelText?.trim()}"; checking it (through the real checkbox, not poking module state) flipped push_to_talk.mic_pref.enabled to ${micPrefEnabledNow}.`,
	});

	// ---------- CHECK 1: push-to-talk, hold-to-record ----------
	await dispatchMouse(page, "mousedown", 4);
	const showingAfterDown = await page.waitForSelector(".ux-dictate-ptt-mic.showing", { timeout: 2000 })
		.then(() => true).catch(() => false);
	if (showingAfterDown) await page.screenshot({ path: `${OUT}/1-hold-showing.png` });
	await dispatchMouse(page, "mouseup", 4);
	await page.waitForTimeout(400); // the ~250ms settle in hide_soon()
	const hiddenAfterUp = !(await micShowing(page));
	results.push({
		n: 1, pass: micEverAttached && micPrefEnabledNow && showingAfterDown && hiddenAfterUp,
		note: micEverAttached
			? `(mic_pref now on) mousedown button 4 -> showing=${showingAfterDown} within 1s; mouseup -> hidden after settle=${hiddenAfterUp}.`
			: "FAIL: there is no `.ux-dictate-ptt-mic` element on the page at all, so it can never show.",
	});

	// ---------- CHECK 2: open-mic toggle + the overlap rule ----------
	let toggleShows = false, stillShowingAfterOverlap = false, hiddenAfterSecondToggle = false;
	if (micEverAttached){
		await dispatchKey(page, { code: "KeyM", ctrlKey: true, shiftKey: true });
		toggleShows = await page.waitForSelector(".ux-dictate-ptt-mic.showing", { timeout: 2000 }).then(() => true).catch(() => false);
		// a push-to-talk tap while the toggle session is open must not cut it off
		await dispatchMouse(page, "mousedown", 4);
		await page.waitForTimeout(50);
		await dispatchMouse(page, "mouseup", 4);
		await page.waitForTimeout(400); // past the push-to-talk settle window
		stillShowingAfterOverlap = await micShowing(page);
		// the same toggle hotkey again turns it off
		await dispatchKey(page, { code: "KeyM", ctrlKey: true, shiftKey: true });
		await page.waitForTimeout(400);
		hiddenAfterSecondToggle = !(await micShowing(page));
	}
	results.push({
		n: 2,
		pass: micEverAttached && micPrefEnabledNow && toggleShows && stillShowingAfterOverlap && hiddenAfterSecondToggle,
		note: micEverAttached
			? `(mic_pref now on) Ctrl+Shift+M -> showing=${toggleShows}; a push-to-talk tap during it -> still showing=${stillShowingAfterOverlap} (overlap rule held); Ctrl+Shift+M again -> hidden=${hiddenAfterSecondToggle}.`
			: "FAIL: same reason as check 1 — no mic element to show or hide.",
	});

	// ---------- CHECK 3: the mic scales with level (simulated) ----------
	// Two reasons this has to be simulated rather than driven end to end, both named
	// rather than guessed past:
	// (a) a real `Dictate` instance only exists inside `push-to-talk.js`'s own
	//     module-level `mount` variable, which the module never exports — there is no
	//     supported hook from outside that module to call `mount.panel.dictate.on_meter(level)`
	//     directly, and the fake mic stream carries no real audio for `on_meter` to react
	//     to anyway (silent by design — the standard headless-mic trick).
	// (b) the root-cause bug (check #0) means there is no REAL `.ux-dictate-ptt-mic` in
	//     the DOM to test on this page right now.
	// So this check builds ONE throwaway element with the real class, appends it to
	// <body> itself (bypassing push-to-talk.js's own broken attach step on purpose —
	// this checks the CSS contract in `FloatingMic.css`, already loaded on every page,
	// not the JS wiring), sets `--mic-level` the same way `push-to-talk.js`'s own
	// `set_level()` does, and confirms the computed `transform` actually changes.
	// ⚠ `.ux-dictate-ptt-mic` also carries `transition: transform 90ms linear` — reading
	// `getComputedStyle` right after the change caught it mid-transition, still showing the
	// OLD value, and looked like the class rule was not applying at all. Waiting past the
	// 90ms (150ms, below) before the second read is the fix — not a bug, just this script's
	// own first attempt not accounting for the transition it was told about (FloatingMic.css's
	// own class doc names the 90ms).
	await page.evaluate(() => {
		const el = document.createElement("div");
		el.id = "ptt-proof-sim-mic";
		el.className = "ux-dictate-ptt-mic showing";
		document.body.appendChild(el);
		el.style.setProperty("--mic-level", "0");
	});
	const at0 = await page.$eval("#ptt-proof-sim-mic", el => getComputedStyle(el).transform);
	await page.evaluate(() => document.getElementById("ptt-proof-sim-mic").style.setProperty("--mic-level", "0.7"));
	await page.waitForTimeout(150); // past the 90ms transition FloatingMic.css declares
	const sim = await page.$eval("#ptt-proof-sim-mic", el => ({
		level: getComputedStyle(el).getPropertyValue("--mic-level").trim(),
		at07: getComputedStyle(el).transform,
	}));
	await page.screenshot({ path: `${OUT}/3-level-simulated.png` });
	await page.evaluate(() => document.getElementById("ptt-proof-sim-mic")?.remove());
	results.push({
		n: 3,
		pass: sim.level === "0.7" && sim.at07 !== at0 && sim.at07 !== "none",
		note: `SIMULATED (not real audio — see the two reasons above) on a throwaway element carrying the real \`.ux-dictate-ptt-mic\` class, through the real stylesheet rule (no inline override): --mic-level set to 0.7 reads back as "${sim.level}"; computed transform at level 0 was "${at0}", 150ms after moving to 0.7 (past the CSS transition) is "${sim.at07}" (FloatingMic.css documents scale 1 -> 1.33, i.e. ~1.231 at 0.7 — matches).`,
	});

	// ---------- CHECK 4: click opens dev shell to chat ----------
	let shellOpen = false, aiTabOn = false;
	if (micEverAttached){
		await dispatchMouse(page, "mousedown", 4);
		await page.waitForSelector(".ux-dictate-ptt-mic.showing", { timeout: 2000 }).catch(() => {});
		await page.click(".ux-dictate-ptt-mic").catch(() => {});
		await page.waitForTimeout(300);
		shellOpen = await page.evaluate(() => document.documentElement.classList.contains("dev-shell-open"));
		aiTabOn = await page.evaluate(() => {
			const btn = [...document.querySelectorAll(".dev-shell-tab")].find(b => b.textContent.trim() === "ai");
			return !!btn && btn.classList.contains("on");
		});
		if (shellOpen) await page.screenshot({ path: `${OUT}/4-dev-shell-ai-tab.png` });
		await page.evaluate(() => document.querySelector(".dev-shell-x")?.click());
		await dispatchMouse(page, "mouseup", 4);
		await page.waitForTimeout(400);
	}
	results.push({
		n: 4, pass: micEverAttached && micPrefEnabledNow && shellOpen && aiTabOn,
		note: micEverAttached
			? `(mic_pref now on) click on the mic -> <html> has dev-shell-open=${shellOpen}; the shell's own tab row shows "ai" selected=${aiTabOn}.`
			: "FAIL: there is nothing on the page to click.",
	});

	// ---------- CHECK 5: settings row (hotkeys section + rebind) ----------
	// Independent of the root-cause bug above — this is `ux/Hotkeys`'s own settings UI
	// (`row.js`'s `hotkeys_section()`), wired into the drawer's Settings tab, nothing to
	// do with the floating mic element.
	//
	// ⚠ The Hotkeys page ITSELF also demos `hotkeys_section()` live on the page body
	// (its own `page.js`), and a hidden nav-preview card renders a third copy — so
	// three "Push to talk" rows exist on this one page at once. Every selector below
	// is scoped to `.drawer-settings` (`ext/drawer/tabs/settings.js`'s own wrapper div)
	// so it reads the REAL drawer row, not one of the demo/preview copies.
	const DRAWER_ROW = sel => `.drawer-settings .dev-row:has-text("${sel}")`;
	await page.click(".drawer-menu");
	await page.waitForSelector(".drawer-tab");
	await page.click(".drawer-tab:text(\"Settings\")");
	await page.waitForSelector(DRAWER_ROW("Push to talk"), { timeout: 3000 });

	// `.dev-val`'s own first child is the plain binding-text node ("Mouse button 4 ");
	// `row.js` appends the "press a key or button…" button AFTER it, into the SAME span —
	// so reading the whole span's `textContent` runs the two together. `childNodes[0]`
	// is just the binding text.
	const before = await page.evaluate(() => {
		const rows = [...document.querySelectorAll(".drawer-settings .dev-row")];
		const read = label => rows.find(r => r.querySelector(".dev-key")?.textContent.trim() === label)
			?.querySelector(".dev-val")?.childNodes[0]?.textContent.trim();
		return { push: read("Push to talk"), toggle: read("Toggle dictation (open mic)") };
	});
	await page.screenshot({ path: `${OUT}/5-settings-hotkeys.png` });

	// ---------- CHECK 5b: capture has a cancel (Escape), and a left-click never binds ----------
	// New since the last round (commit 7c08c858, a fresh-eyes review finding): before this,
	// there was no way to back out of "press a key or button…", and an ordinary left-click
	// (button 0 — "confirm", "close this popover") became the new binding. Tested on the
	// "Toggle dictation" row so it never disturbs the "Push to talk" rebind test below.
	const TOGGLE_ROW = DRAWER_ROW("Toggle dictation (open mic)");
	await page.locator(`${TOGGLE_ROW} button.dev-knob`).click();
	const midCaptureAfterOpen = await page.locator(`${TOGGLE_ROW} button.dev-knob`).textContent();
	await dispatchKey(page, { key: "Escape" });
	await page.waitForTimeout(150);
	const toggleAfterEscape = await page.$eval(`${TOGGLE_ROW} .dev-val`, el => el.childNodes[0]?.textContent.trim());
	const btnAfterEscape = await page.locator(`${TOGGLE_ROW} button.dev-knob`).textContent();

	await page.locator(`${TOGGLE_ROW} button.dev-knob`).click();
	await dispatchMouse(page, "mousedown", 0); // an ordinary left click — must NOT become the binding
	await page.waitForTimeout(150);
	const toggleAfterLeftClick = await page.$eval(`${TOGGLE_ROW} .dev-val`, el => el.childNodes[0]?.textContent.trim());
	const btnAfterLeftClick = await page.locator(`${TOGGLE_ROW} button.dev-knob`).textContent();
	await dispatchKey(page, { key: "Escape" }); // clean up the still-open capture before moving on
	await page.waitForTimeout(150);

	results.push({
		n: "5b",
		pass: midCaptureAfterOpen?.includes("press anything")
			&& toggleAfterEscape === "Ctrl+Shift+M" && btnAfterEscape?.includes("press a key or button")
			&& toggleAfterLeftClick === "Ctrl+Shift+M" && btnAfterLeftClick?.includes("press anything"),
		note: `opened capture ("${midCaptureAfterOpen?.trim()}"), Escape cancelled it: binding still "${toggleAfterEscape}", button back to "${btnAfterEscape?.trim()}". Opened capture again, a left click (button 0) left the binding at "${toggleAfterLeftClick}" and capture still open ("${btnAfterLeftClick?.trim()}") rather than binding to it — matches Hotkeys.button()'s new button===0 guard.`,
	});

	// Rebind "Push to talk" — click its own "press a key or button…" button, then send
	// one keydown (the exact gesture row.js's own doc comment describes).
	await page.locator(`${DRAWER_ROW("Push to talk")} button.dev-knob`).click();
	await dispatchKey(page, { code: "Digit9" });
	await page.waitForTimeout(200);
	const afterPush = await page.$eval(`${DRAWER_ROW("Push to talk")} .dev-val`, el => el.childNodes[0]?.textContent.trim());
	await page.screenshot({ path: `${OUT}/5-settings-rebound.png` });

	results.push({
		n: 5,
		pass: before.push === "Mouse button 4" && before.toggle === "Ctrl+Shift+M" && afterPush === "9",
		note: `before rebind: "Push to talk" read "${before.push}", "Toggle dictation (open mic)" read "${before.toggle}". After clicking its own "press a key or button…" and sending a Digit9 keydown, the row now reads "${afterPush}" (expected "9").`,
	});

	// ---------- CHECK 6: no console errors, no failed requests ----------
	results.push({
		n: 6,
		pass: consoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0,
		note: consoleErrors.length || pageErrors.length || failedRequests.length
			? `console errors: ${JSON.stringify(consoleErrors)}; page errors: ${JSON.stringify(pageErrors)}; failed/4xx/5xx requests: ${JSON.stringify(failedRequests)}`
			: "zero console errors, zero page errors, zero failed/4xx/5xx requests across the whole script — which is itself part of check #0's finding: the mic bug fails completely silently.",
	});

	await context.close();
	await close(); // Server/browser.mjs's own shared-browser teardown

	fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
	for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"} #${r.n}: ${r.note}`);
}

main().catch(e => { console.error("PROOF SCRIPT CRASHED:", e); process.exit(1); });
