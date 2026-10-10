import { AITask, div, p, span, b, code, pre, button, a, small, select, option, label, details, summary } from "/app.js";
import Capture from "/framework/ux/Dictate/capture.js";
import { remember_device, remembered_device } from "/framework/ux/Dictate/Dictate.js";

/* ⚠ An `AITask`, not a plain `Page`. A task dir that has its own `page.js` must
   be named in the day page's `children:`, and a declared child never reaches the
   day dashboard's generic `route()` — so a plain Page here would make this task's
   own record unreachable. `AITask` renders that record; `refresh()` below decides
   the ORDER, and the order is the whole point of this page.

   ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  `AITask`'s own `wide` track, prose held at --measure inside it.
   2 SIZE       THE TOOL IS THE PAGE. Picker, meter, record button and results fit
                one screen at 1280 with nothing above them (the owner, 18:45: "the
                test bench is way down the page… I had to scroll way down to find
                it"). Every word of explanation — the cause, the numbers, the raw
                API, this task's own report and tables — is one closed `<details>`
                BELOW the tool. Iceberg: the surface is what you use, the depth is
                one click down and nothing is deleted.
   3 OWN LAYOUT `flex v gap` for the bench stack; `flex gap wrap v-center` for the
                picker and button rows; `flex gap wrap` for the four number cards.
   4 REGIONS    two — the bench, and the fold.
   5 PREVIEW    one line on the day board. */

const WHISPER_URL = "http://127.0.0.1:8178";
const MIN_SPEECH_MS = 120;   // ux/Dictate's own floor — Dictate.prototype.min_speech_ms

/** One measured number with its name under it. Four fit one row at 1280 and 2×2
 *  at 400; the value never wraps, and `fit-content` keeps "16,000 Hz" unclipped. */
function stat(name){
	let $value;
	div.c("card flex v gap-25", () => {
		$value = div.c("h3", "—").style({ whiteSpace: "nowrap" });
		small.c("muted", name);
	}).style({ minWidth: "fit-content", flex: "1 1 6em" });
	return $value;
}

/** One level bar, and the setter that drives it. `gain` scales the BAR only —
 *  the number beside it is always the real measurement. RMS needs a gain of
 *  about 6 to fill on normal speech (~0.15); peak is already 0..1.
 *
 *  ⚠ The fill is `--ok`, turning `--error` at the top. There is no `--accent`
 *  token in this framework — the first version used one, and because an unknown
 *  custom property makes the whole declaration invalid, the bars painted
 *  TRANSPARENT while the numbers beside them updated correctly. Nothing looked
 *  broken until the screenshot. The ramp that exists is `--ok → --warn → --hot
 *  → --error` (framework.css). */
function meter(name, gain){
	let $fill, $num;
	div.c("flex gap-25 v-center", () => {
		small.c("muted", name).style({ width: "5em", flexShrink: "0" });
		div().style({ flex: "1 1 auto", height: "0.8em", borderRadius: "0.2em", overflow: "hidden", background: "var(--darken-1)" })
			.append(() => {
				$fill = div().style({ height: "100%", width: "0%", background: "var(--ok)", transition: "width 60ms linear" });
			});
		$num = small.c("muted", "0.000").style({ width: "4em", flexShrink: "0", textAlign: "right" });
	});
	return v => {
		$fill.style({ width: Math.min(100, v * gain * 100).toFixed(1) + "%", background: v >= 0.99 ? "var(--error)" : "var(--ok)" });
		$num.text(v.toFixed(3));
	};
}

