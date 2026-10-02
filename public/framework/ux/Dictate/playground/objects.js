/**
 * The playground's data, as real classes instead of plain object literals — minion-part2
 * of [public/framework/ai/2026-10-01/inspect/](/framework/ai/2026-10-01/inspect/), built
 * on Part 1's [`inspect()`](/framework/ux/Content/Object/Inspect.js). The owner's own
 * words: "all of the things that the dictate is creating, all the data structures, we
 * want those to be object oriented so that we can give them an icon."
 *
 * Every class here carries `static icon = "…"` — a Material Symbols name, read by
 * `object()`/`view()`/`inspect()` alike (`ux/Content/Object/Object.js`'s `icon_name()`)
 * — and nothing else: no methods, no behavior. `Playground.js` is still the one place
 * that reads and writes these; this file only gives their shape a name and a face.
 */

/** One Whisper RESEND — a guess that keeps improving, not the final answer yet. Pushed
 * by `Playground.guess()` every time the live transcript changes, so the Chunks tab can
 * show the guess actually getting better instead of only the settled result. */
export class Resend {
	static icon = "sync";

	constructor({ t, segment, text, since_prev }){
		this.t = t;                  // performance.now() when this guess arrived
		this.segment = segment;      // which sentence-in-progress this belongs to
		this.text = text;            // the words Whisper returned this time
		this.since_prev = since_prev; // ms since the last guess, or null for the first one
	}
}

/** One settled sentence — Whisper's raw words, plus (a moment later) the cleaned
 * version and the word-level diff between them. Immutable once `source_kind` is set:
 * `Playground.clean_chunk()` fills in `cleaned`/`deltas`/`source_kind`/`model`/`ms`
 * exactly once, and nothing ever edits `raw` again — the Raw column's own rule
 * ("never removed or edited once drawn," requirements.md deliverable 5). */
export class Chunk {
	static icon = "notes";

	constructor({ raw, gap, cut, session }){
		this.raw = raw;               // Whisper's exact words — never touched after this
		this.gap = gap;                // true if a long pause came before this one (a paragraph break)
		this.cut = cut;                 // why the segment closed: "pause" | "forced" | "manual" | undefined
		this.session = session;         // Playground's session counter, for the stale-cleanup guard

		// Filled in later by `clean_chunk()` — `null`/`undefined` until then, so an
		// `inspect()` card shows "not cleaned yet" rather than a stale guess.
		this.cleaned = null;
		this.deltas = null;
		this.source_kind = null;
		this.model = undefined;
		this.ms = undefined;
		this.level = undefined;
	}
}

/** The "coming phase" the owner named — prompt analysis, investigation and planning,
 * once a settled chunk is more than just text. **This is a STUB ONLY.** Nothing fills
 * it in yet; it exists so the diagram has a real, inspectable place for it, exactly the
 * way the owner asked for ("even though nothing fills it in yet," requirements.md
 * deliverable 1) — not a promise that analysis is running. */
export class Analysis {
	static icon = "psychology";

	constructor(){
		this.status = "not built yet";
	}
}

/** The audio source panel's own state — which microphone, and how loud it is right
 * now. `Playground.audio_panel()`/`pick_device()`/`meter()` still own the real UI (the
 * device `<select>`, the level bar); this class only mirrors the same two facts so the
 * Structure panel's `inspect()` tree has something real to show for "the audio
 * source," instead of two numbers living only as closure variables nobody could see. */
export class Source {
	static icon = "mic";

	constructor(){
		this.device = null;   // the picked input's own label, or null before one is chosen
		this.level = 0;        // the same smoothed 0..1 number the meter bar reads
	}
}

/** One dictation session — everything a single 🎤 run creates, owned by ONE object
 * instead of scattered across separate `Playground` fields. This is what makes the
 * Structure panel possible: `inspect(session)` shows the whole tree — its chunks, its
 * resends, its source, its analysis — as one nested card, because it is actually one
 * object now, not four unrelated arrays. `Playground.reset()` makes a new one on every
 * fresh 🎤 press or ▶ Sample run; `Playground.cleaned_so_far` / `last_chunk_at` /
 * `clean_queue` stay on `Playground` itself, not here — they are the pipeline's own
 * bookkeeping for the NEXT chunk, never something a reader asked to see (logged as a
 * decision in this task's task.jsonl). */
export class Session {
	static icon = "hub";

	constructor(){
		this.chunks = [];          // [Chunk], settled order, immutable once cleaned
		this.resends = [];         // [Resend], every Whisper resend, not just the final text
		this.source = new Source();
		this.analysis = new Analysis();
		this.partial = "";         // the still-moving guess, not yet a Chunk
	}
}
