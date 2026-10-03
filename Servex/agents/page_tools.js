import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PUBLIC = path.join(ROOT, "public");

/* FOUR TOOLS over `Item.Store` (core/Item/Store.js), so an agent writes a LIVE page the
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
 * Four verbs, not one per page shape: `page_add` (a content item), `page_set` (a delta on
 * the page or one item), `page_log` (a "now doing X" line), `page_read` (the page's
 * CURRENT state, computed fresh — never a second copy on disk, deliverable 2). */

// A dynamic import with a safe fallback — the same reasoning as Append.js: a broken
// checker degrades validation, never the whole tool. check() also reads page.jsonl's
// schema as `open: true` (.claude/hooks/jsonl-schema.mjs), so an "at"/"add"/"log" key
// nobody has named a verb for there is simply data no verb claims, never a refusal.
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
}

const now = () => new Date().toISOString();

const tool = (name, description, properties, required, handler) =>
	({ name, description, inputSchema: { type: "object", required, properties }, handler });

const PAGE_PATH = { type: "string", description: "The page's own url, e.g. \"/framework/ai/2026-10-02/page-tools/demo/\" — its page.jsonl is public<path>page.jsonl. The folder must already exist (create_page, or a task's own dir)." };

/* ---------- page_read's COMPUTED state (deliverable 2) ----------
 * No second copy of the page is ever stored: every call re-reads page.jsonl from disk and
 * replays it fresh, the same rule Item.Store.read() follows in the browser. This is a small,
 * deliberately partial replay — just enough of Log.js's own vocabulary (title/icon/description,
 * `content`'s add/set/remove/move/order, `log`) to answer "what does this page say right now",
 * never the whole rendering engine (core never needs the DOM to answer this). */
function parse_lines(file){
	let text;
	try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
	return text.split("\n").filter(line => line.trim()).flatMap(line => {
		try { return [JSON.parse(line)]; } catch { return []; }
	});
}

