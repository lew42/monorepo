import { button } from "../../core/View/View.js";

export const clock = ts => ts ? new Date(ts).toLocaleTimeString() : "—";
export const elapsed = (a, b) => a && b ? new Date(b) - new Date(a) : null;
export const count = n => (n ?? 0).toLocaleString("en-US");

export const dur = ms => {
	if (ms == null) return "—";
	const s = Math.round(ms / 1000);
	if (s < 60) return s + "s";
	const m = Math.floor(s / 60);
	return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m";
};

/** A chip that puts `value` on the clipboard — a session id or a turn ref. */
export function ref(value, label = value.slice(0, 8)){
	return button.c("ai-ref", label)
		.attr("title", "copy " + value)
		.on("click", e => {
			e.stopPropagation();
			navigator.clipboard.writeText(value);
			const b = e.currentTarget, was = b.textContent;
			b.textContent = "copied";
			setTimeout(() => b.textContent = was, 900);
		});
}

/* Deliberately no import from message.js/prompt.js here — both import `count`
 * from this file, so importing back would be the mutual-import trap (§7). The
 * small amount of tag-stripping/text-extraction below is an intentional,
 * self-contained duplicate of what prompt.js does more fully for rendering. */
const HARNESS_TAG = /<(local-command-caveat|local-command-stdout|local-command-stderr|command-name|command-message|command-args|system-reminder|task-notification|ide_selection|ide_opened_file)>[\s\S]*?<\/\1>/g;

const prose_of = content => (typeof content === "string" ? content
	: (content ?? []).filter(b => b.type === "text").map(b => b.text).join(" "))
	.replace(HARNESS_TAG, "").trim();

const one_line = (s, n = 100) => {
	const line = (s ?? "").trim().split("\n")[0];
	return line.length > n ? line.slice(0, n - 1) + "…" : line;
};

/**
 * Deduped token totals for a transcript's assistant turns — one response can
 * span several JSONL lines sharing `message.id`; count it once (readme "Bites").
 * Pass `exclude` (a Set of message ids, e.g. from a parent library's own
 * lines) to keep a fork's copied history from double-counting.
 */
export function usage_of(lines, exclude){
	const seen = new Set(exclude ?? []);
	const total = { input: 0, cache_write: 0, cache_read: 0, output: 0, calls: 0 };
	lines.forEach(l => {
		if (l.type !== "assistant") return;
		const id = l.message?.id, u = l.message?.usage;
		if (!id || !u || seen.has(id)) return;
		seen.add(id);
		total.input += u.input_tokens ?? 0;
		total.cache_write += u.cache_creation_input_tokens ?? 0;
		total.cache_read += u.cache_read_input_tokens ?? 0;
		total.output += u.output_tokens ?? 0;
		total.calls++;
	});
	total.total = total.input + total.cache_write + total.cache_read + total.output;
	return total;
}

const tool_hint = input => {
	const f = input?.file_path ?? input?.path ?? input?.pattern ?? input?.command;
	return f ? " " + one_line(String(f), 60) : "";
};

const tool_name_for = (lines, before_index, id) => {
	for (let i = before_index - 1; i >= 0; i--){
		const c = lines[i].message?.content;
		const hit = Array.isArray(c) && c.find(b => b.type === "tool_use" && b.id === id);
		if (hit) return hit.name;
	}
	return null;
};

/** The latest meaningful action in the transcript, as a one-line "now" string. */
export function tail_activity(lines){
	for (let i = lines.length - 1; i >= 0; i--){
		const l = lines[i];
		if (l.isSidechain || (l.type !== "user" && l.type !== "assistant")) continue;
		const content = l.message?.content;
		if (!content) continue;
		const blocks = typeof content === "string" ? [{ type: "text", text: content }] : content;
		for (let j = blocks.length - 1; j >= 0; j--){
			const b = blocks[j];
			if (b.type === "text" && b.text?.trim()) return "replied: " + one_line(b.text);
			if (b.type === "tool_use") return "running " + b.name + tool_hint(b.input);
			if (b.type === "tool_result") return "awaiting reply — last ran " + (tool_name_for(lines, i, b.tool_use_id) ?? "a tool");
		}
	}
	return "no activity yet";
}

/**
 * What a task IS, from its manifest alone. A task goes live when it was
 * *requested* — a manifest carrying nothing but a `group` is metadata, not a
 * launch, and read as "running since …" forever before this existed.
 */
export const state = m => m?.landed_at ? "landed" : m?.requested_at ? "running" : "proposed";

/**
 * A task's step outline as progress. `steps` is the outline declared at launch,
 * `step` the 1-based index of the one underway — so `1..step-1` are done and
 * nothing can disagree with anything. A landed task reads as all-done whatever
 * `step` says. Null when the task declared no outline.
 */
export function progress(m){
	const steps = m?.steps;
	if (!steps?.length) return null;
	const total = steps.length;
	const step = Math.max(1, Math.min(m.step ?? 1, total));
	return { steps, total, step, done: m.landed_at ? total : step - 1,
		current: m.landed_at ? null : steps[step - 1] };
}

/** What a task cost, as [value, label] — dollars when anyone reported them, else tokens. */
export function spend(m){
	if (!m) return null;
	const agents = m.agents ?? [];
	const some = (own, key) => own ?? (agents.some(a => a[key] != null)
		? agents.reduce((n, a) => n + (a[key] ?? 0), 0) : null);

	const usd = some(m.cost_usd, "cost_usd");
	if (usd) return ["$" + usd.toFixed(2), "cost"];
	const tokens = some(m.tokens, "tokens");
	return tokens ? [Math.round(tokens / 1000).toLocaleString() + "k", "tokens"] : null;
}

/**
 * Real prompt boundaries with timestamps — a human ask or a genuine follow-up,
 * harness noise (`isMeta` skill/caveat injections, tag-only lines) filtered out.
 */
export function timeline_of(lines){
	return lines
		.filter(l => l.type === "user" && !l.isSidechain && !l.isMeta && prose_of(l.message?.content))
		.map(l => ({ at: l.timestamp, uuid: l.uuid, text: one_line(prose_of(l.message.content)) }));
}
