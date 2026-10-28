import fs from "node:fs";
import SessionRecord from "../../Server/SessionRecord.mjs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Subpages from "./Subpages.js";
import Promote from "./Promote.js";
import TaskHomes from "../../Server/TaskHomes.mjs";
import Task from "../../public/framework/core/Task/Task.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PUBLIC = process.env.SERVEX_PUBLIC ? path.resolve(process.env.SERVEX_PUBLIC) : path.join(ROOT, "public");   // SERVEX_PUBLIC: a test points the records at a scratch tree

/* SIX TOOLS over `Item.Store` (core/Item/Store.js), so an agent writes a LIVE page the
 * same small way a browser tab would — one line at a time, through the SAME file every
 * tab already tails (ext/JSONL/live.js → Server/plugins/SocketServer/Tail.js). This runs
 * IN Servex (node), never in a browser, so there is no Store object to call: the line is
 * built here and appended straight to disk, exactly the shape `Item.Store.flush()` would
 * have sent to `Append.js` (core/Item/Store.js, Server/plugins/SocketServer/Append.js) —
 * the dev server's own file watcher picks up the write and tails it to every open tab, no
 * different from any other change to the file.
 *
 * The owner, 2026-10-02 (CLAUDE.md, "Pages are live"): "if an agent creates a page, we
 * want the agent to be able to update that page via the page.jsonl in real time… a
 * toolset… we don't want to bloat our toolset with thousands of cross-domain tools."
 *
 * WIRE FORMAT (2026-10-03, the owner via vscode-mastermind — "no `at`, no dots: the path
 * is the NESTING"): a line nests one hop per level, each hop a property name or a child's
 * id — `{"k2": {"answers": {"add": {...}}}}` means "k2 → its answers list → add". There is
 * no wrapper key for a LIST'S OWN property name in the nesting (`Item.get()`, core/Item/
 * Item.js, finds a child by scanning every list the current node owns) — so a top-level
 * content item is addressed by `["content"]` (the page's own `content` property, found as
 * a NAME before anything is ever tried as an id), and an EXISTING item is addressed by its
 * bare id, `[id]`, found by `get()`'s cross-list id scan. Verified live against the real
 * replay engine (not just read from the design doc) — see doc/jsonl.md, "Agent tools".
 * `page_call`/`page_set` build this; `page_add` is sugar for the single most common call
 * (`page_call` with target `["content"]`, method `"add"`). */

// A dynamic import with a safe fallback — the same reasoning as Append.js: a broken
// checker degrades validation, never the whole tool. check() also reads page.jsonl's
// schema as `open: true` (.claude/hooks/jsonl-schema.mjs), so a nesting key nobody has
// named a verb for is simply data no verb claims, never a refusal.
let check = () => null;
try { ({ check } = await import("../../.claude/hooks/jsonl-schema.mjs")); } catch {}

/* `url` is a page's address ("/framework/ai/sessions/2026/10/02/page-tools/demo/"); its page.jsonl
 * sits one join away. Refuses anything that resolves outside public/ — the same gate
 * Append.js and Tail.js keep on the browser's own writes. */
function resolve_file(url, item = false){
	let pathname = String(url ?? "").replace(/^[\\/]+/, "");
	const named = /\.jsonl$/.test(pathname) ? path.basename(pathname) : null;   // a url may name the log itself
	if (named) pathname = path.dirname(pathname);
	const dir = path.resolve(PUBLIC, pathname);
	if (dir !== PUBLIC && !dir.startsWith(PUBLIC + path.sep)) return null;
	if (named) return path.join(dir, named);
	// Item tool only: task.jsonl beside a page.jsonl means a TASK folder (the page is its view); then session.jsonl; else the page.
	// A folder with a task.jsonl and no page.jsonl is a task for EVERY page tool (page_set, page_call, page_log): never a stray page.jsonl beside it.
	if (item || !fs.existsSync(path.join(dir, "page.jsonl"))) for (const name of ["task.jsonl", "session.jsonl"]) if (fs.existsSync(path.join(dir, name))) return path.join(dir, name);
	return path.join(dir, "page.jsonl");
}

/* ROUTE PATHS (2026-10-09, the page tool): an agent names the page it SEES, and this finds
 * the file behind it, even when none exists yet. Today one family of routes keeps its file
 * somewhere else: a session page, `/framework/ai/sessions/<id>/`, is drawn by a template
 * (ai/AISession/AISessionDetail.js) and its page.jsonl lives in the session's own dated
 * folder, `sessions/YYYY/MM/DD/<slug>/` (AISession.locate() makes one for a session that has
 * none). `<id>` is a session uuid or a Servex agent id (its registry row holds the uuid). A
 * deeper path, `/framework/ai/sessions/<id>/notes/`, is a tab built from a line in that same
 * file, so its segments go on the front of the target: ["notes", ...target]. Anything else
 * resolves the plain way above. Returns { file, target } or null. */
const SESSION_ROUTE = /^\/?framework\/ai\/sessions\/([^/]+)\/(.*)$/;
const SESSION_QUERIES = ["progress", "cost", "total_cost", "duration", "children", "summary", "completion", "rates", "unread"];   // Task.queries: answered from the record, never written
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* TYPO-PROOF SESSION PATHS (2026-10-24, core/Session/doc/identity.md "A typed id that drifts"): a session folder is made only by the
 * SessionStart hook, TaskDirs or a spawn, never because a path was typed. A session id or agent name this tool cannot find, and a
 * dated session folder that is not on disk, come back as { why } and nothing is written: an id that drifted by one character in an
 * agent's context would otherwise start a new folder. The answer names the nearest real id. Omitting `path` (your own page) types no id. */
const DATED_SESSION = /^\/?framework\/ai\/sessions\/(\d{4}\/\d{2}\/\d{2}\/[^/]+)(\/.*)?$/;
const OMIT = "Omit `path` to mean your own page.";

async function resolve(url, target = [], item = false){
	const hit = SESSION_ROUTE.exec(String(url ?? ""));
	// A real folder under sessions/ that is not a session (sessions/tasks/<task>/, a task's own home) is a plain path: only a typed name with nothing on disk is refused.
	const plain = hit && fs.existsSync(path.resolve(PUBLIC, "framework/ai/sessions", hit[1]));
	if (hit && !/^\d{4}$/.test(hit[1])){
		const file = await session_file(hit[1]);
		if (file?.why && !plain) return file;
		if (!file && !plain) return { why: `no session or Servex agent is called "${hit[1]}", so nothing was created. ${OMIT}` };
		if (file && !file.why){
			// A real subpage folder (made by pages.add) wins; a segment with no folder is still a tab target.
			let dir = path.dirname(file), rest = hit[2].split("/").filter(Boolean), at = file;
			while (rest.length && fs.existsSync(path.join(dir, rest[0], "page.jsonl"))){ dir = path.join(dir, rest[0]); at = path.join(dir, "page.jsonl"); rest = rest.slice(1); }
			return { file: at, target: [...rest, ...(target ?? [])] };
		}
	}
	const dated = DATED_SESSION.exec(String(url ?? "").replace(/\/[^/]+\.jsonl$/, "/"));
	if (dated){
		// The session folder must exist, and so must any folder inside it that is named (a subpage is made by pages.add, a task by tasks.add).
		const dir = path.resolve(PUBLIC, "framework/ai/sessions", dated[1], (dated[2] ?? "").replace(/^\/+/, ""));
		if (!fs.existsSync(dir)){
			const own = fs.existsSync(path.resolve(PUBLIC, "framework/ai/sessions", dated[1]));
			return { why: `"${url}" is not on disk, so nothing was created: a session folder is made only by the SessionStart hook, TaskDirs or a spawn, and a folder inside it by pages.add or tasks.add. Check the path for a typo${own ? "." : near_folder(dated[1])}` };
		}
	}
	const file = resolve_file(url, item);
	return file ? { file, target: target ?? [] } : null;
}