function replay(lines){
	const page = { title: undefined, icon: undefined, description: undefined, log: undefined };
	const items = new Map();   // id -> item data
	let order = [];            // ids, in order

	const insert_after = (id, after) => {
		order = order.filter(x => x !== id);
		if (after === null || after === undefined && !order.length) return void order.unshift(id);
		if (after === undefined) return void order.push(id);
		const at = order.indexOf(after);
		order.splice(at === -1 ? order.length : at + 1, 0, id);
	};

	const content_delta = rest => {
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

	for (const line of lines){
		if (!line || typeof line !== "object") continue;
		const { at, ...rest } = line;

		if (at === "content"){ content_delta(rest); continue; }
		if (typeof at === "string" && at.startsWith("content/")){
			const id = at.slice("content/".length);
			if (items.has(id)) items.set(id, { ...items.get(id), ...rest });
			continue;
		}
		if (at) continue;   // a path this small replay doesn't follow — kept on disk, skipped here

		if ("content" in rest){ content_delta(rest.content); const { content, ...top } = rest; Object.assign(page, top); continue; }
		Object.assign(page, rest);
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

function render_markdown({ page, items }){
	const lines = [];
	lines.push(`# ${page.title ?? "(untitled)"}`);
	if (page.description) lines.push(page.description);
	if (page.log?.text) lines.push(`_doing: ${page.log.text}_`);

	lines.push("");
	lines.push("## Content");
	if (!items.length) lines.push("(empty)");
	else for (const item of items) lines.push(`- [${item.id}] ${render_item(item)}`);

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
	return `<li data-id="${esc(item.id)}">${body}</li>`;
}

// The page's own CONTENT, as HTML — no nav, no tab strip, no sidebar: this never drew any
// chrome to begin with, so "without navigation chrome" costs nothing extra here. Structure
// an agent can parse (an id per `<li>`), not a styled page.
function render_html({ page, items }){
	const lines = [`<h1>${esc(page.title ?? "(untitled)")}</h1>`];
	if (page.description) lines.push(`<p>${esc(page.description)}</p>`);
	if (page.log?.text) lines.push(`<p class="muted">doing: ${esc(page.log.text)}</p>`);

	lines.push(items.length ? `<ul>${items.map(render_item_html).join("")}</ul>` : "<p>(empty)</p>");
	return lines.join("\n");
}

/* ---------- the four tools ---------- */

export function page_tools(){
	return [

		tool("page_add",
			"Add ONE item to a live page's own content list — one line appended to its page.jsonl,"
			+ " picked up by every open tab with no reload (the dev server tails the file the same way"
			+ " for any writer). Stamps a fresh id (unless `item.id` is given), the calling agent as"
			+ " `by`, and the time as `ts`.",
			{ path: PAGE_PATH,
				item: { type: "object", description: "The item's own fields — whatever the content list draws: `title`, `text`, `type` (a registered class name, e.g. \"Question\", with its own `text`/`answer`), or any plain data. `id` is optional; one is made for you." },
				after: { type: "string", description: "The id to land after. Omit to append at the end; `null` to land first." } },
			["path", "item"],
			({ path: url, item, after }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

				const id = item?.id ?? crypto.randomUUID();
				const add = { ...item, id, by: ctx.caller ?? "agent", ts: now(), ...(after !== undefined ? { after } : {}) };
				const line = { at: "content", add };

				write_line(file, line);
				return JSON.stringify({ ok: true, id, line });
			}),

		tool("page_set",
			"Change one item's data (by id) or the page's own fields (no id) — one line appended to"
			+ " page.jsonl. `delta` is applied the same way a live edit would be: a key that names a"
			+ " method is CALLED, anything else is set as data. Stamps `by` and `ts` onto the same line.",
			{ path: PAGE_PATH,
				id: { type: "string", description: "A content item's id, from page_add's answer or page_read's listing. Omit to set a field on the PAGE itself (e.g. {\"title\":\"New title\"})." },
				delta: { type: "object", description: "The fields to change, e.g. {\"answer\": \"42\"} or {\"title\": \"Renamed\"}." } },
			["path", "delta"],
			({ path: url, id, delta }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

				const stamped = { ...delta, by: ctx.caller ?? "agent", ts: now() };
				const line = id ? { at: `content/${id}`, ...stamped } : stamped;

				write_line(file, line);
				return JSON.stringify({ ok: true, line });
			}),

		tool("page_log",
			"A \"now doing X\" line — post BEFORE a long step so the owner can watch the page grow"
			+ " while you work, not just at the end (CLAUDE.md, \"Pages are live\"). Overwrites the"
			+ " page's own `log` field each time — this is a status line, not a running list; use"
			+ " `page_add` for anything that should stay on the page.",
			{ path: PAGE_PATH,
				text: { type: "string", description: "What you're doing right now, in a few words, e.g. \"researching X\"." } },
			["path", "text"],
			({ path: url, text }, ctx = {}) => {
				const file = resolve_file(url);
				if (!file) return JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });

				const line = { log: { text, by: ctx.caller ?? "agent", ts: now() } };
				write_line(file, line);
				return JSON.stringify({ ok: true, line });
			}),

		tool("page_read",
			"The page's CURRENT state, computed fresh from page.jsonl every time — never a second,"
			+ " stored copy (CLAUDE.md law 7). Replays the log into title, the `doing:` line if one is"
			+ " set, and every content item with its id, a question card drawn as \"Q: … / A: …\"."
			+ " Default `format` is markdown — the fewest tokens, read this before deciding what to add"
			+ " or change next. `format: \"html\"` gives the same replay as the page's own content HTML,"
			+ " no navigation chrome, when you need the structure (each item's `<li data-id>`) instead.",
			{ path: PAGE_PATH,
				format: { type: "string", enum: ["markdown", "html"], description: "\"markdown\" (default, fewest tokens) or \"html\" (the content's own markup, no nav chrome)." } },
			["path"],
			({ path: url, format }) => {
				const file = resolve_file(url);
				if (!file) return JSON.stringify({ ok: false, why: `"${url}" is not a page under public/` });
				if (!fs.existsSync(file)) return JSON.stringify({ ok: false, why: `no page.jsonl at "${url}" yet` });

				const state = replay(parse_lines(file));
				return format === "html" ? render_html(state) : render_markdown(state);
			}),
	];
}

export default page_tools;
