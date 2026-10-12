import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Subpages from "./Subpages.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PUBLIC = path.join(ROOT, "public");

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

/* `url` is a page's address ("/framework/ai/2026-10-02/page-tools/demo/"); its page.jsonl
 * sits one join away. Refuses anything that resolves outside public/ — the same gate
 * Append.js and Tail.js keep on the browser's own writes. */
function resolve_file(url){
	const pathname = String(url ?? "").replace(/^[\\/]+/, "");
	const dir = path.resolve(PUBLIC, pathname);
	if (dir !== PUBLIC && !dir.startsWith(PUBLIC + path.sep)) return null;
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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function resolve(url, target = []){
	const hit = SESSION_ROUTE.exec(String(url ?? ""));
	if (hit && !/^\d{4}$/.test(hit[1])){
		const file = await session_file(hit[1]);
		if (file){
			// A real subpage folder (made by pages.add) wins; a segment with no folder is still a tab target.
			let dir = path.dirname(file), rest = hit[2].split("/").filter(Boolean), at = file;
			while (rest.length && fs.existsSync(path.join(dir, rest[0], "page.jsonl"))){ dir = path.join(dir, rest[0]); at = path.join(dir, "page.jsonl"); rest = rest.slice(1); }
			return { file: at, target: [...rest, ...(target ?? [])] };
		}
	}
	const file = resolve_file(url);
	return file ? { file, target: target ?? [] } : null;
}

async function session_file(id){
	// A folder made here is named for the agent (its Servex id), not left as session-<id8> (brief: "sessions get a name").
	let uuid = UUID.test(id) ? id : null, name = uuid ? null : id;
	try {
		const { default: Registry } = await import("./registry.js"), agents = new Registry().read();
		if (!uuid) uuid = agents[id]?.session_id ?? null;
		else name = Object.entries(agents).find(([, a]) => a?.session_id === uuid)?.[0] ?? null;
	} catch {}
	if (!uuid) return null;
	const slug = /^[a-z0-9][a-z0-9-]{2,60}$/.test(name ?? "") ? `${name}-${uuid.slice(0, 8)}` : undefined;
	const { default: AISession } = await import("../../public/framework/ai/AISession/AISession.js");
	if (!AISession.days.has(uuid)) AISession.scanned = false;   // a long-lived Servex: a folder made since the last scan must be found, never doubled
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
function write_line(file, line){
	let why = null;
	try { why = check(file, line); } catch (e) { console.error("page_tools: check() threw, writing anyway:", e.message); }
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
			if (items.has(key) && is_plain(value)){ items.set(key, { ...items.get(key), ...value }); continue; }
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
	} catch (e){ return { why: e.message, done }; }
	return { done };
}

/* ---------- the six tools ---------- */

export function page_tools(){
	const not_a_page = url => JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

	return [

				tool("page_call",
			"Alias of page_set: one method call at one target, `page_call(path, [\"k2\",\"answers\"], \"add\", {…})` = `{\"k2\":{\"answers\":{\"add\":{…}}}}`. Prefer page_set (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH, target: TARGET,
				method: { type: "string", description: "The verb to call at the target — a method on whatever `target` resolves to: `add`, `remove`, `move`, `order`, or any method the item's own class defines." },
				args: { description: "The method's one argument — an object for `add`, a string id for `remove`, etc. If it's a plain object, `by` and `ts` are stamped onto it." } },
			["method"],
			async ({ path: url, target, method, args }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, target);
				if (!at) return not_a_page(url);

				const stamped = is_plain(args) ? { ...(method === "add" ? { id: crypto.randomUUID() } : {}), ...stamp_ids(args), by: ctx.caller ?? "agent", ts: now() } : args;
				const line = nest(at.target, { [method]: stamped });

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
				const at = await resolve(url, ["content"]);
				if (!at) return not_a_page(url);

				const id = item?.id ?? crypto.randomUUID();
				const add = { ...item, id, by: ctx.caller ?? "agent", ts: now(), ...(after !== undefined ? { after } : {}) };
				const line = nest(at.target, { add });

				const size = write_line(at.file, line);
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
			async ({ path: url, target, delta }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url, target);
				if (!at) return not_a_page(url);

				// `pages` is the one key the tool handles itself: a folder is made on disk (Subpages.js).
				const { pages, ...rest } = is_plain(delta) ? delta : {};
				const made = pages === undefined ? null : apply_pages(at, pages, url);
				if (made?.why) return JSON.stringify({ ok: false, why: made.why, done: made.done });

				const ids = [];
				let line = null, size;
				if (pages === undefined || Object.keys(rest).length){
					line = nest(at.target, { ...stamp_ids(pages === undefined ? delta : rest, ids), by: ctx.caller ?? "agent", ts: now() });
					size = write_line(at.file, line);
				} else size = size_of(at.file);
				return JSON.stringify({ ok: true, ids, line, size, ...(made ? { pages: made.done } : {}) });
			}),

				tool("page_log",
			"Alias of page_set `{\"log\":{\"text\":…}}`: the \"now doing X\" line, overwritten each time; post it BEFORE a long step (core/Page/doc/ai-api.md).",
			{ path: PAGE_PATH,
				text: { type: "string", description: "What you're doing right now, in a few words, e.g. \"researching X\"." } },
			["text"],
			async ({ path: url, text }, ctx = {}) => {
				url ??= own_page(ctx);
				const at = await resolve(url);
				if (!at) return not_a_page(url);

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
				if (!at) return not_a_page(url);
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
