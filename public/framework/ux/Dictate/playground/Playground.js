import { View, div, span, button, select, option, a } from "../../../core/View/View.js";
import Dictate, { remember_device, remembered_device } from "../Dictate.js";
import Revise from "../../Revise/Revise.js";
import { inspect } from "../../Content/Object/Inspect.js";
import { Session, Chunk, Resend } from "./objects.js";

View.stylesheet(import.meta, "Playground.css");

// How much already-cleaned text rides along as `before` — enough for the assistant to
// see the sentence it is joining, not the whole transcript.
const BEFORE_CHARS = 300;

// Longer than this since the previous chunk settled reads as a paragraph break (a blank
// line in every view), not just the ordinary pause between sentences.
const BIG_GAP_MS = 2500;

// The Live tab's one constant: how long the red/green marks take to dissolve, in JS so
// the CSS transition and a headless proof's wait share the same number.
export const FADE_MS = 5000;

// **Chunks** and **Side** are new (ai/2026-09-29/audio/, deliverable 4 — "see more detail
// into the workings of the Whisper transcription process"): Chunks shows every RESEND as
// its own row, not just the final settled text, so the guess visibly improves; Side shows
// raw and revised next to each other, in two plain columns, with the level picker above
// the tabs choosing what "revised" means.
//
// **Clean** is new (ai/2026-09-29/audio/next-clean-transcription/a-clean-mode, deliverable
// 5): the clean text alone, no strike-through marks — what the real composer now shows by
// default (`ext/Chat/Mic.js`'s own clean mode). It is the DEFAULT tab here too, because
// that is what a first-time reader of this page should see first: the finished result, not
// the mechanism. Corrections and Live are relabelled "(debug)" — they still work exactly as
// before, just no longer first.
// **Analysis**, **Chat** and **Structure** are new (minion-part2, 2026-10-01 — the
// Dictate playground as a full-bleed, live system diagram): the same six-tab,
// show/hide-only mechanism this file already used, just with three more panels. On a
// narrow screen all nine are still ordinary tabs — "a stack with tabs is fine," the
// owner's own words (requirements.md). At ≥1200px, `Playground.css` additionally makes
// Raw/Clean/Analysis/Chat/Structure always-visible GRID COLUMNS (ignoring which tab is
// "active") and Chunks/Corrections/Live/Side an always-visible debug row underneath —
// see that file's "full-bleed, 2D desktop layout" section for exactly how.
const TABS = ["clean", "raw", "chunks", "corrections", "live", "side", "analysis", "chat", "structure"];
const TAB_LABEL = {
	clean: "Clean", raw: "Raw", chunks: "Chunks", corrections: "Corrections (debug)", live: "Live (debug)", side: "Side by side",
	analysis: "Analysis", chat: "Chat", structure: "Structure",
};

// The one line a reader sees in the Chat column — intentionally NOT a second `chat()`
// mount. `@task-mastermind-one-dictation` owns the real widget (mic, bubbles, replies,
// reactions); this diagram is built AROUND it, never a second copy of it (requirements.md
// fence: "Part 2 builds the diagram around their widget, not a second widget").
const CHAT_PLACEHOLDER = "chat — see the widget above/beside this page";

// "like" and "i mean" are deliberately NOT here — a real sentence like "I like the
// layout" would lose a real word, not a filler. That call needs context, which is
// exactly what /api/tidy's fast assistant is for; this rule pass only removes the
// fillers a fixed word list can never mistake for content. doc/decisions.md.
const FILLERS = /\b(um+|uh+|ah+|er+|erm+|hmm+|you know)\b[,]?\s*/gi;

// The one line every empty panel shows until the first chunk arrives — so a reader
// never wonders whether the widget is even wired up.
const EMPTY_TEXT = "press 🎤 or ▶ Sample — Whisper's words appear here";

// ---- word-level diff (LCS, no library) ------------------------------------
// Splits both strings on whitespace and walks the classic longest-common-subsequence
// table back to a list of {type: "keep"|"strike"|"add", word}. A few dozen lines, and
// the whole reason the Corrections/Live tabs can show "this word, not that one" instead
// of a wall of red-then-green.
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
// Minimal on purpose — the owner's own rule: near-verbatim, never change the intent.
// Fillers out, a doubled word collapsed, a capital after a sentence ends, a capital
// to open it. No punctuation is MOVED — a misplaced "?" stays exactly where it was
// said; that is the fast assistant's job, not this one's.
function rule_clean(text){
	let out = text.trim();
	out = out.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");   // "the the" -> "the"
	out = out.replace(FILLERS, "");
	out = out.replace(/\s{2,}/g, " ").trim();
	out = out.replace(/^[a-z]/, c => c.toUpperCase());
	out = out.replace(/([.!?]\s+)([a-z])/g, (m, sep, c) => sep + c.toUpperCase());
	return out;
}

