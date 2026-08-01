/* Drives new/0 in a real, visible Chromium so you can watch the load/navigate
 * sequence happen, with the page's own console mirrored into this terminal.
 *
 *   node public/framework/core/new/0/drive.mjs              # paced, hands-off
 *   node public/framework/core/new/0/drive.mjs --step       # press Enter per step
 *   node public/framework/core/new/0/drive.mjs --tour=layouts
 *   node public/framework/core/new/0/drive.mjs --headless --close
 *
 * Tours: basics · layouts · smoke · reload · all (default).
 *
 * The framework groups synchronous work with console.groupCollapsed, which
 * devtools indents for free. Here it's reconstructed from the group events —
 * see the console handler below.
 *
 * The browser stays open at the end unless you pass --close; the last step
 * hands the keyboard to you.
 */
import { spawn, execSync } from "node:child_process";
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* Playwright is deliberately NOT a dependency of this repo — three tiny deps is
 * a feature, and nobody should have to download a browser to run the dev server.
 * It's a global tool, so resolve it from the global root rather than importing
 * a bare specifier (which only ever looks in node_modules).
 *
 *   npm i -g playwright && npx playwright install chromium
 */
function load_playwright(){
	try { return createRequire(import.meta.url)("playwright"); } catch {}

	try {
		const root = execSync("npm root -g", { encoding: "utf8" }).trim();
		return createRequire(import.meta.url)(path.join(root, "playwright"));
	} catch {
		console.error("\nPlaywright not found. It's a global tool here, on purpose:\n"
			+ "\n    npm i -g playwright && npx playwright install chromium\n");
		process.exit(1);
	}
}

const { chromium } = load_playwright();

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8100;
const origin = `http://localhost:${PORT}`;

