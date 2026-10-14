import { View, div, span, h3, h4, p, icon } from "/app.js";

// AI 2 never imports the `ui/` tier itself — without this, `.ui-avatar`
// carries no rule anywhere on the page and every avatar collapses to a
// tiny, unstyled dot (mastermind correction, 2026-09-28).
import "/framework/ui/avatar/avatar.js";
import "/framework/ui/scale/scale.js";

View.stylesheet(import.meta, "details.css");

/* My band of the "Task Management & AI Patterns" Figma section (frame
 * "Details and priority", 78:13722): two task-detail cards, then a
 * "Priority by scale" board. One rounded grey panel, same as every other
 * Figma section on this card — the Figma comparison image sits below it,
 * drawn by a sibling file (figma.js).
 *
 * SCALED, NOT REFLOWED (mastermind correction, 2026-09-28), via the shared
 * `ui/scale` component (review finding 8): the card column is ~400px wide,
 * a quarter of the Figma frame's 856px, so a real two-up layout has no room
 * by site rhythm. Instead the outer `ui-scale` is a container-query root,
 * and `ui-scale-body`'s own `font-size` is `100cqi / 53.5` — 16px exactly
 * when the container is 856px wide, shrinking proportionally at any
 * narrower width. Every size below it is written in
 * `em` at the SAME ratio the Figma file itself used (their pixel ÷ 16), so
 * the whole band keeps the Figma's layout and simply gets smaller, instead
 * of re-wrapping into a taller, single-column mobile shape. No site
 * `.pad`/`.gap`/`.card` classes inside this subtree — their tokens are
 * themselves built from `cqi`/`%`, which would resolve against THIS new
 * container instead of the page, and go wrong.
 *
 * ⚠ Every class here is prefixed `figma-details-`, not a bare `figma-` —
 * the sibling `view.js`/`view.css` in this same card folder already used
 * plain names (`figma-chip`, `figma-desc`, `figma-path`…) and a same-named
 * rule in my stylesheet would have silently overridden theirs or the other
 * way around, both loaded into the same page (census caught this).
 *
 * ⚠ `View.style(obj, callback)` drops the callback silently (code skill) —
 * every capturing call below opens its children inside `.c()`'s own
 * argument, and `.style()` only ever comes after, with no third argument.
 *
 * Colour gaps, named rather than hidden: the site's token set has one accent
 * (a coral, `--prim`) and no purple/green/blue, where the Figma gives each
 * agent and each "done" state its own hue. `AVATAR_TONE` below is a small
 * fixed palette held ONLY in this file, picked to read the same as the
 * reference image, not a new site-wide token.
 */
const AVATAR_TONE = { AK: "#8b5cf6", AI: "#22c55e", MC: "var(--prim)", JD: "#3b82f6" };
const DONE_GREEN = "#22c55e";

export default class Default extends View {

	render(){
		div.c("ui-scale", () => {
			div.c("ui-scale-body figma-details darken-1 flex v", () => {
				this.chip("Task detail views");

				this.row("1.5em", () => {
					this.task_card("SIMPLE TASK", () => this.simple_task());
					this.task_card("COMPLEX TASK", () => this.complex_task());
				});

				this.line();
				this.priority_intro();
				this.priority_board();
			}).style({ gap: "1.5em", padding: "2.25em 2em" });
		}).style("--scale-width", "53.5");
	}

	// A row that does NOT wrap — the whole point of scaling instead of
	// reflowing is that two Figma-width columns always fit once shrunk.
	row(gap, fn){ return div.c("flex", fn).style({ gap }); }