// `ux/Revise` (`Revise.run`) is the ONE place this playground now asks Servex for a
// cleaned chunk — this used to be its own copy of that same fetch, pointed only at the
// original "clean" prompt; now the widget's own level picker (below) can ask for `edit`
// or `summary` too, and there is only one place a Servex-down failure is handled.
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

/**
 * The dictation playground — one 🎤, one session, three ways of watching it: the raw
 * words whisper actually heard, the fast assistant's strike/add corrections, and a
 * "live" version where those marks dissolve into the clean text. `ux/Dictate/doc/`
 * has the mic itself; this file is only the pipeline and the widget on top of it.
 *
 * Not a `View` — `widget()` is called from inside a `Page`'s own `content()` (once on
 * the plain Dictate page, once on this module's own page), each already running inside
 * the right captor. **Both calls share this ONE instance** — `pg` at the bottom of this
 * file — so a session started from either widget shows up on both; `doc/decisions.md`
 * has the current shape and the bugs an earlier shape caused.
 * `globalThis.$dictate_pg` (set in `page.js`) is the seam a headless test drives.
 */
export default class Playground {

	constructor(...args){ this.assign(...args); this.views = new Set(); this.session = 0; this.level = "clean"; this.reset(); }
	assign(...args){ return Object.assign(this, ...args); }

