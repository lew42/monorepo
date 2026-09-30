import { View } from "../../core/View/View.js";
import item from "../../ui/item/item.js";
import refs from "./maps/refs.js";
import people from "./maps/people.js";

/**
 * Mention — `#Name` and `@name` become a small icon + the word, linking to
 * wherever that name means. Two SEPARATE namespaces, one per control
 * character (the owner, 2026-09-30): `#` looks names up in `refs.js` (real
 * things on the site — `#Page`, `#Servex`), `@` looks them up in `people.js`
 * (users and agents — `@owner`, `@mastermind`). Adding a THIRD namespace
 * later is adding a third map and a third key to `maps` below — nothing in
 * this file needs to change.
 *
 *   mentions(el)                 // walk el's own text, using the site's two maps
 *   mentions(el, { "#": my_map })  // a caller with its own namespace
 *   mention_html("See #Page")    // the string form, for a template literal
 *
 * PATTERN: `/(?<![\w\[])([#@])(\[[^\]\n]+\]|[A-Za-z][\w.-]*[\w])/g`
 *   - not preceded by a letter/digit/underscore or `[` — so `a#b` and
 *     `user@example.com` are left alone (an email's `@` always has a word
 *     character right before it).
 *   - `#[Page layout]` — the bracket form, for a name with a space in it.
 *   - a markdown heading (`# Title`, `#` then a SPACE) never matches — the
 *     character right after `#` has to be `[` or a letter, never a space.
 *   - `#fff` (a colour written in prose) matches the shape but almost never
 *     the map, so it falls through to plain text — same as any other typo.
 *
 * A name not in its map is left as plain text (untouched — the original
 * text node is never even split) and recorded in `unknown`, once per name,
 * with one `console.debug` — never `warn`/`error`, which would fail this
 * site's own merge smoke test. `unknown`'s keys carry their sigil
 * (`"#Nope"`, not `"Nope"`) so `#Nope` and a future `@Nope` don't collide.
 *
 * Synchronous throughout — no fetch, nothing awaited — so this is safe to
 * call from inside a `View` capture callback, same as `md()` itself.
 */
const PATTERN = /(?<![\w\[])([#@])(\[[^\]\n]+\]|[A-Za-z][\w.-]*[\w])/g;

export const maps = { "#": refs, "@": people };

export const unknown = new Set();

const SKIP_TAGS = new Set(["CODE", "PRE", "A", "TEXTAREA"]);

function raw_name(raw){
	return raw.startsWith("[") ? raw.slice(1, -1) : raw;
}

function lookup(m, sigil, raw){
	const map = m[sigil];
	if (!map) return null;

	const name = raw_name(raw).toLowerCase();
	const key = Object.keys(map).find(k => k.toLowerCase() === name);
	return key ? { name: key, ...map[key] } : null;
}

function note_unknown(sigil, raw){
	const tag = sigil + raw_name(raw);
	if (!unknown.has(tag)){
		unknown.add(tag);
		console.debug("Mention: unknown", tag);
	}
}

// Built OUTSIDE whatever captor happens to be open when `mentions()` runs
// (a page's own content() callback, most of the time) — `item()` is a normal
// View factory and would otherwise auto-append itself into that captor
// before this file ever moves it into place. doc/decisions.md if this ever
// needs to be true for a second reason.
function build_row(name, entry){
	const saved = View.captor;
	View.captor = null;
	try {
		return item(entry.url ? { icon: entry.icon, name, href: entry.url } : { icon: entry.icon, name }).ac("inline mention").el;
	} finally {
		View.captor = saved;
	}
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
		const [full, sigil, raw] = match;
		const entry = lookup(m, sigil, raw);

		if (!entry){ note_unknown(sigil, raw); continue; }   // left in place — `last` doesn't move

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

	return String(str).replace(re, (full, sigil, raw) => {
		const entry = lookup(m, sigil, raw);
		if (!entry){ note_unknown(sigil, raw); return full; }

		const tag = entry.url ? "a" : "span";
		const href = entry.url ? ` href="${entry.url.replaceAll('"', "&quot;")}"` : "";
		return `<${tag} class="item inline mention"${href}>`
			+ `<span class="material-icons icon item-icon">${entry.icon}</span>`
			+ `<span class="item-name">${entry.name}</span></${tag}>`;
	});
}

export default mentions;
