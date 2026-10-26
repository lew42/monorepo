import { View } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import item from "../../ui/item/item.js";
import { css } from "../../ui/parts.js";
import refs from "./maps/refs.js";
import people from "./maps/people.js";
import AgentUrl from "../../ai/AISession/AgentUrl.js";

// CSS specificity dance and dark mention styling: doc/Mention-notes.md
css(`@layer theme {
	.item.page-surface-dark { background: var(--dark-bg); color: var(--dark-ink); }

	/* INLINE, IN A SENTENCE, A DARK ONE MUST SIT AT THE LINE'S OWN HEIGHT (the owner, live
	   on the Now card, 2026-10-03: "#Page" taller than the line it's in"). \`.item\`'s own
	   padding and its 1.3em icon frame (ui/item/item.js) are sized for a tappable row, and
	   a PLAIN inline mention is already that tall — it just has no visible edge, so nobody
	   notices. \`.page-surface-dark\`'s fill paints that same box solid, and a solid box
	   taller than its line reads as a mistake. Tightened here, for mentions only — a tree
	   row or any other \`.item\` keeps its own tappable room. */
	.mention.inline.page-surface-dark { padding-block: 0; }
	.mention.inline.page-surface-dark:not(.mention-class) .item-icon { width: 1em; font-size: 0.85em; }

	/* THE THREE KINDS (the owner, 2026-10-06; plan.md in ext/Mention/doc/architecture.md):
	   each kind has its own named colour token and its own icon frame, so a reader sees
	   what sort of thing it is before reading it. A theme changes a token, never a rule. */
	:root {
		--mention-path:  light-dark(#0f766e, #5eead4);   /* a place: teal */
		--mention-actor: light-dark(#6d28d9, #c4b5fd);   /* a someone: violet */
		--mention-class: var(--prime-ink);               /* a class: the accent, on the dark card */
	}
	.mention { max-width: 100%; }
	.mention-path  { color: var(--mention-path); }
	.mention-path .item-name { white-space: normal; overflow-wrap: anywhere; }
	.mention-actor { color: var(--mention-actor); }
	.mention-actor .item-icon { border-radius: 50%; background: color-mix(in srgb, var(--mention-actor) 16%, transparent); }
	.mention-class .item-icon { color: var(--mention-class); border: 1px solid currentColor; border-radius: 0.3em; }
	/* A framed glyph sits inside its frame with room on every side, and the frame stays within the line */
	.mention-class.inline .item-icon, .mention-actor.inline .item-icon { box-sizing: border-box; width: 1.5em; padding: 0.15em; font-size: 0.7em; }
	.mention-class .item-name { color: inherit; }
}`);

/**
 * Mention — `#Name`, `@name`, `/path` → icon + link.
 * Namespaces, pattern rules, and design: doc/Mention-notes.md
 *   mentions(el)                 // walk el's text, using site maps
 *   mentions(el, { "#": my_map })  // custom namespace
 *   mention_html("See #Page")    // for template literals
 */
