import { AITask, div, p, span, b, small, select, option, label, button, input, audio, icon } from "/app.js";
import Capture from "/framework/ux/Dictate/capture.js";
import { remember_device, remembered_device } from "/framework/ux/Dictate/Dictate.js";
import Tree from "/framework/ux/Tree/Tree.js";

/* ⚠ An `AITask`, not a plain `Page` — see `ai/2026-09-22/dictate-silence/page.js`'s
   own comment for why a task dir with a page.js has to be named in the day's
   `children:`. `extra()` below is this task's one unique thing.

   The owner's own addendum (18:38) turned deliverable 1 from a form into a
   WORKSPACE — left, every recording in a selectable list (`ux/Tree`: it already
   draws exactly that, with an active row and a `selected_change` hook, so this
   is a `decision` for the log — Tree over `ext/files`, which fetches real files
   off disk for a docs-teaching split view and carries a heavier contract than a
   flat list needs); right, the selected one's detail, persistent across clicks.

   ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  `AITask`'s own `wide` track.
   2 SIZE       one screen: controls on top, then the workspace fills what is
                left — the tree narrow (it is a list of short names), the detail
                pane wide (it is the thing actually being looked at).
   3 OWN LAYOUT `flex v gap` for the whole stack; `flex gap wrap v-center` for
                the controls row; `flex gap` (row) for the two-pane workspace.
   4 REGIONS    three — the controls, the tree, the detail pane.
   5 PREVIEW    one line on the day board. */

const WHISPER_URL = "http://127.0.0.1:8178";

function meter(){
	let $fill;
	div.c("flex gap-25 v-center", () => {
		small.c("muted", "level").style({ width: "3em", flexShrink: "0" });
		div().style({ flex: "1 1 auto", height: "0.8em", borderRadius: "0.2em", overflow: "hidden", background: "var(--darken-1)" })
			.append(() => { $fill = div().style({ height: "100%", width: "0%", background: "var(--ok)", transition: "width 60ms linear" }); });
	});
	return peak => $fill.style({ width: Math.min(100, peak * 100).toFixed(1) + "%", background: peak >= 0.99 ? "var(--error)" : "var(--ok)" });
}

/** The row that goes IN the tree: `text` is Tree's own label, so the recording's
 *  own fields live under `rec` instead — `node.text` would otherwise collide
 *  with the transcript field the server sends back (both are called `text`). */
function node_of(r){ return { text: r.name, icon: () => icon(r.text ? "check_circle" : "graphic_eq"), rec: r }; }

async function api(name, body){
	const r = await fetch(`/recordings/${name}`, { method: "POST", body });
	return r.json();
}

