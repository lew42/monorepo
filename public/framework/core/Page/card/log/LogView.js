import { View, div, p, span, small, details, summary, style } from "../../../View/View.js";
import { BOXED_LEVELS } from "../depth.js";

/**
 * LogView — renders a `Logger`'s entries (`logger.entries`, or a plain array
 * from `Logger.from_jsonl(text)`) as nested cards.
 *
 *   new LogView({ logger }).append_to(somewhere);      // live: redraws itself
 *   new LogView({ entries: Logger.from_jsonl(text) }); // static: one read
 *
 * Level 1 through `BOXED_LEVELS` (3) are boxes (`.card`, so they pick up
 * framework.css's padding and rounded corners for free). Level 4 and deeper
 * give up the box — a bare heading over its own content, at the SAME
 * indentation — because a fourth level of nested boxes runs out of padding
 * to give (the owner, 2026-09-29). `card/nesting/page.js` draws a plain card
 * tree to the same rule, from the same constant, so the two can't drift
 * apart again (`card/doc/system.md`'s Nesting table). Every group is a
 * native `<details>`, open by default, so a reader can collapse the ones
 * they don't care about.
 */
style(`@layer theme {
	/* RHYTHM: a log reads like a log, not like paragraphs of prose. Two log
	   LINES in a row sit tight (0.2em — the owner, 2026-09-30); anywhere a
	   GROUP is one of the two neighbours, it keeps the full --gap, so a group
	   still reads as its own thing. ":is(.log-view, .log-group-body) > *"
	   covers both the root list and every nested one with one rule. */
	:is(.log-view, .log-group-body) { display: flex; flex-direction: column; }
	:is(.log-view, .log-group-body) > * { margin: 0; }
	:is(.log-view, .log-group-body) > * + * { margin-block-start: var(--gap); }
	:is(.log-view, .log-group-body) > .log-line + .log-line { margin-block-start: 0.2em; }

	.log-group-body { margin-block-start: var(--gap); }

	/* Boxed groups (level 1-2): .card already pads and rounds the corners, and
	   already spaces summary from body (framework.css's ":where(.card) > *"
	   rhythm) — so the body's own margin above is redundant there and switched
	   off, one line, rather than fighting the two rules against each other. */
	.log-group.card > .log-group-body { margin-block-start: 0; }

	/* The summary reset — framework.css's control grammar reads a bare
	   <summary> as a button (grey fill, border, a 2.4em floor, an inset-shadow
	   hover); a log group's toggle is a plain heading, not a control, so
	   every one of those declarations is reset back to nothing here.
	   "summary.log-group-summary" (element + class) outweighs framework's
	   bare "summary" (and its ":is(...)" hover rule, which counts as a plain
	   class for specificity) regardless of stylesheet load order — the exact
	   selector shape ui/item.js already uses for this same reset. */
	summary.log-group-summary {
		display: flex; align-items: baseline; gap: 0.4em;
		width: auto; max-width: none; min-height: 0;
		padding: 0; margin: 0; background: none; border: none; box-shadow: none;
		font-weight: 700; cursor: pointer; list-style: none;
	}
	summary.log-group-summary:hover, summary.log-group-summary:active { --ctl-lift: transparent; border-color: transparent; }
	summary.log-group-summary::-webkit-details-marker { display: none; }

	/* The caret: one glyph, rotated open — not a second glyph swapped in,
	   the same mechanism ui/item.js's .item-caret already uses. */
	.log-caret { display: inline-block; color: var(--subtle); transition: transform 0.1s; }
	details[open] > summary.log-group-summary > .log-caret { transform: rotate(90deg); }

	.log-group-meta { font-weight: 400; }

	/* Flat groups (level 4+, past BOXED_LEVELS): no box, no extra padding —
	   just a bigger, bolder label standing in for the missing border. Capped
	   at level 5 so a deep object graph doesn't shrink text past readable. */
	.log-level-4 > .log-group-summary { font-size: 1.05em; }
	.log-level-5 > .log-group-summary { font-size: 1em; color: var(--subtle); }

	.log-line { font-family: monospace; font-size: 0.9em; }
	.log-line-time { font-family: monospace; margin-inline-end: 0.5em; }

	/* The two tags logger.note(tag, ...) can set. Muted: a skipped step, the
	   detail nobody needs to read twice. Highlight: the one line worth the
	   eye catching on — --ok-wash isn't a token every theme defines, so this
	   falls back to --wash, which every theme does. */
	.log-muted { color: var(--subtle); }
	.log-highlight { background: var(--ok-wash, var(--wash)); border-radius: var(--radius); padding: 0.1em 0.4em; margin-inline-start: -0.4em; }
}`);

