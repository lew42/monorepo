import PromptLog from "./PromptLog.js";
import LineKey from "../../core/Item/LineKey.js";

/** The Timeline's rows, built with no DOM so a node test can count them (SessionTimeline.test.mjs). A record line is one row, a prompt of
 *  prompts.jsonl is one row, a landed child session is one row; SessionTimeline draws them. Readme: ai/AISession/readme.md. */
export default class SessionTimelineRows {

	/** [kind, menu label, material icon]; `done` wears SessionOutlineView.state_icon, the Overview's green check. */
	static KINDS = [
		["prompt", "Prompts", "record_voice_over"], ["task", "Tasks added and changed", "add_task"], ["done", "Tasks done", "check_circle"],
		["child", "Child sessions started", "play_circle"], ["landed", "Child sessions landed", "flag"], ["note", "Notes", "sticky_note_2"],
		["decision", "Decisions", "gavel"], ["review", "Reviews", "rate_review"], ["commit", "Commits", "commit"],
		["session", "Session start and stop", "power_settings_new"], ["chat", "Chat (owner and assistant)", "forum"],
		["log", "Log lines", "notes"], ["tag", "Tag lines", "sell"], ["plumbing", "Voice plumbing (placement, relay, pauses, word-by-word text)", "cable"], ["other", "Other, unrecognized lines", "more_horiz"],
	];
	static HIDDEN = ["log", "tag", "plumbing"];   // off until the reader turns them on
	static LANDED = ["landed", "complete", "done", "closed"];

	// ---- rows: no DOM, so the test can call them ---------------------------------------------------------------------------------

	static time_of(l){
		const own = l.at ?? l.ts;
		if (own) return Date.parse(own) || null;
		for (const v of Object.values(l)) if (v && typeof v === "object" && !Array.isArray(v) && v.at) return Date.parse(v.at) || null;
		return null;
	}

