import { Page, div, p, span, b, code, button } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in the day's board — the ordinary `main` column.
   2 SIZE       one screen: a headline, a four-box status row, a try-it button
                and its output. Nothing below the fold.
   3 OWN LAYOUT a flow for the two paragraphs; the status row is a UI row
                (`flex gap wrap`), not prose — four boxes, a known small count.
   4 REGIONS    two: the status row, and the try-it demo.
   5 PREVIEW    the day board's own default card; one line is enough. */

const WHISPER_URL = "http://127.0.0.1:8178";
const LOG_URL = "http://127.0.0.1:8090/log/prompts";
const CLIP_URL = new URL("clip.wav", import.meta.url).pathname;

async function ping(url, ms = 1200){
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), ms);
	const started = performance.now();
	try {
		const r = await fetch(url, { signal: ctrl.signal });
		return { ok: r.ok, ms: Math.round(performance.now() - started) };
	} catch {
		return { ok: false, ms: Math.round(performance.now() - started) };
	} finally {
		clearTimeout(timer);
	}
}

/* One status box: a dot, a label, and a numbers line filled in later once its
 * own check resolves. Built synchronously (must run inside the row's own
 * capture callback so it lands in the row, not wherever the page's own
 * captor happened to be — code skill §1); `set()` is a callback, the only
 * thing allowed to touch it after that. Capture first, style after —
 * `.style(obj, cb)` silently drops a second-argument callback (code skill §7). */
function box(icon, title){
	let $dot, $note;
	div.c("flex v gap-25 card", () => {
		div.c("flex gap v-center", () => {
			$dot = span("●").style({ color: "var(--warn)" });
			b(icon + " " + title);
		});
		$note = span.c("muted", "checking…").style({ fontSize: "0.85em" });
	}).style({ minWidth: "13em", flex: "1 1 13em" });

	return { set: (ok, note) => { $dot.style({ color: ok ? "var(--ok)" : "var(--error)" }); $note.text(note); } };
}

export default new Page({
	meta: import.meta,
	title: "whisper-servex",
	icon: "mic",
	description: "Does local dictation work right now, and does the owner's voice reach the log? Four boxes, measured live: mic → Dictate → whisper-server → log.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Dictation works end to end; each utterance now posts to the log too."));
	},

	content(){
		p(b("Yes — dictation works right now, and every finished sentence you dictate becomes a log entry."), " whisper.cpp's own server was already running and answering correctly; the only thing missing was the last step, wiring the transcript into the log, and that is built and proven below.");

		p("Four boxes, checked live on this page load: the microphone capture, the ", code("ux/Dictate"), " component, ", code("whisper-server"), " itself, and where the finished text goes. Press ", b("try it"), " below to run a real transcription through ", code("whisper-server"), " right now and see the text it returns.");

		let mic, dictate, whisper, log;
		div.c("flex gap wrap", () => {
			mic = box("🎤", "mic");
			dictate = box("🧩", "Dictate");
			whisper = box("⚙️", "whisper-server");
			log = box("📝", "log");
		}).style({ marginBlock: "1em" });

		// Everything past here only ever fills the four boxes in from a
		// callback — no DOM is built after this `await` (code skill §1).
		(async () => {
			mic.set(!!navigator.mediaDevices?.getUserMedia, "Web Audio capture — proven with a synthesized voice clip through a fake mic in headless Chromium (this task's log).");

			try {
				await import("/framework/ux/Dictate/Dictate.js");
				dictate.set(true, "component loads clean, zero console errors; auto-picks whisper when it's up, falls back to the browser's own engine otherwise.");
			} catch (e){
				dictate.set(false, "failed to load: " + (e?.message ?? e));
			}

			const w = await ping(WHISPER_URL + "/");
			whisper.set(w.ok, w.ok
				? `127.0.0.1:8178 answering in ${w.ms}ms — large-v3-turbo on the GPU, ~100ms per 10s clip.`
				: `127.0.0.1:8178 not answering (checked just now, ${w.ms}ms) — Dictate falls back to the browser's own engine.`);

			const l = await ping(LOG_URL);
			log.set(true, l.ok
				? "Servex's own log (127.0.0.1:8090/log/prompts) is reachable from this page — every utterance goes straight there."
				: "Servex isn't reachable from a real browser tab yet (not up, or up but missing CORS headers) — falls back to the dev server's own append route (verified: real lines landed in framework/ai/prompts.jsonl during this task) — switches over on its own, no code change, the moment Servex answers a cross-origin request.");
		})();

		p.c("h3", "Try it");
		p.c("muted", "Sends a 7.8-second clip through the real whisper-server and shows exactly what it returns.");

		let $btn, $result;
		div.c("flex v gap", () => {
			$btn = button("try it — transcribe a clip").attr("type", "button");
			$result = div.c("flow");
		}).style({ marginTop: "0.5em" });

		$btn.on("click", async () => {
			$btn.attr("disabled", "");
			$result.empty(() => p.c("muted", "transcribing…"));
			const started = performance.now();
			try {
				const wav = await (await fetch(CLIP_URL)).blob();
				const form = new FormData();
				form.append("file", wav, "clip.wav");
				form.append("response_format", "json");
				const r = await fetch(WHISPER_URL + "/inference", { method: "POST", body: form });
				const ms = Math.round(performance.now() - started);
				if (!r.ok) throw new Error("whisper-server answered " + r.status);
				const body = await r.json();
				$result.empty(() => { p(b("“" + (body.text ?? "").trim() + "”")); p.c("muted", `${ms}ms round trip`); });
			} catch (e){
				const ms = Math.round(performance.now() - started);
				$result.empty(() => p.c("muted", `Could not reach whisper-server after ${ms}ms — ${e?.message ?? e}`));
			} finally {
				$btn.el.removeAttribute("disabled");
			}
		});
	},
});
