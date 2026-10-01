/* JSONL SCHEMA (2026-09-30) — the ONE list of what a line may look like, per log file.
 *
 * The owner, 2026-09-30: "tool calls… that then take the same data and validate it first
 * before writing it to file so that… we would never get a crash, a console error."
 *
 * Who uses it: `append.mjs` (judges every new line before it writes anything) and Servex's
 * `append_log` tool (its own kind, `servex event`, at the bottom). Old lines are never judged;
 * the logs are append-only.
 *
 * A file's kind is its BASENAME (`task.jsonl`, `day.jsonl`, …). A file with no entry here is
 * only checked for being JSON — nothing else about it is known.
 *
 * Each verb lists `fields`: the keys its value MUST have (a value of exactly "NOW" counts —
 * append.mjs turns it into the clock). `any`: at least one of these. `type: "string"`: the
 * value is a string, not an object. Everything else in a value is free.
 *
 * `reader` names the class that replays the file; `pending` lists verbs this schema knows but
 * that reader does not register yet (it prints `JSONL: unknown verb` for them until it does).
 * `jsonl-schema.test.mjs` fails when the schema and the reader disagree about anything else.
 *
 * Plain data, no imports: node and (if ever needed) the browser can both load it. */

export const schemas = {
	"task.jsonl": {
		what: "a task's log (public/framework/ai/<date>/<slug>/task.jsonl)",
		reader: { file: "public/framework/ext/JSONL/JSONL.js", class: "TaskJSONL" },
		verbs: {
			assign:     { fields: [], eg: { step: 2, now: "what is happening" } },
			log:        { fields: ["at", "msg"], eg: { at: "NOW", msg: "one finding" } },
			action:     { fields: ["at", "did"], eg: { at: "NOW", did: "edit", files: ["path"] } },
			agent:      { fields: ["task"], eg: { kind: "cli", task: "slug", model: "…" } },
			chat:       { fields: ["text"], eg: { at: "NOW", role: "user", text: "…" } },
			shot:       { fields: [], any: ["path", "url"], eg: { at: "NOW", path: "…", label: "…" } },
			ask:        { fields: ["id"], eg: { id: "slug", summary: "…", status: "open" } },
			decision:   { fields: ["at"], eg: { at: "NOW", question: "…", options: ["…"], chose: "…", why: "…" } },
			verdict:    { fields: ["id", "decision"], eg: { id: "v1", decision: "d1", say: "approve" } },
			rank:       { fields: ["list"], eg: { list: "tasks", order: ["a", "b"] } },
			note:       { fields: [], eg: { id: "n1", msg: "…" } },
			experiment: { fields: ["try", "measure", "result"], eg: { try: "…", measure: "…", result: "…" } },
			review:     { fields: [], eg: { found: 3, real: 2, fixed: 2 } },
			shots:      { fields: ["pages"], eg: { at: "NOW", pages: ["/x/"], dir: "shots/" } },
			// `{"group": "slug"}` puts the task in a group — read by ai2/groups.js's Member.apply(), not a verb method.
			group:      { type: "string", extra: "public/framework/ai2/groups.js", eg: "system-design" },
		},
		pending: ["experiment", "review", "shots"],
	},
	"day.jsonl": {
		what: "a day's log (public/framework/ai/<date>/day.jsonl)",
		reader: { file: "public/framework/ai2/inbox.js", class: "Day" },
		verbs: {
			assign: { fields: [], eg: { title: "…" } },
			log:    { fields: ["at", "task", "msg"], eg: { at: "NOW", task: "slug", msg: "task opened — one line" } },
			action: { fields: ["at", "did"], eg: { at: "NOW", did: "…" } },
		},
	},
	"board.jsonl": {
		what: "the AI board (public/framework/ai/board.jsonl)",
		reader: { file: "public/framework/ai2/inbox.js", class: "Board" },
		verbs: {
			assign: { fields: [], eg: { title: "…" } },
			log:    { fields: ["at", "msg"], eg: { at: "NOW", msg: "…" } },
			action: { fields: ["at", "did"], eg: { at: "NOW", did: "…" } },
			card:   { fields: ["id"], eg: { at: "NOW", id: "slug", title: "…", text: "…", status: "working" } },
			chunk:  { fields: [], eg: { id: "slug", text: "…" } },
		},
	},
	"asks.jsonl": {
		what: "the owner's routed asks (public/framework/ai/asks.jsonl)",
		reader: { file: "public/framework/ai/asks/fold.js", fn: "fold_asks" },
		verbs: {
			ask: { fields: ["at"], any: ["id", "title"], eg: { at: "NOW", id: "slug", status: "building", why: "…", by: "agent-id" } },
		},
	},
	/* A card's (or any page's) page.jsonl is OPEN on purpose: line 1 is the constructor, every later
	 * line sets fields, and a key the vocabulary does not know is plain data (ai2/fold.js absorb()).
	 * So only the line's shape is judged, plus the keys whose value the fold reads as an object. */
	"page.jsonl": {
		what: "a page's or card's log (…/page.jsonl) — write cards with Servex's card_reply / card_set, which own these files",
		reader: { file: "public/framework/ai2/fold.js", fn: "absorb" },
		open: true,
		verbs: {
			message: { fields: ["text"], eg: { by: "agent-id", text: "…", at: "NOW" } },
			prompt:  { fields: ["id"], eg: { id: "uuid", text: "…" } },
		},
	},
};

