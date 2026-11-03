import Logger from "../Logger.js";

/**
 * instrument_whisper(whisper) — wires a `Logger` onto a live
 * `Transcriber.Whisper` instance from the OUTSIDE: `audio/**` is read-only
 * for this task, so nothing here edits `Whisper.js` — every line below only
 * CALLS its public surface (`tick()` / `transcribe()` / `commit_all()` as
 * plain methods it replaces on the INSTANCE, never the class; `on_final` as
 * the exact compose-a-listener pattern `Transcriber.Transcript` and
 * `Transcriber.View` already use on this same class, in `audio/Transcriber/
 * Transcriber.js` — so this never competes with another listener already on
 * the instance).
 *
 * Call it BEFORE `whisper.start(mic)` (the interval inside `start()` reads
 * `this.tick` fresh on every fire, so replacing it first is enough — nothing
 * needs to happen after `start()`).
 *
 *   const logger = instrument_whisper(whisper).logger;
 *   const seams = instrument_whisper(whisper);
 *   seams.on_seam((tick_id, text) => …);   // for the transcript view's own marks
 *   await whisper.start(mic);
 *
 * One TICK is one group (the brief's own shape), holding: how many seconds
 * of audio were sent, the previous tail, the raw text whisper-server
 * returned (nested one level deeper, inside `transcribe()`'s own group —
 * whose duration IS "the ms the request took"), what COMMITTED (highlighted
 * — `logger.note("highlight", …)`, logged from ONE place, `on_final`, so an
 * agreement commit and a forced one never both log it), and the new tail. A
 * SKIPPED tick (already sending, or not loud enough — `tick()`'s own two
 * early returns, read here rather than duplicated) is one muted line, never
 * a group. A forced commit past `window_s` opens as its own nested group,
 * labelled a seam — `on_final` still fires inside it, so "committed" nests
 * under the right one either way.
 *
 * ⚠ Deliberate exception to "a partial guess is ephemeral, never logged"
 * (`audio/Transcriber/readme.md`): THIS is the tool built to see exactly
 * that, so the previous/new tail lines here log text the real dictation UI
 * never would. Never copy this pattern into a production listener.
 */
export default function instrument_whisper(whisper){
	const logger = Logger.attach(whisper);
	const seam_listeners = [];
	let tick_n = 0;

	const real_tick = whisper.tick.bind(whisper);
	const real_transcribe = whisper.transcribe.bind(whisper);
	const real_commit_all = whisper.commit_all.bind(whisper);

	whisper.transcribe = samples => logger.group("transcribe()", async () => {
		const text = await real_transcribe(samples);
		logger.log("whisper said:", text || "(nothing)");
		return text;
	});

	whisper.commit_all = text => logger.group("forced commit — a seam (past window_s)", () => real_commit_all(text));

	whisper.tick = async () => {
		if (whisper.inflight){ logger.note("muted", "tick skipped — a request is already in flight"); return; }

		const samples = whisper.mic.snapshot();
		if (!whisper.worth_sending(samples)){
			logger.note("muted", "tick skipped — not loud enough");
			return real_tick();
		}

		const id = `whisper-tick-${++tick_n}`;
		const prev_tail = whisper.prev_tail_words.join(" ");
		const seconds = (samples.length / whisper.mic.rate()).toFixed(1);

		await logger.group(`tick #${tick_n}`, async entry => {
			entry.id = id;
			logger.log(seconds + "s of audio sent");
			if (prev_tail) logger.log("previous tail:", prev_tail);

			await real_tick();

			const new_tail = whisper.prev_tail_words.join(" ");
			if (new_tail) logger.log("new tail:", new_tail);
		});
	};

	// The ONE place "committed" logs, for BOTH paths: a normal agreement
	// commit calls `note_final()` directly from inside `tick()`'s own group;
	// a forced one calls it from inside `commit_all()`'s group (above) —
	// either way `on_final` fires while the right group is still open, so
	// this line always nests under the group that actually produced it.
	const prior_final = whisper.on_final;
	whisper.on_final = text => {
		prior_final?.(text);
		const n = text.trim().split(/\s+/).filter(Boolean).length;
		logger.log(n === 1 ? "1 word agreed" : `${n} words agreed`);
		logger.note("highlight", "committed:", text);
		seam_listeners.forEach(fn => fn(`whisper-tick-${tick_n}`, text));
	};

	return { logger, on_seam(fn){ seam_listeners.push(fn); } };
}

export { instrument_whisper };
