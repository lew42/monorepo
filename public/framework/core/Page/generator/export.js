import { Page, div, span, a, input, button } from "/app.js";
import { MODEL } from "./gen.js";

// history and reasons: doc/generator-export-notes.md

export const DIR = "/imagine/generated/";

// ⚠ off localhost, async_rpc() returns undefined immediately; this timeout is for sockets with no server
const PROBE = 2500;

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

// ⚠ fallback is 1em (core's wall gap), not 0px; guessing low silently drops to two columns
const cell = cols => !/^\d+$/.test(cols) ? cols
	: +cols < 2 ? "100%"
	: `calc((100% - ${+cols - 1} * var(--gap, 1em)) / ${cols})`;

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

const kids = page => [...page.children.values()].filter(kid => kid?.at);

export function module(page){
	const under = kids(page);
	const shape = shape_for(page);
	const out = [];

	out.push(shape.md ? `import { Page, md } from "/app.js";` : `import { Page } from "/app.js";`);
	if (shape.tabs) out.push(`import "/framework/ext/tabs/tabs.js";`);

	out.push("", "// " + shape.note, "", "export default new Page({", "\tmeta: import.meta,",
		`\ttitle: ${JSON.stringify(page.title)},`);

	const wline = width_line(page);
	if (wline) out.push("\t" + wline);

	// ⚠ `index: true` — my content already shows my children, so core's column must
	//   not list them a second time under the wall (or under the tab bar).
	if (shape.index) out.push("\tindex: true,");

	if (under.length) out.push("", `\tchildren: ${JSON.stringify(under.map(kid => kid.name).join(" "))},`);

	const cline = content_line(page);
	if (cline) out.push("", `\tcontent(){ ${cline} },`);

	out.push("});", "");

	return out.join("\n");
}

export function root(host, name, at){
	const under = kids(host);
	// ⚠ */ is neutered in spec before it closes the block comment early
	const spec = host.spec.replace(/\*\//g, "* /").split("\n").map(line => " *   " + line).join("\n");
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

export function index(names){
	// ⚠ children: is OMITTED when empty; children: "" declares a child called "" which 404s
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

function shape_for(page){
	const under = kids(page);
	return SHAPES[under.length ? page.block : "prose"] ?? SHAPES.prose;
}

export function content_line(page){
	const shape = shape_for(page);
	return shape.content ? shape.content(page.opt) : null;
}

export function width_line(page){
	return page.width ? `width: ${JSON.stringify(page.width)},` : null;
}

// write deepest last, so no index names a directory that isn't there yet
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

// ⚠ async_rpc() returns undefined when socket is disabled; falsy answer either way, never an exception
async function ask(socket, method, ...args){
	return (await raced(socket.async_rpc(method, ...args))) ?? null;
}

function raced(promise){
	return Promise.race([promise, new Promise(done => setTimeout(done, PROBE, null))]);
}

export async function run(host, name){
	const socket = host.app?.socket;
	if (!socket) return { ok: false, msg: "no socket — export needs the dev server." };
	if (!name) return { ok: false, msg: "name the tree first." };

	// ⚠ spec of comments only parses to zero nodes; refuse before any write
	if (!kids(host).length) return { ok: false, msg: "nothing to export — this spec has no pages." };

	const listing = await ask(socket, "ls", DIR);
	if (!listing) return { ok: false, msg: "no dev server answered — nothing is listening to write the files." };

	const dirs = (listing.response ?? []).filter(entry => entry.type === "dir").map(entry => entry.name);

	// ⚠ never overwrite; an export is a tree someone may have edited by hand
	if (dirs.includes(name)) return { ok: false, msg: `${DIR}${name}/ already exists — pick another name.` };

	const list = files(host, name);

	const { default: FsFile } = await import("/framework/ext/filesystem/FsFile.js");
	const write = (path, text) => raced(FsFile.write(path, text));

	for (const [file, source] of list){
		if (await write(file, source) !== true) return { ok: false, msg: `write failed at ${file}` };
	}

	if (await write(DIR + "page.js", index([...dirs, name].sort())) !== true) return { ok: false, msg: "the tree was written, but the index was not — add it to " + DIR + "page.js by hand." };

	return { ok: true, url: DIR + name + "/", msg: `${list.length} files written` };
}

export function suggest(host){
	const saved = host.prefs().get({ saved: [] }).saved ?? [];
	const match = saved.find(entry => entry.spec === host.spec);

	return Page.slug(match?.title || (host.typed ? "tree" : "seed " + host.seed));
}

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

export function report(host, result){
	host.$export_msg.empty(() => {
		if (!result.ok) return span.c("page-gen-export-bad", result.msg);

		span(result.msg + " → ");
		a.c("page-link", result.url).href(result.url);
	});

	return result;
}

export default run;