/* Servex's `append_log` writes its OWN named logs (under SERVEX_HOME, never a repo file), and
 * every one of those is an event: one flat object with a string `type`. */
export const servex_event = {
	what: "a Servex named log (append_log)",
	eg: { type: "focus", ref: "2026/09/30/some-card" },
};

const basename = file => String(file).split(/[\\/]/).pop();

/** The schema for a file path, by its basename, or null when nothing is known about it. */
export function schema_for(file){ return schemas[basename(file)] ?? null; }

const plain = v => v !== null && typeof v === "object" && !Array.isArray(v);

/** Every line shape this file takes, as one readable sentence — what a refusal prints. */
export function shape(file){
	const s = schema_for(file);
	if (!s) return "";
	const one = ([verb, v]) => v.type === "string" ? `{"${verb}":"…"}`
		: `{"${verb}":{${[...v.fields, ...(v.any ? [v.any.join("|")] : [])].map(f => `"${f}"`).join(",") || "…"}}}`;
	const list = Object.entries(s.verbs).map(one).join(", ");
	return s.open
		? `${basename(file)} is ${s.what}: one JSON object per line, any keys; ${list}.`
		: `${basename(file)} is ${s.what}. Each line is ONE object with ONE verb as its key: ${list}.`;
}

/** Judge one new line for a file. Returns null when it fits, or the reason it does not. */
export function check(file, line){
	if (!plain(line)) return `a line must be one JSON object, not ${Array.isArray(line) ? "an array" : JSON.stringify(line)}`;
	const keys = Object.keys(line);
	if (!keys.length) return "an empty object {} says nothing";
	const s = schema_for(file);
	if (!s) return null;

	const value_problem = (verb, v, value) => {
		if (v.type === "string") return typeof value === "string" ? null : `"${verb}" takes a string, like {"${verb}":${JSON.stringify(v.eg)}}`;
		if (!plain(value)) return `"${verb}" takes an object, like {"${verb}":${JSON.stringify(v.eg)}} — got ${JSON.stringify(value)?.slice(0, 60)}`;
		const missing = v.fields.filter(f => value[f] === undefined || value[f] === null || value[f] === "");
		if (missing.length) return `"${verb}" is missing ${missing.map(f => `"${f}"`).join(", ")} — like {"${verb}":${JSON.stringify(v.eg)}}`;
		if (v.any && !v.any.some(f => value[f] !== undefined && value[f] !== null && value[f] !== ""))
			return `"${verb}" needs one of ${v.any.map(f => `"${f}"`).join(" or ")} — like {"${verb}":${JSON.stringify(v.eg)}}`;
		return null;
	};

	if (s.open){
		for (const key of keys) if (s.verbs[key]){
			const why = value_problem(key, s.verbs[key], line[key]);
			if (why) return why;
		}
		return null;
	}

	const unknown = keys.filter(k => !s.verbs[k]);
	// flat = no key is a verb carrying its value (`{"type":"launch","agent":"a"}` is flat too: `agent` holds a string, not an object)
	const carried = keys.filter(k => s.verbs[k] && (s.verbs[k].type === "string" || plain(line[k])));
	if (!carried.length && keys.length > 1 || unknown.length === keys.length)
		return `a flat line (no verb: ${keys.slice(0, 4).map(k => `"${k}"`).join(", ")}) — wrap it in a verb, e.g. {"log":{"at":"NOW","msg":"…"}}`;
	if (unknown.length) return `unknown verb ${unknown.map(k => `"${k}"`).join(", ")} beside ${keys.filter(k => s.verbs[k]).map(k => `"${k}"`).join(", ")} — one verb per line, every key a verb`;
	if (keys.length > 1) return `one verb per line — this line has ${keys.length} (${keys.join(", ")}); append them as separate lines`;
	return value_problem(keys[0], s.verbs[keys[0]], line[keys[0]]);
}

/** Judge one entry for Servex's `append_log`. Returns null when it fits, or the reason. */
export function check_event(name, entry){
	if (!plain(entry)) return `an entry must be one JSON object, like ${JSON.stringify(servex_event.eg)}`;
	if (/\.jsonl$|[\\/]public[\\/]|^task$|^day$/i.test(String(name)))
		return `append_log writes Servex's own named logs, never a repo file — for "${name}" use node .claude/hooks/append.mjs <file.jsonl> <lines.json>`;
	if (typeof entry.type !== "string" || !entry.type.trim()){
		const keys = Object.keys(entry);
		const verbish = keys.length === 1 && plain(entry[keys[0]]);
		return verbish
			? `{"${keys[0]}":{…}} is a task.jsonl-style line; append_log writes Servex events. A task log line goes through node .claude/hooks/append.mjs <task.jsonl> <lines.json>; an event here needs a "type", like ${JSON.stringify(servex_event.eg)}`
			: `a Servex event needs a string "type", like ${JSON.stringify(servex_event.eg)}`;
	}
	return null;
}