const args = process.argv.slice(2);
const flag = name => args.some(a => a === `--${name}`);
const value = name => args.find(a => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const step_mode = flag("step");
const stay = !flag("close");
const pace = Number(value("pace") ?? 2200);

// ── terminal paint ────────────────────────────────────────────────────────
const c = {
	reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m",
	app: "\x1b[35m", page: "\x1b[36m", router: "\x1b[33m",
	rule: "\x1b[1m\x1b[97m", note: "\x1b[32m", warn: "\x1b[31m",
};

const say = (...parts) => console.log(...parts);

// Colour by who logged it — the framework names itself first on every line
// (`app.`, `page{`, `router.`), which is the only convention this relies on.
//
// new/0 logs plain strings, but shared code doesn't: framework/dev/Socket uses
// %c styling, and Playwright hands that over as the raw format string plus its
// css arguments. Decoding it properly needs an await, which this handler can't
// afford (see the console listener), so strip it textually instead.
function paint(text){
	if (text.includes("%c"))
		text = text.replaceAll("%c", "").replace(/\s*(?:[a-z-]+:\s*[^;]+;?\s*)+$/i, "");

	const head = text.trim();
	if (head.startsWith("──")) return c.rule + text + c.reset;
	if (head.startsWith("router.")) return c.router + text + c.reset;
	if (head.startsWith("page{") || head.startsWith("new page{")) return c.page + text + c.reset;
	if (head.startsWith("app.")) return c.app + text + c.reset;
	return c.dim + text + c.reset;
}

// ── server ────────────────────────────────────────────────────────────────
async function up(){
	try { return (await fetch(origin, { signal: AbortSignal.timeout(800) })).ok; }
	catch { return false; }
}

async function serve(){
	if (await up()) return say(`${c.note}✓ reusing the server already on ${origin}${c.reset}`), null;

	const child = spawn(process.execPath, [path.join(here, "server.js")], {
		env: { ...process.env, PORT }, stdio: "ignore",
	});

	for (let i = 0; i < 40; i++){
		if (await up()) return say(`${c.note}✓ started server.js (pid ${child.pid}) on ${origin}${c.reset}`), child;
		await new Promise(r => setTimeout(r, 250));
	}

	throw new Error(`server never came up on ${origin}`);
}

function stop(child){
	if (!child) return;
	// A plain child.kill() can leave the tree alive on Windows, and an orphaned
	// dev server here busy-loops on its dead console handle and pins a core.
	if (process.platform === "win32") spawn("taskkill", ["/F", "/T", "/PID", String(child.pid)], { stdio: "ignore" });
	else child.kill("SIGTERM");
}

// ── pacing ────────────────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(res => rl.question(q, res));

async function beat(){
	if (step_mode) await ask(`${c.dim}      ⏎ next${c.reset} `);
	else await new Promise(r => setTimeout(r, pace));
}

// ── what the DOM actually looks like ──────────────────────────────────────
// The point of the whole design: which .page nodes exist, how they nest, and
// whose content is hidden. Printed after every step.
const shape = page => page.evaluate(() => {
	const lines = [];

	for (const el of document.querySelectorAll(".page")){
		let depth = 0;
		for (let p = el.parentElement; p; p = p.parentElement)
			if (p.classList.contains("page")) depth++;

		const content = el.querySelector(":scope > .page-content");
		const title = content?.querySelector(":scope > .page-title")?.textContent ?? "(untitled)";

		// Visibility is CSS now, not an inline style — ask the browser, not the
		// style attribute, or every page reads as visible.
		const off = getComputedStyle(el).display === "none";
		const hidden = !off && content && getComputedStyle(content).display === "none";
		const mark = off ? "×" : hidden ? "·" : "▸";

		lines.push(`${"    ".repeat(depth)}${mark} ${title}`
			+ (off ? "   not in the chain" : hidden ? "   content hidden" : ""));
	}

	return lines;
});

// Which links are lit, and against which url. The two have to agree — if they
// don't, the marking ran at the wrong moment or against the wrong root.
const links = page => page.evaluate(() => {
	const named = sel => [...document.querySelectorAll(sel)].map(el => el.textContent).join(", ") || "(none)";
	return `url ${location.pathname}   .active [${named("a.active")}]   .in-path [${named("a.in-path")}]`;
});

// an on-screen caption, so the browser window explains itself too
const caption = (page, text) => page.evaluate(t => {
	let el = document.getElementById("drive-caption");

	if (!el){
		el = document.createElement("div");
		el.id = "drive-caption";
		el.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:9999;"
			+ "background:#0f172a;color:#e2e8f0;font:600 14px/1.5 ui-monospace,monospace;"
			+ "padding:10px 16px;border-top:2px solid #38bdf8";
		document.body.append(el);
	}

	el.textContent = t;
}, text).catch(() => {});

// ── the script ────────────────────────────────────────────────────────────
// Two tours. --tour=basics | layouts | all (default).
const tour = value("tour") ?? "all";

const basics = [
	{
		title: "Cold load of /",
		note: "App.render → load_root → new Router → router.load('/'). One page in the chain.",
		run: async page => page.goto(`${origin}/`, { waitUntil: "networkidle" }),
	},
	{
		title: "Click 'Nesting' in the sidebar",
		note: "shared=1 (root stays). Root's content hides, Nesting appends INSIDE root.",
		run: async page => {
			await page.click(".nav-link:has-text('Nesting')");
			await page.waitForTimeout(300);

			// previews() is async — it must still land inside the page. Building
			// its container after the await put it in body > div.app instead.
			return page.evaluate(() => {
				const el = document.querySelector(".page-previews");
				if (!el) return ".page-previews — not rendered";
				return `.page-previews parent = ${el.parentElement.className || el.parentElement.tagName}`
					+ `  ·  inside .page-content: ${!!el.closest(".page-content")}`;
			});
		},
	},
	{
		title: "Click the 'Deep' preview card",
		note: "shared=2. Nothing above Deep is touched — no deactivate at all.",
		run: async page => page.click(".page-preview:has-text('Deep')"),
	},
	{
		title: "Scroll Deep to the bottom",
		note: "Sets up the next step. .main is chrome — the scroll lives there, not on the page.",
		run: async page => page.evaluate(() => {
			const main = document.querySelector(".main");
			main.scrollTo(0, 99999);
			return `.main.scrollTop = ${main.scrollTop}`;
		}),
	},
	{
		title: "Back up to /nesting/ via the sidebar",
		note: "Deep deactivates; Nesting's SAME DOM node reappears — never rebuilt.",
		run: async page => {
			await page.click(".nav-link:has-text('Nesting')");
			return page.evaluate(() => `.main.scrollTop = ${document.querySelector(".main").scrollTop}`);
		},
	},
	{
		title: "Forward to /nesting/deep/ again",
		note: "Same DOM node, so nothing re-renders. Whether the SCROLL came back is the question.",
		run: async page => {
			await page.click(".page-preview:has-text('Deep')");
			return page.evaluate(() => `.main.scrollTop = ${document.querySelector(".main").scrollTop}`);
		},
	},
	{
		title: "Sideways to /dynamic/ (a sibling subtree)",
		note: "shared=1. Deep and Nesting both deactivate, deepest first.",
		run: async page => page.click(".nav-link:has-text('Dynamic')"),
	},
	{
		title: "Click 'Item 42' — a url with no file on disk",
		note: "child('42') misses the filesystem, falls through to route('42').",
		run: async page => page.click(".page-preview:has-text('Item 42')"),
	},
	{
		title: "Browser Back",
		note: "popstate → the same router.load(). No special case for history.",
		run: async page => page.goBack(),
	},
	{
		title: "Hard reload of /nesting/deep/",
		note: "Cold walk from the root. Identical chain — a click and a reload converge.",
		run: async page => page.goto(`${origin}/nesting/deep/`, { waitUntil: "networkidle" }),
	},
	{
		title: "A url that resolves to nothing",
		note: "find() returns null, go() never pushes — a broken link can't corrupt history.",
		run: async page => page.evaluate(() => window.app.router.go("/nope/zzz/")).catch(() => {}),
	},
];

// How many .page nodes sit side by side rather than nested — i.e. real columns.
const columns = page => page.evaluate(() => {
	const rows = [];
	for (const el of document.querySelectorAll(".page.columns")){
		const title = el.querySelector(":scope > .page-content > .page-title")?.textContent ?? "?";
		rows.push(`${title} → ${el.querySelectorAll(":scope > .pages > .page").length} column child`);
	}
	return rows.join("  ·  ") || "no .columns page on screen";
});

const layouts = [
	{
		title: "LAYOUT 1 — replace: /layouts/replace/deeper/",
		note: "The default. Four pages mounted, every ancestor's content hidden, one visible.",
		run: async page => page.goto(`${origin}/layouts/replace/deeper/`, { waitUntil: "networkidle" }),
	},
	{
		title: "LAYOUT 2 — columns, where the child opted in",
		note: "column/ and opt-in/ both override show(), so nothing hides — three real columns.",
		run: async page => {
			await page.goto(`${origin}/layouts/column/opt-in/deep/`, { waitUntil: "networkidle" });
			return columns(page);
		},
	},
	{
		title: "LAYOUT 2b — the same layout, where the child did NOT",
		note: "plain/ is an ordinary page.js, so Deep nests inside it. This is the open problem.",
		run: async page => {
			await page.goto(`${origin}/layouts/column/plain/deep/`, { waitUntil: "networkidle" });
			return columns(page);
		},
	},
	{
		title: "LAYOUT 3 — tabs: open tab one and type into it",
		note: "Same activation, aimed at a $pages the page relocated, with keep: true.",
		run: async page => {
			await page.goto(`${origin}/layouts/tabs/one/`, { waitUntil: "networkidle" });
			await page.fill(".tab-panel input.probe", "state I typed on tab one");
			return page.evaluate(() => `typed: "${document.querySelector(".tab-panel input.probe").value}"`);
		},
	},
	{
		title: "LAYOUT 3b — switch to tab two, then back to one",
		note: "Panel one is display:none, still mounted. The text has to survive.",
		run: async page => {
			await page.click(".tab:has-text('two')");
			await page.waitForTimeout(300);
			await page.click(".tab:has-text('one')");
			await page.waitForTimeout(300);
			return page.evaluate(() => {
				const panels = [...document.querySelectorAll(".tab-panel > .page")];
				const visible = panels.find(el => getComputedStyle(el).display !== "none");
				const title = visible?.querySelector(".page-title")?.textContent;
				return `${panels.length} panels mounted   ·   visible tab "${title}"`
					+ `   ·   its input says "${visible?.querySelector("input.probe")?.value}"`;
			});
		},
	},
	{
		title: "LAYOUT 4 — takeover: the page asks the App directly",
		note: "activate(){ this.app.takeover(this) } — sidebar and $main go away entirely.",
		run: async page => {
			await page.goto(`${origin}/layouts/takeover/full/`, { waitUntil: "networkidle" });
			return page.evaluate(() => {
				const vis = sel => !!document.querySelector(sel)?.getClientRects().length;
				return `sidebar visible: ${vis(".sidebar")}   ·   takeover page: ${vis(".takeover-page")}`;
			});
		},
	},
	{
		title: "LAYOUT 4b — leave it via the link inside",
		note: "deactivate() → app.restore(). The chrome underneath was only CSS-hidden.",
		run: async page => {
			await page.click(".takeover-page a.page-link");
			await page.waitForTimeout(300);
			return page.evaluate(() => {
				const vis = sel => !!document.querySelector(sel)?.getClientRects().length;
				return `sidebar visible: ${vis(".sidebar")}   ·   takeover page: ${vis(".takeover-page")}`;
			});
		},
	},
];

// Every url in the sidebar, cold-loaded. A page.js that throws resolves to null
// and 404s silently, so "did it render a title" is the only real check.
const smoke = [
	"/", "/app/", "/page/", "/router/", "/loading/", "/nesting/", "/nesting/deep/",
	"/dynamic/", "/dynamic/42/", "/layouts/", "/layouts/replace/", "/layouts/replace/deeper/",
	"/layouts/column/", "/layouts/column/opt-in/", "/layouts/column/opt-in/deep/",
	"/layouts/column/plain/", "/layouts/column/plain/deep/",
	"/layouts/tabs/", "/layouts/tabs/one/", "/layouts/tabs/two/", "/layouts/tabs/three/",
	"/layouts/takeover/", "/layouts/takeover/full/",
	"/state/", "/areas/", "/beyond/", "/loading/resolve/",
	"/inline/", "/inline/alpha/", "/inline/beta/", "/inline/full/",
	"/inline/tabs/", "/inline/tabs/red/", "/inline/tabs/blue/",
].map(url => ({
	title: `smoke ${url}`,
	note: "cold load — did it resolve and render a title?",
	run: async page => {
		await page.goto(`${origin}${url}`, { waitUntil: "networkidle" });
		return page.evaluate(u => {
			const titles = [...document.querySelectorAll(".page-title")].map(el => el.textContent);
			return titles.length ? `OK  ${titles.join(" › ")}` : `FAIL  ${u} rendered no page at all`;
		}, url);
	},
}));

// chokidar → DevSocket → socket.rpc("reload") → location.reload(). Touches a real
// watched file and puts it back, so it proves the whole chain rather than mocking
// any part of it.
const reload = [{
	title: "Live reload — change a watched file",
	note: "The dev server watches public/. Editing anything under it reloads every open page.",
	run: async page => {
		await page.goto(`${origin}/`, { waitUntil: "networkidle" });
		await page.waitForTimeout(500);

		const connected = await page.evaluate(() => !!window.app?.socket?.connected);
		await page.evaluate(() => { window.__survived = true; });

		const css = path.join(here, "site", "styles.css");
		const original = fs.readFileSync(css, "utf8");
		let reloaded = false;

		try {
			fs.writeFileSync(css, original + "\n/* live-reload probe — removed immediately */\n");
			await page.waitForFunction(() => window.__survived === undefined, null, { timeout: 10000 });
			reloaded = true;
		} catch {
			reloaded = false;
		} finally {
			fs.writeFileSync(css, original);          // always put it back
		}

		return `socket connected: ${connected}   ·   page reloaded on file change: ${reloaded}`;
	},
}];

const steps = tour === "basics" ? basics
	: tour === "layouts" ? layouts
	: tour === "smoke" ? smoke
	: tour === "reload" ? reload
	: basics.concat(layouts);

// ── run ───────────────────────────────────────────────────────────────────
const server = await serve();

const browser = await chromium.launch({
	headless: flag("headless"),
	args: ["--window-size=1500,1000", "--window-position=40,40"],
});

const page = await browser.newPage({ viewport: null });

// A file save mid-tour would reload the page out from under the script. The
// client Socket honours this flag; the reload tour deliberately doesn't set it.
if (tour !== "reload") await page.addInitScript(() => { window.$BLOCKRELOAD = true; });

/* Devtools indents console groups for you; a terminal does not. Playwright
 * reports the group boundaries as message types, so the nesting is rebuilt from
 * those — a collapsed group in the browser is an indented block here.
 *
 * The handler MUST stay synchronous. Awaiting anything (msg.args()[0].jsonValue(),
 * say) lets two messages interleave and the depth counter drifts, which is why
 * the framework logs plain strings with no %c formatting to decode.
 */
let depth = 0;

page.on("console", msg => {
	const type = msg.type();

	if (type === "endGroup") return void (depth = Math.max(0, depth - 1));

	say(paint("     " + "  ".repeat(depth) + msg.text()));

	if (type === "startGroup" || type === "startGroupCollapsed") depth++;
});

page.on("pageerror", e => say(`${c.warn}     ✖ ${e.message}${c.reset}`));

say(`\n${c.bold}new/0 — ${steps.length} steps${c.reset}  ${c.dim}${step_mode ? "press Enter to advance" : `${pace}ms per step — pass --step to go one at a time`}${c.reset}`);

for (const [i, step] of steps.entries()){
	say(`\n${c.rule}${"═".repeat(74)}${c.reset}`);
	say(`${c.bold}${String(i + 1).padStart(2)}. ${step.title}${c.reset}`);
	say(`${c.dim}    ${step.note}${c.reset}\n`);

	await caption(page, `${i + 1}/${steps.length}  ${step.title} — ${step.note}`);
	const measured = await step.run(page);
	await page.waitForTimeout(400);

	if (typeof measured === "string") say(`\n${c.note}    measured  ${measured}${c.reset}`);

	const dom = await shape(page).catch(() => []);
	if (dom.length){
		say(`\n${c.dim}    DOM  (▸ visible · hidden)${c.reset}`);
		dom.forEach(l => say(`${c.dim}    ${l}${c.reset}`));
	}

	say(`${c.dim}    LINKS  ${await links(page).catch(() => "?")}${c.reset}`);

	await caption(page, `${i + 1}/${steps.length}  ${step.title} — ${step.note}`);
	await beat();
}

say(`\n${c.rule}${"═".repeat(74)}${c.reset}`);
say(`${c.note}Done.${c.reset} ${c.dim}window.app, window.app.router, window.app.root are all in the console.${c.reset}`);

if (stay){
	await caption(page, "The driver is finished — the browser is yours. Poke at window.app in the console.");

	// Launched from a terminal: Enter closes. Launched detached (no TTY, so
	// there's no Enter to wait for): hold the browser open until killed.
	if (process.stdin.isTTY) await ask(`${c.bold}\n⏎ to close the browser and stop the server  ${c.reset}`);
	else {
		say(`${c.bold}\nBrowser is open and will stay open. Kill this process to close it.${c.reset}`);
		await new Promise(() => {});
	}
}

rl.close();
await browser.close();
stop(server);
