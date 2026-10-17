/* Dry run: `node chunk-session.mjs <session file> [gap hours=1] [max lines=200]`
 * Reads one session file as ext/Session writes it and PRINTS where it would be cut into archive
 * chunks: at a silence of the gap or more, or at the line cap. It writes and moves nothing (a later
 * step moves by this manifest). Why: doc/sessions.md. */
import { readFileSync } from "fs";

export default class ChunkSession {
	constructor({ gap_hours = 1, max_lines = 200 } = {}){ this.gap_ms = gap_hours * 3600e3; this.max_lines = max_lines; }

	/** [{ at, text }] for every dated line; the first key of a line is its kind (`session`, `chat`, …). */
	static read(file){
		return readFileSync(file, "utf8").split("\n").filter(Boolean).map(line => {
			try { const body = Object.values(JSON.parse(line))[0] ?? {}; return { at: Date.parse(body.at), text: body.text ?? "" }; }
			catch { return { at: NaN, text: "" }; }
		}).filter(l => !Number.isNaN(l.at));
	}

	/** The manifest: [{ chunk, from, to, lines, first_words }]. */
	manifest(lines){
		const chunks = [];
		for (const l of lines){
			const last = chunks.at(-1);
			if (!last || l.at - last.end >= this.gap_ms || last.lines >= this.max_lines)
				chunks.push({ chunk: chunks.length + 1, from: new Date(l.at).toISOString(), lines: 0, first_words: "", end: l.at });
			const c = chunks.at(-1);
			c.lines++; c.end = l.at; c.to = new Date(l.at).toISOString();
			if (!c.first_words && l.text) c.first_words = l.text.split(/\s+/).slice(0, 8).join(" ");
		}
		return chunks.map(({ end, ...c }) => c);
	}
}

if (process.argv[1]?.endsWith("chunk-session.mjs") && process.argv[2]){
	const [file, gap, cap] = process.argv.slice(2);
	const cs = new ChunkSession({ gap_hours: gap ? +gap : 1, max_lines: cap ? +cap : 200 });
	console.table(cs.manifest(ChunkSession.read(file)));
}
