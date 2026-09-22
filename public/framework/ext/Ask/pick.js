import { View, div, span } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "ask.css");

/**
 * Crosshair mode. The cursor changes, whatever you hover gets outlined, a click
 * picks it, Escape cancels.
 *
 *     const about = await pick();      // null if you pressed Escape
 *
 * What it resolves to is the element's **context** — everything a Claude turn
 * needs to answer a question about that element without looking anything up:
 * which page it is on, what the element is, and the text of the `readme.md` and
 * `doc/decisions.md` that sit beside that page. `describe()` below turns that
 * object into the plain sentences a turn reads.
 *
 * `app` is the running App. It is read at GESTURE time, never at import time —
 * during boot `window.app` does not exist yet, so pass it if you have it
 * (`this.app` in a page, the arg the dev rail is handed) and it falls back only
 * because a click always happens long after boot.
 */
export function pick(opts = {}){
	return new Picker(opts).start();
}

export class Picker {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	start(){
		return new Promise(resolve => {
			this.resolve = resolve;

			/* ⚠ `capture: false` — a View built while a captor is set appends itself to
			   whatever is rendering. The overlay belongs to the document, not to the
			   page that happened to call pick(). */
			this.$ui = new View({ capture: false }).ac("ask-pick-ui").append(() => {
				this.$box = div.c("ask-pick-box");
				div.c("ask-pick-hint", () => {
					this.$what = span.c("ask-pick-what", "hover anything");
					span.c("ask-pick-say", "click to ask about it · Esc to cancel");
				});
			}).append_to(document.body);

			document.documentElement.classList.add("ask-picking");
			this.listen(true);
		});
	}

	/* Capture phase on all four, so a link or a button never gets the click and the
	   outline keeps up with a page that scrolls under the pointer. */
	listen(on){
		this.handlers ??= {
			pointermove: e => this.hover(e.target),
			click: e => { e.preventDefault(); e.stopPropagation(); this.stop(this.target); },
			keydown: e => { if (e.key === "Escape"){ e.preventDefault(); this.stop(null); } },
			scroll: () => this.frame(),
		};

		for (const [type, fn] of Object.entries(this.handlers))
			on ? document.addEventListener(type, fn, true) : document.removeEventListener(type, fn, true);
	}

	hover(target){
		if (!target?.closest || target === document.documentElement || target.closest(this.skip)) return;
		this.target = target;
		this.frame();
	}

	// An inline style because the numbers are measured, not designed: this box IS the
	// hovered element's rectangle.
	frame(){
		const box = this.target?.getBoundingClientRect();
		if (!box) return;

		this.$box.style({ top: box.top + "px", left: box.left + "px",
			width: box.width + "px", height: box.height + "px", opacity: 1 });
		this.$what.text(where(this.target));
	}

	stop(el){
		this.listen(false);
		document.documentElement.classList.remove("ask-picking");
		this.$ui.el.remove();
		this.resolve(el ? context(el, this) : null);
	}
}

// On the prototype, not a class field, so an arg to `pick()` can replace it: the
// picker's own chrome and the chat panel you launched from are never what you meant.
Picker.prototype.skip = ".ask-pick-ui, .chat";

/** `div#main.card.flow` — how you would write the element as a CSS selector. */
export function where(el){
	return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "")
		+ [...el.classList].map(c => "." + c).join("");
}

/**
 * `div.card` — the same thing short enough to fit in a chip.
 *
 * ⚠ An element with no id and no class has nothing to name it by, and the chip then
 *   read just `h4` — a word that tells the reader nothing about WHICH h4 they picked
 *   (measured 2026-09-17). When there is no name, borrow the element's own first words.
 */
export function label(el){
	const named = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "")
		+ (el.classList[0] ? "." + el.classList[0] : "");
	if (el.id || el.classList[0]) return named;

	const text = (el.textContent ?? "").trim().replace(/\s+/g, " ");
	return text ? named + " “" + text.slice(0, 28) + (text.length > 28 ? "…" : "") + "”" : named;
}

/**
 * Everything worth telling a turn about one element, gathered from the page it is
 * on. Every fetch is optional — a page with no readme simply has no `readme`
 * field, and nothing here throws.
 *
 *     { page, selector, tag, classes, html,
 *       readme:    { url, text },   // the nearest readme.md at or above the page
 *       decisions: { url, text },   // doc/decisions.md beside that readme
 *       module:    { url, text } }  // the framework module that owns its class prefix
 */
export async function context(el, { app } = {}){
	const { url: page, dir } = page_at(el, app);

	const about = {
		page,
		selector: where(el),
		label: label(el),
		tag: el.tagName.toLowerCase(),
		classes: [...el.classList].join(" "),
		html: el.outerHTML.slice(0, 600),
	};

	const [readme, module] = await Promise.all([nearest_readme(dir ?? page), module_url(el)]);

	const [decisions, mod] = await Promise.all([
		readme ? text(readme.url + "doc/decisions.md") : null,
		module && module !== readme?.url ? text(module + "readme.md") : null,
	]);

	// Where the explanation lives — the chip shows THIS, not the synthetic child page
	// a Doc renders its content into.
	about.home = readme?.url ?? page;

	if (readme) about.readme = { url: readme.url + "readme.md", text: readme.text };
	if (decisions) about.decisions = { url: readme.url + "doc/decisions.md", text: decisions };
	if (mod) about.module = { url: module + "readme.md", text: mod };

	return about;
}

