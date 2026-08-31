import { Page, div, span, a, input, button } from "/app.js";
import { MODEL } from "./gen.js";

/**
 * THE ENDGAME — a generated tree, written out as real `page.js` files.
 *
 * Waves 1-7 built a page tree that has everything a real one has except a
 * filesystem: real urls, the real Router, core's columns, the `active-page`
 * contract. This is the last thing it was missing — a way OUT. One click writes
 * one directory per page under `/imagine/generated/<name>/`, each with an
 * ordinary `page.js`, and the result is browsable exactly like a module somebody
 * typed by hand. Nothing under there imports anything from this directory.
 *
 * The whole export is a function of the LIVE TREE — `host.children`, the same
 * Pages you are looking at — so what lands on disk is what was on screen. The
 * draw path (`gen.js`, `rules.js`, `spec.js`) is not touched, read or re-run:
 * `#7` still means one tree and the reproducibility line stays green.
 *
 * ⚠ DEV ONLY, by design. The site is static in production, so the writer is the
 *   dev server's `rpc:write` (Server/plugins/SocketServer/Runtime.js) and the
 *   control disables itself with a reason when nothing answers — see `report()`.
 */

// Where an export lands. `/imagine/` is the lab world, and its own index page is
// the one file outside this directory that had to learn the word "generated".
export const DIR = "/imagine/generated/";

/* How long a write waits before deciding there is no dev server. Off localhost
   `async_rpc()` returns undefined immediately and never reaches this; the timeout
   is for the other case — a socket that is connected to nothing, or a server too
   old to answer `rpc:write`. The same probe `/imagine/stream/` pays. */
const PROBE = 2500;


/* ════ THE FILES ══════════════════════════════════════════════════════════════
 *
 * One `page.js` per page, in the shape the readme's own "four words that were
 * cut" section writes by hand — because that section is the answer to "what does
 * this word look like when a person writes it", and it was already written.
 *
 *   wall    a card wall            index: true + previews()
 *   list    an inbox               nothing — core's column already lists children
 *   prose   the leaf               a line of md()
 *   tabs    a strip over a panel   ext/tabs' `tabs()`
 *   vtabs   the same, on its side  `tabs().ac("vertical")`
 *
 * ⚠ A CHILDLESS PAGE IS A LEAF, whatever word it wears. `gen()` already draws it
 *   that way and `kind()` already offers `prose` only to a page with no children;
 *   a typed spec can still say `tabs` with nothing under it, and `tabs()` on an
 *   empty set reaches for `list[0]` and throws. One rule, three places agree.
 */
const SHAPES = {
	wall: {
		index: true,
		note: "A wall of cards; picking one opens a column to the right.",
		content: opt => `return this.previews()${style(opt)};`,
	},
	list: {
		note: "An inbox — core's own column draws my children as rows, so there is nothing to write here.",
	},
	prose: {
		md: true,
		note: "The leaf. Replace this line with the page.",
		content: () => `md("The end of a branch — this is where the real page goes.");`,
	},
	tabs: {
		index: true,
		tabs: true,
		note: "A strip of tabs over a panel: a child swaps IN PLACE and the row never grows.",
		content: () => `return this.tabs();`,
	},
	vtabs: {
		index: true,
		tabs: true,
		note: "The same set as a side rail — ext/tabs turned on its side.",
		content: () => `return this.tabs().ac("vertical");`,
	},
};

/* `cols=3` is three tracks exactly: `.page-previews` is `auto-fill` over `--column`,
   so the track is what is left after the gaps, divided three ways.
   ⚠ The fallback is `1em` — core's own wall gap — and NOT the `0px` controls.js
     writes for the generator's own nav. Guess it low and the third track no longer
     fits: `auto-fill` silently drops to two columns. Same idea, different wall. */
const cell = cols => !/^\d+$/.test(cols) ? cols
	: +cols < 2 ? "100%"
	: `calc((100% - ${+cols - 1} * var(--gap, 1em)) / ${cols})`;

/* The two spec settings core's wall can actually read. `flow=` has no equivalent
   here on purpose: it swaps the generator's own nav between `.grid.auto` and
   `.flex.auto`, and `previews()` is one grid — a `.flex` wall would be a rule this
   export invented, which is the opposite of "reads like a person wrote it". */
function style(opt = {}){
	const set = {};

	if (opt.cols) set["--column"] = cell(opt.cols);
	if (opt.gap) set["--gap"] = /^-?[\d.]+$/.test(opt.gap) ? opt.gap + "px" : opt.gap;

	const keys = Object.keys(set);
	if (!keys.length) return "";

	return keys.length === 1
		? `.style("${keys[0]}", "${set[keys[0]]}")`
		: `.style({ ${keys.map(key => `"${key}": "${set[key]}"`).join(", ")} })`;
}

// The generated pages under one page, in spec order. `at` is the filter the whole
// module uses: the permutation wall and the spec gallery are stable children with
// no place in the spec, and neither is part of the tree being exported.
const kids = page => [...page.children.values()].filter(kid => kid?.at);