// Pattern: `#`, `@` not after word/`[`; `/` starts a word only. See doc/Mention-notes.md
const PATTERN = /(?:(?<![\w\[])([#@])|(?<![^\s(])(\/))(\[[^\]\n]+\]|[A-Za-z][\w./-]*[\w]\/?)/g;

export const maps = { "#": refs, "@": people };

// Opt-in integration: doc/Mention-notes.md
View.upgrade = el => mentions(el);

export const unknown = new Set();

const SKIP_TAGS = new Set(["CODE", "PRE", "A", "TEXTAREA"]);

function raw_name(raw){
	return (raw.startsWith("[") ? raw.slice(1, -1) : raw).replace(/\/$/, "");
}

// `/` — path from web root; see doc/Mention-notes.md
const norm = url => String(url).toLowerCase().replace(/[?#].*$/, "").replace(/\/?$/, "/");
function by_path(m, raw){
	const want = norm("/" + raw_name(raw));
	// TRAP: `path: false` must not resolve from `/` lookup; prevents alias collisions (2026-10-03)
	for (const map of [m["#"], m["@"]]) for (const key in map ?? {})
		if (map[key].url && map[key].path !== false && norm(map[key].url) === want) return { key, ...map[key] };
	return null;
}

// `/` — a path that exists: walk the site's own folder listings from `/` (Page.listing, i.e. each
// folder's files.jsonl / page.jsonl). Returns "page" | "dir" | "file", null (not there), or
// { wait: dir } when that folder's listing has not loaded yet. Never fetches. See doc/architecture.md.
const PATH_ICON = { page: "article", dir: "folder", file: "description" };
function path_walk(segs){
	let dir = "/";
	for (let i = 0; i < segs.length; i++){
		const listing = Page.loaded_listing(dir), seg = segs[i], last = i === segs.length - 1;
		if (listing === undefined) return { wait: dir };
		if (!listing) return null;
		if (listing.folder(seg)){
			if (last) return listing.pages.has(seg) ? "page" : "dir";
			dir += seg + "/";
		} else return last && listing.files.includes(seg) ? "file" : null;
	}
	return null;
}

function path_entry(raw, state){
	if (!state || state.wait) return state ?? null;
	const url = "/" + raw_name(raw) + (state === "file" ? "" : "/");
	return { key: url, name: url, url, icon: PATH_ICON[state], kind: "path" };
}

function find(map, name){
	const key = map && Object.keys(map).find(k => k.toLowerCase() === name.toLowerCase());
	return key ? { key, ...map[key] } : null;
}

// Live agent ids: doc/Mention-notes.md
const AGENT_KIND = [[/^task-mastermind-/, "psychology"], [/^mastermind-/, "psychology"],
	[/^minion-/, "smart_toy"], [/^manager-/, "support_agent"], [/^assistant/, "bolt"]];
// The agent's real page is its task folder in the dated store (ai/AISession/AgentUrl.js reads it from ai/index.json). Until that has
// loaded a link points at /framework/ai/sessions/<name>/, which redirects there; `data-agent` lets retarget() swap the href in place.
function agent_entry(name){
	const icon = AGENT_KIND.find(([re]) => re.test(name))?.[1];
	if (!icon) return null;
	if (!AgentUrl.pending) AgentUrl.load().then(retarget);
	return { key: name, icon, agent: name, url: AgentUrl.of(name) ?? `/framework/ai/sessions/${name}/` };
}
function retarget(){
	for (const el of document.querySelectorAll("a[data-agent]")){
		const url = AgentUrl.of(el.dataset.agent);
		if (url) el.setAttribute("href", url);
	}
}

// Path lookup: doc/Mention-notes.md
function lookup_cached(m, sigil, raw){
	if (sigil === "/"){
		const hit = by_path(m, raw);
		return hit ? { name: hit.key, ...hit } : path_entry(raw, path_walk(raw_name(raw).split("/")));
	}
	const [head, ...rest] = raw_name(raw).split("/");
	const hit = find(m[sigil], head) ?? (sigil === "@" ? find(m["#"], head) ?? agent_entry(head) : null);
	if (!hit) return null;
	if (!rest.length) return { name: hit.key, ...hit };
	const url = hit.url ? hit.url.replace(/\/?$/, "/") + rest.join("/") + "/" : undefined;
	return { ...hit, agent: undefined, name: [hit.key, ...rest].join("/"), url };
}

// Live instances vs. cache: doc/Mention-notes.md
function live(entry){
	if (!entry?.url) return entry;   // also passes a { wait } through

	const want = norm(entry.url);
	const instance = Page.instances().find(p => p.url && norm(p.url) === want);
	if (!instance) return entry;   // cold case: never loaded this session, cache stands

	const nav = instance.nav?.() ?? {};
	return { ...entry, icon: nav.icon ?? entry.icon, class_card: nav.class_card ?? entry.class_card };
}

function lookup(m, sigil, raw){
	return live(lookup_cached(m, sigil, raw));
}

function note_unknown(sigil, raw){
	const tag = sigil + raw_name(raw);
	if (!unknown.has(tag)){
		unknown.add(tag);
		console.debug("Mention: unknown", tag);
	}
}

// The kind class the stylesheet reads: `#` class, `@` actor, `/` path. An entry from `ref_entry(url)` is a path.
const KINDS = { "#": "class", "@": "actor", "/": "path" };
const kind_class = entry => "mention-" + (entry.kind ?? "path");

// Written text shows a path as typed; only `#` and `@` mentions show the map's name. A path is a place, so it never
// takes the dark class card (a `ref_entry` card still does).
const shown = (sigil, raw, entry) => sigil === "/" ? "/" + raw_name(raw) + (raw.endsWith("/") ? "/" : "") : entry.name;
const as_kind = (sigil, entry) => ({ ...entry, kind: entry.kind ?? KINDS[sigil], class_card: sigil === "/" ? false : entry.class_card });

// Build context, class card, and styling: doc/Mention-notes.md
export function build_row(name, entry, extra = "inline mention"){
	const saved = View.captor;
	View.captor = null;
	try {
		const row = item(entry.url ? { icon: entry.icon, name, href: entry.url } : { icon: entry.icon, name })
			.ac(extra).ac(kind_class(entry)).ac(entry.class_card && "page-surface-dark").el;
		if (entry.agent) row.dataset.agent = entry.agent;
		return row;
	} finally {
		View.captor = saved;
	}
}

// Lookup by url for template literals: doc/Mention-notes.md
export function ref_entry(url){
	const entry = url ? lookup(maps, "/", String(url).replace(/^\//, "")) : null;
	return entry?.wait ? null : entry;   // a folder whose listing has not loaded is not an answer yet
}

function skip(node){
	for (let p = node.parentElement; p; p = p.parentElement)
		if (SKIP_TAGS.has(p.tagName)) return true;
	return false;
}

// A text node's mentions become rows. A `/path` whose folder listings are still loading stays text,
// and is tried again once they arrive (a plain DOM replace, no View capture involved).
function replace_node(node, m, depth = 0){
	const text = node.textContent;
	const re = new RegExp(PATTERN.source, "g");
	const pieces = [], waits = new Set();
	let last = 0, match, changed = false;

	while ((match = re.exec(text))){
		const [full, s1, s2, raw] = match, sigil = s1 ?? s2;
		const entry = lookup(m, sigil, raw);

		if (entry?.wait){ waits.add(entry.wait); continue; }
		if (!entry){ if (sigil !== "/") note_unknown(sigil, raw); continue; }   // left in place — `last` doesn't move

		changed = true;
		if (match.index > last) pieces.push(document.createTextNode(text.slice(last, match.index)));
		pieces.push(build_row(shown(sigil, raw, entry), as_kind(sigil, entry)));
		last = match.index + full.length;
	}

	if (changed){
		if (last < text.length) pieces.push(document.createTextNode(text.slice(last)));
		node.replaceWith(...pieces);
	}

	if (waits.size && depth < 8){
		const texts = changed ? pieces.filter(p => p.nodeType === 3) : [node];
		Promise.all([...waits].map(dir => Page.listing(dir).catch(() => null))).then(() => {
			for (const t of texts) if (t.parentNode) replace_node(t, m, depth + 1);
		});
	}
}

// An inline `code` that holds ONLY one reference (`/framework/ai/`, `@owner`, `mastermind-x`) becomes the same link; longer code stays code.
function upgrade_code(code, m){
	let t = code.textContent.trim();
	if (t.includes("-") && agent_entry(t)) t = "@" + t;   // a hyphen: the bare word "assistant" is prose
	const match = new RegExp(PATTERN.source, "g").exec(t);
	if (!match || match[0] !== t) return;
	const sigil = match[1] ?? match[2], entry = lookup(m, sigil, match[3]);
	if (entry && !entry.wait) code.replaceWith(build_row(shown(sigil, match[3], entry), as_kind(sigil, entry)));
}

/** Walk every text node under `el` and turn known mentions into icon links, in place. */
export function mentions(el, m = maps){
	for (const code of el.querySelectorAll("code"))
		if (!code.closest("pre, a")) upgrade_code(code, m);

	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const nodes = [];
	let node;
	while ((node = walker.nextNode())) nodes.push(node);

	for (const n of nodes)
		if (!skip(n)) replace_node(n, m);

	return el;
}

/** The string form — for a template literal or an attribute, where there's no element to walk. */
export function mention_html(str, m = maps){
	const re = new RegExp(PATTERN.source, "g");

	return String(str).replace(re, (full, s1, s2, raw) => {
		const sigil = s1 ?? s2, found = lookup(m, sigil, raw);
		if (!found || found.wait){ if (!found && sigil !== "/") note_unknown(sigil, raw); return full; }   // a pending path stays text: a string cannot upgrade later

		const entry = as_kind(sigil, found), name = shown(sigil, raw, found);
		const tag = entry.url ? "a" : "span";
		const href = entry.url ? ` href="${entry.url.replaceAll('"', "&quot;")}"` + (entry.agent ? ` data-agent="${entry.agent}"` : "") : "";
		const dark = entry.class_card ? " page-surface-dark" : "";
		return `<${tag} class="item inline mention ${kind_class(entry)}${dark}"${href}>`
			+ `<span class="material-icons icon item-icon">${entry.icon}</span>`
			+ `<span class="item-name">${name}</span></${tag}>`;
	});
}

export default mentions;
