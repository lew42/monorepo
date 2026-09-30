/**
 * **Who has the floor, and the rhythm of the talking.** One small, shared record
 * of the microphone, so an assistant reading the prompts log can tell "the owner
 * is still talking, hold your reply" from "the owner has finished".
 *
 * `Dictate` feeds it (mic on, every level frame, mic off), and `post_prompt()`
 * stamps two fields onto every entry it posts:
 *
 *     entry.floor = "speaking" | "done"
 *     entry.cues  = { mic_on_at, pauses: [{start, end, ms}], speaking_ms }
 *
 * `start`/`end` are milliseconds since the mic turned on. `pauses` holds only the
 * pauses since the PREVIOUS stamped entry, so each entry carries the rhythm of its
 * own words. A pause still running when the entry is sent has `end: null` and is
 * SPLIT there: the next entry reports the rest of it, starting at the cut, so no
 * quiet is ever counted twice. Only a mic entry (`via: "whisper"`) takes cues;
 * a typed one is always "done" and leaves them for the next dictated entry.
 * The contract, for whoever reads the log: `ext/Chat/doc/floor.md`.
 *
 * It is module state on purpose: there is one microphone, and every `Dictate` on
 * the page (ComposerMic included) reaches this without any wiring of its own.
 */
export const floor = {
	min_pause_ms: 300,     // a quiet stretch shorter than this is between words, not a pause
	done_after_ms: 1500,   // quiet this long ends the thought (ext/Chat's paragraph pause, break_pause_ms)

	owner: null,           // the Dictate instance whose mic is on, or null
	on_at: 0,              // performance.now() when the mic turned on
	mic_on_at: null,       // the same moment, as an ISO string for the log
	pauses: [],            // closed pauses not yet stamped onto an entry
	quiet_since: null,     // performance.now() the current quiet began, or null while loud
	heard: false,          // any speech yet this session (quiet before the first word is not a pause)
	split: false,          // the current quiet was cut by a send: its remainder is reported however short
	speaking_ms: 0,        // loud time since the previous stamped entry
	last_at: 0,            // the previous level frame's time

	/** The mic really is on (Dictate's own "listening"). */
	mic_on(owner){
		const now = performance.now();
		Object.assign(this, { owner, on_at: now, mic_on_at: new Date().toISOString(), pauses: [],
			quiet_since: now, heard: false, split: false, speaking_ms: 0, last_at: now });
		this.post("speaking", owner);
	},

	/** One level frame (about every 8 ms). `loud` is Dictate's own speech test. */
	level(owner, loud){
		if (owner !== this.owner) return;
		const now = performance.now();
		if (loud){
			if (this.quiet_since != null && this.heard) this.close_pause(now);
			this.quiet_since = null;
			this.split = false;
			this.speaking_ms += now - this.last_at;
			this.heard = true;
		} else if (this.quiet_since == null) this.quiet_since = now;
		this.last_at = now;
	},

	close_pause(now){
		const ms = now - this.quiet_since;
		if (ms >= this.min_pause_ms || (this.split && ms > 0)) this.pauses.push({ start: Math.round(this.quiet_since - this.on_at), end: Math.round(now - this.on_at), ms: Math.round(ms) });
	},

	/** The mic is off (stopped, errored, or stopping). Only its own owner can end it. */
	mic_off(owner){
		if (owner !== this.owner) return;
		this.owner = null;
		this.post("idle", owner);
	},

	/** "speaking" while the mic is on and the current quiet is shorter than `done_after_ms`. */
	state(){
		if (!this.owner) return "done";
		const quiet = this.quiet_since == null ? 0 : performance.now() - this.quiet_since;
		return quiet >= this.done_after_ms ? "done" : "speaking";
	},

	/** Adds `floor` and (after any mic session) `cues` to an entry, then starts the next
	 *  entry's rhythm fresh. An entry that already has them is left as it is. */
	stamp(entry){
		if (!entry || typeof entry !== "object" || entry.type === "floor" || "floor" in entry) return entry;
		if (entry.chat){ entry.floor = this.state(); return entry; }   // a revision line: the floor now, but it never takes the cues
		if (!this.voice(entry)){ entry.floor = "done"; return entry; }  // typed: finished by definition, and the cues wait for the next dictated entry
		entry.floor = this.state();
		if (!this.mic_on_at) return entry;   // no mic this page load: a typed entry, nothing to report
		const now = performance.now();
		const pauses = [...this.pauses];
		const open = now - (this.quiet_since ?? now);
		if (this.owner && this.quiet_since != null && this.heard && (open >= this.min_pause_ms || (this.split && open > 0))){
			pauses.push({ start: Math.round(this.quiet_since - this.on_at), end: null, ms: Math.round(open) });
			this.quiet_since = now;   // split here: the next entry reports only the rest
			this.split = true;
		}
		entry.cues = { mic_on_at: this.mic_on_at, pauses, speaking_ms: Math.round(this.speaking_ms) };
		this.pauses = [];
		this.speaking_ms = 0;
		if (!this.owner) this.mic_on_at = null;   // the last entry of a finished session took its cues; a later typed one gets none
		return entry;
	},

	/** A mic entry: Dictate and ComposerMic both post `via: "whisper"` (the browser engine too). */
	voice(entry){ return entry.via === "whisper" || entry.via === "voice"; },

	/** `{type:"floor", state}` to the prompts log — Servex stamps `at` on arrival. Every
	 *  reader of that log ignores a type it does not know (checked: the fold, the fast
	 *  assistant, the Dispatcher), so this makes no card and no reply. Set by Dictate.js. */
	post: (state, owner) => {},
};

export default floor;