export default class LogView extends View {

	render(){
		this.max_level = this.max_level || 5;
		this.ac("log-view");
		this.draw();

		// A live Logger: redraw on every event. Pushed onto `logger.outputs`
		// rather than polled, so a page with no new logs costs nothing.
		if (this.logger)
			this.logger.outputs.push({
				write: () => this.draw(),
				open: () => this.draw(),
				close: () => this.draw(),
			});
	}

	// `this.entries` is a plain config field (`new LogView({ entries })`), not a
	// method — Object.assign in the constructor would silently clobber a
	// method of this name, so this reads it straight, falling back to the
	// live logger's own tree when the view was built with `{ logger }` instead.
	draw(){
		const list = this.entries || (this.logger ? this.logger.entries : []);
		this.empty(() => this.draw_entries(list, 1));
	}

	draw_entries(entries, level){
		for (const entry of entries){
			if (entry.kind === "group")
				this.draw_group(entry, level);
			else
				this.draw_line(entry);
		}
	}

	draw_group(entry, level){
		const boxed = level <= BOXED_LEVELS;
		const shown = Math.min(level, this.max_level);

		// `entry.id`, when a caller (the Whisper debug view) sets one, gives
		// this group a real anchor — `location.hash` or `scrollIntoView()`
		// can jump straight to the tick that made it.
		details.c(`log-group log-level-${shown}` + (boxed ? " card" : " log-group-flat")).attr("open", "").attr("id", entry.id).append(() => {
			summary.c("log-group-summary", () => {
				span.c("log-caret", "▸");
				span.c("log-group-label", entry.label || "(group)");
				small.c("log-group-meta muted", this.group_meta(entry));
			});
			div.c("log-group-body", () => this.draw_entries(entry.entries, level + 1));
		});
	}

	// "2 lines · 3 ms" — the count is every log line anywhere inside (nested
	// groups included, so a group holding sub-groups still says how much work
	// happened in it); the duration is missing while the group is still open.
	group_meta(entry){
		const n = this.count_lines(entry.entries);
		const parts = [n === 1 ? "1 line" : `${n} lines`];
		if (entry.duration != null) parts.push(`${entry.duration} ms`);
		return parts.join(" · ");
	}

	count_lines(entries){
		let n = 0;
		for (const e of entries) n += e.kind === "group" ? this.count_lines(e.entries) : 1;
		return n;
	}

	// `entry.tag` ("muted" or "highlight", from `logger.note(tag, ...)") adds
	// one class — a plain `log()` call has no tag and renders the plain way.
	draw_line(entry){
		p.c(`log-line${entry.tag ? " log-" + entry.tag : ""}`, () => {
			small.c("log-line-time muted", this.format_time(entry.t));
			span(entry.args.map(a => this.format_arg(a)).join(" "));
		});
	}

	// Strings print as-is; anything else gets a short, safe JSON form — the
	// same fallback `Logger.short()` uses for a group's own label.
	format_arg(value){
		if (typeof value === "string") return value;
		try { return JSON.stringify(value); } catch { return String(value); }
	}

	format_time(t){
		if (!t) return "";
		const d = new Date(t);
		return d.toTimeString().slice(0, 8) + "." + String(d.getMilliseconds()).padStart(3, "0");
	}
}

export { LogView };