	// Everything a session accumulates — cleared at the start of every NEW session
	// (the owner's ask #1: one click clears the views and starts fresh). Every MOUNTED
	// widget clears with it — `this.views` is every `widget()` call still on screen.
	//
	// `this.session` is a plain counter, bumped every reset. Every chunk is stamped with
	// the session it was settled under (`settle()`); `clean_chunk()` refuses to draw a
	// chunk whose stamp no longer matches — a chunk still waiting on `/api/tidy` when the
	// mic is pressed again finishes into nothing instead of painting a NEW session's
	// panels with an OLD session's text. doc/decisions.md.
	reset(){
		this.prune_views();
		this.session++;

		// **`this.current` is the one `Session` instance** for this run — it owns
		// `chunks`/`resends`/`source`/`analysis`/`partial` (minion-part2, "real classes
		// instead of plain objects"). `cleaned_so_far`/`last_chunk_at`/`clean_queue` stay
		// HERE, on `Playground` itself, not on `Session` — they are the pipeline's own
		// bookkeeping for cleaning the NEXT chunk, never something a reader asked to
		// inspect (decision logged in this task's task.jsonl).
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

	// Drops a widget from `this.views` once its own root element has left the page —
	// a navigation away from wherever it was mounted, with the old DOM node never
	// reattached. Without this, a widget that leaves the screen stayed in the Set
	// forever, still getting every `meter()` tick and diff update for nobody to see.
	// Called on the next pipeline update rather than eagerly (there is no "the page
	// changed" event to hang this on; the cost of one extra check per update is nothing).
	prune_views(){
		this.views.forEach(view => { if (view.$root && !view.$root.el.isConnected) this.views.delete(view); });
	}

	// Shows/hides each panel's own "press 🎤…" line — visible until the panel has
	// something real to show, then gone for the rest of the session. Analysis, Chat and
	// Structure have no empty state of their own: Analysis and Structure always have a
	// real `inspect()` card to show (a stub still IS a card), and Chat is static text.
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

	// ⚠ Called on EVERY page that shows the playground (the plain Dictate page's
	// Overview, and this module's own page) — each call builds its OWN mic button,
	// audio panel and three panels, registered in `this.views` so the pipeline
	// (`settle()`/`guess()`/`clean_chunk()`) updates every one of them, not just the
	// last one built. No DOM ref here is ever a field on `this` (the shared `pg`) —
	// only on the LOCAL `view` object — because two widgets sharing one field would
	// each overwrite the other's reference (found the hard way: `doc/decisions.md`).
	widget(){
		const view = { tab: null };
		this.views.add(view);

		// `wide` opts the widget out of the page's default 40em reading measure — a
		// transcript line wrapped constantly at 1920/3440 inside it (Playground.css caps
		// the actual width at a readable 60em, not the full wide track).
		const $root = div.c("ux-dictate-pg wide flex v gap", () => {
			div.c("ux-dictate-pg-mic flex gap v-center wrap", () => {
				new Dictate({
					mode: "open",             // the box is not this widget's job — on_text/on_guess are
					on_start: () => this.reset(),
					on_stop: () => {},
					// `reason` — "pause" | "forced" (the 15s cap) | "manual" (stop pressed) |
					// undefined (the browser engine, or a sample line) — Dictate.js's own
					// `commit()`, additive, passed straight through to Chunks (4a: "mark each
					// segment cut and say why").
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

			// **Raw is Whisper's exact output, always** (the owner, 2026-09-29: fillers
			// sometimes vanish from Raw and sometimes stay, make it predictable). That
			// unpredictability is WHISPER'S OWN behavior on quiet or short "um"s, not this
			// pipeline's doing — this pipeline never edits Raw. Only the `clean` level
			// removes filler words, and only in the Corrections/Live/Side views. Said once,
			// plainly, instead of leaving a reader to guess from behavior alone.
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

			// **The full-bleed, 2D layout (deliverable 4).** Below ~1200px these two divs
			// are plain blocks — exactly today's single `.ux-dictate-pg-panels` wrapper,
			// just split in two, with every panel still shown/hidden one-at-a-time by
			// `select_tab()` through the `[hidden]` attribute (nothing about the tab
			// mechanism changed; "don't delete TABS/select_tab," requirements.md). At
			// ≥1200px, `Playground.css` turns `.ux-dictate-pg-grid` into the owner's own
			// column order — "source, raw, clean, analysis... chat" — Raw/Clean/
			// Analysis/Chat/Structure become ALWAYS-VISIBLE grid columns (the CSS
			// overrides `[hidden]` on just these five), with Structure wider than the
			// rest ("a wider structure panel"). `.ux-dictate-pg-debug-row` does the same
			// for the four debug panels, in their own row underneath — real detail,
			// still there, just not the first thing a wide screen shows.
			//
			// ⚠ Each panel's PRE-EXISTING chunks (a widget mounted after a session
			// already has some) are drawn AFTER the `view.$raw =` / `view.$corrections =`
			// assignment finishes, never inside the same capture callback — the callback
			// runs synchronously while that assignment is still in progress, so reading
			// `view.$raw` from inside it reads `undefined` and every draw call silently
			// no-ops (code skill, "no DOM after an await" family — the same trap, one
			// step earlier: reading a ref before its own assignment has returned).
			div.c("ux-dictate-pg-grid", () => {
				// **Raw** (owner's own order: "the raw transcriptions can go in a card").
				view.$raw = div.c("ux-dictate-pg-panel ux-dictate-pg-code ux-dictate-pg-raw", () => {
					view.$raw_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
					view.$guess = div.c("ux-dictate-pg-line ux-dictate-pg-guess muted");
				});
				this.current.chunks.forEach(entry => this.draw_raw_line(view, entry));

				// **Clean** (deliverable 5) — the clean text alone, no strike-through marks: what
				// the real composer shows by default now. One line per settled chunk, drawn with
				// its raw words the instant it settles (nothing worth showing yet is worse than a
				// blank panel) and swapped for the cleaned wording in place once `clean_chunk()`
				// below answers — the exact same "raw now, clean in place once it arrives" idea
				// as `ext/Chat/Mic.js`'s own box.
				view.$clean = div.c("ux-dictate-pg-panel ux-dictate-pg-code ux-dictate-pg-clean", () => {
					view.$clean_empty = div.c("ux-dictate-pg-empty muted", EMPTY_TEXT);
				});
				this.current.chunks.forEach(entry => this.draw_clean_line(view, entry));

				// **Analysis** — a STUB today (requirements.md deliverable 1): a real,
				// inspectable object with its own icon, honest about doing nothing yet.
				view.$analysis = div.c("ux-dictate-pg-panel ux-dictate-pg-analysis");
				this.render_analysis(view);

				// **Chat** — a placeholder, on purpose; see `CHAT_PLACEHOLDER`'s own comment.
				// `card` (framework.css) is the one existing class for "a framed box" — no
				// new CSS needed to make this read as its own column, same as Analysis and
				// Structure already do through their own `inspect()` card's chrome.
				view.$chat = div.c("ux-dictate-pg-panel ux-dictate-pg-chat card muted", CHAT_PLACEHOLDER);

				// **Structure** (deliverable 3) — the WHOLE session, one nested card, built
				// from `inspect(this.current)` and re-drawn after every `settle()`/`guess()`/
				// `clean_chunk()` (`render_structure()`, below). This is the "visual
				// rendering of the hierarchy" the owner asked for.
				view.$structure = div.c("ux-dictate-pg-panel ux-dictate-pg-structure");
				this.render_structure(view);
			});

			div.c("ux-dictate-pg-debug-row", () => {
				// **Chunks** — every RESEND as its own row (not just the final text), so
				// the guess visibly improves. `hidden` until picked, same as every panel here.
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

		// "routed" the light way: the hash names the tab, so a reload or the back
		// button lands on the same one — no separate Page per tab (that shape drew
		// a duplicate H1 per tab and rebuilt panels instead of just showing them).
		const start = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "clean";
		this.select_tab(view, start);

		return $root;
	}

	// One `[hidden]` toggle per tab name, read off `view.$<name>` — grown from six
	// hand-written lines to a loop once Analysis/Chat/Structure made it nine (minion-part2).
	// At ≥1200px `Playground.css` overrides `[hidden]` on five of the nine panels so they
	// show regardless of which tab is "active" (see `widget()`'s own comment on the grid) —
	// this method doesn't know or care about that; it always sets the real attribute
	// honestly, same as before.
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
				// ONE control names the mic: the picker itself, via the `selected` option's
				// own text — no separate "mic: default" label that could ever disagree with
				// what the picker actually shows (the label used to lag a refresh; two
				// sources of truth for the same fact is how they went out of sync).
				span.c("ux-dictate-pg-audio-label muted", "Audio source");
				$select = select.c("ux-dictate-pg-devices").attr("aria-label", "Audio source")
					.on("change", e => this.pick_device($select, e.target.value));
			});
			div.c("ux-dictate-pg-meter-wrap flex gap v-center", () => {
				span.c("ux-dictate-pg-meter-label muted", "level");
				// Always visible — a bordered, visibly-a-track box even at idle, flat until
				// listening starts. Bigger than the mic button's own tiny bar on purpose (the
				// owner: "larger"); driven by the SAME smoothed number as that bar,
				// `Dictate`'s `on_meter()` hook, never a second loudness calculation of its own.
				view.$meter = div.c("ux-dictate-pg-meter", () => { view.$meter_fill = div.c("ux-dictate-pg-meter-fill"); });
			});
		}).style("--gap", "0.3em");

		view.$select = $select;
		this.refresh_devices($select);
	}

	// ⚠ Mirrors the number into `this.current.source.level` (so the Structure panel's
	// `inspect()` tree has a real value to show for "the audio source") but deliberately
	// does NOT re-render Structure here — `meter()` fires ~12 times a second while the
	// mic is live, and rebuilding a whole nested inspect tree that often would be real
	// cost for a number nobody is watching pixel-by-pixel in that one card. Structure
	// re-draws on `settle()`/`guess()`/`clean_chunk()` instead, so the level shown there
	// can be up to one resend stale — noted here as the deliberate, cheaper choice
	// (requirements.md: "don't over-engineer a diffing update... note the cost").
	meter(level){
		this.prune_views();
		this.current.source.level = level;
		this.views.forEach(view => view.$meter_fill?.style("--ux-dictate-pg-level", level.toFixed(3)));
	}

	// A picker of `enumerateDevices()` audio inputs, remembered the same way every
	// `Dictate` on the site remembers one — `DEVICE_KEY` / `remember_device()`, so
	// picking a mic here moves the board's own mic too (`Dictate.js`'s own doc).
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

		// Stamped with the CURRENT session — `clean_chunk()` checks this stamp against
		// `this.session` before ever drawing it, so a session started while this chunk is
		// still cleaning leaves it silently unwanted rather than painted into the new
		// session's panels. doc/decisions.md. `cut` (4a) says WHY this segment closed —
		// "pause", "forced" (the 15s cap) or "manual" — undefined for the browser engine
		// or a sample line, which never had a reason to give.
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

	// Analysis is a STUB (`objects.js`) — it never changes after a session starts, so
	// this only needs to run once per session (`reset()` calls it; nothing else does).
	render_analysis(view){
		if (!view.$analysis) return;
		view.$analysis.empty(() => inspect(this.current.analysis));
	}

	// **The simplest working re-render, on purpose** (requirements.md deliverable 3:
	// "don't over-engineer a diffing update for a first version"). Every call throws
	// away the whole card and rebuilds `inspect(this.current)` from scratch — cheap
	// enough for a session with a few dozen chunks, and far simpler than hand-patching
	// one nested tree in place. If a session ever grows into the hundreds of chunks,
	// the cost of re-walking the whole tree on every `settle()`/`guess()` is the thing
	// to measure first; noted here rather than solved now.
	render_structure(view){
		if (!view.$structure) return;
		view.$structure.empty(() => inspect(this.current, { variant: "card" }));
	}

	// ---- Raw panel -------------------------------------------------------------

	// One settled chunk = one line, inserted before the guess line — which always
	// stays last (`insertBefore`, since a plain append would land a new line AFTER
	// the guess it is replaying to replace).
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

	// One line per settled chunk, same as Raw — starts showing the raw words (nothing
	// cleaned yet is better than a blank line) and is UPDATED in place, never re-drawn,
	// once `clean_chunk()` answers (`update_clean_line()` below). The wrapped view object
	// is kept on the entry itself, keyed by which mounted widget it belongs to, since two
	// widgets can share one session (`widget()`'s own doc comment) and each needs its own
	// element to update.
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

	// One row per Whisper RESEND — segment number, time since the previous update,
	// and the text THAT guess returned — appended once and never rewritten (each
	// row is its own moment; only the settled Raw line and the guess itself are ever
	// updated in place). `since_prev` is measured in THIS file, not inside `ux/Dictate`
	// — see `guess()`'s own comment for why it stands in for "how long Whisper took".
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

	// A chip marking the SEAM where a segment actually closed and why — "pause" (the
	// owner stopped talking), "forced" (hit the 15s cap mid-sentence, so the next
	// segment is a continuation, not a new thought) or "manual" (stop pressed). Says
	// nothing for the browser engine or a sample line (`entry.cut` is `undefined`
	// there) rather than guessing a reason nobody gave.
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

	// The strike/add marks dissolve over `FADE_MS` — set once, as an inline style, so
	// the CSS only has to say WHAT transitions, never the number. Added on the NEXT
	// frame (not this one) or the browser has nothing to transition FROM. Once the
	// fade finishes, the struck words are also taken OUT OF LAYOUT (`display: none`)
	// — opacity alone left a gap exactly the width of the word that "vanished"
	// ("we should␣␣we should"), which does not read as clean text at all.
	start_fade($line){
		const strikes = [...$line.el.querySelectorAll(".ux-dictate-pg-strike")];
		const adds = [...$line.el.querySelectorAll(".ux-dictate-pg-add")];

		[...strikes, ...adds].forEach(el => { el.style.transitionDuration = FADE_MS + "ms"; });
		requestAnimationFrame(() => requestAnimationFrame(() => $line.ac("ux-dictate-pg-faded")));
		setTimeout(() => strikes.forEach(el => { el.style.display = "none"; }), FADE_MS + 60);
	}

	// ---- the Sample button: the same pipeline, no mic, no whisper -----------

	// Feeds guesses word by word, then settles each chunk — the OWNER's own script:
	// fillers and doubled words in the first line, a misplaced "?" in the second, a
	// forced paragraph break before the third. Proves the whole pipeline (guess ->
	// settle -> clean -> diff -> fade) to a reader, or a headless test, with no
	// microphone and no whisper-server running.
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

// `cut` on each line is invented for the demo (a real session gets it from
// `Dictate`'s own `close_segment(reason)`) — the point is showing the Chunks view's
// seam marker actually renders, in the one path (Sample) that has no real Whisper
// segments to cut.
Playground.SAMPLE_SCRIPT = [
	{ text: "so um i was thinking we should uh we should build the the playground", cut: "pause" },
	{ text: "what do you think? about the layout", cut: "pause" },
	{ text: "let's also think about the audio source panel and the live level meter", force_gap: true, cut: "forced" },
];

// One instance for the whole `ux/Dictate` tier — the standalone playground page (its
// own url) and the widget embedded at the top of the plain Dictate page both read and
// drive this SAME pipeline, so a chunk settled from either widget shows up in both.
// `doc/decisions.md` has the shape and the bugs it caused before landing here.
export const pg = new Playground();