/* A page's own url is not always where its readme is: `/framework/styles/system/studies/color/` has no
   readme, `/imagine/design/` does. So climb the path, nearest rung first, and stop at
   the first readme. Three rungs is enough for every shape on this site, and the readout
   names the url it found, so a surprising answer is visible rather than silent.
   ⚠ Start from the page's own DIRECTORY, never from its url — `page_at()` below. */
async function nearest_readme(page){
	const urls = [page];

	while (urls.length < 4){
		const up = urls.at(-1).replace(/[^/]+\/$/, "");
		if (up === "/" || up === urls.at(-1)) break;
		urls.push(up);
	}

	const found = await Promise.all(urls.map(url => text(url + "readme.md")));
	const hit = found.findIndex(Boolean);

	return hit < 0 ? null : { url: urls[hit], text: found[hit] };
}

/**
 * The plain sentences a turn opens with. Say what the element is, which page it is
 * on, and where the decisions behind it are written down — then quote those files,
 * so the answer can cite them instead of guessing.
 */
export function describe(about){
	if (!about?.tag) return null;

	const files = [about.readme, about.decisions, about.module].filter(Boolean);
	const home = about.home;
	const lines = [
		"You are being asked about ONE element on a page of this website.",
		`The element is \`${about.selector}\`, and it is on the page ${about.page} of this site.`
			+ (home && home !== about.page ? ` That page belongs to ${home}.` : ""),
		"Its markup begins:\n\n```html\n" + about.html + "\n```",
	];

	if (about.selection) lines.push(`The owner also had this text selected: "${String(about.selection).slice(0, 300)}"`);

	lines.push(files.length
		? `What this thing is, and the design decisions behind it, are written down in ${files.map(f => f.url).join(" and ")} — quoted in full below. Answer from them, and name the file you are citing.`
		: `There is no readme beside ${about.page}, so say that, and answer from the markup alone.`);

	files.forEach(f => lines.push(`--- ${f.url} ---\n${f.text}`));
	lines.push("The question about that element follows.");

	return lines.join("\n\n");
}

/* TWO answers, and they are not the same answer.

   `url` — the page the element is sitting on, the address in the address bar. The
   `.page` element carries no address (core stamps it `.page` and `.page--<name>` and
   nothing more), so the ancestor is matched back to the Page OBJECT that rendered it,
   whose `url` is the real one. Falls back to the route when the element is outside any
   page.

   `dir` — the DIRECTORY that page's own files live in, which is where a readme would
   be. Core renders a Doc's content into synthetic child pages: pick anything on
   /framework/ext/Ask/ and the nearest `.page` is `/framework/ext/Ask/overview/intro/`,
   a page that owns no files and never was a folder. Hunting a readme up from there
   asked the server about two directories that have never existed — two red 404s in the
   console on every single pick (measured 2026-09-17). A Page knows its own module
   (`meta.url`); the nearest ancestor that has one is the honest answer. */
function page_at(el, app){
	const host = el.closest?.(".page");
	const running = app ?? window.app;
	const found = host && running?.root && find_page(running.root, host);
	const url = found?.url ?? running?.router?.active?.url ?? location.pathname;

	let owner = found;
	while (owner && !owner.meta) owner = owner.parent;

	return {
		url: url.endsWith("/") ? url : url.replace(/[^/]*$/, ""),
		dir: owner?.meta ? new URL(".", owner.meta.url).pathname : null,
	};
}

function find_page(page, target){
	if (page?.view?.el === target) return page;

	for (const child of page?.children?.values() ?? []){
		const hit = child && find_page(child, target);
		if (hit) return hit;
	}

	return null;
}

/* The framework module that owns the element's class prefix, read out of the same
   file the `new-css-class` skill checks: `demo-card` -> `ext/demo`. Worth its lines
   because the component's readme is often the one that explains the element, while
   the page's readme only explains the page it landed on. Longest prefix wins. */
async function module_url(el){
	const map = await scopes();
	let best = null;

	for (const cls of el.classList)
		for (const [prefix, path] of map)
			if (cls.startsWith(prefix) && (!best || prefix.length > best[0].length)) best = [prefix, path];

	return best && `/framework/${best[1]}/`;
}

let cached;

async function scopes(){
	if (cached) return cached;

	const src = await text("/framework/styles/css-scopes.txt", 20000) ?? "";
	const map = new Map();

	src.split("\n").forEach(line => {
		const [prefix, path] = line.trim().split(/\s+/);
		// A trailing dash is what makes a line a namespace; anything else on the line is prose.
		if (prefix?.endsWith("-") && /^[\w/.-]+$/.test(path ?? "")) map.set(prefix, path.replace(/\/+$/, ""));
	});

	return cached = map;
}

/* ⚠ The SPA fallback answers every miss with index.html, so a missing file arrives
   as 200 with an HTML content type — the content type IS the 404. */
async function text(url, max = 4000){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;

	const body = await res.text();
	return body.length > max ? body.slice(0, max) + "\n… (truncated)" : body;
}

export default pick;