	// The Figma look: a small box label. `tone` picks the fill —
	// "accent" (solid `--prim`, on-accent text), "pale" (a light tint of
	// `edge`, text in that same colour — IN PROGRESS, and the priority pills),
	// "white" (a plain surface box, P2/P3's low-key reading) or "outline"
	// (no fill, a hairline border — kept for anything else that wants it).
	chip(text, tone, edge){
		const $c = span.c("figma-details-chip", text.toUpperCase());
		if (tone === "accent") $c.style({ background: "var(--prim)", color: "var(--on-accent, #fff)" });
		else if (tone === "pale") $c.style({ background: `color-mix(in srgb, ${edge} 18%, var(--surface))`, color: edge });
		else if (tone === "white") $c.style({ background: "var(--surface)", color: "var(--ink)", border: "0.0625em solid var(--line)" });
		else if (tone === "outline") $c.style({ background: "none", color: "var(--ink)", border: "0.0625em solid var(--line)" });
		return $c;
	}

	type_label(text){ div.c("figma-details-type", text); }

	line(){ div.c("figma-details-line"); }

	// A framed box — `.surface` for the fill/ink/radius, with the 1px border
	// re-drawn in `em` so it thins out at small scale exactly as a real Figma
	// stroke would, instead of staying a flat, relatively-thick 1px.
	box(pad, fn){ return div.c("surface flex v", fn).style({ gap: "0.9em", padding: pad, borderWidth: "0.0625em" }); }

	// One agent-initials circle in its own fixed colour (see AVATAR_TONE).
	// ⚠ No per-avatar `font-size` override here — `--avatar` is itself an
	// `em` value, so setting it on the SAME element whose own font-size was
	// just shrunk resolves it against the ALREADY-shrunk size and the circle
	// shrinks twice. `--avatar` is set once, on the row below, and every
	// avatar inherits the row's own (unshrunk) font-size instead.
	avatar(name){
		return span.c("ui-avatar", name).style({ background: AVATAR_TONE[name] ?? "var(--ink)", color: "#fff" });
	}

	avatars(names){
		div.c("ui-avatars flex", () => names.forEach(name => this.avatar(name))).style({ "--avatar": "1.6em" });
	}

	path_row(path){
		div.c("figma-details-path flex v-center", () => {
			icon("account_tree");
			span(path);
		}).style("gap", "0.35em");
	}

	// icon + label + value, one line — the Figma's "Detail field" repeated for
	// due date / priority / label with no markup of its own per field.
	detail_field(name, label, value){
		div.c("figma-details-field flex v-center", () => {
			icon(name);
			span.c("figma-details-field-label", label);
			span.c("figma-details-field-value", value);
		}).style("gap", "0.6em");
	}

	// The shared shell of both cards: a type label above a framed box whose
	// header row carries the status chip, the avatars, and the × close icon
	// every "Task detail" card wears in the Figma.
	task_card(label, fn){
		div.c("flex v", () => {
			this.type_label(label);
			fn();
		}).style({ gap: "0.6em", flex: "0 0 24.375em" });
	}

	simple_task(){
		this.box("1.125em", () => {
			div.c("flex split v-center", () => {
				this.chip("In review", "accent");
				div.c("flex v-center", () => { this.avatars(["AK", "AI"]); icon("close"); }).style("gap", "0.6em");
			});

			p.c("figma-details-title", "Update release notes with the final accessibility fixes.");
			this.path_row("tasks/release-notes#a18f");
			this.line();
			this.detail_field("event", "DUE", "Today · 16:00");
			this.detail_field("flag", "PRIORITY", "High");
			this.detail_field("sell", "LABEL", "Documentation");

			div.c("wash flex v", () => {
				div.c("figma-details-field-label", "LATEST ACTIVITY");
				p.c("figma-details-activity", "AI linked the keyboard-navigation fix and requested a final copy review.");
			}).style({ gap: "0.3em", padding: "0.75em", borderRadius: "0.375em" });
		});
	}