// The nearest real name to a typed one, as "; did you mean …?" or ".". A one-character drift is distance 1.
function distance(a, b){
	const d = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++){ let prev = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++){ const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; } }
	return d[b.length];
}
function nearest(typed, names){
	let best = null, bd = Infinity;
	for (const n of names){ const d = distance(typed, n); if (d < bd){ bd = d; best = n; } }
	return best && bd <= Math.max(2, Math.floor(typed.length / 6)) ? `; did you mean "${best}"?` : ".";
}
function near_folder(rel){
	const [y, m, d, name] = rel.split("/");
	let names = []; try { names = fs.readdirSync(path.join(PUBLIC, "framework/ai/sessions", y, m, d), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch {}
	return nearest(name, names);
}

// A transcript on this machine (~/.claude/projects/<dir>/<uuid> plus .jsonl): a session that has one is real even before its folder exists.
function has_transcript(uuid){
	const root = path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude", "projects");
	try { return fs.readdirSync(root).some(d => fs.existsSync(path.join(root, d, uuid + ".jsonl"))); } catch { return false; }
}

async function session_file(id){
	// A folder made here is named for the agent (its Servex id), not left as session-<id8> (brief: "sessions get a name").
	let uuid = UUID.test(id) ? id : null, name = uuid ? null : id, agents = {};
	try {
		const { default: Registry } = await import("./Registry.js"); agents = new Registry().read();
		if (!uuid) uuid = agents[id]?.session_id ?? null;
		else name = Object.entries(agents).find(([, a]) => a?.session_id === uuid)?.[0] ?? null;
	} catch {}
	if (!uuid) return { why: `no session or Servex agent is called "${id}", so nothing was created${nearest(id, Object.keys(agents))} ${OMIT}` };
	const slug = /^[a-z0-9][a-z0-9-]{2,60}$/.test(name ?? "") ? `${name}-${uuid.slice(0, 8)}` : undefined;
	const { default: AISession } = await import("../../public/framework/ai/AISession/AISession.js");
	if (!AISession.days.has(uuid)) AISession.scanned = false;   // a long-lived Servex: a folder made since the last scan must be found, never doubled
	await AISession.scan();
	// A uuid with no folder, no Servex agent and no transcript is not a session: refuse rather than make a folder for it.
	if (!AISession.days.has(uuid) && !name && !has_transcript(uuid))
		return { why: `no session ${uuid}: it has no folder, no transcript and no Servex agent, so nothing was created. Was the id typed${nearest(uuid, [...AISession.days.keys()]).replace(/^; d/, "? D").replace(/^\.$/, "?")} ${OMIT}` };
	const file = fileURLToPath(new URL("page.jsonl", await AISession.locate(uuid, undefined, slug)));
	// A brand-new folder says whose it is on its first line, so AISession.scan() finds it again (never a second folder).
	if (!fs.existsSync(file)){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify({ session: uuid, ts: new Date().toISOString() }) + "\n"); }
	return file;
}

// "This page" when an agent names none: its own session page. Servex passes the caller's
// agent id; a VS Code tab has none here, so it is told its path instead (the prompt hook).
const own_page = ctx => ctx?.caller && ctx.caller !== "owner" ? `/framework/ai/sessions/${ctx.caller}/` : null;

// Nests `payload` one level per step in `target`, innermost (the payload itself) last —
// `nest(["k2","answers"], {add: {...}})` → `{k2: {answers: {add: {...}}}}`. `nest([], x)`
// is `x` itself, flat — the exact same helper Store.js's own `wrap()` is, kept separate
// so this file never imports a browser module (core/Item/Store.js touches `location`).
function nest(target, payload){
	const path = [...(target ?? [])];
	return path.length === 0 ? payload : { [path[0]]: nest(path.slice(1), payload) };
}

/* ONE line, validated then appended — the same two steps Append.js takes for a browser's
 * line, so a page written by an agent and a page written by a live tab are written
 * identically. Throws with the refusal reason; the tool handlers turn that into
 * `{ok:false, why}` rather than letting the SDK wrap a raw exception. */
function write_line(file, line, own_check = false){
	let why = null;
	// own_check: the item tool already validated this line against its class (the task.jsonl schema is one-verb-per-line and has no by/ts).
	if (!own_check) try { why = check(file, line); } catch (e) { console.error("page_tools: check() threw, writing anyway:", e.message); }
	if (why) throw new Error(`refused: ${why}`);

	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.appendFileSync(file, JSON.stringify(line) + "\n");
	return size_of(file);
}

/* SIZE FEEDBACK (the owner, 2026-10-09 18:25): every write answers with the log's new size,
 * so the writer sees it growing. Past LARGE the answer says so; compaction is designed in
 * core/Page/doc/architecture.md ("Log growth"). */
const LARGE = 1024 * 1024;
function size_of(file){
	const buf = fs.readFileSync(file);
	let lines = 0;
	for (let i = 0; i < buf.length; i++) if (buf[i] === 10) lines++;
	return { file: path.relative(ROOT, file).replaceAll("\\", "/"), bytes: buf.length, lines, ...(buf.length > LARGE ? { large: true } : {}) };
}

/* Every `add` in a delta, at any depth, gets an id if it brought none — the agent never
 * invents ids (the owner, 2026-10-09: "the tool stamps those"). */
function stamp_ids(value, ids){
	if (Array.isArray(value)) return value.map(v => stamp_ids(v, ids));
	if (!is_plain(value)) return value;
	const out = {};
	for (const [key, v] of Object.entries(value)){
		if (key === "add" && is_plain(v)){
			const id = v.id ?? crypto.randomUUID();
			ids?.push(id);
			out[key] = { id, ...stamp_ids(v, ids) };
		} else out[key] = stamp_ids(v, ids);
	}
	return out;
}

/* A delta carries exactly what changed, at any depth: a nested plain object merges into the old one
 * key by key instead of replacing it (core/Page/doc/subpages.md, "Deep deltas"). Arrays and scalars replace. */
export function deep_merge(old, delta){
	if (!is_plain(old) || !is_plain(delta)) return delta;
	const out = { ...old };
	for (const [k, v] of Object.entries(delta)){
		if (k === "__proto__" || k === "constructor") continue;
		out[k] = is_plain(v) && is_plain(old[k]) ? deep_merge(old[k], v) : v;
	}
	return out;
}

const now = () => new Date().toISOString();
const is_plain = v => !!v && typeof v === "object" && !Array.isArray(v);

const tool = (name, description, properties, required, handler) =>
	({ name, description, inputSchema: { type: "object", required, properties }, handler });

const PAGE_PATH = { type: "string", description: "The page's url as the browser shows it, e.g. \"/framework/core/Page/tool/\" or a session page \"/framework/ai/sessions/<id>/\" (its file is found for you, even if none exists yet). Omit it to mean YOUR OWN page, /framework/ai/sessions/<your agent id>/." };
const TARGET = { type: "array", items: { type: "string" }, description: "The path to the target, as a list of hops — each one a property name (\"content\") or a child's id, never a string with slashes or dots. [] (or omit) targets the PAGE itself. [\"content\"] targets its content list. [\"k2\"] targets the existing item with id \"k2\", wherever it lives. [\"k2\",\"answers\"] walks into k2's own \"answers\" list." };

/* ---------- page_read's COMPUTED state (deliverable 2) ----------
 * No second copy of the page is ever stored: every call re-reads page.jsonl from disk and
 * replays it fresh, the same rule Item.Store.read() follows in the browser. This is a small,
 * deliberately partial replay — just enough to answer "what does this page say right now"
 * (title, content items one level deep, the log line), never the whole rendering engine
 * (core never needs the DOM to answer this). It understands both wire shapes: the current
 * nested one, and the old `{"at": "content", ...}` one (one release of compat, matching
 * core/Item/Item.js's own `apply()`), so a page that has lines from before 2026-10-03 still
 * reads correctly. */
function parse_lines(file){
	let text;
	try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
	return text.split("\n").filter(line => line.trim()).flatMap(line => {
		try { return [JSON.parse(line)]; } catch { return []; }
	});
}

function replay(lines){
	const page = { title: undefined, icon: undefined, description: undefined, log: undefined };
	const items = new Map();   // id -> item data (one level deep — a nested sub-list is kept as raw data)
	let order = [];            // ids, in order

	const insert_after = (id, after) => {
		order = order.filter(x => x !== id);
		if (after === null || (after === undefined && !order.length)) return void order.unshift(id);
		if (after === undefined) return void order.push(id);
		const at = order.indexOf(after);
		order.splice(at === -1 ? order.length : at + 1, 0, id);
	};

	const content_verbs = rest => {
		if (rest.add){
			const { after, ...data } = rest.add;
			items.set(data.id, { ...items.get(data.id), ...data });
			insert_after(data.id, after);
		}
		if (typeof rest.remove === "string"){ items.delete(rest.remove); order = order.filter(x => x !== rest.remove); }
		if (rest.clear){ items.clear(); order = []; }
		if (rest.move){ insert_after(rest.move.id, rest.move.after); }
		if (Array.isArray(rest.order)){
			const listed = rest.order.filter(id => items.has(id));
			order = [...listed, ...order.filter(id => !listed.includes(id))];
		}
	};

	// One line is "a key naming a method" (add/remove/move/order on `content`, or the special
	// `log`/`note` data fields) OR "a child's id" (merge into that item) OR plain page data —
	// Item.get()'s own order, replayed here without a live object to call `.get()` on.
	const apply_top = obj => {
		for (const key in obj){
			if (key === "constructor" || key === "__proto__" || key.startsWith("_")) continue;
			const value = obj[key];

			if (key === "content" && is_plain(value)){ content_verbs(value); continue; }
			if (key === "tab" && is_plain(value) && value.name){ (page.tabs ??= {})[value.name] = { ...page.tabs?.[value.name], ...value }; continue; }
			if (page.tabs?.[key] && is_plain(value)){ const t = page.tabs[key]; if (is_plain(value.content?.add)) (t.items ??= []).push(value.content.add); continue; }
			if (key === "by" || key === "ts") continue;
			if (items.has(key) && is_plain(value)){ items.set(key, deep_merge(items.get(key), value)); continue; }
			page[key] = value;
		}
	};

	for (const raw of lines){
		const line = Array.isArray(raw) ? raw : [raw];
		for (const entry of line){
			if (!entry || typeof entry !== "object") continue;

			// ⚠ compat only, one release (2026-10-03) — an old line routed its REST to
			// whatever `at` named; never written any more, only read.
			if ("at" in entry){
				const { at, ...rest } = entry;
				if (at === "content") content_verbs(rest);
				else if (typeof at === "string" && at.startsWith("content/")){
					const id = at.slice("content/".length);
					if (items.has(id)) items.set(id, { ...items.get(id), ...rest });
				}
				continue;
			}

			apply_top(entry);
		}
	}

	return { page, items: order.map(id => items.get(id)).filter(Boolean) };
}

// A registered-type item with `text` (+ optional `answer`) reads as a question card. Anything
// else falls back to its title, then its text, then its bare data — one line each.
function render_item(item){
	if (item.type === "Question" || ("text" in item && "answer" in item))
		return `Q: ${item.text} / A: ${item.answer ?? "…"}`;
	if (item.title) return item.title;
	if (item.text) return item.text;
	const { id, by, ts, after, type, ...data } = item;
	return Object.keys(data).length ? JSON.stringify(data) : "(empty)";
}

function render_markdown({ page, items }, subpages){
	const lines = [];
	lines.push(`# ${page.title ?? "(untitled)"}`);
	if (page.description) lines.push(page.description);
	if (page.log?.text) lines.push(`_doing: ${page.log.text}_`);
	const words = ["navigation", "width", "arrangement", "surface", "background", "type_size"].filter(w => page[w]).map(w => `${w}: ${page[w]}`);
	if (words.length) lines.push(`_layout: ${words.join(", ")}_`);
	for (const [name, t] of Object.entries(page.tabs ?? {})) lines.push(`- tab [${name}] ${t.title ?? name}${t.items?.length ? ` (${t.items.length} items)` : ""}`);

	lines.push("");
	lines.push("## Content");
	if (!items.length) lines.push("(empty)");
	else for (const item of items) lines.push(`- [${item.id}] (${item.type ?? "item"}) ${render_item(item)}`);

	if (subpages?.length){
		lines.push("", "## Subpages");
		for (const { name, url } of subpages) lines.push(`- ${name} ${url}`);
	}

	return lines.join("\n");
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Q/A as a small definition list; everything else as plain text — both escaped, both
// carrying the item's id as a data attribute, the one thing an agent needs to target it
// with a later page_set.
function render_item_html(item){
	const body = (item.type === "Question" || ("text" in item && "answer" in item))
		? `<dl><dt>Q</dt><dd>${esc(item.text)}</dd><dt>A</dt><dd>${esc(item.answer ?? "…")}</dd></dl>`
		: `<p>${esc(render_item(item))}</p>`;
	return `<li data-id="${esc(item.id)}" data-type="${esc(item.type ?? "item")}">${body}</li>`;
}

// The page's own CONTENT, as HTML — no nav, no tab strip, no sidebar: this never drew any
// chrome to begin with, so "without navigation chrome" costs nothing extra here. Structure
// an agent can parse (an id per `<li>`), not a styled page.
function render_html({ page, items }, subpages){
	const lines = [`<h1>${esc(page.title ?? "(untitled)")}</h1>`];
	if (page.description) lines.push(`<p>${esc(page.description)}</p>`);
	if (page.log?.text) lines.push(`<p class="muted">doing: ${esc(page.log.text)}</p>`);

	lines.push(items.length ? `<ul>${items.map(render_item_html).join("")}</ul>` : "<p>(empty)</p>");
	if (subpages?.length) lines.push(`<ul class="subpages">${subpages.map(s => `<li><a href="${esc(s.url)}">${esc(s.name)}</a></li>`).join("")}</ul>`);
	return lines.join("\n");
}

/* `{"pages":{"add":{name,title,icon,description}, "rename":{name,to}, "remove":"name"}}`:
 * folders sit beside the page's own page.jsonl, so a session page's subpage goes in the
 * session's own folder. Only on the page itself (no target): a subpage is a folder. */
function apply_pages(at, pages, url){
	if (at.target.length) return { why: "`pages` works on the page itself, not inside a target" };
	if (!is_plain(pages)) return { why: "`pages` must be {add|rename|remove: …}" };
	const subs = new Subpages(path.dirname(at.file)), base = String(url ?? "").replace(/\/?$/, "/"), done = [];
	try {
		for (const spec of [].concat(pages.add ?? [])){ subs.add(spec); done.push({ added: spec.name, url: base + spec.name + "/" }); }
		for (const spec of [].concat(pages.rename ?? [])){ subs.rename(spec); done.push({ renamed: spec.name, to: spec.to, url: base + spec.to + "/" }); }
		for (const name of [].concat(pages.remove ?? [])){ subs.remove(name); done.push({ removed: name }); }
		for (const spec of [].concat(pages.promote ?? [])){ new Promote(subs).promote(spec); done.push({ promoted: spec.id, url: base + spec.name + "/" }); }
	} catch (e){ return { why: e.message, done }; }
	return { done };
}

/* ---------- the item tool (plan section 4): page_set generalised to any Item class ----------
 * A delta is ONE log line, the object Item.set() takes; the file is replayed through the same
 * class code a browser would use. Only Task can be imported in node (Page touches the DOM,
 * Page touches the DOM), so Task and Session get the key refusals. */
const ITEM_PATH = { type: "string", description: "The item's url, e.g. a task folder \"/framework/ai/sessions/…/<slug>/\" (task.jsonl there wins over page.jsonl) or a page. Omit = your own session page." };
const ITEM_DESCRIPTION = "THE ITEM TOOL: `item({path, delta})`. `delta` is ONE log line, the exact object Item.set(delta) takes: a key naming a method calls it with the value as its arguments (`{\"start\":{}}`, `{\"wait\":{\"on\":\"owner\"}}`), a key naming a child walks into it (`{\"tasks\":{\"add\":{\"title\":\"x\"}}}`), any other key assigns. `\"a.b\": v` is shorthand for `{a:{b:v}}`. No `delta` = the current state. The first call per class also returns `instructions`; `{\"help\":{}}` returns them again.";

// improvements.jsonl: a folder's proposed fixes and moves, one nested Task each (Servex/agents/roles/mastermind.md, "Improvements").
const FILE_CLASS = { "task.jsonl": "Task", "session.jsonl": "Session", "page.jsonl": "Page", "improvements.jsonl": "Task" };
const LOADERS = {
	Task: async () => (await import("../../public/framework/core/Task/Task.js")).default,
	Session: async () => (await import("../../public/framework/core/Session/Session.js")).default,
	Process: async () => (await import("../../public/framework/core/Task/processes/index.js")).default,
};
/* The real Page, for the page files (LOADERS has only the Task family: Class.replay there means "a task"). The resolve hook lets Page.class.js
 * import in node (site-absolute imports map to public/); parts/kinds.js registers the part types, the ONE list the browser also imports. */
let page_loaded = null;
const page_class = () => page_loaded ??= (async () => {
	const { register } = await import("node:module");
	register(pathToFileURL(path.join(HERE, "site-hooks.mjs")).href);
	const { default: Page } = await import("../../public/framework/core/Page/Page.class.js");
	const { PART_TYPES } = await import("../../public/framework/core/Page/parts/kinds.js");
	return Object.assign(Page, { PART_TYPES });
})().catch(e => { console.warn(`item tool: Page.class.js did not import in node, so page lines are written unchecked (${e.message})`); return null; });
const CLASS_SOURCES = { Task: ["core/Task/Task.js", "core/Item/Item.js"], Session: ["core/Session/Session.js", "core/Item/Item.js"], Process: ["core/Task/Process.js", "core/Task/processes/index.js", "core/Task/Task.js", "core/Item/Item.js"] };
// Fields a Session line may carry: its identity, a title, and its tasks.
const SESSION_KEYS = ["id", "session", "title", "description", "module", "now", "tasks", "task", "by", "ts", "class", "place", "summary"];   // "place" and "summary": the voice assistant's lines (one per sentence; one per card of 2+ sentences) (ux/Dictate/doc/voice-assistant.md)

// Fields a Task line may carry beyond its getters (plan section 2) and the legacy line keys Task.replay reads.
const TASK_KEYS = ["id", "now", "title", "description", "state", "expected", "complete", "completion", "priority", "commits", "session", "session_id", "module", "tags", "tasks", "task", "path", "parent", "content", "mode", "waiting_on", "outcome", "why", "steps", "step", "checked_by", "verdict", "brief", "assign", "at", "log", "decision", "review", "note", "by", "ts"];

// A Process adds its own line-1 field and the lines only ProcessRunner writes (core/Task/doc/process.md).
const PROMPT_KEYS = [...TASK_KEYS, "raw", "paragraphs", "replies", "subject", "parts", "process", "handled", "text", "from"];   // core/Task/Prompt.js
const KEYS = { Task: TASK_KEYS, Session: SESSION_KEYS, Prompt: PROMPT_KEYS, Question: [...TASK_KEYS, "text", "from", "answer"], Process: [...TASK_KEYS, "process", "class", "spawn", "queue", "pulse", "measure"] };

const told = new Map();   // `${caller}|${class}` -> true once its instructions went out

// "a.b": v -> {a: {b: v}}, the only dot handling there is.
function expand_dots(delta){
	const out = {};
	for (const [key, value] of Object.entries(delta)){
		const parts = key.split(".");
		if (parts.length < 2 || parts.some(p => !p)){ out[key] = value; continue; }
		let at = out;
		for (const p of parts.slice(0, -1)) at = at[p] = is_plain(at[p]) ? at[p] : {};
		at[parts.at(-1)] = value;
	}
	return out;
}

function class_of(file){
	const first = parse_lines(file)[0];
	// A record that opens with {"session":{id,…}} is a session (a VS Code tab, a voice agent): Session, not Task, so it gets its cost and children.
	return (is_plain(first) && typeof first.class === "string" ? first.class : null) ?? (is_plain(first?.session) ? "Session" : null) ?? (SessionRecord.log_file(path.dirname(file)) === file ? "Task" : null) ?? FILE_CLASS[path.basename(file)] ?? "Page";
}

// describe() with each method's doc filled: the first `//` line of the comment block above it, from the class's source.
function describe_class(Class){
	const d = Class.describe();
	const text = (CLASS_SOURCES[d.class] ?? []).map(f => { try { return fs.readFileSync(path.join(PUBLIC, "framework", f), "utf8"); } catch { return ""; } }).join("\n");
	const lines = text.split("\n");
	for (const m of d.methods){
		const at = lines.findIndex(l => new RegExp(`^\\s*(static\\s+)?(async\\s+)?${m.name}\\s*\\(`).test(l));
		let top = at;
		while (top > 0 && /^\s*\/\//.test(lines[top - 1])) top--;
		if (at > 0 && top < at) m.doc = lines[top].replace(/^\s*\/\/\s?/, "");
	}
	return d;
}

const GRAMMAR = "delta = one log line. A key naming a method calls it with the value as arguments; a key naming a child item walks into it; any other key assigns. Keys starting with _ are refused.";

async function instructions_for(kind, Class){
	return Class ? { ...describe_class(Class), task_keys: KEYS[kind], grammar: GRAMMAR, rules: RULES } : { class: kind, grammar: GRAMMAR };
}

// The owner's grouping rules (Servex/doc/item-tool.md), returned beside describe() on the first call.
export const RULES = [
	"A refinement of an existing task goes into that task: add to its `tasks`, or set its fields. It does not become a new task.",
	"New tasks are only for new asks.",
	"A task stays in the session that files it (nested in that session's log). Tag the module with `module` so the module page can find it; give `home: \"<module>\"` only when the owner asked for a module home.",
	"An idea to keep beside a module while designing is a note, not a task.",
	"The tool files the session reference; never write it by hand.",
];


/* ---------- task homes (plan step 14a) ----------
 * `tasks.add` on a parent makes the child its own folder + task.jsonl and writes ONE reference line `{"task": "<app path>"}`
 * on the parent; replay resolves the reference (Task.from_ref). Home: <module>/tasks/<slug>/ when public/framework/<module>/
 * already exists (never created here), else <parent folder>/<slug>/. ctx.module_root overrides the module root (tests). */
const FRAMEWORK = path.join(PUBLIC, "framework");
const MODULE_NAME = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;
const app_path = dir => "/" + path.relative(PUBLIC, dir).split(path.sep).join("/") + "/";
// The class a new subtask is written as: a known task class it names (session-is-a-task: a Project, a Process, a child Session), else Task.
const task_type = a => ["Project", "Process", "Session", "Prompt", "Question"].includes(a?.type) ? a.type : "Task";
export const slug_of = text => Task.slug(text);   // one slug rule, Task's (a string added in the browser gets the same id)

// Which folder a new module task lives in, and its slug. Never suffixes: `taken` is true when the folder exists, and the caller refuses (offering `free`).
// A task stays where it is filed: nested in the filing session's (or parent's) task.jsonl. It gets a module folder ONLY when the add carries an explicit
// `home: "<module>"` (the owner asked for a module home, 2026-10-26). The call's path never picks one; `module` is just a tag a module page finds it by.
function task_home(parent_dir, add, root = FRAMEWORK, from_path = ""){
	const mod = typeof add.home === "string" ? add.home.replace(/^\/+|\/+$/g, "") : "";
	const mod_dir = MODULE_NAME.test(mod) ? path.join(root, mod) : null;
	if (!(mod_dir && fs.existsSync(mod_dir) && fs.statSync(mod_dir).isDirectory())) return null;
	const base = path.join(mod_dir, "tasks"), slug = slug_of(add.id ?? add.title);
	let free = slug;
	for (let n = 2; fs.existsSync(path.join(base, free)); n++) free = `${slug}-${n}`.replace(/^(.{0,40})(-\d+)$/, (_, a, b) => a.slice(0, 40 - b.length) + b);
	return { slug, free, taken: free !== slug, dir: path.join(base, slug), list: { dir: base, module: mod } };
}

export const PAGE_JS = ['import { TaskPage } from "/framework/core/Task/TaskPage.js";', "export default new TaskPage({ meta: import.meta });", ""].join(String.fromCharCode(10));

// Who asked, for line 1 of a new task: an explicit ctx.source (voice-app | vscode | dictate), else the calling agent. Node fills it; an agent never types it.
const SOURCES = ["voice-app", "vscode", "dictate"];
const source_of = ctx => { const who = ctx?.caller && ctx.caller !== "owner" ? ctx.caller : process.env.SERVEX_AGENT; return ctx?.source ?? (SOURCES.includes(who) ? who : who ? `servex:${who}` : undefined); };

// One add -> child folder with line 1, returns { id, path }. Fields come from the add (a legacy `data` object is flattened).
function make_child(parent_dir, add, ctx, home){
	const { type: _t, id: _i, after: _a, home: _h, data, ...fields } = add;
	const { slug, dir, list } = home;
	const child = path.join(dir, "task.jsonl"), url = app_path(dir);
	if (fs.existsSync(child)) throw new Error(`refused: ${app_path(dir)} already holds a task`);   // never overwrite
	const source = source_of(ctx), sess = ctx.caller && ctx.caller !== "owner" ? [{ id: ctx.caller, task: url }] : undefined;
	write_line(child, { id: slug, path: url, parent: app_path(parent_dir), ...(source ? { source } : {}), ...(sess ? { sessions: sess } : {}), ...data, ...fields, by: ctx.caller ?? "agent", ts: now() }, true);
	// Step 14b: the child's folder routes (TaskPage), and the module's list task holds a second reference to it.
	fs.writeFileSync(path.join(dir, "page.js"), PAGE_JS);
	if (list){
		const file = path.join(list.dir, "task.jsonl");
		if (!fs.existsSync(file)){
			write_line(file, { id: "tasks", path: app_path(list.dir), title: `${list.module} tasks`, mode: "parallel" }, true);
			TaskHomes.add(app_path(list.dir), ctx.caller ?? "agent");   // the new home joins /tasks/ (Server/TaskHomes.mjs)
		}
		write_line(file, { task: url, by: ctx.caller ?? "agent", ts: now() }, true);
	}
	return { id: slug, path: url };
}

/* A process (core/Task/doc/process.md) always gets its own folder inside the caller's folder, never a module home: line 1 and one
 * add per step come from the Process template (core/Task/processes/), and ProcessRunner starts it (hooks.changed). Refused: an unknown process, a taken slug. */
async function process_home(parent_dir, add){
	const Process = await LOADERS.Process();
	if (!Process.template(add.process) && !Process.from_steps(add.steps)) return { why: add.steps
		? "`steps` must be a non-empty list of {title, do, session?} with distinct titles (an id that is a line key or verb, like file or improve, gets -step added)"
		: `no process "${add.process}"; the processes are: ${Process.names().join(", ")}, or give your own \`steps\`` };
	const slug = slug_of(add.id ?? add.title), dir = path.join(parent_dir, slug);
	// A folder that only holds a brief is fine (write the brief, then start the process in it); one with a log is taken.
	if (["task.jsonl", "session.jsonl"].some(f => fs.existsSync(path.join(dir, f)))) return { why: `"${slug}" already holds a task in this folder; nothing was written. Give the process another id or title.` };
	return { slug, dir, list: null, process: Process };
}
function make_process(parent_dir, add, ctx, home){
	const [first, ...adds] = home.process.lines(add);
	const h = make_child(parent_dir, first, ctx, home), file = path.join(home.dir, "task.jsonl");
	for (const line of adds) write_line(file, { ...line, by: ctx.caller ?? "agent", ts: now() }, true);
	return { ...h, process: first.process, file };
}

/* DRAFT IN THE SESSION, THEN MOVE HOME (core/Task/doc/owner-2026-10-20-projects-and-completion.md §6). A task folder (a process once its
 * plan is approved) moves to <module>/tasks/<slug>/: git mv when tracked, else a rename. Then one line on each side:
 * - the task records its new path;
 * - the old parent and the module list reference the new path (a later reference with the same id replaces the earlier one, Task.js);
 * - the move is one {at, kind: "task", from, to, session} line in ai/sessions/task-moves.jsonl, the ledger Server/TaskMove.mjs keeps,
 *   so Server/TaskDirs.mjs redirects the old path and the move can be undone by hand.
 * Returns {from, to, file} or {why}. ProcessRunner calls it; the dated store's move_project is the same idea for project.jsonl folders. */
export const ledgers = { task_moves: path.join(PUBLIC, "framework", "ai", "sessions", "task-moves.jsonl") };   // a test points it at a scratch file
export async function move_home(file, module, by = "ProcessRunner"){
	const dir = path.dirname(path.resolve(file)), slug = path.basename(dir);
	const home = task_home(path.dirname(dir), { id: slug, home: module }, FRAMEWORK, "");
	if (!home) return { why: `no module folder public/framework/${module}` };
	if (path.resolve(home.dir) === dir) return { why: "already home" };
	if (fs.existsSync(home.dir)) return { why: `${app_path(home.dir)} already exists; the task stays in its session` };
	const from = app_path(dir), to = app_path(home.dir), rel = p => path.relative(ROOT, p).split(path.sep).join("/");
	const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
	const parent = (() => { try { return JSON.parse(lines[0]).parent; } catch { return null; } })();
	fs.mkdirSync(path.dirname(home.dir), { recursive: true });
	const { execFileSync } = await import("node:child_process");
	const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
	let tracked = false; try { tracked = !!git("ls-files", "--", rel(dir)); } catch {}
	if (tracked) git("mv", rel(dir), rel(home.dir)); else fs.renameSync(dir, home.dir);
	const nf = path.join(home.dir, "task.jsonl"), at = now();
	write_line(nf, { set: { path: to, parent: app_path(home.list.dir), moved_from: from }, by, ts: at }, true);
	const pf = parent ? resolve_file(parent, true) : null;
	if (pf && fs.existsSync(pf)) write_line(pf, { task: to, moved_from: from, by, ts: at }, true);
	const list = path.join(home.list.dir, "task.jsonl");
	if (!fs.existsSync(list)){
		write_line(list, { id: "tasks", path: app_path(home.list.dir), title: `${home.list.module} tasks`, mode: "parallel" }, true);
		TaskHomes.add(app_path(home.list.dir), by);
	}
	write_line(list, { task: to, by, ts: at }, true);
	record_new_folder(home.list.dir, slug);
	fs.appendFileSync(ledgers.task_moves, JSON.stringify({ at, kind: "task", from: rel(dir), to: rel(home.dir), session: parent ?? null, module, by, git: tracked }) + "\n");
	return { from, to, file: nf };
}

/* MOVE A TASK FOLDER INTO A SESSION (the owner, 2026-10-26: a task stays in the session that files it). The reverse of move_home: the folder
 * <module>/tasks/<slug>/ moves to <session folder>/<slug>/ (git mv when tracked), keeping id and history. Then one line on each side:
 * the task records its new path, parent and module tag; the session log and the old module list reference the new path (same id replaces
 * the old reference, Task.js), and the move is one line in task-moves.jsonl. dry = report only. Returns {from, to, file} or {why}. */
export async function move_to_session(file, session_url, by = "move_to_session", dry = false){
	const dir = path.dirname(path.resolve(file)), slug = path.basename(dir);
	const sfile = resolve_file(session_url, true), sdir = sfile && path.dirname(sfile);
	if (!sdir || !fs.existsSync(sfile)) return { why: `no session record at ${session_url}` };
	const to_dir = path.join(sdir, slug), mod = path.relative(FRAMEWORK, path.dirname(path.dirname(dir))).split(path.sep).join("/");
	if (path.basename(path.dirname(dir)) !== "tasks") return { why: "not in a <module>/tasks/ folder" };
	if (fs.existsSync(to_dir)) return { why: `${app_path(to_dir)} already exists` };
	const from = app_path(dir), to = app_path(to_dir), rel = p => path.relative(ROOT, p).split(path.sep).join("/");
	if (dry) return { from, to, dry: true };
	const { execFileSync } = await import("node:child_process");
	const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
	let tracked = false; try { tracked = !!git("ls-files", "--", rel(dir)); } catch {}
	if (tracked) git("mv", rel(dir), rel(to_dir)); else fs.renameSync(dir, to_dir);
	const nf = path.join(to_dir, "task.jsonl"), at = now();
	write_line(nf, { set: { path: to, parent: session_url, module: mod, moved_from: from }, by, ts: at }, true);
	write_line(sfile, { task: to, by, ts: at }, true);
	const list = path.join(path.dirname(dir), "task.jsonl");
	if (fs.existsSync(list)) write_line(list, { task: to, moved_from: from, by, ts: at }, true);
	fs.appendFileSync(ledgers.task_moves, JSON.stringify({ at, kind: "task", from: rel(dir), to: rel(to_dir), session: session_url, module: mod, by, git: tracked }) + String.fromCharCode(10));
	await record_new_folder(sdir, slug);
	return { from, to, file: nf };
}

/* MOVE A NESTED TASK HOME (owner prompts become tasks, 2026-10-22): a proposal drafted as lines in a session's record
 * (`{"tasks":{"add":…}}` in session.jsonl), once approved, gets its own folder <module>/tasks/<slug>/: line 1 carries its data,
 * the session gets a same-id `{task}` reference (which replaces the nested child, core/Session/Session.js), the module list
 * references it, and task-moves.jsonl records the move. Same steps as move_home above, for a task that had no folder yet.
 * Returns {from, to, file} or {why}. PromptTasks.sweep() calls it. */
export async function move_nested_home(record, id, module, by = "PromptTasks"){
	const file = path.resolve(record);
	const { default: Session } = await import("../../public/framework/core/Session/Session.js");
	const kid = Session.replay(parse_lines(file))._tasks?.find(id);
	if (!kid) return { why: `"${id}" is not a task in ${app_path(path.dirname(file))}` };
	if (kid.data.path) return { why: "already has its own folder" };
	const home = task_home(path.dirname(file), { id, home: module }, FRAMEWORK, "");
	if (!home) return { why: `no module folder public/framework/${module}` };
	if (fs.existsSync(home.dir)) return { why: `${app_path(home.dir)} already exists; the task stays in its session` };
	const moved = await move_item({ from: app_path(path.dirname(file)), id, to: app_path(home.dir), by, module });   // the one mover: history, reference, ledger
	if (moved.why) return moved;
	const at = now(), to = moved.to;
	const list = path.join(home.list.dir, "task.jsonl");
	if (!fs.existsSync(list)){
		write_line(list, { id: "tasks", path: app_path(home.list.dir), title: `${home.list.module} tasks`, mode: "parallel" }, true);
		TaskHomes.add(app_path(home.list.dir), by);
	}
	write_line(list, { task: to, by, ts: at }, true);
	record_new_folder(home.list.dir, home.slug);
	return moved;
}

/* MOVE AN ITEM TO A NEW HOME (core/Item/tasks/item-move/design.md): a subtask written as lines in a parent's log moves to the folder
 * `to` (a url) with its id, its whole history (each line keeps its by/ts) and ONE reference left behind:
 * {"task": to, "as": id, "moved_from": "<from>#<id>"}, which Task/Session replay swap for the nested child (same id).
 * Order: check everything, then write the new file, the old-home reference and the ledger line. A refusal writes nothing.
 * Returns {from, to, file} or {why}. Callers: the item tool's `move` key, open_task (handoff), move_nested_home. */
// `entry` ({type, spawn}, a spawn's handoff): the reference left behind is the Session entry, so the subtask is upgraded in place.
export async function move_item({ from, id, to, by = "agent", module, entry = null } = {}){
	const pf = resolve_file(from, true), dir = typeof to === "string" ? path.resolve(PUBLIC, to.replace(/^[\\/]+/, "")) : null;
	if (!pf || !fs.existsSync(pf)) return { why: `no record at ${from}` };
	if (!dir || !dir.startsWith(PUBLIC + path.sep)) return { why: `"${to}" is not a folder under public/` };
	const kind = path.basename(pf) === "session.jsonl" ? "Session" : class_of(pf);   // Session, not Task: it reads the owner's {decide} lines, which change a child without naming it
	const Class = LOADERS[kind] ? await LOADERS[kind]().catch(() => null) : null;
	if (!Class?.replay) return { why: `${from} is not a Task or Session record` };
	link_refs(await LOADERS.Task());
	const Task = await LOADERS.Task(), plines = parse_lines(pf), kid = Class.replay(plines)._tasks?.find(id);
	if (!kid) return { why: `"${id}" is not a task in ${from}` };
	if (kid._own_file) return { why: `"${id}" already lives in its own file (${kid._own_file})` };
	if (path.resolve(path.dirname(pf)) === dir) return { why: "already home" };
	// 2. The history: every line that addresses the child, in order, each with its own by/ts.
	const hist = [], parent_url = app_path(path.dirname(pf)), moved_from = `${parent_url}#${id}`, url = app_path(dir);
	for (const l of plines){
		const { by: b, ts, ...body } = l, stamp = { ...(b !== undefined ? { by: b } : {}), ...(ts !== undefined ? { ts } : {}) };
		const adds = is_plain(body.tasks) ? [].concat(body.tasks.add ?? []).filter(a => is_plain(a) && a.id === id) : [];
		for (const a of adds){
			const { type: _t, id: _i, after: _a, data, ...fields } = a;
			hist.push({ id, path: url, parent: parent_url, set: { ...data, ...fields }, moved_from, ...stamp });
		}
		if (is_plain(body.tasks) && is_plain(body.tasks[id])) hist.push({ ...body.tasks[id], ...stamp });
		if (is_plain(body[id])) hist.push({ ...body[id], ...stamp });
	}
	if (!hist.length) return { why: `no lines address "${id}" in ${from}` };
	// 3. Check before writing: replay the history alone and compare with the live child; a snapshot closes any gap.
	const SKIP = new Set(["path", "parent", "moved_from"]), plain = d => Object.fromEntries(Object.entries(d).filter(([k]) => !SKIP.has(k)));   // (two replays stamp `started_at` etc. from the clock, so *_at keys are compared by presence only)
	const same = (a, b) => { const A = plain(a), B = plain(b), keys = new Set([...Object.keys(A), ...Object.keys(B)]); return [...keys].every(k => /_at$/.test(k) ? (k in A) === (k in B) : JSON.stringify(A[k]) === JSON.stringify(B[k])); };
	const back = Task.replay(hist);
	if (!same(back.data, kid.data) || back.state !== kid.state){
		const set = { ...plain(kid.data), ...(back.state !== kid.state ? { state: kid.state } : {}) };
		hist.push({ set, snapshot: true, by, ts: now() });
	}
	// 4. The new home, written BEFORE the reference: if the reference write failed, the task would show in both places (never lost). A folder with a log already (open_task's assign line) gets the history after it.
	const nf = SessionRecord.start_file(dir, hist[0]), rel = p => path.relative(ROOT, p).split(path.sep).join("/");
	fs.mkdirSync(dir, { recursive: true });
	fs.appendFileSync(nf, hist.map(l => JSON.stringify(l) + "\n").join(""));
	if (!fs.existsSync(path.join(dir, "page.js"))) fs.writeFileSync(path.join(dir, "page.js"), PAGE_JS);
	// 5. The old home: one reference, with the id it had here. 6. The ledger.
	const at = now();
	write_line(pf, { task: url, as: id, ...(entry?.type ? { type: entry.type } : {}), ...(entry?.spawn ? { spawn: entry.spawn } : {}), moved_from, by, ts: at }, true);
	fs.mkdirSync(path.dirname(ledgers.task_moves), { recursive: true });
	fs.appendFileSync(ledgers.task_moves, JSON.stringify({ at, kind: "task", from: `${rel(pf)}#${id}`, to: rel(dir), session: parent_url, ...(module ? { module } : {}), by, git: false }) + "\n");
	return { from: moved_from, to: url, file: nf };
}

/* Requests are logged items (Servex/agents/doc/messaging.md). After a write: each new request goes to its receiver, and each
 * request this write completed goes back to whoever asked (`from`), with its outcome. A completion is a `complete` line on a nested
 * child ({"<id>": {"complete": …}}, or a target of [<id>]), or on a request that has its own folder (the file's own root). */
function notify_requests(live, at, body, requests, by){
	for (const r of requests) if (hooks.requested && r.to) Promise.resolve(hooks.requested(r)).catch(() => {});   // a log with no agent (a VS Code tab's session) has nobody to tell
	if (!hooks.answered) return;
	const done = [];
	if (at.target.length === 1 && body.complete !== undefined) done.push(live._tasks?.find(at.target[0]));
	else if (!at.target.length){
		if (body.complete !== undefined) done.push(live);
		for (const [k, v] of Object.entries(body)) if (is_plain(v) && v.complete !== undefined) done.push(live._tasks?.find(k));
	}
	for (const t of done){
		const from = t?.get_one("from");
		if (!from || from === by || from === "owner" || t.state !== "complete") continue;   // the owner sees it on the page
		Promise.resolve(hooks.answered({ to: from, by, id: t.id, title: t.get_one("title") ?? t.id, outcome: t.get_one("outcome") ?? null, path: t === live ? (live.get_one("path") ?? app_path(path.dirname(at.file))) : app_path(path.dirname(at.file)) })).catch(() => {});
	}
}

// Node's resolver for Task.from_ref: an app path -> that folder's parsed task.jsonl, or null. While a root is being replayed, `collect` gathers every child file it read.
let collect = null;
const sig = file => { try { const st = fs.statSync(file); return `${st.size}:${st.mtimeMs}`; } catch { return "none"; } };
/* RECOMPUTE ONLY WHAT CHANGED: a child record's parsed lines are kept by file and reused while the file keeps the same size and mtime, so
 * reading a session re-reads and re-parses only the child files that changed. Each replay still builds fresh task objects from those lines
 * (a cached object would get the parent's lines addressed to it applied again), and every total is computed on read. */
const parsed = new Map();
function lines_of(file){
	const s = sig(file), hit = parsed.get(file);
	if (hit && hit.sig === s) return hit.lines;
	const lines = parse_lines(file);
	if (parsed.size > 4000) parsed.clear();   // bounded: a long-lived Servex never holds every child file it ever read
	parsed.set(file, { sig: s, lines });
	return lines;
}
export function link_refs(Task){
	Task.session_resolver ??= ref => { const dir = path.resolve(PUBLIC, String(ref ?? "").replace(/^[\/]+/, "")); return dir.startsWith(PUBLIC + path.sep) && path.basename(SessionRecord.file(dir) ?? "") === "session.jsonl"; };   // Task.children: does this folder hold a session record
	Task.resolver ??= ref => {
		const dir = path.resolve(PUBLIC, String(ref).replace(/^[\/]+/, ""));
		if (!dir.startsWith(PUBLIC + path.sep)) return null;
		const file = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
		collect?.push([file, sig(file)]);
		return fs.existsSync(file) ? lines_of(file) : null;
	};
}

/* ONE LIVE INSTANCE PER FILE (plan, Amendments 4): the root is replayed once into `Item.Store.for(url)` and every later call on the
 * path reaches that same object. It is advanced with the line the tool just wrote (the same replay_line a browser's Store.read runs),
 * never re-read, unless the file (or a child file it replayed) changed on disk from outside: size/mtime differ -> replay again. */
function live_root(Class, file){
	const store = Class.Store.for("/" + path.relative(PUBLIC, file).split(path.sep).join("/"));
	if (store.host && store.sig === sig(file) && store.deps.every(([f, s]) => sig(f) === s)) return store.host;
	const deps = [];
	collect = deps;
	let root;
	try { root = Class.replay(parse_lines(file)); } finally { collect = null; }
	Object.assign(store, { host: root, sig: sig(file), deps, file });
	root.store = store;
	root.at_path = "/" + path.relative(PUBLIC, path.dirname(file)).split(path.sep).join("/") + "/";   // a session record has no `path` field: its cost is looked up by its folder
	return root;
}

// The line was appended; move the cached root forward with it and re-stamp the file's signature.
function advance(root, line){
	collect = root.store.deps;   // a {task} / {file} line reads a child file: watch it too
	try { root.replay_line(line); } catch (e) { root.store.host = null; throw e; } finally { collect = null; }
	root.store.sig = sig(root.store.file);
}

/* A line that would break replay is refused BEFORE it is written (a getter-only field in a child add, e.g. `commits`, once made a log
 * unreadable). The line is replayed on the live root first; a throw drops the cached root (it is half-changed) and the file never sees the line. */
class Refused extends Error {}
function try_line(root, line){
	collect = root.store.deps;
	try { root.replay_line(line); } catch (e) { root.store.host = null; throw new Refused(`this line would not replay (${e.message})`); } finally { collect = null; }
}

/* A row per child task: its state, and (2026-10-23, the session snapshot) what it cost and how long it ran, both computed from the
 * records (Task.cost reads the agents' logs through Task.cost_resolver; duration from the lines' own times). */
function row_of(t){
	const cost = Number(t.cost) || 0, ran_ms = typeof t.duration === "function" ? t.duration() : 0;
	return { id: t.id, title: t.get_one("title"), state: t.state, ...(cost ? { cost: Math.round(cost * 100) / 100 } : {}), ...(ran_ms > 0 ? { ran_ms } : {}),
		...(t.data?.completed_at ? { completed_at: t.data.completed_at } : {}), ...(t.state === "stopped" && t.data?.why ? { why: String(t.data.why).slice(0, 80) } : {}) };
}

// Every task in a tree, each once (a session's cost sums each task's own agents once, so nothing counts twice).
function every_task(list, out = []){ for (const t of list ?? []){ out.push(t); every_task(t._tasks, out); } return out; }

/* What a task tree holds, by state: created (every task), started (it ran: start() stamped started_at, or it is past idle and not
 * stopped), complete and stopped. A task stopped before it ever ran is not started. */
function counts(list){
	const c = { created: list.length, started: 0, complete: 0, stopped: 0 };
	for (const t of list){ if (t.data?.started_at || !["idle", "stopped"].includes(t.state)) c.started++; if (t.state === "complete") c.complete++; if (t.state === "stopped") c.stopped++; }
	return c;
}

/* Child sessions as a tree: an agent whose parent is also in the list sits under it; each node has its own cost and its subtree total. */
export function nest_agents(agents){
	const by = new Map(agents.map(a => [a.id, { ...a, children: [] }])), roots = [];
	// A voice session's fast seat is counted under its smart seat (same parent_session); both keep parent "sessions" for events (Sessions.js).
	const smart = new Map([...by.values()].filter(a => a.role === "session-smart" && a.parent_session).map(a => [a.parent_session, a]));
	for (const a of by.values()){
		const seat = /^(session-fast|voice-assistant)$/.test(a.role) ? smart.get(a.parent_session) : null;
		(seat && seat !== a ? seat : by.get(a.parent))?.children?.push(a) ?? roots.push(a);
	}
	const sum = a => (a.total = r2(a.cost + a.children.reduce((s, k) => s + sum(k), 0)));
	roots.forEach(sum);
	return roots;
}
const r2 = n => Math.round(n * 100) / 100;

/* The session's own Claude cost and active time: the newest summary in its folder's cache.jsonl, which AISessionIndex keeps current from
 * the transcript (new bytes only; ai/AISession/AISession.js, verified against the SDK's billing). Stamped with where it read to. */
function own_cost(dir){
	// The file grows by a summary per index pass (4 MB for a long tab), so read back from its end until a summary line turns up.
	let m = null, at = null, fd = null;
	try {
		const file = path.join(dir, "cache.jsonl"), size = fs.statSync(file).size; fd = fs.openSync(file, "r");
		for (let n = 64 * 1024; !m; n *= 4){
			const len = Math.min(n, size), buf = Buffer.alloc(len); fs.readSync(fd, buf, 0, len, size - len);
			const line = buf.toString("utf8").split("\n").filter(l => l.startsWith('{"summary"')).at(-1);
			if (line){ const o = JSON.parse(line); m = o.summary; at = o.at; }
			if (len === size) break;
		}
	} catch {} finally { if (fd !== null) fs.closeSync(fd); }
	return m ? { usd: r2(m.usd ?? 0), parts: Object.fromEntries(Object.entries(m.usd_parts ?? {}).map(([k, v]) => [k, r2(v)])), active_ms: m.active_ms ?? 0, models: m.main_models ?? {},
		through: m.last_at ?? null, read_to: m.cursor?.main?.off ?? null, at } : null;
}

/* A session's whole picture (2026-10-23, "session data, complete"; core/Session/readme.md, "What item() answers"):
 * its own cost (own_cost), its child sessions nested with their costs, the tasks' costs, its span, and task counts. */
export function session_state(task, tasks = []){
	// A task's cost is its folder's agents, so two tasks naming one folder (a task and its re-filed twin) count it once.
	const all = every_task(task._tasks), seen = new Set(), costed = all.filter(t => Number(t.cost) > 0 && !seen.has(t.get_one("path")) && seen.add(t.get_one("path")));
	const task_cost = costed.reduce((s, t) => s + t.cost, 0);
	// Its agents: those whose task is in its folder, and (by its uuid) those it spawned anywhere since it began.
	const dir = task.store?.file ? path.dirname(task.store.file) : null, uuid = /^[0-9a-f]{8}-/.test(task.id ?? "") ? task.id : null;
	const agents = dir ? (task.constructor.agents_resolver?.(dir, { session_id: uuid, since: task.first_at ? new Date(task.first_at).toISOString() : null }) ?? []) : [];
	/* THE THREE COSTS (session-is-a-task item 32): own, children = the sum of each child's total, total = own + children. Computed on read.
	 * Own is the tab's transcript (cache.jsonl), else, for a spawned agent's record, the agents whose task is this folder. Children come from the
	 * Session entries first (entry_children); an agent with no entry yet (not backfilled) still counts through the registry (`agents`), once. */
	const at = task.constructor.agents_at_resolver, counted = new Set();
	let own = dir ? own_cost(dir) : null;
	if (!own && dir && at){ const mine = at(app_path(dir)); mine.forEach(a => counted.add(a.id)); if (mine.length) own = { usd: r2(mine.reduce((s, a) => s + a.cost, 0)), agents: mine.map(a => a.id) }; }
	const entries = entry_children(task, at, counted);
	const unlinked = nest_agents(agents.filter(a => !counted.has(a.id))).map(a => ({ ...a, agent: a.id, linked: false }));
	const child_cost = entries.reduce((s, c) => s + c.total, 0) + unlinked.reduce((s, a) => s + (a.total || 0), 0);
	const biggest = costed.sort((a, b) => b.cost - a.cost).slice(0, 5).map(t => ({ id: t.id, title: t.get_one("title"), cost: r2(t.cost), state: t.state }));
	return { class: "Session", id: task.id, completion: task.completion, progress: task.progress(), rates: task.rates(), first_at: task.first_at, last_at: task.last_at, span_ms: task.span_ms,
		cost: { total: r2((own?.usd ?? 0) + child_cost), own, children: r2(child_cost), tasks: r2(task_cost) },
		counts: { direct: counts(task._tasks ?? []), all: counts(all), children: { entries: count_entries(entries), unlinked: agents.filter(a => !counted.has(a.id)).length } },
		biggest, children: [...entries, ...unlinked], agents: agents.length,
		// Its own turns bucketed by the task open at the time (Task.attribute); null when no per-turn record exists (a VS Code tab today).
		by_task: (turns => turns.length ? task.attribute(turns) : null)(task.constructor.turns_resolver?.(uuid) ?? []), data: { ...task.data }, tasks };
}

/* The child sessions as a tree, from the entries (Task.sessions_below: a Session entry at any depth of the task tree, under its cause).
 * Each: its own cost (the agents whose task is its folder; `counted` collects their ids so the registry fallback never counts them again),
 * its own children the same way, and its total. Rows keep the registry rows' shape (id, state, role, session_id, cost, total, children). */
function entry_children(node, at, counted){
	return node.sessions_below().map(kid => {
		const p = kid.get_one("path"), spawn = kid.get_one("spawn") ?? null, mine = (at?.(p) ?? []).filter(a => !counted.has(a.id));
		mine.forEach(a => counted.add(a.id));
		const cost = r2(mine.reduce((s, a) => s + a.cost, 0)), children = entry_children(kid, at, counted);
		return { id: kid.id, title: kid.get_one("title") ?? kid.id, state: kid.state, path: p, linked: true,
			agent: spawn?.agent ?? kid.get_one("agent") ?? mine[0]?.id ?? null, role: spawn?.role ?? kid.get_one("role") ?? null,
			session_id: spawn?.session_id ?? kid.get_one("session") ?? null, spawn, cost, total: r2(cost + children.reduce((s, c) => s + c.total, 0)), children };
	});
}
const count_entries = list => list.reduce((n, c) => n + 1 + count_entries(c.children), 0);

function task_state(Task, task){
	const tasks = [...(task._tasks ?? [])].map(row_of);
	if (Task.name === "Process") return { class: "Process", process: task.process, state: task.state, step: task.step?.id ?? null, next: task.next(), completion: task.completion, data: { ...task.data }, tasks: [...(task._tasks ?? [])].map(t => ({ id: t.id, title: t.get_one("title"), state: t.state, outcome: t.get_one("outcome") ?? null })) };
	if (Task.name === "Session") return session_state(task, tasks);
	// A task an agent works (its record names the session): that agent's turns bucketed by the subtask open at the time (Task.attribute).
	const sid = task.session, turns = sid && Task.turns_resolver ? Task.turns_resolver(sid) : [];
	return { class: "Task", state: task.state, completion: task.completion, ...(turns.length && task._tasks?.length ? { by_task: task.attribute(turns) } : {}), data: { ...task.data }, tasks };
}

// The first task verb anywhere in a delta ({"tasks":{"<id>":{"start":{}}}} -> "start"), or null.
const TASK_VERBS = new Set(["start", "pause", "resume", "stop", "complete", "finish", "wait", "approve", "improve", "reject", "check"]);
function verb_in(delta){
	if (!is_plain(delta)) return null;
	for (const [k, v] of Object.entries(delta)){
		if (TASK_VERBS.has(k)) return k;
		const deeper = k === "add" ? null : verb_in(v);   // a new task's own fields are not a verb call
		if (deeper) return deeper;
	}
	return null;
}

/* HONEST COMPLETION (core/Task/doc/resolution.md, section 6): every complete/finish call in a delta, as its argument object.
 * A bare string or empty value counts as a call with no evidence. A new task's own fields ("add") are not a call. */
function complete_calls(delta, out = [], trail = []){
	if (!is_plain(delta)) return out;
	for (const [k, v] of Object.entries(delta)){
		if (k === "complete" || k === "finish") out.push({ args: v, trail });
		else if (k !== "add") complete_calls(v, out, k === "tasks" ? trail : [...trail, k]);
	}
	return out;
}
// The task a target (then a trail of child ids) names, walking `_tasks` one id at a time; the deepest one found (a Question's own rules apply to it, not the session's).
function node_at(root, ...paths){
	let node = root;
	for (const id of paths.flat()){ const kid = node?._tasks?.find(id); if (!kid) return node; node = kid; }
	return node;
}

/* A task that completes with caveats tells its parent: one line on the parent's log (the session or task SessionRecord.parent_log finds),
 * naming the task and what was asked and not done. Returns the log written, or null. */
export function tell_parent_caveats(task_dir, caveats, by = "node"){
	const list = [].concat(caveats ?? []).filter(c => String(c ?? "").trim());
	if (!list.length) return null;
	const log = SessionRecord.parent_log(task_dir);
	if (!log) return null;
	write_line(log, { note: { id: "caveats-" + path.basename(task_dir), msg: `${app_path(task_dir)} completed with caveats: ${list.join("; ")}` }, by, ts: now() }, true);
	return log;
}

/* QUERIES (class `static queries`): a delta whose keys are all queries runs them and writes nothing. `{"cost":{}}`, `{"summary":{}}`,
 * and into a child by `target` or by id: `{"tasks":{"<id>":{"cost":{}}}}` or `{"<id>":{"cost":{}}}`. A query's value is its argument:
 * {} / true / null = none, an array = the arguments, any other object = one argument. */
function query_args(arg){ return Array.isArray(arg) ? arg : is_plain(arg) && Object.keys(arg).length ? [arg] : []; }
// A Session's queries are answered here, from session_state (its one picture), because its cost needs node: own_cost reads cache.jsonl.
// `completion` is the one tally every Task-family node answers: its tasks' current states and the number computed from them.
const TALLY = n => ({ stopped: 0, ...n.progress(), completion: n.completion });
const NODE_QUERIES = { Session: { progress: n => n.progress(), cost: n => session_state(n, []).cost, children: n => session_state(n, []).children, summary: n => session_state(n, []) } };
function walk_queries(node, delta, trail = "", out = { answer: {}, queried: false, other: [], set: [] }){
	const into = (kid, sub, here, put) => { const r = walk_queries(kid, sub, here); out.queried ||= r.queried; out.other.push(...r.other); out.set.push(...r.set); if (r.queried) put(r.answer); };
	for (const [key, arg] of Object.entries(delta)){
		const here = trail ? `${trail}.${key}` : key;
		const node_query = NODE_QUERIES[node.constructor.name]?.[key] ?? (key === "completion" && node.constructor.queries?.includes(key) ? TALLY : null);
		if (key === "summary" && is_plain(arg) && "card" in arg){ out.other.push(here); continue; }   // {summary:{card,text}} is the voice assistant's LINE (ux/Dictate/doc/voice-assistant.md), not the summary query
		if (node_query || node.constructor.queries?.includes(key)){
			out.queried = true;
			if (typeof arg === "string" || typeof arg === "number" || arg === false){ out.set.push(here); continue; }   // a value is an attempt to SET a read-only key
			if (node_query){ out.answer[key] = node_query(node); continue; }
			const v = node[key];
			out.answer[key] = typeof v === "function" ? v.apply(node, query_args(arg)) : v;
		} else if (key === "tasks" && is_plain(arg) && !LIST_VERBS.some(v => v in arg)){
			for (const [id, sub] of Object.entries(arg)){
				const kid = is_plain(sub) ? node._tasks?.find(id) : null;
				if (kid) into(kid, sub, `${here}.${id}`, a => ((out.answer.tasks ??= {})[id] = a));
				else out.other.push(`${here}.${id}`);
			}
		} else if (is_plain(arg) && node._tasks?.find(key)) into(node._tasks.find(key), arg, here, a => (out.answer[key] = a));
		else out.other.push(here);
	}
	return out;
}
const LIST_VERBS = ["add", "remove", "move", "order", "clear"];

// null = not a query delta (run it as a change); {ok:false} = a mix, refused; else the answer. Nothing here writes.
function ask(root, target, delta){
	let node = root;
	for (const id of target){ node = node._tasks?.find(id); if (!node) return { ok: false, why: `no task "${id}" under this path to ask` }; }
	const r = walk_queries(node, delta);
	if (!r.queried) return null;
	if (r.set.length) return { ok: false, why: `${r.set.join(", ")} ${r.set.length > 1 ? "are queries" : "is a query"}: ${r.set.length > 1 ? "they only read" : "it only reads"} and cannot be set (give {} or an argument object). Nothing was written.` };
	if (r.other.length) return { ok: false, why: `this delta asks (${Object.keys(r.answer).join(", ")}) and also changes (${r.other.join(", ")}). A delta either asks or changes: send two calls. Nothing was written.` };
	return { ok: true, answer: r.answer };
}

function refusal(why, Class){
	const d = describe_class(Class);
	return { ok: false, why, exists: [...d.methods.map(m => m.name), ...new Set([...d.fields, ...(KEYS[Class.name] ?? [])])] };
}

// Task and Session: a top-level key must be a public method, a known field, or an existing child.
function validate(Task, task, delta){
	const known = new Set([...Task.describe().fields, ...(KEYS[Task.name] ?? []), "folder"]);
	for (const key of Object.keys(delta)){
		if (key === "help") continue;
		if (key.startsWith("_")) return refusal(`"${key}" starts with _ (private)`, Task);
		if (typeof task[key] === "function" || known.has(key) || task.get(key) !== undefined || task.member?.(key) !== undefined) continue;   // member: a child by id (get() no longer searches lists)
		return refusal(`"${key}" names no method, field or child of ${Task.name}`, Task);
	}
	return null;
}

/* A page line is tried on a REAL Page before it is written: a private key or a part type nobody registered is refused, and the page's own
 * log plus the new line must replay. Only `part-*` types are checked: a page also holds plain data typed "card", "note", "request", "task"…
 * (in use today), which no class claims. Returns {ok:false, why} or null. */
function bad_page_delta(Page, node, trail = ""){
	if (Array.isArray(node)) { for (const n of node){ const why = bad_page_delta(Page, n, trail); if (why) return why; } return null; }
	if (!is_plain(node)) return null;
	for (const [key, value] of Object.entries(node)){
		if (key.startsWith("_") || key === "constructor" || key === "prototype") return `"${trail}${key}" is private (keys starting with _ are never written)`;
		if (key === "type" && typeof value === "string" && value.startsWith("part-") && !Page.types.has(value)) return `unknown part type "${value}" (the part types are: ${Page.PART_TYPES.join(", ")})`;
		const why = bad_page_delta(Page, value, `${trail}${key}.`);
		if (why) return why;
	}
	return null;
}
async function page_refusal(at, delta){
	const Page = await page_class();
	if (!Page) return null;   // a broken Page degrades the check, never the tool
	let why = bad_page_delta(Page, delta);
	if (!why) try { Page.replay([...parse_lines(at.file), nest(at.target, delta)]); } catch (e) { why = `the page would not replay with this line (${e.message})`; }
	return why ? { ok: false, why: `${why}. Nothing was written.` } : null;
}

// A new folder is one more line in its parent's files.jsonl, through ModuleLog (a failure here never fails the write).
async function record_new_folder(parent, name){
	try { (await import("../../Server/ModuleLog.mjs")).default.record(parent, `${name}/page.js`); } catch {}
}

/* `{"folder":"<child id>"}`: a nested subtask gets its OWN folder on demand. The child's line 1 carries its current data; the parent
 * records {"file":"<id>/task.jsonl"} and replay swaps the nested child for that file. A child with subtasks of its own is refused (give those a folder first). */
async function give_folder(root, at, ids, ctx){
	const parent_dir = path.dirname(at.file), made = [], by = ctx.caller ?? "agent";
	for (const id of [].concat(ids)){
		const kid = root._tasks?.find(String(id));
		if (!kid) return { why: `"${id}" is not a subtask of this task` };
		if ([...(kid._tasks ?? [])].length) return { why: `"${id}" has subtasks of its own; give them folders first` };
		const slug = slug_of(kid.id), dir = path.join(parent_dir, slug);
		if (fs.existsSync(dir)) return { why: `${app_path(dir)} already exists` };
		if (root.data.path === undefined){   // the parent must know where it lives for the {"file"} line to resolve
			const own = { path: app_path(parent_dir), by, ts: now() };
			write_line(at.file, own, true);
			advance(root, own);
		}
		write_line(path.join(dir, "task.jsonl"), { id: kid.id, path: app_path(dir), parent: root.data.path, set: { ...kid.data, path: app_path(dir) }, by, ts: now() }, true);
		fs.writeFileSync(path.join(dir, "page.js"), PAGE_JS);
		const line = { file: `${slug}/task.jsonl`, by, ts: now() };
		write_line(at.file, line, true);
		advance(root, line);
		await record_new_folder(parent_dir, slug);
		made.push({ id: kid.id, path: app_path(dir) });
	}
	return { made };
}

/* templates.md: Servex sets this to `file => task_loop.launch(file)`; run_item calls it right after an `approve` line lands. */
export const hooks = {
	approved: null,
	changed: null,     // Servex sets it to `file => process_runner.step(file)` (a process moves on after any write)
	requested: null,   // requested/answered: Servex sends the one-line notices (Servex/agents/doc/messaging.md, "Requests are logged items")
	answered: null,
	prompted: null,   // Servex: an owner Prompt landed on a session page -> PromptTasks files its asks (Servex/agents/PromptTasks.js)
};

export async function run_item(args = {}, ctx = {}, alias = false){
	// A breadcrumb before each call and after a slow one (crumbs.log, only when Servex installed Crumbs): an agent's tool call never passes an
	// HTTP route, so this is what names an item call that held the event loop.
	const crumbs = globalThis.__crumbs, t = Date.now(), what = `${args.path ?? "(own page)"} ${is_plain(args.delta) ? Object.keys(args.delta).slice(0, 6).join(",") || "read" : args.delta == null ? "read" : typeof args.delta} by ${ctx.caller ?? ctx.agent ?? "?"}`;
	crumbs?.drop?.(`item> ${what}`);
	try { return await run_item_now(args, ctx, alias); }
	catch (e) { if (e instanceof Refused) return { ok: false, why: `${e.message}. Nothing was written.` }; throw e; }
	finally { const ms = Date.now() - t; if (ms > 1000) crumbs?.drop?.(`item< ${ms}ms ${what}`); }
}

async function run_item_now({ path: url, target, delta } = {}, ctx = {}, alias = false){
	url ??= own_page(ctx);
	let caller_log = ctx.caller_log ?? null;
	try { caller_log ??= ctx.resolve_log?.(ctx.caller) ?? null; } catch { caller_log = null; }   // a broken resolver never breaks the call
	let at = await resolve(url, target, true);
	if (!at || at.why) return { ok: false, why: at?.why ?? `"${url}" is not a page under public/` };
	// A session route's file is its page.jsonl (cards, tabs). A READ or a query there asks about the session itself, so it reads the record
	// beside it, session.jsonl: cost, span, children, counts (core/Session/readme.md, "What item() answers"). Writes still go to the page.
	const routed = SESSION_ROUTE.exec(String(url ?? "")), dated = DATED_SESSION.exec(String(url ?? ""));
	const session_url = (routed && !/^\d{4}$/.test(routed[1])) || (dated && !(dated[2] ?? "").replace(/\//g, ""));   // /sessions/<id>/ or the dated folder itself, never a subpage
	if (session_url && !at.target.length && path.basename(at.file) === "page.jsonl" && (delta === undefined || (is_plain(delta) && Object.keys(delta).length && Object.keys(delta).every(k => SESSION_QUERIES.includes(k))))){
		const dir = path.dirname(at.file), record = path.join(dir, "session.jsonl");
		// An older folder has no record yet (page.jsonl, cache.jsonl, index.json only): a query asks for it, so it gets the one-line record a tab gets, never a `{"summary":{}}` line in the page.
		if (!fs.existsSync(record) && !fs.existsSync(path.join(dir, "task.jsonl")) && SessionRecord.is_session_dir(dir) && delta !== undefined){
			let id = null, born = null; try { ({ id, first_at: born } = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"))); } catch {}
			id ??= UUID.test(routed?.[1]) ? routed[1] : null;
			if (id) write_line(record, { session: { id, kind: "vscode-tab", at: born ?? now() }, by: "item (first query)" }, true);
		}
		if (fs.existsSync(record)) at = { file: record, target: [] };
		else if (delta !== undefined) return { ok: false, why: `"${url}" has no session record to answer ${Object.keys(delta).join(", ")}, and these keys are never written to its page. Nothing was written.` };
	}

	const kind = class_of(at.file);
	const Class = LOADERS[kind] ? await LOADERS[kind]().catch(() => null) : null;
	if (Class) link_refs(await LOADERS.Task());   // references on a parent resolve to live children
	const root = () => live_root(Class, at.file);
	const first_time = () => !told.has(`${ctx.caller}|${kind}`) && told.set(`${ctx.caller}|${kind}`, true);
	const state = () => Class?.replay ? task_state(Class, root()) : (fs.existsSync(at.file) ? render_markdown(replay(parse_lines(at.file)), Subpages.listed(at.file).map(name => ({ name, url: String(url).replace(/\/?$/, "/") + name + "/" }))) : null);
	const extra = async () => alias ? {} : { ...(first_time() ? { instructions: await instructions_for(kind, Class) } : {}), state: state() };

	if (delta === undefined) return { ok: true, ...(await extra()), ...(alias ? { state: state() } : {}) };
	if (!is_plain(delta)) return { ok: false, why: "`delta` must be one object (a log line)" };
	const flat = expand_dots(delta);
	// A verdict verb given as a bare note ({"approve":"ok"}) would be written but ignored on replay (Task.replay_line reads verbs as objects): make it {note}.
	for (const v of ["approve", "improve", "reject"]) if (typeof flat[v] === "string") flat[v] = { note: flat[v] };
	if (Object.keys(flat).length === 1 && flat.help){
		told.set(`${ctx.caller}|${kind}`, true);
		return { ok: true, instructions: await instructions_for(kind, Class) };
	}
	if (Class?.replay){ const asked = ask(root(), at.target, flat); if (asked) return asked; }
	else if (Object.keys(flat).length === 1 && "completion" in flat) return { ok: false, why: `no task record at "${url}" (${path.basename(at.file)} is not a session or task record), so there is no completion to answer. Nothing was written.` };
	// An improvement proposed again adds weight, never a duplicate (the owner, 2026-10-22; readme-system.md): the same title becomes
	// {"<id>": {"reinforce": {why}}} on the existing one, and Task.weight counts them.
	if (path.basename(at.file) === "improvements.jsonl" && is_plain(flat.tasks?.add) && Object.keys(flat).length === 1 && Object.keys(flat.tasks).length === 1){
		const a = flat.tasks.add, id = slug_of(a.id ?? a.title);
		if (root()._tasks?.find(id)) { delete flat.tasks; flat[id] = { reinforce: { ...(a.why ? { why: a.why } : {}) } }; }
	}
	// MOVE (design.md): {"<id>":{"move":{"to":url}}}, {"tasks":{"<id>":{"move":{"to":url}}}} or move on target [<id>]. Handled here, not written as a line.
	if (Class?.replay){
		const mv = (id, v) => is_plain(v) && Object.keys(v).length === 1 && is_plain(v.move) ? { id, to: v.move.to } : null;
		const inner = is_plain(flat.tasks) && Object.keys(flat).length === 1 && Object.keys(flat.tasks).length === 1 ? Object.entries(flat.tasks)[0] : null;
		const asked = at.target.length === 1 ? mv(at.target[0], flat) : Object.keys(flat).length === 1 ? (inner ? mv(...inner) : mv(...Object.entries(flat)[0])) : null;
		if (asked && asked.id !== "tasks"){
			const r = await move_item({ from: app_path(path.dirname(at.file)), id: asked.id, to: asked.to, by: ctx.caller ?? "agent" });
			return r.why ? { ok: false, why: r.why } : { ok: true, moved: { from: r.from, to: r.to }, state: state() };
		}
	}
	if (Class?.replay){ const node = node_at(root(), at.target); const no = validate(node?.constructor ?? Class, node ?? root(), flat); if (no) return no; }
	else if (kind === "Page"){ const no = await page_refusal(at, flat); if (no) return no; }
	// A complete without evidence is refused BEFORE a line is written: a written line would replay as a recorded fact.
	if (Class?.replay) for (const { args, trail } of complete_calls(flat)){
		const node = node_at(root(), at.target, trail), Own = node?.constructor ?? Class;
		const why = Own.completion_problem?.(args, node);
		if (why) return { ok: false, why };
	}

	// `pages` and `folder` are the keys the tool handles itself: a folder is made on disk (Subpages.js, give_folder).
	const { pages, folder, ...rest } = flat;
	const made = pages === undefined ? null : apply_pages(at, pages, url);
	if (made?.why) return { ok: false, why: made.why, done: made.done };

	const ids = [], homes = [], requests = [], by = ctx.caller ?? "agent";
	let line = null, size;
	// Every write to a Task/Session goes through here: append the line, then advance the live root with it.
	const put = (l, own = true) => {
		const live = Class?.replay ? root() : null;   // root BEFORE the write: after it the file's size differs and root() would re-read
		if (live) try_line(live, l);
		try { size = write_line(at.file, l, own); } catch (e) { if (live) live.store.host = null; throw e; }
		if (live) live.store.sig = sig(live.store.file);
		line = l;
	};

	let body = pages === undefined && folder === undefined ? flat : rest;
	if (Class?.replay && !at.target.length && is_plain(body.tasks) && body.tasks.add !== undefined){
		const { add, ...others } = body.tasks;
		// A REQUEST (the owner, 2026-10-22: logs over chat): a task added to another agent's task is a request to that agent. Node stamps
		// `from` on it, tells the receiver once, and tells the sender when it completes (hooks.requested / hooks.answered, below).
		const owner_agent = root().get_one("agent"), asker = ctx.caller && ctx.caller !== owner_agent && owner_agent ? ctx.caller : null;
		// Check everything first: a refused slug writes nothing at all.
		const plan = [];
		for (let a of [].concat(add)){
			if (typeof a === "string" && a.trim()) a = { title: a.trim() };   // a plain string is a task with that title (session-is-a-task, 2026-10-24); the line written is the object
			if (!is_plain(a)) return { ok: false, why: "`tasks.add` takes a title (a string) or an object (the new task's fields)" };
			const home = typeof a.process === "string" || Array.isArray(a.steps) ? await process_home(path.dirname(at.file), a) : path.basename(at.file) === "improvements.jsonl" ? null : task_home(path.dirname(at.file), a, ctx.module_root, url);   // an improvement nests in its folder's list (mastermind role readme)
			if (home?.why) return { ok: false, why: home.why };
			if (home?.taken) return { ok: false, why: `a task "${home.slug}" already exists under ${home.list.module}/tasks/; nothing was written. Use the id "${home.free}" (or a different title), or work on the existing one.`, suggest: home.free };
			const id = home ? null : slug_of(a.id ?? a.title);
			if (id && (root()._tasks?.find(id) || plan.some(p => p.id === id)))
				return { ok: false, why: `this task already has a subtask "${id}"; nothing was written. Use the id "${id}-2" (or a different title), or change the existing one.`, suggest: id + "-2" };
			if (!home && Class?.replay) try { const { type: _ty, data, ...fields } = a; Class.replay([{ tasks: { add: { type: task_type(a), ...data, ...fields, id } } }]); } catch (e) { return { ok: false, why: `this line would not replay (${e.message}). Nothing was written. Check the fields of "${id}".` }; }
			plan.push({ a: asker && a.from === undefined ? { ...a, from: asker } : a, home, id });
		}
		for (const { a, home, id } of plan){
			if (home){
				const h = home.process ? make_process(path.dirname(at.file), a, ctx, home) : make_child(path.dirname(at.file), a, ctx, home);
				homes.push(h); ids.push(h.id);
				if (asker) requests.push({ to: owner_agent, from: asker, id: h.id, title: a.title ?? h.id, path: h.path, own_folder: true });
				put({ task: h.path, by, ts: now() });
				await record_new_folder(path.dirname(home.dir), home.slug);
				// Step 16: the caller's own log gets the same reference (never the parent twice, never an error).
				if (caller_log && path.resolve(caller_log) !== path.resolve(at.file)) try { write_line(caller_log, line, true); } catch {}
			} else {
				// A subtask nests in this file: {"tasks":{"add":{…}}}, no folder.
				const { type: _t, data, ...fields } = a;
				ids.push(id);
				if (asker) requests.push({ to: owner_agent, from: asker, id, title: a.title ?? id, path: app_path(path.dirname(at.file)) });
				put({ tasks: { add: { type: task_type(a), ...data, ...stamp_ids(fields, ids), id } }, by, ts: now() });
			}
		}
		const { tasks: _t, ...more } = body;
		body = Object.keys(others).length ? { ...more, tasks: others } : more;
	}
	if (folder !== undefined && Class?.replay){
		const g = await give_folder(root(), at, folder, ctx);
		if (g.why) return { ok: false, why: g.why };
		homes.push(...g.made);
		size = size_of(at.file);
	}
	let unchanged = null;
	if ((pages === undefined && folder === undefined && !homes.length && !ids.length) || Object.keys(body).length){
		// A verb that does nothing (refused from this state, or its child not found) is still written, but the answer says so.
		const verb = Class?.replay && !at.target.length ? verb_in(body) : null;
		// Compared without the clocks: a running child's ran_ms (row_of) grows between the two reads, so it would always look changed.
		const steady = state => JSON.stringify(state, (k, v) => k === "ran_ms" || k === "span_ms" || k === "last_at" ? undefined : v);
		// A fingerprint without costs: the full picture (task_state) reads every agent's spend, twice per write.
		const print = t => ({ state: t.state, completion: t.completion, data: t.data, kids: every_task(t._tasks).map(k => [k.id, k.state, k.data]) });
		const was = verb ? steady(print(root())) : null;
		put(nest(at.target, { ...stamp_ids(body, ids), by, ts: now() }), !!Class?.replay);
		if (verb && steady(print(root())) === was) unchanged = `"${verb}" was written but changed nothing: the task (or the child it names) is in a state that refuses it, or no child has that id`;
	} else if (size === undefined) size = size_of(at.file);
	// An approve line starts a templated task's agent (TaskLoop.launch); never awaited into the answer, a failure never reaches the tool.
	if (Class?.replay && !at.target.length && body.approve !== undefined && hooks.approved) try { Promise.resolve(hooks.approved(at.file)).catch(() => {}); } catch {}
	// A process moves on after any write to it, and a new one starts at once (ProcessRunner.step).
	if (hooks.changed) for (const f of [...(kind === "Process" ? [at.file] : []), ...homes.filter(h => h.process).map(h => h.file)]) try { Promise.resolve(hooks.changed(f)).catch(() => {}); } catch {}
	if (Class?.replay) try { notify_requests(root(), at, body, requests, by); } catch {}
	// Caveats of a task that just completed reach its parent's log (a subtask nested in this file is on this log already).
	if (Class?.replay && !at.target.length && is_plain(body.complete) && root().state === "complete") try { tell_parent_caveats(path.dirname(at.file), body.complete.caveats, by); } catch {}
	// Node records who worked on the task: one appended line carrying the full list, only when the caller is new to it.
	if (Class?.replay && Class.FIELDS?.includes("sessions") && ctx.caller && ctx.caller !== "owner") try {
		const live = root(), list = live.sessions;
		if (!list.some(s => s?.id === ctx.caller)) { const keep = line; put({ sessions: [...list, { id: ctx.caller, task: live.get_one("path") ?? app_path(path.dirname(at.file)) }], by, ts: now() }); line = keep; }
	} catch {}
	// A write to a task or session answers with what was written, never the whole picture (session-is-a-task item 12): a session's picture
	// walks every task's cost and every child agent, which made each write 20 s on a 140 KB record, past the browser Store's 5 s timeout
	// (it then appended the line itself: a twin). The picture is a read, item({path}) with no delta. A page's write still answers its page.
	if (Class?.replay){
		const live = root();
		return { ok: true, ids, line, size, now: { state: live.state, completion: live.completion }, ...(unchanged ? { warning: unchanged } : {}), ...(homes.length ? { homes } : {}),
			...(!alias && first_time() ? { instructions: await instructions_for(kind, Class) } : {}) };
	}
	return { ok: true, ids, line, size, ...(unchanged ? { warning: unchanged } : {}), ...(homes.length ? { homes } : {}), ...(made ? { pages: made.done } : {}), ...(!alias ? await extra() : {}) };
}

/* ---------- the six tools ---------- */

/* resolve_log(agent id) -> that agent's task.jsonl path or null; the host supplies it (Agents.task_dir_for). */
export function page_tools(resolve_log = null){
	const not_a_page = (url, at) => JSON.stringify({ ok: false, why: at?.why ?? `"${url}" is not a page under public/` });

	return [

		tool("page_call",
			"Alias of page_set: one method call at one target, `page_call(path, [\"k2\",\"answers\"], \"add\", {…})` = `{\"k2\":{\"answers\":{\"add\":{…}}}}`. Prefer page_set (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH, target: TARGET,
				method: { type: "string", description: "The verb to call at the target — a method on whatever `target` resolves to: `add`, `remove`, `move`, `order`, or any method the item's own class defines." },
				args: { description: "The method's one argument — an object for `add`, a string id for `remove`, etc. If it's a plain object, `by` and `ts` are stamped onto it." } },
			["method"],
			async ({ path: url, target, method, args }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, target, true);
				if (!at || at.why) return not_a_page(url, at);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, target, delta: { [method]: is_plain(args) ? args : {} } }, { resolve_log, ...ctx }, true));   // a task / session: the item path

				const stamped = is_plain(args) ? { ...(method === "add" ? { id: crypto.randomUUID() } : {}), ...stamp_ids(args), by: ctx.caller ?? "agent", ts: now() } : args;
				const line = nest(at.target, { [method]: stamped });
				const no = await page_refusal(at, { [method]: stamped });
				if (no) return JSON.stringify(no);

				const size = write_line(at.file, line);
				return JSON.stringify({ ok: true, line, size });
			}),

		tool("page_add",
			"Alias of page_set `{\"content\":{\"add\":item}}`: add one card (type part-heading | part-text | part-card). Prefer page_set (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				item: { type: "object", description: "The item's own fields — whatever the content list draws: `title`, `text`, `type` (a registered class name, e.g. \"Question\", with its own `text`/`answer`), or any plain data. `id` is optional; one is made for you." },
				after: { type: "string", description: "The id to land after. Omit to append at the end; `null` to land first." } },
			["item"],
			async ({ path: url, item, after }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, ["content"], true);
				if (!at || at.why) return not_a_page(url, at);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, delta: { content: { add: { ...item, ...(after !== undefined ? { after } : {}) } } } }, { resolve_log, ...ctx }, true));

				const id = item?.id ?? crypto.randomUUID();
				const add = { ...item, id, by: ctx.caller ?? "agent", ts: now(), ...(after !== undefined ? { after } : {}) };
				const line = nest(at.target, { add });
				const no = await page_refusal(at, { add });
				if (no) return JSON.stringify(no);

				const size = write_line(at.file, line);
				// An owner prompt (prompt-relay.mjs writes it): Servex files its asks as proposed tasks (Servex/agents/PromptTasks.js).
				if (item?.type === "Prompt" && typeof item.text === "string" && hooks.prompted)
					try { Promise.resolve(hooks.prompted({ file: at.file, line: size?.lines ?? null, id, text: item.text, at: add.ts, by: ctx.caller ?? null })).catch(() => {}); } catch {}
				return JSON.stringify({ ok: true, id, line, size });
			}),

		tool("page_set",
			"THE PAGE TOOL: append one JSON delta to a page's log; every open tab redraws within a second, no reload."
			+ " `path` = the page's url (omit = your own session page). `by`, `ts` and every missing `id` are stamped"
			+ " for you, and the answer lists them as `ids` (use one to change that card later). THREE KEY RULES:"
			+ " a plain key is a property `{\"title\":\"Notes\",\"description\":\"…\"}` (also the layout words navigation,"
			+ " width, arrangement, surface, background, type_size); a key naming a method calls it"
			+ " `{\"content\":{\"add\":{…}}}` (also remove \"id\", move {id,after}, order [ids]); a key that is a card id"
			+ " walks into that card `{\"<id>\":{\"text\":\"new\"}}`. CARD TYPES, added with content.add: heading"
			+ " `{\"type\":\"part-heading\",\"text\":\"…\"}`, paragraph `{\"type\":\"part-text\",\"text\":\"markdown\"}`, card"
			+ " `{\"type\":\"part-card\",\"title\":\"…\",\"text\":\"…\"}` (`after:\"<id>\"` places it). A SUBPAGE (own folder"
			+ " and url, made on disk for you): `{\"pages\":{\"add\":{\"name\":\"notes\",\"title\":\"Notes\",\"icon\":\"📝\","
			+ " \"description\":\"One line.\"}}}`, also `rename:{name,to}` and `remove:\"name\"` (moved aside, never deleted);"
			+ " write on it with `path` = its url. Look first with page_read. Full model: /framework/core/Page/doc/ai-api.md.",
			{ path: PAGE_PATH, target: TARGET,
				delta: { type: "object", description: "The fields to change, e.g. {\"answer\": \"42\"} or {\"title\": \"Renamed\"}." } },
			["delta"],
			async (args, ctx = {}) => JSON.stringify(await run_item(args, { resolve_log, ...ctx }, true))),

		tool("item", ITEM_DESCRIPTION,
			{ path: ITEM_PATH, delta: { type: "object", description: "ONE JSONL line, exactly what Item.set(delta) takes and the log holds. Omit it to read the current state. {\"help\":{}} returns the instructions again." } },
			[],
			async (args, ctx = {}) => JSON.stringify(await run_item(args, { resolve_log, ...ctx }))),

		tool("page_log",
			"Alias of page_set `{\"log\":{\"text\":…}}`: the \"now doing X\" line, overwritten each time; post it BEFORE a long step (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				text: { type: "string", description: "What you're doing right now, in a few words, e.g. \"researching X\"." } },
			["text"],
			async ({ path: url, text }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, undefined, true);
				if (!at || at.why) return not_a_page(url, at);
				if (path.basename(at.file) !== "page.jsonl") return JSON.stringify(await run_item({ path: url, delta: { now: { preview: text } } }, { resolve_log, ...ctx }, true));   // a task has no page log: its "now"

				const line = nest(at.target, { log: { text, by: ctx.caller ?? "agent", ts: now() } });
				const size = write_line(at.file, line);
				return JSON.stringify({ ok: true, line, size });
			}),

		tool("page_read",
			"The page's CURRENT state, replayed fresh from page.jsonl: title, the `doing:` line, every card as `[id] (type) text`, and its subpages with their urls. Read it before you change anything; `format:\"html\"` gives the cards' markup (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				format: { type: "string", enum: ["markdown", "html"], description: "\"markdown\" (default, fewest tokens) or \"html\" (the content's own markup, no nav chrome)." } },
			[],
			async ({ path: url, format }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url);
				if (!at || at.why) return not_a_page(url, at);
				const file = at.file;
				if (!fs.existsSync(file)) return JSON.stringify({ ok: false, why: `no page.jsonl at "${url}" yet` });

				const state = replay(parse_lines(file));
				const base = String(url ?? "").replace(/\/?$/, "/");
				const subpages = Subpages.listed(file).map(name => ({ name, url: base + name + "/" }));
				return format === "html" ? render_html(state, subpages) : render_markdown(state, subpages);
			}),
	];
}

export default page_tools;
