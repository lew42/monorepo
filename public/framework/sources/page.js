/* THE SOURCE LIBRARY, AS A PAGE — a wall of topics; open one and its saved pages are the
   same tree + about + source browser ext/Doc's own Files tab uses (ext/files), not a
   second wall. Two real urls: /framework/sources/ (the topic wall) and
   /framework/sources/<topic>/ (that topic's browser — one saved page is
   `?file=<path>` inside it, the same way the Files tab picks a file).

   Container: /framework/ (a topic row, core's own page grid). Size: the default page
   track for the topic wall — prose and cards, nothing wants the wide or bleed track;
   the topic page itself opts out with its own `render()`, same reason the Files tab
   does (the browser wants the whole page). Preview: the default card for topics.

   TOPICS COME FROM DATA, NOT A DECLARED LIST — this page's own decision, logged in
   doc/decisions.md: `Server/sources.mjs` appends one line to a top-level
   sources/index.jsonl the first time it saves anything for a new topic, and this page
   just reads that file. A hand-typed list here would need editing every time a topic is
   seeded; the file already exists for exactly this reason (core/Page/doc/data-children.md
   — `children` as a function, read once, is the intended seam for exactly this shape). */

import { Page, View, div, h1, p, a, span, icon, md } from "/app.js";
import files from "../ext/files/files.js";

View.stylesheet(import.meta, "Sources.css");

// One .jsonl file -> its rows. Same shape Server/sources.mjs writes with appendJsonl();
// read here as plain fetch + text, because this runs in the browser, not node.
async function read_jsonl(url){
	const res = await fetch(url).catch(() => null);
	if (!res?.ok) return [];
	const text = await res.text();
	return text.split("\n").filter(Boolean)
		.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
}

function badge(authority){
	return span.c("sources-badge sources-badge-" + (authority || "low"), authority || "low");
}

// Every saved page opens with a `---`-fenced YAML header (url/title/kind/authority/
// fetched_at) — that's for a human or agent reading the raw .md file, and the header
// row above already shows the same three facts. `md.js` knows nothing about
// frontmatter (nothing else in this framework has any), so left in, it rendered as
// one run-on paragraph ahead of the real content. Stripped here, in this module only
// — a plain string cut, not a change to the shared markdown reader.
function strip_frontmatter(text){
	return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

// The "about" panel for one saved source, inside the topic's file browser below: the
// same badge row (authority/kind/real url) the old per-source card used to show, then
// the converted body. Fetched as plain text (not md.file()) so the frontmatter header
// can be cut before the body is parsed — md.file() has no idea what frontmatter is.
// ⚠ `res.ok` checked before `.text()` — a missing .md must say so in plain words, never
// render the site's 404 HTML as though it were the page (the same guard read_jsonl()
// above already has).
function source_about(row, path){
	if (!row) return p.c("muted", `No index entry for ${path}.`);

	return fetch(new URL(path, import.meta.url).href)
		.then(res => res.ok ? res.text() : null)
		.then(text => div.c("flow", () => {
			div.c("flex gap wrap", () => {
				badge(row.authority);
				span.c("muted", row.kind);
				a.c("muted", row.url).href(row.url);
			});
			md(text != null ? strip_frontmatter(text) : `*Not found: ${path}*`);
		}));
}

// One topic: the same tree + about + source browser as ext/Doc's own Files tab
// (`ext/files`), not a wall of cards — this page's own decision, logged in
// doc/decisions.md, matching the task's requirement that "the sources library uses the
// same browser." `index.jsonl`'s own `path` field (already relative, e.g.
// "opencode/opencode-cli-documentation.md") is exactly the space-separated path list
// `files()` wants; `about` looks a path back up in that same data for its badge row.
function topic_page(topic){
	return {
		name: topic,
		title: topic,
		icon: "folder_open",

		// A full custom render, same as ext/Doc's Files tab: the browser wants the whole
		// page, not the standard title + reading column (core/Page/doc/declaring.md).
		render(){
			return this.view ??= div.c("page sources-files", () => {
				h1.c("sources-files-title h2", topic);

				return read_jsonl(new URL(`${topic}/index.jsonl`, import.meta.url).href).then(rows => {
					const by_path = new Map(rows.map(row => [row.path, row]));

					return files({ url: import.meta.url }, rows.map(row => row.path).join(" "), {
						about: path => source_about(by_path.get(path), path),
					});
				});
			}).ac("page--" + this.name);
		},
	};
}

export default new Page({
	meta: import.meta,
	title: "Sources",
	description: "A library of web pages fetched once, saved as markdown, and cited by url — so no agent re-fetches the same page twice.",
	icon: "menu_book",

	// Data source, same seam as topic_page()'s own children() — read once, on first ask
	// (core/Page/doc/data-children.md). Deduped by topic: a race between two fan-outs
	// seeding the same brand-new topic at once can append it twice (Server/sources.mjs's
	// own comment above its topicsFile append has the measurement) — index.jsonl is
	// append-only by design, so the fix is reading it tolerantly, never rewriting it.
	children(){
		return read_jsonl(new URL("index.jsonl", import.meta.url).href)
			.then(rows => [...new Set(rows.map(row => row.topic))].map(topic_page));
	},

	content(){
		md("Any agent can save a web page here as markdown, once, instead of re-fetching it every time it comes up. `node Server/sources.mjs --cite <topic>` prints what is already saved before fetching anything; `node Server/sources.mjs \"<question>\" --topic <topic>` runs a small web-search fan-out and saves what it finds. `readme.md` beside this file has both, in full.");
		return this.previews();
	},
});
