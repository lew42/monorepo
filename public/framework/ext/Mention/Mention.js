import { View } from "../../core/View/View.js";
import { Page } from "../../core/Page/Page.class.js";
import item from "../../ui/item/item.js";
import { css } from "../../ui/parts.js";
import refs from "./maps/refs.js";
import people from "./maps/people.js";

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
	.mention.inline.page-surface-dark .item-icon { width: 1em; font-size: 0.85em; }
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

function find(map, name){
	const key = map && Object.keys(map).find(k => k.toLowerCase() === name.toLowerCase());
	return key ? { key, ...map[key] } : null;
}

// Live agent ids: doc/Mention-notes.md
const AGENT_KIND = [[/^task-mastermind-/, "psychology"], [/^mastermind-/, "psychology"],
	[/^minion-/, "smart_toy"], [/^manager-/, "support_agent"], [/^assistant/, "bolt"]];
function agent_entry(name){
	const icon = AGENT_KIND.find(([re]) => re.test(name))?.[1];
	return icon ? { key: name, icon } : null;
}

// Path lookup: doc/Mention-notes.md
function lookup_cached(m, sigil, raw){
	if (sigil === "/"){ const hit = by_path(m, raw); return hit && { name: hit.key, ...hit }; }
	const [head, ...rest] = raw_name(raw).split("/");
	const hit = find(m[sigil], head) ?? (sigil === "@" ? find(m["#"], head) ?? agent_entry(head) : null);
	if (!hit) return null;
	if (!rest.length) return { name: hit.key, ...hit };
	const url = hit.url ? hit.url.replace(/\/?$/, "/") + rest.join("/") + "/" : undefined;
	return { ...hit, name: [hit.key, ...rest].join("/"), url };
}

// Live instances vs. cache: doc/Mention-notes.md
function live(entry){
	if (!entry?.url) return entry;

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

// Build context, class card, and styling: doc/Mention-notes.md
export function build_row(name, entry, extra = "inline mention"){
	const saved = View.captor;
	View.captor = null;
	try {
		return item(entry.url ? { icon: entry.icon, name, href: entry.url } : { icon: entry.icon, name })
			.ac(extra).ac(entry.class_card && "page-surface-dark").el;
	} finally {
		View.captor = saved;
	}
}

// Lookup by url for template literals: doc/Mention-notes.md
export function ref_entry(url){
	return url ? lookup(maps, "/", String(url).replace(/^\//, "")) : null;
}

function skip(node){
	for (let p = node.parentElement; p; p = p.parentElement)
		if (SKIP_TAGS.has(p.tagName)) return true;
	return false;
}

function replace_node(node, m){
	const text = node.textContent;
	const re = new RegExp(PATTERN.source, "g");
	const pieces = [];
	let last = 0, match, changed = false;

	while ((match = re.exec(text))){
		const [full, s1, s2, raw] = match, sigil = s1 ?? s2;
		const entry = lookup(m, sigil, raw);

		if (!entry){ if (sigil !== "/") note_unknown(sigil, raw); continue; }   // left in place — `last` doesn't move

		changed = true;
		if (match.index > last) pieces.push(document.createTextNode(text.slice(last, match.index)));
		pieces.push(build_row(entry.name, entry));
		last = match.index + full.length;
	}

	if (!changed) return;
	if (last < text.length) pieces.push(document.createTextNode(text.slice(last)));
	node.replaceWith(...pieces);
}

/** Walk every text node under `el` and turn known mentions into icon links, in place. */
export function mentions(el, m = maps){
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
		const sigil = s1 ?? s2, entry = lookup(m, sigil, raw);
		if (!entry){ if (sigil !== "/") note_unknown(sigil, raw); return full; }

		const tag = entry.url ? "a" : "span";
		const href = entry.url ? ` href="${entry.url.replaceAll('"', "&quot;")}"` : "";
		const dark = entry.class_card ? " page-surface-dark" : "";
		return `<${tag} class="item inline mention${dark}"${href}>`
			+ `<span class="material-icons icon item-icon">${entry.icon}</span>`
			+ `<span class="item-name">${entry.name}</span></${tag}>`;
	});
}

export default mentions;
