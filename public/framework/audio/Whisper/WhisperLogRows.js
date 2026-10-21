/**
 * class WhisperLogRows — the pure half of the Whisper log: how to read a list of log lines. No DOM, so
 * `node --test` runs it. `WhisperLog.View` draws what `annotate()` returns.
 *
 *   const rows = WhisperLogRows.annotate(lines);   // sorted; each row gains .change .diff .dup_of
 *
 * `change` says what a row did to the previous row of its lane (same segment of Whisper replies, or the same
 * stage downstream): "new", "same", "grow" (only words added at the end), "amend" (an earlier word changed).
 * `dup_of` is the `seq` of an earlier row at the same stage with the same words: the duplicate to look for.
 * Doc: `audio/Whisper/readme.md`.
 */
export default class WhisperLogRows {

	/** Stages where the same words appearing twice means a duplicate. A grey interim guess repeating is normal, so it is not here. */
	static DUP_STAGES = new Set(["server:final", "dictate:commit", "composer:enqueue", "composer:post", "composer:deliver", "refine:go", "refine:chunk", "chat:bubble"]);

	static norm(t){ return String(t ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
	static words(t){ return String(t ?? "").trim().split(/\s+/).filter(Boolean); }
	static stage(row){ return `${row.src}:${row.kind}`; }

	/** The lane a row is compared inside: Whisper replies of one segment, else the same stage. */
	static lane(row){ return row.src === "server" && row.segment != null ? `server:${row.segment}` : WhisperLogRows.stage(row); }

	/** Word diff of `b` against `a` (LCS, case and trailing punctuation ignored): [{w, op: "same"|"add"|"del"}]. */
	static diff(a, b){
		const A = WhisperLogRows.words(a), B = WhisperLogRows.words(b), n = (w) => w.toLowerCase().replace(/[.,!?;:]+$/, "");
		const L = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
		for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--)
			L[i][j] = n(A[i]) === n(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
		const out = [];
		let i = 0, j = 0;
		while (i < A.length && j < B.length){
			if (n(A[i]) === n(B[j])){ out.push({ w: B[j], op: "same" }); i++; j++; }
			else if (L[i + 1][j] >= L[i][j + 1]) out.push({ w: A[i++], op: "del" });
			else out.push({ w: B[j++], op: "add" });
		}
		while (i < A.length) out.push({ w: A[i++], op: "del" });
		while (j < B.length) out.push({ w: B[j++], op: "add" });
		return out;
	}

	/** "new" | "same" | "grow" | "amend": what `text` did to the `before` text of its lane. */
	static change(before, text){
		if (before == null) return "new";
		const d = WhisperLogRows.diff(before, text);
		if (d.every(x => x.op === "same")) return "same";
		const shared = d.filter(x => x.op === "same").length, shorter = Math.min(WhisperLogRows.words(before).length, WhisperLogRows.words(text).length);
		if (shared < shorter / 2) return "new";   // a different sentence in the same lane, not a rewrite of the last one
		const del = d.some(x => x.op === "del");
		if (!del) return "grow";
		// the last word of a guess is still forming: a lone changed last word is a tweak, not an amend of earlier words
		const cut = d.findLastIndex(x => x.op === "same");
		const tail_only = !d.slice(0, cut + 1).some(x => x.op !== "same");
		return tail_only && d.filter(x => x.op === "del").length <= 1 ? "grow" : "amend";
	}

	/** Sort by time then seq, and mark every row: change, diff against its lane's previous row, dup_of. */
	static annotate(lines){
		const rows = [...lines].filter(l => l && l.seq != null).sort((a, b) => (a.t ?? 0) - (b.t ?? 0) || a.seq - b.seq);
		const last = new Map(), seen = new Map();
		return rows.map(r => {
			const row = { ...r }, text = r.msg ?? "", lane = WhisperLogRows.lane(r);
			const prev = last.get(lane);
			row.change = text ? WhisperLogRows.change(prev?.msg, text) : "none";
			row.diff = text && prev?.msg ? WhisperLogRows.diff(prev.msg, text) : null;
			row.prev_seq = prev?.seq ?? null;
			if (text) last.set(lane, r);
			const stage = WhisperLogRows.stage(r), key = `${r.run}|${stage}|${WhisperLogRows.norm(text)}`;
			if (text && WhisperLogRows.DUP_STAGES.has(stage) && WhisperLogRows.norm(text).length > 1){
				if (seen.has(key)) row.dup_of = seen.get(key); else seen.set(key, r.seq);
			}
			return row;
		});
	}

	/** Mark which final replaced which interims: an interim of the same run and segment, before a final, gains
	 *  `replaced_by` (the final's seq); the final gains `replaces` (their seqs). Rows are changed in place and returned. */
	static supersede(rows){
		const finals = new Map();
		for (const r of rows) if (r.src === "server" && r.kind === "final" && r.segment != null) finals.set(`${r.run}|${r.segment}`, r);
		for (const r of rows){
			if (r.src !== "server" || r.kind !== "interim" || r.segment == null) continue;
			const f = finals.get(`${r.run}|${r.segment}`);
			if (!f || (f.t ?? 0) < (r.t ?? 0)) continue;
			r.replaced_by = f.seq;
			(f.replaces ??= []).push(r.seq);
		}
		return rows;
	}

	static runs(lines){ return [...new Set(lines.filter(l => l?.run).map(l => l.run))]; }

	/** One line of facts: how many replies, how many amended, how many duplicates, per stage. */
	static summary(rows){
		const by = {};
		for (const r of rows){ const s = WhisperLogRows.stage(r); by[s] = (by[s] ?? 0) + 1; }
		return { rows: rows.length, amends: rows.filter(r => r.change === "amend").length, dups: rows.filter(r => r.dup_of != null).length, by };
	}
}