/* ONE FILE. Fields in the order every hand-written page.js in this repo puts them:
   what I am, how wide, what is under me, what I draw. */
export function module(page){
	const under = kids(page);
	const shape = SHAPES[under.length ? page.block : "prose"] ?? SHAPES.prose;
	const out = [];

	out.push(shape.md ? `import { Page, md } from "/app.js";` : `import { Page } from "/app.js";`);
	if (shape.tabs) out.push(`import "/framework/ext/tabs/tabs.js";`);

	out.push("", "// " + shape.note, "", "export default new Page({", "\tmeta: import.meta,",
		`\ttitle: ${JSON.stringify(page.title)},`);

	// Core's own word — `.page-column-<width>`, a track in the row. An in-place child
	// never has one: `tree.js` dropped it upstream, so there is nothing to write.
	if (page.width) out.push(`\twidth: ${JSON.stringify(page.width)},`);

	// ⚠ `index: true` — my content already shows my children, so core's column must
	//   not list them a second time under the wall (or under the tab bar).
	if (shape.index) out.push("\tindex: true,");

	if (under.length) out.push("", `\tchildren: ${JSON.stringify(under.map(kid => kid.name).join(" "))},`);
	if (shape.content) out.push("", `\tcontent(){ ${shape.content(page.opt)} },`);

	out.push("});", "");

	return out.join("\n");
}

/* THE ROOT — the one page the spec does not describe. It is the export's own name,
   the provenance of the tree, and the single line that makes the whole subtree lay
   out as columns. Everything below it is an ordinary page.
   ⚠ The spec goes in a BLOCK COMMENT and a typed spec is whatever somebody typed,
     so `*​/` is neutered before it ends the comment three lines early. */