export default new AITask({
	meta: import.meta,
	title: "dictate-silence",
	icon: "graphic_eq",
	description: "Which microphone is actually hearing you — watch the bars, then record.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Pick a microphone, watch the bars move while you talk, record until you stop. If the bars are flat, that device is not hearing you."));
	},

	/* The ORDER, overridden: the tool first, everything else folded under it.
	   ⚠ This region is rebuilt on EVERY streamed append to `task.jsonl`, and the
	   bench is a live instrument — an open microphone, a running meter, the
	   results of the take you just made. Rebuilding it threw all of that away
	   (measured: one append blanked a finished take back to "—"). So the bench is
	   built exactly ONCE and the same element is put back afterwards; only the
	   fold is redrawn. `empty()` detaches it for an instant, which the audio graph
	   does not care about, and every listener and value survives. */
	refresh(m){
		const built = !!this.$bench;
		this.$live.empty(() => {
			if (!built) this.$bench = this.bench();
			details(() => {
				summary("How this was found — the cause, the numbers, the raw API, the record");
				this.notes();
				this.outcome(m);
				this.links(m);
				this.status(m);
				this.checklist(m);
				this.unparsed(m);
				this.shots(m);
				this.figures(m);
			}).style({ marginTop: "2em" });
		});
		if (built) this.$live.el.insertBefore(this.$bench.el, this.$live.el.firstChild);
	},

	/** The tool. Everything it needs is built synchronously here; nothing below
	 *  the first `await` in any handler creates DOM (`code` skill §1). */
	bench(){
		this.mic?.stop();
		this.mic = null;

		let $bench;
		const page = this;
		const remembered = remembered_device();
		let chosen = remembered?.id ?? null;
		let clock = null;

		let $select, $listen, $device, $hint, $record, $state;
		let $verdict, $results, $seconds, $rate, $loud, $rms, $answer, $links;
		let set_peak, set_rms;

		// `data-bench` carries no styling — it is how a headless proof addresses
		// THIS bench on a page that also renders code blocks and a zoom control.
		$bench = div.c("flex v gap", () => {

			div.c("flex gap wrap v-center", () => {
				label.c("muted", "microphone");
				$select = select().style({ maxWidth: "24em" });
				$listen = button("▶ live test").attr("type", "button");
			});

			div.c("card flex v gap-25", () => {
				$device = div.c("h4", "no microphone open yet");
				set_peak = meter("now (peak)", 1);
				set_rms = meter("average (RMS)", 6);
				$hint = small.c("muted", "bars flat while you talk? pick another microphone ↑");
			});

			div.c("flex gap wrap v-center", () => {
				$record = button("● record").attr("type", "button")
					.style({ fontSize: "1.2em", padding: "0.4em 1em" });
				$state = span.c("muted", "press record and talk — it will ask for the microphone");
			});

			$results = div.c("flex v gap").style({ display: "none" });
			$results.append(() => {
				// A sentence, not a label — `.h4` uppercases, and three lines of
				// shouted red is harder to read than the thing it is warning about.
				$verdict = p().attr("data-verdict", "").style({ fontWeight: "600" });
				div.c("flex gap wrap", () => {
					$loud = stat("speech found");
					$seconds = stat("seconds");
					$rate = stat("sample rate");
					$rms = stat("average (RMS)");
				});
				$answer = pre().style({ whiteSpace: "pre-wrap" });
				$links = div.c("flex gap wrap v-center");
			});
		}).attr("data-bench", "");

		// ---- behaviour -------------------------------------------------------

		/** The `audioinput` list. Runs once now (names blank until permission is
		 *  granted) and again after the first `getUserMedia`, when they fill in.
		 *  ⚠ The remembered pick is matched by id FIRST and by name second — a
		 *  `deviceId` is salted per origin and does not survive clearing site
		 *  data, so the name is what makes "it remembered my microphone" true the
		 *  next morning rather than only this afternoon. */
		const fill_devices = async () => {
			const list = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "audioinput");
			$select.empty(() => {
				for (const d of list)
					option(d.label || "microphone " + (d.deviceId || "default").slice(0, 8)).attr("value", d.deviceId);
			});
			const match = list.find(d => d.deviceId === chosen)
				?? (remembered?.label ? list.find(d => d.label && d.label === remembered.label) : null);
			if (match){ chosen = match.deviceId; $select.el.value = chosen; }
			else chosen = $select.el.value || null;
		};

		/** WHICH microphone is open, in bold, at all times. The owner spent a take
		 *  talking into a device that was not selected; the name has to be
		 *  impossible to miss, right beside the bars that are not moving. */
		const name_device = () => {
			const cap = page.mic;
			if (!cap?.stream) return $device.text("no microphone open yet");
			const s = cap.settings();
			$device.text("🎤 " + (cap.label() || "unnamed microphone"));
			$rate.text(cap.rate().toLocaleString() + " Hz");
			$hint.text(`${s.sampleRate?.toLocaleString() ?? "?"} Hz, ${s.channelCount ?? "?"} channel`
				+ (cap.recovered ? " · found again under a new id" : "")
				+ (cap.fell_back ? " · your remembered microphone is gone, this is the system default" : "")
				+ " — bars flat while you talk? pick another microphone ↑");
		};

		const stop_listening = () => {
			page.mic?.stop();
			page.mic = null;
			page.recording = false;
			clearInterval(clock);
			set_peak(0); set_rms(0);
			$listen.text("▶ live test");
			$record.text("● record");
			$device.text("no microphone open yet");
			$state.text("press record and talk — it will ask for the microphone");
		};

		/** Open the chosen microphone and run the meter on it, recording nothing. */
		const listen = async () => {
			stop_listening();
			const named = $select.el.selectedOptions[0]?.textContent ?? remembered?.label ?? "";
			const cap = page.mic = new Capture({ device_id: chosen, device_label: named, keep: false });
			await cap.start((r, pk) => { set_rms(r); set_peak(pk); });
			// Follow the microphone that is actually open, never the one we asked for.
			if (cap.fell_back || cap.recovered) chosen = cap.device_id ?? cap.settings().deviceId ?? null;
			await fill_devices();          // names exist now that permission was granted
			remember_device(chosen, cap.label());
			name_device();
			$listen.text("■ stop listening");
			$state.text("listening — the bars are live, nothing is being recorded");
		};

		const finish = async () => {
			const cap = page.mic;
			page.recording = false;
			clearInterval(clock);
			cap.keep = false;
			$record.text("● record");
			$state.text("listening — the bars are live, nothing is being recorded");

			const samples = cap.snapshot();
			const loud = cap.loudness(samples);
			const wav = cap.wav(samples);
			const device = cap.label() || "the selected microphone";
			cap.cut();

			$seconds.text(loud.seconds.toFixed(2) + "s");
			$rate.text(cap.rate().toLocaleString() + " Hz");
			$rms.text(loud.rms.toFixed(4));
			$loud.text(loud.loud_ms + " ms");

			// ⚠ "No speech found" must carry its EVIDENCE. Whisper answers silence
			// by inventing a sentence, so without the peak, the RMS and the device
			// name beside it, a silent take reads as whisper mishearing you rather
			// than as nothing having reached the browser at all (the owner, 18:45).
			const heard = loud.loud_ms >= MIN_SPEECH_MS;
			$verdict.text(heard
				? `Heard you: ${(loud.loud_ms / 1000).toFixed(1)}s of speech on ${device}.`
				: `Nothing reached the browser — captured ${loud.peak.toFixed(3)} peak, ${loud.rms.toFixed(4)} average on ${device}. Pick another microphone above and watch the bars while you talk.`);
			$verdict.style({ color: heard ? "var(--ok)" : "var(--error)" });

			$answer.text("asking whisper…");
			$links.empty();
			try {
				const form = new FormData();
				form.append("file", wav, "segment.wav");
				form.append("response_format", "json");
				const started = performance.now();
				const r = await fetch(WHISPER_URL + "/inference", { method: "POST", body: form });
				const body = await r.text();
				const ms = Math.round(performance.now() - started);
				$answer.text((heard ? "whisper returned:\n" : "whisper INVENTS a sentence for silence — this is not your voice:\n")
					+ body.trim() + "\n\n" + ms + "ms round trip · " + wav.size.toLocaleString() + " bytes · peak " + loud.peak.toFixed(3));
			} catch (e){
				$answer.text("whisper-server did not answer: " + (e?.message ?? e) + "\n\nThe recording itself is fine — download it below.");
			}
			$links.append(() => {
				a("⬇ download this WAV").href(URL.createObjectURL(wav)).attr("download", `dictate-${Date.now()}.wav`);
				small.c("muted", heard
					? "Real dictation would send this."
					: `Under ${MIN_SPEECH_MS}ms of speech — real dictation refuses to send this, which is the fix.`);
			});
		};

		$select.on("change", async () => {
			chosen = $select.el.value || null;
			remember_device(chosen, $select.el.selectedOptions[0]?.textContent ?? "");
			if (page.mic) await listen().catch(e => $state.text("could not open that microphone: " + (e?.message ?? e)));
		});

		$listen.on("click", async () => {
			if (page.mic) return stop_listening();
			$state.text("opening the microphone…");
			try { await listen(); }
			catch (e){ stop_listening(); $state.text("could not open that microphone: " + (e?.message ?? e)); }
		});

		/* No gate. The record button works from the first paint: it opens the
		   microphone itself if nothing is listening yet, then records (the owner,
		   18:45: "I have to click live test first before the record button even
		   turns on"). */
		$record.on("click", async () => {
			if (page.recording) return finish();
			if (!page.mic){
				$state.text("opening the microphone…");
				try { await listen(); }
				catch (e){ stop_listening(); return $state.text("could not open that microphone: " + (e?.message ?? e)); }
			}
			const cap = page.mic;
			cap.cut(); cap.keep = true;
			page.recording = true;
			const started = performance.now();
			$record.text("■ stop and transcribe");
			$results.style({ display: "flex" });
			$verdict.text("recording — talk, and watch the bars move").style({ color: "" });
			$answer.text("");
			$links.empty();
			clock = setInterval(() => {
				$seconds.text(((performance.now() - started) / 1000).toFixed(1) + "s");
				$state.text("RECORDING — press stop when you are done");
			}, 200);
		});

		fill_devices().catch(() => { /* no device API — the state line already says so */ });

		/* If this browser has ALREADY granted the microphone, start the meter on
		   load: the bars are then moving before the owner touches anything, which
		   is the feedback they asked for. Without permission nothing is opened and
		   nothing is prompted — pressing record does that. */
		(async () => {
			try {
				const st = await navigator.permissions?.query({ name: "microphone" });
				if (st?.state === "granted") await listen();
			} catch { /* no permissions API for microphone (Firefox) — record still works */ }
		})();

		return $bench;
	},

	/** Everything that is explanation rather than tool — inside the fold. */
	notes(){
		p.c("h3", "What was actually wrong");

		p(b("Nothing was wrong with the sound."), " Measured end to end: Chrome gives this machine a real 16,000 Hz recording context even though the microphone itself runs at 48,000, the audio worklet runs, every WAV posted is a correct 16,000 Hz mono 16-bit file, and its header's byte count agrees exactly with the file's real length.");

		p(b("What was wrong is that the quiet parts were being transcribed too."), " When you stop talking for 700ms Dictate closes the sentence and starts a new recording — and that new recording is the silence between your last word and your press of the button. It was sent to whisper, whisper said “Thank you”, and that went into your box and into your prompt log. The 1.5s live re-sends did the same thing while you sat quiet before speaking, which is why “Thank you” appeared before you had said anything.");

		p("The fix is the ", b("speech found"), " number above. Dictate now counts how many milliseconds of a recording are actually loud — in 20ms frames, not as one average, because a single click carries enough energy to fool an average — and refuses to send anything under 120ms of it. Measured on the real recordings: every silent one scored 0ms, the weakest real sentence scored 220ms.");

		p("Whisper also labels noises it knows are not speech — `*shriek*`, `[BLANK_AUDIO]`, `(door closes)`. A real fan noise came back as `*shriek*` while this was being proved, and was typed into the box. Those are dropped now too, by their shape rather than by a list of phrases.");

		p("The microphone you pick above is remembered in this browser, and ", b("every mic button on the site reads the same pick"), " — so the one on the board follows it with nothing to set up.");

		p.c("h3", "Getting your hands on the raw whisper API");

		p("whisper.cpp's server is an ordinary HTTP endpoint on this machine. One `POST` with a 16-bit PCM WAV in a `file` field is the whole API — this is what `ux/Dictate` does, and what the record button does:");

		pre(() => { code('curl -X POST http://127.0.0.1:8178/inference -F "file=@%LOCALAPPDATA%/lew42/whisper/jfk.wav"'); });

		p("Two clips already sit in that folder and prove both halves in one minute. `jfk.wav` comes back as the full “ask not what your country can do for you” sentence. `silence.wav` comes back as `\" Thank you.\\n\"` — that is the hallucination, straight from the server, with no browser involved at all.");

		p(() => {
			span("The component itself is ");
			a("ux/Dictate").href("/framework/ux/Dictate/");
			span(", and every measurement behind this is written up in ");
			a("doc/silence.md").href("/framework/ux/Dictate/doc/silence/");
			span(".");
		});
	},
});
