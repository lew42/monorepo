import fs from "fs";
import path from "path";
import AISessionFlags from "./AISessionFlags.js";
import AISessionBuckets from "./AISessionBuckets.js";

/* The node side of the Sessions grid's rows: what the "sessions" query source (ext/Query) adds to each index snapshot so the browser draws
 * the same row the files path does. `shape` is the join; the snapshot itself stays as the index wrote it (no second store).
 * Doc: ext/Query/doc/architecture.md. */
export default class AISessionSource {

	/** id -> source tag ("sdk", "cli", "vscode") from sessions.json, the legacy snapshot the files path also reads. Filled by load(). */
	static tags = new Map();

	/** Read the join file once, when the source loads. A missing file is an empty join. */
	static load(root) {
		AISessionSource.tags = new Map();
		try {
			for (const r of JSON.parse(fs.readFileSync(path.join(root, "sessions.json"), "utf8")).rows ?? [])
				if (r.source && r.source !== "servex") AISessionSource.tags.set(r.session_id ?? r.id, r.source);
		} catch {}
		try {   // the same flags table the files path loads (Server/session-flags.mjs): roles, hour dollars, context, last line
			const data = JSON.parse(fs.readFileSync(path.join(root, "session-flags.json"), "utf8"));
			AISessionFlags.generated_at = Date.parse(data.generated_at ?? 0) || 0;
			AISessionFlags.rows = data.rows ?? {};
		} catch {}
	}

	/** The files path's in-flight test (AISessionRows.is_in_flight / true_state): a live Servex agent, or a session whose transcript moved in the last five minutes. */
	static in_flight(r, now = Date.now()) {
		if (r.source === "servex") return !!r.state && !AISessionSource.NOT_IN_FLIGHT.has(r.state);
		return now - (Date.parse(r.last_activity ?? 0) || 0) < 5 * 60 * 1000;
	}
	static NOT_IN_FLIGHT = new Set(["dormant", "stopped", "gone", "done", "failed", "error", "ended"]);

	/** A Servex-spawned session has a registry agent id; any other is the tag sessions.json gave it, else a VS Code tab (what the files path draws for a session only the index knows). */
	static source_of(snap) { return snap.agent ? "servex" : AISessionSource.tags.get(snap.id) ?? "vscode"; }

	/** The Claude spend the files path totals (AISessionRows.claude_usd_of): OpenRouter dollars are not Claude's. */
	static claude_usd_of(snap) { return snap.provider === "openrouter" ? 0 : snap.usd ?? 0; }

	/** The files path's "needs attention" test, run by the same AISessionFlags.flags_of: a session-record alert or any red flag. 1 or 0, so the query can `gte` and `sum` it. */
	static attention_of(row) { return row.alerts || AISessionFlags.flags_of(row).length ? 1 : 0; }

	/** The sorted matches become the grid's list, exactly as AISessionsPage.arrange does for the files path (the same AISessionBuckets.arrange): routine kinds roll up into head rows,
	 * children nest under their parent. `spec.open` = { kinds, ids } is what the browser has expanded. Each session row carries its `nest` ({ depth, kids, open }). */
	static arrange(hit, spec) {
		const now = Date.now(), by = spec.sort?.by ?? "last_activity";
		if (by === "last_activity" && spec.sort?.dir !== "asc") { const up = hit.filter(r => AISessionSource.in_flight(r, now)); if (up.length) { const set = new Set(up); hit = [...up, ...hit.filter(r => !set.has(r))]; } }   // the default sort: a running session is the newest
		const open = spec.open ?? {}, buckets = AISessionSource.buckets ??= new AISessionBuckets([], { of: r => r, key: r => r.id });
		const { out, nests } = AISessionBuckets.arrange(hit, { buckets, sort: rs => rs, open_kinds: new Set(open.kinds), open_ids: new Set(open.ids), parent_of: r => r.parent, id_of: r => r.id });
		return out.map(r => r.bucket ? r : { ...r, nest: nests.get(r) });
	}

	static shape(snap) {
		const source = AISessionSource.source_of(snap);
		const row = { ...snap, source, claude_usd: AISessionSource.claude_usd_of(snap), closed: !!snap.closed, role: source === "servex" ? AISessionBuckets.role_of(snap) : null };
		row.attention = AISessionSource.attention_of(row);
		return row;
	}
}