export function root(host, name, at){
	const under = kids(host);
	const spec = host.spec.replace(/\*\//g, "* /").split("\n").map(line => " *   " + line).join("\n");
	// ⚠ A seed is only an address against one MODEL, so the file says which one it
	//   was drawn under — the same line the proof strip prints. A typed spec has no
	//   seed to name and its own text is above.
	const drawn = host.typed ? "a spec typed by hand" : `seed ${host.seed}, model v${MODEL}`;

	return [
		`import { Page } from "/app.js";`,
		"",
		`/* Exported from the page generator on ${at} — ${drawn}.`,
		" *",
		spec,
		" *",
		" * Ordinary pages from here down: one directory each, one `page.js` each, nothing",
		" * imported from the generator. Edit them like any other module.",
		" */",
		"",
		"export default new Page({",
		"\tmeta: import.meta,",
		`\ttitle: ${JSON.stringify(titled(name))},`,
		`\tdescription: ${JSON.stringify(`A generated page tree — ${count(host)} pages, exported from ${drawn}.`)},`,
		`\ticon: "account_tree",`,
		"",
		"\t// Core's opt-in: my whole subtree lays out as full-height columns.",
		"\tinitialize(){ this.columns(); },",
		"",
		`\tchildren: ${JSON.stringify(under.map(kid => kid.name).join(" "))},`,
		"});",
		"",
	].join("\n");
}

/* THE INDEX — `/imagine/generated/page.js`, rewritten on every export because its
   `children:` is the only record that an export happened. Nothing crawls: a page
   exists once its parent names it, and this is the parent.
   ⚠ `children:` is OMITTED when the list is empty. `children: ""` declares one child
     called "" — `"".split(/\s+/)` is `[""]`, not `[]` — and the index would render a
     nameless row that 404s. */
export function index(names){
	return [
		`import { Page, md } from "/app.js";`,
		"",
		"/* Page trees the generator wrote out — real modules, one directory per page.",
		" *",
		" * ⚠ The `children:` line below is REWRITTEN by the Export control on",
		" *   /framework/core/Page/generator/ (export.js). Add a tree by exporting it;",
		" *   remove one by deleting its directory and its name from that line.",
		" */",
		"",
		"export default new Page({",
		"\tmeta: import.meta,",
		`\ttitle: "Generated",`,
		`\tdescription: "Page trees exported from the generator — the same tree, as files you can edit.",`,
		`\ticon: "output",`,
		"\tindex: true,",
		...(names.length ? ["", `\tchildren: ${JSON.stringify(names.join(" "))},`] : []),
		"",
		"\tcontent(){",
		`\t\tmd("Each of these was a tree in the [generator](/framework/core/Page/generator/) and is now a directory of ordinary \`page.js\` files — real imports, \`children:\` naming the subdirs, the width words the spec gave them. Open one and it is a columns tree like any other; open its files and there is nothing generated about them. ([how this works](/imagine/generated/readme/))");`,
		names.length ? "\t\tthis.previews();" : `\t\tmd("Nothing exported yet — roll a tree in the generator and press **Export**.");`,
		"\t},",
		"});",
		"",
	].join("\n");
}

// Every page in the tree, as `[url path, source]` — the whole write list, in the
// order it is written: deepest last, so no index ever names a directory that is
// not there yet.
export function files(host, name){
	const at = new Date().toISOString().slice(0, 10);
	const out = [[DIR + name + "/page.js", root(host, name, at)]];

	(function walk(pages, path){
		pages.forEach(page => {
			out.push([path + page.name + "/page.js", module(page)]);
			walk(kids(page), path + page.name + "/");
		});
	})(kids(host), DIR + name + "/");

	return out;
}

const count = host => { let n = 0; (function walk(list){ list.forEach(p => { n++; walk(kids(p)); }); })(kids(host)); return n; };
const titled = name => name.replace(/-/g, " ").replace(/^./, c => c.toUpperCase());


/* ════ THE WRITE ══════════════════════════════════════════════════════════════ */

/* One rpc, raced against a clock. ⚠ `async_rpc()` returns `undefined` when the
   socket is disabled — which is exactly what a production page is — so an
   unreachable server is a falsy answer either way and never an exception. */
async function ask(socket, method, ...args){
	const reply = await Promise.race([
		socket.async_rpc(method, ...args),
		new Promise(done => setTimeout(done, PROBE, null)),
	]);

	return reply ?? null;
}

/**
 * EXPORT — and the four answers it can give, all of them quiet.
 *
 * `ls` first, and it does three jobs at once: it proves a dev server is listening,
 * it says whether this name is taken, and it is where the index's `children:` comes
 * from. That is why there is no manifest file — the directory IS the list, and a
 * second copy of it would be a second thing to keep in step.
 */
export async function run(host, name){
	const socket = host.app?.socket;
	if (!socket) return { ok: false, msg: "no socket — export needs the dev server." };
	if (!name) return { ok: false, msg: "name the tree first." };

	// ⚠ A spec of nothing but comments parses to zero nodes — `parse()` drops `#` lines
	//   — and the root would be written with `children: ""`, which declares one child
	//   called "". Refuse before anything is written.
	if (!kids(host).length) return { ok: false, msg: "nothing to export — this spec has no pages." };

	const listing = await ask(socket, "ls", DIR);
	if (!listing) return { ok: false, msg: "no dev server answered — nothing is listening to write the files." };

	const dirs = (listing.response ?? []).filter(entry => entry.type === "dir").map(entry => entry.name);

	// ⚠ NEVER overwrite. An export is a tree somebody may already have edited by
	//   hand — that is the whole point of exporting it — so a second run under the
	//   same name is refused rather than merged.
	if (dirs.includes(name)) return { ok: false, msg: `${DIR}${name}/ already exists — pick another name.` };

	const list = files(host, name);

	for (const [file, source] of list){
		const reply = await ask(socket, "write", file, source);
		if (reply?.response !== "write successful") return { ok: false, msg: `write failed at ${file}` };
	}

	// The seam, last: the index names the directory only once the directory is there.
	const written = await ask(socket, "write", DIR + "page.js", index([...dirs, name].sort()));
	if (written?.response !== "write successful") return { ok: false, msg: "the tree was written, but the index was not — add it to " + DIR + "page.js by hand." };

	// Files, not pages — the list is the tree plus the root that holds it, and the
	// root's own description already says how many pages the tree is.
	return { ok: true, url: DIR + name + "/", msg: `${list.length} files written` };
}


/* ════ THE CONTROL ════════════════════════════════════════════════════════════ */

/* A NAME THIS TREE ALREADY HAS. A curated or saved spec has a title and that title
   is the obvious directory name; a rolled tree has a seed and nothing else. Both are
   only a suggestion — the field is editable, and `Page.slug()` is what actually
   decides what a directory may be called. */
export function suggest(host){
	const saved = host.store().get({ saved: [] }).saved ?? [];
	const match = saved.find(entry => entry.spec === host.spec);

	return Page.slug(match?.title || (host.typed ? "tree" : "seed " + host.seed));
}

/**
 * The control, under the spec box — where the tree already is. One field, one
 * button, one line of feedback that is never an alert.
 *
 * ⚠ Off the dev server there is no socket at all (`dev/Socket` gates on hostname),
 *   so the button is disabled before it is ever pressed and the line says why. That
 *   is the honest production state: this page still rolls, types, switches and
 *   links — it just cannot write files, because there is nothing to write to.
 */
export function control(host){
	const live = !!host.app?.socket && !host.app.socket.disabled;

	return div.c("page-gen-export", () => {
		span.c("page-gen-tag", "export");

		div.c("page-gen-export-row", () => {
			host.$export_name = input.c("page-gen-export-name")
				.attr("placeholder", "directory name…")
				.attr("value", suggest(host));

			button.c("page-gen-export-btn", "Export to files")
				.attr("disabled", live ? null : "")
				.click(() => host.export());
		});

		host.$export_msg = div.c("page-gen-export-msg")
			.text(live ? "" : "Dev only — the site is static in production, so there is no server to write to.");
	});
}

/* The answer, in the line under the button — and a LINK when there is one, because
   the whole point of the feature is the page you can now open. */
export function report(host, result){
	host.$export_msg.empty(() => {
		if (!result.ok) return span.c("page-gen-export-bad", result.msg);

		span(result.msg + " → ");
		a.c("page-link", result.url).href(result.url);
	});

	return result;
}

export default run;