	complex_task(){
		const subtasks = [
			{ label: "Keyboard shortcuts", owner: "AI", done: true },
			{ label: "Command search", owner: "AI", done: true },
			{ label: "Recent actions", owner: "JD", done: false },
			{ label: "Accessibility pass", owner: "AI", done: false },
		];

		this.box("1.125em", () => {
			div.c("flex split v-center", () => {
				this.chip("In progress", "pale", "#8b5cf6");
				div.c("flex v-center", () => { this.avatars(["MC", "AI", "JD"]); icon("close"); }).style("gap", "0.6em");
			});

			h3.c("figma-details-title-lg", "Ship command palette");
			p.c("figma-details-desc", "A keyboard-first surface for navigation, search, and common actions.");
			this.path_row("feature/cmd-menu#c04b");

			// Each sub-task is its own small box, not a bare row: done ones sit
			// on a darker fill with a green check; open ones stay on the card's
			// own surface with an empty ring. The assignee is small grey
			// initials at the right, not a coloured avatar dot.
			div.c("flex v", () => subtasks.forEach(t =>
				div.c(t.done ? "darken-1 flex split v-center" : "surface flex split v-center", () => {
					div.c("flex v-center", () => {
						icon(t.done ? "check_circle" : "radio_button_unchecked").style("color", t.done ? DONE_GREEN : "var(--line)");
						span(t.label);
					}).style("gap", "0.5em");
					span.c("figma-details-subtask-owner", t.owner);
				}).style({ gap: "0.5em", padding: "0.5em 0.7em", borderRadius: "0.375em" }))).style("gap", "0.4em");

			div.c("figma-details-progress").style("--value", `${subtasks.filter(t => t.done).length / subtasks.length * 100}%`);
		});
	}

	priority_intro(){
		div.c("flex split", () => {
			div.c("flex v", () => {
				h3.c("figma-details-title-lg", "Priority by scale");
				p.c("figma-details-desc", "Visual size mirrors urgency and impact.");
			}).style("gap", "0.2em");

			div.c("figma-details-field-label", "IMPACT → URGENCY");
		});
	}

	priority_board(){
		div.c("flex v", () => {
			// `align-items: flex-start` — the P0 card sizes to its own content
			// and does NOT stretch to match the secondary column's full height,
			// the flex default every browser otherwise applies to a row.
			this.row("0.75em", () => {
				this.priority_card({
					// A distinct warm orange, not `--prim` — this site's one accent
					// IS already an orange-coral, so P0 (blocker) needs its own hue
					// to read as different from P1's accent border (mastermind
					// correction, 2026-09-28).
					width: "30em", badge: "P0 · BLOCKER", edge: "#e0892e", big: true,
					title: "Resolve release-blocking focus trap",
					desc: "Blocks the release candidate and receives the strongest visual weight.",
					path: "fix/focus-trap-#912", owners: ["MC", "AI", "JD"],
				});

				div.c("flex v", () => {
					this.priority_card({ badge: "P1 · HIGH", edge: "var(--prim)", accent: true, title: "Ship command palette", path: "feature/cmd-menu#c04b", owners: ["AI"] });
					this.priority_card({ badge: "P2", white: true, title: "Update changelog", path: "docs/changelog#ec21", owners: ["AI"] });
					this.priority_card({ badge: "P3", white: true, title: "Archive old flags", path: "ops/flags#10aa", owners: ["AI"] });
				}).style({ gap: "0.625em", flex: "0 0 18.75em" });
			}).style("align-items", "flex-start");
		}).style("gap", "0.9em");
	}

	priority_card({ width, badge, edge, accent, white, big, title, desc, path, owners }){
		return this.box(big ? "1.375em" : "0.875em", () => {
			div.c("flex split v-center", () => {
				this.chip(badge, white ? "white" : "pale", edge);
				icon("drag_indicator");
			});

			if (big) h3.c("figma-details-title-reg-lg", title);
			else h4.c("figma-details-title-reg-sm", title);
			if (desc) p.c("figma-details-desc", desc);
			div.c("flex split v-center", () => {
				this.path_row(path);
				this.avatars(owners ?? ["AI"]);
			});
		}).style({
			flex: width ? `0 0 ${width}` : "1",
			border: `0.125em solid ${edge ?? "var(--line)"}`,
		});
	}
}