	static clip(s, n = 220){ s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
	static slug_of(path){ return String(path ?? "").split("/").filter(Boolean).pop() ?? ""; }

	/** Every task title the record names (`tasks.add`), id to title: a later line says "done" with only the id. */
	static titles(lines){
		const out = new Map();
		const walk = l => { if (!l || typeof l !== "object") return; l = LineKey.deep(l); for (const x of [].concat(l.tasks?.add ?? [])) if (x?.id && x.title) out.set(x.id, x.title); for (const v of Object.values(l)) if (v && typeof v === "object" && !Array.isArray(v) && v.tasks) walk(v); };
		lines.forEach(walk);
		return out;
	}

	/** One `tasks` line, which may add tasks, finish some and drop others at once, as one row. */
	static task_row(t, titles){
		const name = id => SessionTimelineRows.clip(titles.get(id) ?? id, 120), adds = [], done = [], dropped = [], other = [];
		for (const [id, v] of Object.entries(t)){
			if (id === "add"){ adds.push(...[].concat(v)); continue; }
			if (v && typeof v === "object" && "complete" in v) done.push([id, v.complete]);
			else if (v && typeof v === "object" && "stop" in v) dropped.push([id, v.stop]);
			else other.push([id, v]);
		}
		const list = (names, noun) => names.length === 1 ? names[0] : `${names.length} ${noun}: ${names.slice(0, 2).join("; ")}${names.length > 2 ? ` and ${names.length - 2} more` : ""}`;
		const also = [done.length && adds.length && `${adds.length} added`, dropped.length && (done.length || adds.length) && `${dropped.length} dropped`, other.length && (done.length || adds.length || dropped.length) && `${other.length} changed`].filter(Boolean).join(", ");
		const tail = also ? ` (also ${also})` : "";
		if (done.length){
			const one = done.length === 1 ? done[0][1] : null, outcome = typeof one === "string" ? one : one?.outcome;
			return { kind: "done", text: (done.length === 1 ? "Done: " : "") + list(done.map(d => name(d[0])), "tasks done") + tail, more: outcome ? SessionTimelineRows.clip(outcome, 300) : "" };
		}
		if (adds.length) return { kind: "task", text: (adds.length === 1 ? "Task added: " : "") + list(adds.map(x => SessionTimelineRows.clip(x.title ?? x.id ?? "untitled", 120)), "tasks added") + tail };
		if (dropped.length) return { kind: "task", text: (dropped.length === 1 ? "Dropped: " : "") + list(dropped.map(d => name(d[0])), "tasks dropped") + tail, more: dropped.length === 1 && typeof dropped[0][1] === "string" ? SessionTimelineRows.clip(dropped[0][1], 300) : "" };
		const first = other[0]?.[1], note = first && typeof first === "object" ? first.note ?? first.now ?? first.waiting_on : null;
		return { kind: "task", text: "Task update: " + list(other.map(d => name(d[0])), "tasks"), more: other.length === 1 && note ? SessionTimelineRows.clip(typeof note === "string" ? note : JSON.stringify(note), 300) : "" };
	}

	/** One record line to one row `{ kind, at, text, more?, children? }`. `children` are the child sessions the row names (linked when drawn). */
	static row(l, titles){
		l = LineKey.deep(l);   // `complete()` and `#c3` read as complete and c3 (D13)
		const at = SessionTimelineRows.time_of(l), clip = SessionTimelineRows.clip, str = v => typeof v === "string" ? v : v?.msg ?? v?.text ?? v?.title ?? v?.about ?? v?.id ?? "";
		if (l.tasks && typeof l.tasks === "object") return { ...SessionTimelineRows.task_row(l.tasks, titles), at };
		if (typeof l.task === "string"){
			const id = l.as ?? SessionTimelineRows.slug_of(l.task);
			if (l.type === "Session" || l.spawn) return { kind: "child", at, text: "Child session started", children: [id], more: [l.spawn?.role, l.spawn?.model].filter(Boolean).join(" · ") };
			return { kind: "task", at, text: "Task linked: " + id, more: l.moved_from ? "moved here" : "" };
		}
		if (Array.isArray(l.sessions)){
			const ids = l.sessions.map(s => typeof s === "string" ? s : s?.id).filter(Boolean);
			return { kind: "child", at, text: ids.length > 1 ? `${ids.length} child sessions started` : "Child session started", children: ids };
		}
		if (l.decide) return { kind: "task", at, text: `Owner ${l.decide.is}: ${clip(titles.get(l.decide.task) ?? l.decide.task, 120)}`, more: l.decide.note ? clip(l.decide.note) : "" };
		if (l.tag !== undefined) return { kind: "tag", at, text: "Tag: " + str(l.tag) };
		if (l.log !== undefined) return { kind: "log", at, text: clip(str(l.log)) };
		if (l.note !== undefined) return { kind: "note", at, text: clip(str(l.note)) };
		if (l.decision !== undefined) return { kind: "decision", at, text: "Decision: " + clip(str(l.decision)), more: typeof l.decision === "object" ? clip(l.decision.decision ?? l.decision.chose ?? l.decision.why ?? "", 300) : "" };
		if (l.review !== undefined){
			const r = l.review, n = Array.isArray(r?.findings) ? r.findings.length : 0;
			return { kind: "review", at, text: `Review${r?.size ? " (" + r.size + ")" : ""}: ${r?.verdict ?? "recorded"} · ${n} finding${n === 1 ? "" : "s"}` };
		}
		if (l.commit !== undefined) return { kind: "commit", at, text: `Commit ${String(l.commit?.hash ?? "").slice(0, 8)}: ${clip(l.commit?.what ?? "", 200)}` };
		if (l.content !== undefined){ const x = l.content.add ?? l.content; return { kind: "note", at, text: `${x?.type ?? "Content"}: ${clip(x?.text ?? x?.title ?? "")}` }; }
		if (l.stop !== undefined) return { kind: "session", at, text: "Session stopped" + (l.stop?.why ? ": " + clip(l.stop.why, 160) : "") };
		if (l.start !== undefined) return { kind: "session", at, text: "Session resumed" };
		if (l.landed_at !== undefined) return { kind: "session", at, text: "Landed" + (l.outcome ? ": " + clip(l.outcome, 200) : "") };
		if (l.session && typeof l.session === "object") return { kind: "session", at, text: "Session started" + (l.session.kind ? " (" + l.session.kind + ")" : "") };
		if (l.assign !== undefined || l.agent !== undefined) return { kind: "session", at, text: "Agent assigned" + (l.assign?.role ? ": " + l.assign.role : "") };
		if (typeof l.msg === "string") return { kind: SessionTimelineRows.KINDS.some(k => k[0] === l.type) ? l.type : "log", at, text: clip(l.msg) };
		// `chat` is the real conversation (owner and assistant; unlike the "prompt" rows below it also has the assistant's replies).
		// `place`, `sent` and `quiet` are internal relay/pause bookkeeping: real, but not worth reading by default.
		if (l.chat !== undefined) return { kind: "chat", at, text: (l.chat?.from?.kind === "owner" ? "You: " : "Reply: ") + clip(l.chat?.text ?? "") };
		if (l.place !== undefined) return { kind: "plumbing", at, text: "Placed: " + clip(l.place?.text ?? "") };
		// The real chat list (core/Session/Chat), written beside each `chat` line above: the same words again, so plumbing here.
		if (l.messages !== undefined || l.sentences !== undefined) return { kind: "plumbing", at, text: "Chat list: " + clip(l.sentences?.add?.text ?? l.messages?.add?.text ?? Object.keys(l.messages ?? {})[0] ?? "") };
		if (l.sent !== undefined) return { kind: "plumbing", at, text: "Relayed to " + (l.sent?.to ?? "?") + (Array.isArray(l.sent?.re) ? ` (${l.sent.re.length} lines)` : "") };
		if (l.quiet !== undefined) return { kind: "plumbing", at, text: "Quiet" + (l.quiet?.ms ? ` (${l.quiet.ms}ms)` : "") };
		const inner = Object.values(l).find(v => v && typeof v === "object" && !Array.isArray(v) && (v.tasks || typeof v.task === "string"));
		if (inner) return { ...SessionTimelineRows.row(inner, titles), at: at ?? SessionTimelineRows.time_of(inner) };
		// A prompt's own text arriving word by word (`{"raw":{"push":"…"}}`, `{"paragraphs":{"append":…}}`), nested under its p-<id> key:
		// the finished prompt already gets its own "prompt" row below (from prompts.jsonl), so this is plumbing, not a second copy of it.
		const only = Object.keys(l).find(k => !["by", "ts", "at"].includes(k)), ov = only ? l[only] : null;
		if (ov && typeof ov === "object" && (ov.raw?.push !== undefined || ov.paragraphs !== undefined)) return { kind: "plumbing", at, text: "Prompt text updated" };
		const key = only ?? "line";
		return { kind: "other", at, text: key + ": " + clip(typeof l[key] === "string" ? l[key] : JSON.stringify(l[key]), 160) };
	}

	/** Every row, oldest first: one per record line, one per prompt in the log (`PromptLog.fold` of its lines), one per landed child
	 *  (`landed`: `[{ id, name, at }]`). A line with no time of its own takes the time of the line before it; the sort is stable. */
	static rows(lines = [], prompt_lines = [], landed = []){
		const titles = SessionTimelineRows.titles(lines), out = [];
		let last = null;
		lines.forEach((l, n) => {
			const r = SessionTimelineRows.row(l, titles);
			if (r.at == null) r.at = last; else last = r.at;
			out.push({ ...r, n });
		});
		const first = out.find(r => r.at != null)?.at ?? 0;
		out.forEach(r => { r.at ??= first; });
		for (const pr of Object.values(PromptLog.fold(prompt_lines))){
			const raw = pr.raw ?? pr.clean.join(" ");
			out.push({ kind: "prompt", at: Date.parse(pr.at) || first, text: SessionTimelineRows.clip(pr.subject || raw || "(empty prompt)", 160), raw: raw ?? "", n: out.length });
		}
		for (const c of landed) out.push({ kind: "landed", at: Date.parse(c.at) || first, text: "Child session landed", children: [c.id ?? c.name], n: out.length });
		return out.sort((x, y) => x.at - y.at || x.n - y.n);
	}

	/** The child sessions that have landed, from the Overview's child list (SessionOutline.children().list). */
	static landed_of(kids){
		return kids.filter(c => c.snap && (c.snap.closed || SessionTimelineRows.LANDED.includes(c.snap.state))).map(c => ({ id: c.id ?? c.key, name: c.name, at: c.snap.last_activity ?? c.snap.first_at }));
	}
}
