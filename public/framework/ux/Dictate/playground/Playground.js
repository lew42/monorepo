import { View, div, span, button, select, option, a } from "../../../core/View/View.js";
import Dictate, { remember_device, remembered_device } from "../Dictate.js";
import Revise from "../../Revise/Revise.js";
import { inspect } from "../../Content/Object/Inspect.js";
import { Session, Chunk, Resend } from "./objects.js";

View.stylesheet(import.meta, "Playground.css");

const BEFORE_CHARS = 300;
const BIG_GAP_MS = 2500;
export const FADE_MS = 5000;

// See doc/Playground-notes.md for tabs and layout rationale.
const TABS = ["clean", "raw", "chunks", "corrections", "live", "side", "analysis", "chat", "structure"];
const TAB_LABEL = {
	clean: "Clean", raw: "Raw", chunks: "Chunks", corrections: "Corrections (debug)", live: "Live (debug)", side: "Side by side",
	analysis: "Analysis", chat: "Chat", structure: "Structure",
};

const CHAT_PLACEHOLDER = "chat — see the widget above/beside this page";

const FILLERS = /\b(um+|uh+|ah+|er+|erm+|hmm+|you know)\b[,]?\s*/gi;

const EMPTY_TEXT = "press 🎤 or ▶ Sample — Whisper's words appear here";

// ---- word-level diff (LCS, no library) ------------------------------------
function words(text){ return text.trim().split(/\s+/).filter(Boolean); }

function word_diff(raw_text, clean_text){
	const a = words(raw_text), b = words(clean_text);
	const n = a.length, m = b.length;
	const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

	for (let i = n - 1; i >= 0; i--)
		for (let j = m - 1; j >= 0; j--)
			lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);

	const ops = [];
	let i = 0, j = 0;
	while (i < n && j < m){
		if (a[i] === b[j]){ ops.push({ type: "keep", word: a[i] }); i++; j++; }
		else if (lcs[i + 1][j] >= lcs[i][j + 1]){ ops.push({ type: "strike", word: a[i] }); i++; }
		else { ops.push({ type: "add", word: b[j] }); j++; }
	}
	while (i < n) ops.push({ type: "strike", word: a[i++] });
	while (j < m) ops.push({ type: "add", word: b[j++] });
	return ops;
}

// ---- the fallback pass, when /api/tidy is down or answers ok:false --------
function rule_clean(text){
	let out = text.trim();
	out = out.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");   // "the the" -> "the"
	out = out.replace(FILLERS, "");
	out = out.replace(/\s{2,}/g, " ").trim();
	out = out.replace(/^[a-z]/, c => c.toUpperCase());
	out = out.replace(/([.!?]\s+)([a-z])/g, (m, sep, c) => sep + c.toUpperCase());
	return out;
}

async function tidy(text, before, level){
	const out = await Revise.run(text, level, { before });
	return out.ok ? out : null;   // a `{ok:false, why}` here means "not up yet" — same as before
}

const wait = ms => new Promise(res => setTimeout(res, ms));

/** One line of the cleanup status: what cleaned this chunk, and how. */
function source_label(entry){
	const level = Revise.LEVELS[entry.level]?.label ?? entry.level ?? "clean";
	return entry.source_kind === "assistant"
		? `${level} · fast assistant · ${entry.model} · ${(entry.ms / 1000).toFixed(1)} s`
		: `${level} · rules (no LLM) — Servex /api/tidy not reachable`;
}

// See doc/Playground-notes.md for the pipeline design.
export default class Playground {

	constructor(...args){ this.assign(...args); this.views = new Set(); this.session = 0; this.level = "clean"; this.reset(); }
	assign(...args){ return Object.assign(this, ...args); }