export default new AITask({
	meta: import.meta,
	title: "record",
	icon: "mic",
	description: "Record your voice to a file on the server, then hear it back or send it to whisper.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "A little workspace: press record, it lands in the list, click any one to hear it and its transcript."));
	},

	extra(){
		p.c("h2", "Record your voice");
		p("Pick a microphone and press ", b("record"), "; press it again to stop. Each take lands in the list, selected, and starts transcribing on its own — click any earlier one to hear it again or read what whisper made of it.");

		let $select, $note, $record, $state, $set_meter, $detail;
		let chosen = remembered_device()?.id ?? null, cap = null, clock = null, tree = null, expected = {};

		div.c("flex v gap", () => {
			div.c("flex gap wrap v-center", () => {
				label.c("muted", "microphone");
				$select = select().style({ maxWidth: "24em" });
				$record = button("● record").attr("type", "button");
				$state = span.c("muted", "");
			});
			$note = small.c("muted", "Microphone names appear once you've recorded at least once.");
			$set_meter = meter();
		}).attr("data-record", "");

		div.c("flex gap wrap", () => {
			div.c("card").style({ flex: "1 1 16em", minWidth: "min(16em, 100%)", maxHeight: "28em", overflowY: "auto" })
				.append(() => { tree = new Tree({ nodes: [], selected_change: node => render_detail(node) }); });
			$detail = div.c("card flex v gap").style({ flex: "3 1 20em", minWidth: "min(20em, 100%)" })
				.append(() => { p.c("muted", "pick a recording to see it here."); });
		}).attr("data-workspace", "");

		// ---- devices (unchanged from the first pass) ---------------------------

		const fill_devices = async () => {
			const list = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "audioinput");
			$select.empty(() => { for (const d of list) option(d.label || "microphone " + (d.deviceId || "default").slice(0, 8)).attr("value", d.deviceId); });
			const remembered = remembered_device();
			const match = list.find(d => d.deviceId === chosen) ?? (remembered?.label ? list.find(d => d.label === remembered.label) : null);
			chosen = match ? match.deviceId : ($select.el.value || null);
			if (match) $select.el.value = chosen;
		};
		$select.on("change", () => { chosen = $select.el.value || null; remember_device(chosen, $select.el.selectedOptions[0]?.textContent ?? ""); });
		fill_devices().catch(() => {});
		fetch("/framework/ai/recordings/expected.json").then(r => r.ok ? r.json() : {}).then(j => { expected = j; }).catch(() => {});

		// ---- the workspace: list + detail ---------------------------------------

		async function refresh(select_name){
			const rows = await (await fetch("/recordings/")).json();
			const nodes = rows.map(node_of);
			tree.draw(nodes);
			const found = select_name && nodes.find(n => n.rec.name === select_name);
			if (found) tree.select(found, true);
		}

		function render_detail(node){
			const r = node.rec;
			$detail.empty(() => {
				div.c("flex gap wrap v-center", () => {
					b(r.name);
					span.c("muted", (r.bytes / 1024).toFixed(1) + " KB");
				});
				audio().attr("controls", "").attr("src", r.path);
				div.c("flex gap wrap", () => {
					stat(r.seconds?.toFixed(2) + "s", "length");
					stat(r.rate?.toLocaleString() + " Hz", "sample rate");
					stat(r.rms?.toFixed(4), "RMS");
					stat(r.peak?.toFixed(3), "peak");
					if (r.device) stat(r.device, "microphone");
				});
				let $t;
				$t = p.c("muted", r.text ? r.text + " (" + r.ms + "ms)" : "transcribing…");
				let $said, $save;
				div.c("flex gap wrap v-center", () => {
					small.c("muted", "this is what I said:");
					$said = input().attr("type", "text").attr("value", expected[r.name] ?? "").style({ minWidth: "20em", flex: "1 1 auto" });
					$save = button("save").attr("type", "button");
				});
				$save.on("click", async () => {
					expected = await api("expected.json", JSON.stringify({ [r.name]: $said.el.value }));
				});
				if (!r.text) ensure_transcript(r, $t);
			});
		}

		function stat(value, name){
			div.c("flex v gap-25", () => { span.c("h3", value ?? "—").style({ whiteSpace: "nowrap" }); small.c("muted", name); }).style({ minWidth: "fit-content" });
		}

		async function ensure_transcript(r, $t){
			try {
				const clip = await (await fetch(r.path)).blob();
				const form = new FormData();
				form.append("file", clip, r.name + ".wav");
				form.append("response_format", "json");
				const started = performance.now();
				const resp = await fetch(WHISPER_URL + "/inference", { method: "POST", body: form });
				const body = await resp.json();
				const ms = Math.round(performance.now() - started);
				r.text = (body.text ?? "").trim(); r.ms = ms;
				await api(r.name + ".json", JSON.stringify({ text: r.text, ms }));
				$t.text(r.text + " (" + ms + "ms)");
			} catch (e){ $t.text("whisper-server did not answer: " + (e?.message ?? e)); }
		}

		// ---- record / stop -----------------------------------------------------

		const start = async () => {
			$state.text("opening the microphone…");
			const label_text = $select.el.selectedOptions[0]?.textContent ?? "";
			cap = new Capture({ device_id: chosen, device_label: label_text, keep: true });
			await cap.start((rms, peak) => $set_meter(peak));
			if (cap.fell_back || cap.recovered) chosen = cap.device_id ?? cap.settings().deviceId ?? null;
			await fill_devices();
			remember_device(chosen, cap.label());
			$note.text(cap.fell_back ? "your remembered microphone is gone — recording on the system default" : `recording on ${cap.label() || "the default microphone"}`);
			$record.text("■ stop");
			const started = performance.now();
			clock = setInterval(() => $state.text(((performance.now() - started) / 1000).toFixed(1) + "s — recording"), 200);
		};

		const stop = async () => {
			clearInterval(clock);
			$state.text("saving…");
			$set_meter(0);
			const samples = cap.snapshot();
			const wav = cap.wav(samples);
			const device = cap.label();
			cap.stop(); cap = null;
			$record.text("● record");

			const rows = await (await fetch("/recordings/")).json();
			const n = rows.reduce((max, r) => { const m = /^recording-(\d+)$/.exec(r.name); return m ? Math.max(max, +m[1]) : max; }, 0) + 1;
			const name = "recording-" + n;
			await fetch(`/recordings/${name}.wav`, { method: "POST", headers: { "Content-Type": "audio/wav" }, body: wav });
			if (device) await api(name + ".json", JSON.stringify({ device }));
			$state.text("");
			/* Writing a new .wav under public/ is a file the dev server's own live-reload
			   watches — it reloads this tab a second or so later, wiping the selection
			   set below. `pending` survives that reload (localStorage does) so the very
			   next mount reselects the recording that was just made, same as if the
			   reload had never happened. */
			try { localStorage.setItem("lew42.record.pending", name); } catch {}
			await refresh(name);
		};

		$record.on("click", async () => {
			if (cap){ stop(); return; }
			try { await start(); }
			catch (e){ $state.text("could not open that microphone: " + (e?.message ?? e)); }
		});

		let pending = null;
		try { pending = localStorage.getItem("lew42.record.pending"); localStorage.removeItem("lew42.record.pending"); } catch {}
		refresh(pending);
	},
});