	reset(){
		this.prune_views();
		this.session++;

		this.current = new Session();
		this.cleaned_so_far = "";  // accumulated CLEANED text — the `before` context for /api/tidy
		this.last_chunk_at = null; // performance.now() of the last settle, for the gap check
		this.clean_queue = Promise.resolve();   // chunks clean IN ORDER, never out of turn

		this.views.forEach(view => {
			view.$clean.empty(() => { view.$clean_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT); });
			view.$raw.empty(() => {
				view.$raw_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				view.$guess = div.c("ux-dictate-pg-line ux-dictate-pg-guess muted");
			});
			view.$chunks.empty(() => { view.$chunks_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT); });
			view.$corrections.empty(() => { view.$corrections_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT); });
			view.$live.empty(() => { view.$live_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT); });
			view.$side.empty(() => { view.$side_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT); });
			view.$status.text("");
			this.render_analysis(view);
			this.render_structure(view);
			this.toggle_empty(view);
		});
	}

	prune_views(){
		this.views.forEach(view => { if (view.$root && !view.$root.el.isConnected) this.views.delete(view); });
	}

	toggle_empty(view){
		if (view.$clean_empty) view.$clean_empty.el.hidden = this.current.chunks.length > 0;
		if (view.$raw_empty) view.$raw_empty.el.hidden = this.current.chunks.length > 0;
		if (view.$chunks_empty) view.$chunks_empty.el.hidden = this.current.resends.length > 0;
		const has_clean = this.current.chunks.some(c => c.deltas);
		if (view.$corrections_empty) view.$corrections_empty.el.hidden = has_clean;
		if (view.$live_empty) view.$live_empty.el.hidden = has_clean;
		if (view.$side_empty) view.$side_empty.el.hidden = this.current.chunks.length > 0;
	}

	// ---- the widget: mic, sample, audio source, status, tabs, panels --------

	widget(){
		const view = { tab: null };
		this.views.add(view);

		const $root = div.c("ux-dictate-pg wide flex v gap", () => {
			div.c("ux-dictate-pg-mic flex gap v-center wrap", () => {
				new Dictate({
					mode: "open",
					on_start: () => this.reset(),
					on_stop: () => {},
					on_text: (text, reason) => this.settle(text, { cut: reason }),
					on_guess: text => this.guess(text),
					on_meter: level => this.meter(level),
				});
				button.c("ux-dictate-pg-sample", "▶ Sample")
					.attr("type", "button")
					.attr("title", "play a scripted fake session — no mic, no whisper, same pipeline")
					.on("click", () => this.run_sample());
			});

			this.audio_panel(view);

			view.$status = div.c("ux-dictate-pg-status muted");

			div.c("ux-dictate-pg-note muted", "Raw = Whisper's exact words, never edited here (it can drop \"um\"/\"uh\" itself on quiet audio). The level below touches every OTHER tab — Clean, Corrections, Live and Side.");

			div.c("ux-dictate-pg-level-row flex gap v-center wrap", () => {
				span.c("muted", "Level:");
				view.$level = select.c("ux-dictate-pg-level", () => {
					Object.entries(Revise.LEVELS).forEach(([key, lv]) => option(lv.label).attr("value", key));
				}).attr("aria-label", "Revision level")
					.on("change", e => { this.level = e.target.value; });
				view.$level.el.value = this.level;
			}).style("--gap", "0.4em");

			div.c("ux-dictate-pg-tabs flex gap", () => {
				view.$tabs = TABS.map(name => a.c("ux-dictate-pg-tab", TAB_LABEL[name])
					.href("#" + name)
					.on("click", e => { e.preventDefault(); this.select_tab(view, name); }));
			});

			// See doc/Playground-notes.md for the full-bleed 2D layout details and DOM ref cautions.
			div.c("ux-dictate-pg-grid", () => {
				view.$raw = div.c("ux-dictate-pg-panel ux-dictate-pg-code ux-dictate-pg-raw", () => {
					view.$raw_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
					view.$guess = div.c("ux-dictate-pg-line ux-dictate-pg-guess muted");
				});
				this.current.chunks.forEach(entry => this.draw_raw_line(view, entry));

				view.$clean = div.c("ux-dictate-pg-panel ux-dictate-pg-code ux-dictate-pg-clean", () => {
					view.$clean_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.chunks.forEach(entry => this.draw_clean_line(view, entry));

				view.$analysis = div.c("ux-dictate-pg-panel ux-dictate-pg-analysis");
				this.render_analysis(view);

				view.$chat = div.c("ux-dictate-pg-panel ux-dictate-pg-chat card muted", CHAT_PLACEHOLDER);

				view.$structure = div.c("ux-dictate-pg-panel ux-dictate-pg-structure");
				this.render_structure(view);
			});

			div.c("ux-dictate-pg-debug-row", () => {
				view.$chunks = div.c("ux-dictate-pg-panel ux-dictate-pg-chunks", () => {
					view.$chunks_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.resends.forEach(r => this.draw_chunk_row(view, r));

				view.$corrections = div.c("ux-dictate-pg-panel ux-dictate-pg-diff ux-dictate-pg-corrections", () => {
					view.$corrections_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.chunks.filter(c => c.deltas).forEach(c => this.draw_diff_line(view.$corrections, c, false));

				view.$live = div.c("ux-dictate-pg-panel ux-dictate-pg-diff ux-dictate-pg-live", () => {
					view.$live_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.chunks.filter(c => c.deltas).forEach(c => this.draw_diff_line(view.$live, c, true));

				// **Side by side** — raw next to revised, in two plain columns, one row per
				// settled chunk (ask 4b: "raw vs revised side by side, with a level picker" —
				// the picker above the tabs is shared by Side, Corrections and Live).
				view.$side = div.c("ux-dictate-pg-panel ux-dictate-pg-side", () => {
					view.$side_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.chunks.forEach(c => this.draw_side_row(view, c));
			});
		}).style("--gap", "0.6em");

		// The ref `prune_views()` checks `isConnected` against — set once, never
		// reassigned, so it always answers "is THIS widget still on the page".
		view.$root = $root;

		this.toggle_empty(view);
		this.update_status(view);

		const start = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "clean";
		this.select_tab(view, start);

		return $root;
	}

	select_tab(view, name){
		view.tab = name;
		view.$tabs.forEach((t, i) => t.rc("active muted").ac(TABS[i] === name ? "active" : "muted"));
		TABS.forEach(tab_name => { view["$" + tab_name].el.hidden = tab_name !== name; });
		if (location.hash.slice(1) !== name) history.replaceState(null, "", location.pathname + location.search + "#" + name);
	}

	// ---- the audio source panel: which mic, and its level while listening ---

	audio_panel(view){
		let $select;

		div.c("ux-dictate-pg-audio flex v gap", () => {
			div.c("ux-dictate-pg-audio-row flex gap v-center wrap", () => {
				span.c("ux-dictate-pg-audio-label muted", "Audio source");
				$select = select.c("ux-dictate-pg-devices").attr("aria-label", "Audio source")
					.on("change", e => this.pick_device($select, e.target.value));
			});
			div.c("ux-dictate-pg-meter-wrap flex gap v-center", () => {
				span.c("ux-dictate-pg-meter-label muted", "level");
				view.$meter = div.c("ux-dictate-pg-meter", () => { view.$meter_fill = div.c("ux-dictate-pg-meter-fill"); });
			});
		}).style("--gap", "0.3em");

		view.$select = $select;
		this.refresh_devices($select);
	}

	meter(level){
		this.prune_views();
		this.current.source.level = level;
		this.views.forEach(view => view.$meter_fill?.style("--ux-dictate-pg-level", level.toFixed(3)));
	}

	async refresh_devices($select){
		if (!navigator.mediaDevices?.enumerateDevices){
			$select.empty(() => { option("this browser cannot list microphones").attr("value", ""); });
			return;
		}

		let devices = [];
		try { devices = await navigator.mediaDevices.enumerateDevices(); }
		catch { /* no permission asked yet — an empty list still renders something honest */ }

		const inputs = devices.filter(d => d.kind === "audioinput");
		const remembered = remembered_device();
		const picked = inputs.find(d => d.deviceId === remembered?.id) ?? inputs[0];

		$select.empty(() => {
			if (!inputs.length){ option("no microphone found").attr("value", ""); return; }
			inputs.forEach((d, i) => {
				option(d.label || remembered?.label || `microphone ${i + 1}`).attr("value", d.deviceId)
					.attr("selected", d.deviceId === picked?.deviceId ? "" : undefined);
			});
		});

		this.current.source.device = $select.el.selectedOptions[0]?.textContent ?? null;
	}

	pick_device($select, id){
		const opt = [...$select.el.options].find(o => o.value === id);
		remember_device(id, opt?.textContent ?? "");
		this.current.source.device = opt?.textContent ?? id;
		// Picking a device is rare, unlike a meter tick — cheap to refresh Structure here too.
		this.prune_views();
		this.views.forEach(view => this.render_structure(view));
	}

	// ---- the pipeline: a settled chunk in, a raw line + a cleaned diff out ----

	// The still-moving guess — replaces the ONE grey line at the end of the Raw view,
	// never appends a new one, so a changed guess is never shown twice. ALSO a row in
	// Chunks (deliverable 4a): every RESEND, not just the settled text, so a reader
	// can watch the guess actually improve. `since_prev` is measured HERE, in the
	// browser, as wall-clock time between two updates — the real Whisper-side
	// processing time lives only inside `ux/Dictate` and isn't exposed by its public
	// API (`Dictate.js` in this task is fenced to its `revise` option only); this is
	// an honest stand-in, labelled as such in the row itself (`draw_chunk_row()`).
	guess(text){
		this.prune_views();
		if (text && text !== this.current.partial){
			const now = performance.now();
			const prev = this.current.resends.at(-1);
			const row = new Resend({ t: now, segment: this.current.chunks.length + 1, text, since_prev: prev ? now - prev.t : null });
			this.current.resends.push(row);
			this.views.forEach(view => this.draw_chunk_row(view, row));
		}
		this.current.partial = text;
		this.views.forEach(view => { this.render_guess(view); this.toggle_empty(view); this.render_structure(view); });
	}

	// A chunk has settled. Draws the raw line immediately (whisper's own answer, never
	// held up) in every mounted widget, then queues the cleanup pass — real or ruled —
	// behind whatever is still cleaning ahead of it, so `before` always reflects
	// everything settled so far.
	settle(raw, { force_gap, cut } = {}){
		if (!raw) return;

		this.prune_views();
		const now = performance.now();
		const gap = force_gap ?? (this.last_chunk_at != null && now - this.last_chunk_at > BIG_GAP_MS);
		this.last_chunk_at = now;

		this.current.partial = "";
		this.views.forEach(view => this.render_guess(view));

		const entry = new Chunk({ raw, gap, cut, session: this.session });
		this.current.chunks.push(entry);
		this.views.forEach(view => { this.draw_raw_line(view, entry); this.draw_clean_line(view, entry); this.draw_cut_marker(view, entry); this.toggle_empty(view); this.render_structure(view); });

		this.clean_queue = this.clean_queue.then(() => this.clean_chunk(entry));
	}

	async clean_chunk(entry){
		this.prune_views();
		if (entry.session === this.session)
			this.views.forEach(view => view.$status.text("cleaning…"));

		const before = this.cleaned_so_far.slice(-BEFORE_CHARS);
		const level = entry.level = this.level;   // stamped on the entry — Side shows what actually ran, even if the picker changes later
		const result = await tidy(entry.raw, before, level);

		if (entry.session !== this.session) return;   // a new session started while this was cleaning

		if (result){ entry.cleaned = result.text; entry.source_kind = "assistant"; entry.model = result.model; entry.ms = result.ms; }
		else { entry.cleaned = rule_clean(entry.raw); entry.source_kind = "rules"; }

		entry.deltas = word_diff(entry.raw, entry.cleaned);
		this.cleaned_so_far = (this.cleaned_so_far + " " + entry.cleaned).trim();

		this.views.forEach(view => {
			this.update_clean_line(view, entry);
			this.draw_diff_line(view.$corrections, entry, false);
			this.draw_diff_line(view.$live, entry, true);
			this.draw_side_row(view, entry);
			this.toggle_empty(view);
			this.update_status(view);
			this.render_structure(view);
		});
	}

	// ONE line, above the tabs, naming the CURRENT cleanup source — never repeated
	// per chunk (the owner: "noise"). Per-line detail still lives in each line's own
	// `title` tooltip (`draw_diff_line()`).
	update_status(view){
		const last = this.current.chunks.findLast(c => c.source_kind);
		view.$status.text(last ? source_label(last) : "");
	}

	// ---- Analysis + Structure: the live, nested `inspect()` panels --------------

	render_analysis(view){
		if (!view.$analysis) return;
		view.$analysis.empty(() => inspect(this.current.analysis));
	}

	render_structure(view){
		if (!view.$structure) return;
		view.$structure.empty(() => inspect(this.current, { variant: "card" }));
	}

	// ---- Raw panel -------------------------------------------------------------

	draw_raw_line(view, entry){
		if (!view.$raw) return;

		const $line = div(entry.raw).ac("ux-dictate-pg-line");
		if (entry.gap) view.$raw.el.insertBefore(div.c("ux-dictate-pg-break").el, view.$guess?.el ?? null);
		view.$raw.el.insertBefore($line.el, view.$guess?.el ?? null);
	}

	render_guess(view){
		if (!view.$guess) return;
		view.$guess.text(this.current.partial);
		view.$guess.el.style.display = this.current.partial ? "" : "none";
	}

	// ---- Clean panel: the clean text alone, no marks (deliverable 5) -----------

	draw_clean_line(view, entry){
		if (!view.$clean) return;
		let $line;
		view.$clean.append(() => { $line = div(entry.cleaned ?? entry.raw).ac("ux-dictate-pg-line"); });
		(entry.clean_lines ??= new Map()).set(view, $line);
	}

	update_clean_line(view, entry){
		entry.clean_lines?.get(view)?.text(entry.cleaned ?? entry.raw);
	}

	// ---- Chunks panel: every resend, not just the settled text (4a) ------------

	draw_chunk_row(view, row){
		if (!view.$chunks) return;
		let $line;
		view.$chunks.append(() => {
			$line = div.c("ux-dictate-pg-chunk-row flex gap", () => {
				span.c("ux-dictate-pg-chunk-seg muted", "segment " + row.segment);
				span.c("ux-dictate-pg-chunk-ms muted", row.since_prev == null ? "first guess" : (row.since_prev / 1000).toFixed(1) + "s later");
				span.c("ux-dictate-pg-chunk-text", row.text);
			});
		});
		$line.attr("title", "wall-clock time since the previous update in this widget, not Whisper's own processing time");
	}

	CUT_LABEL = { pause: "closed — pause", forced: "closed — forced (15s cap)", manual: "closed — stopped" };
	draw_cut_marker(view, entry){
		if (!view.$chunks || !entry.cut) return;
		view.$chunks.append(() => { div.c("ux-dictate-pg-cut muted", this.CUT_LABEL[entry.cut] ?? ("closed — " + entry.cut)); });
	}

	// ---- Side panel: raw next to revised, two columns, the level picker's result (4b) --

	draw_side_row(view, entry){
		if (!view.$side || !entry.cleaned) return;
		let $row;
		view.$side.append(() => {
			$row = div.c("ux-dictate-pg-side-row grid gap", () => {
				if (entry.gap) div.c("ux-dictate-pg-break");
				div.c("ux-dictate-pg-side-raw", entry.raw);
				div.c("ux-dictate-pg-side-revised", entry.cleaned).attr("title", source_label(entry));
			});
		});
		$row.style("--column", "18em");
	}

	// ---- Corrections + Live panels — same drawing, Live also fades ----------

	draw_diff_line($container, entry, fading){
		if (!$container || !entry.deltas) return;

		let $line;
		$container.append(() => {
			if (entry.gap) div.c("ux-dictate-pg-break");
			$line = div.c("ux-dictate-pg-line flex wrap", () => {
				entry.deltas.forEach(op => {
					if (op.type === "keep") span(op.word + " ");
					else if (op.type === "strike") span.c("ux-dictate-pg-strike", op.word + " ");
					else span.c("ux-dictate-pg-add", op.word + " ");
				});
			});
		});
		$line.attr("title", source_label(entry));

		if (fading) this.start_fade($line);
	}

	start_fade($line){
		const strikes = [...$line.el.querySelectorAll(".ux-dictate-pg-strike")];
		const adds = [...$line.el.querySelectorAll(".ux-dictate-pg-add")];

		[...strikes, ...adds].forEach(el => { el.style.transitionDuration = FADE_MS + "ms"; });
		requestAnimationFrame(() => requestAnimationFrame(() => $line.ac("ux-dictate-pg-faded")));
		setTimeout(() => strikes.forEach(el => { el.style.display = "none"; }), FADE_MS + 60);
	}

	// ---- the Sample button: the same pipeline, no mic, no whisper -----------

	async run_sample(){
		if (this.sample_running) return;
		this.sample_running = true;
		this.reset();

		for (const { text, force_gap, cut } of Playground.SAMPLE_SCRIPT){
			const parts = words(text);
			for (let n = 1; n <= parts.length; n++){
				this.guess(parts.slice(0, n).join(" "));
				await wait(60);
			}
			await wait(250);
			this.settle(text, { force_gap, cut });
		}

		this.sample_running = false;
	}
}

Playground.SAMPLE_SCRIPT = [
	{ text: "so um i was thinking we should uh we should build the the playground", cut: "pause" },
	{ text: "what do you think? about the layout", cut: "pause" },
	{ text: "let's also think about the audio source panel and the live level meter", force_gap: true, cut: "forced" },
];

export const pg = new Playground();
