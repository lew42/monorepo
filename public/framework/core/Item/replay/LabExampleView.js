import View, { div, h2, p, span, b, code, button, input, label, ul, li } from "../../View/View.js";
import LabExample from "./LabExample.js";

/* One example, drawn: the buttons on top, then the two columns side by side (a stack on a phone). Each column shows its live
   object, the lines it saved, and, after Reload, the rebuilt object with its verdict. The state lives in the LabExample; this
   only draws it and passes presses on. */
export default class LabExampleView extends View {

	static COLUMNS = {
		changes: { title: "Saved as changes", note: "Each press saves the values it changed. On reload: put the values back. No method runs." },
		calls: { title: "Saved as calls", note: "Each press saves the method call (item.act). On reload: run each saved method again." },
	};

	// "**bold**" and `code` inside a sentence; everything else is plain text. (Only p() and h1-h6 read backticks on their own.)
	static say(classes, text, tag = p){
		return tag.c(classes, () => text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).forEach(part =>
			part.startsWith("**") ? b(part.slice(2, -2)) : part.startsWith("`") ? code(part.slice(1, -1)) : span(part)));
	}

	// A saved line as one row of text. Times are shown as hh:mm:ss.
	static show_line(line){
		return JSON.stringify(line, (k, v) => (k === "ts" || k.endsWith("_at")) && typeof v === "string" ? LabExample.clock(Date.parse(v)) : v);
	}

	render(){
		const example = this.example, X = example.constructor;
		this.tick_live = []; this.tick_after = [];
		this.$live = {}; this.$log = {}; this.$count = {}; this.$after = {};
		div.c("card core-item-replay-bench", () => {
			h2(X.title);
			LabExampleView.say("core-item-replay-look", X.look);
			div.c("core-item-replay-controls", () => {
				div.c("core-item-replay-buttons", () => X.buttons.forEach(one => button.c(one.two ? "is-two" : "", one.label).on("click", () => this.press(one))));
				X.options.forEach(option => label.c("core-item-replay-option", () => {
					const $box = input().attr("type", "checkbox");
					$box.el.checked = !!example.options[option.key];
					$box.on("change", () => this.option(option.key, $box.el.checked));
					span(option.label);
				}));
				div.c("core-item-replay-buttons", () => {
					button.c("core-item-replay-reload", "Reload the page").on("click", () => this.reload());
					button.c("core-item-replay-quiet", "Start over").on("click", () => this.start_over());
				});
				p.c("muted core-item-replay-hint", X.hint);
			});
		});
		div.c("core-item-replay-columns", () => Object.keys(LabExampleView.COLUMNS).forEach(kind => this.column(kind)));
		this.draw_all();
		this.start_clock();
		if (example.move) this.start_drag();
	}

	column(kind){
		const info = LabExampleView.COLUMNS[kind];
		div.c(`card core-item-replay-col is-${kind}`, () => {
			div.c("core-item-replay-col-head", () => { h2(info.title); this.$count[kind] = span.c("core-item-replay-eyebrow"); });
			p.c("muted core-item-replay-hint", info.note);
			this.$live[kind] = div.c("core-item-replay-live");
			this.$log[kind] = div.c("core-item-replay-log");
			this.$after[kind] = div.c("core-item-replay-after");
		});
	}

	// ---- drawing: each region on its own, so a drag can redraw the live objects and logs without touching the rest ----

	draw_all(){ this.draw_live(); this.draw_logs(); this.draw_after(); }

	draw_live(){
		this.tick_live.length = 0;
		for (const kind of Object.keys(this.$live)){
			const column = this.example.columns[kind];
			this.$live[kind].empty(() => {
				span.c("core-item-replay-eyebrow", "Live, before reload");
				this.example.draw(column.you, this.tick_live);
				if (this.example.constructor.check_meant){
					const off = this.example.off(kind);
					p.c("core-item-replay-check " + (off.length ? "is-bad" : "is-ok"), off.length ? "Not what the presses meant: " + off.join("; ") + "." : "Matches what the presses meant.");
				}
			});
		}
	}

	draw_logs(){
		for (const kind of Object.keys(this.$log)){
			const entries = this.example.columns[kind].tape.entries, shown = entries.slice(-60), from = entries.length - shown.length;
			this.$count[kind].text(`${entries.length - 1} line${entries.length === 2 ? "" : "s"} saved`);
			this.$log[kind].empty(() => {
				if (from) div.c("core-item-replay-line muted", `… ${from} earlier lines`);
				shown.forEach((entry, i) => div.c("core-item-replay-line" + (entry.tab === "file" ? " is-file" : ""), () => {
					span.c("core-item-replay-n", String(from + i + 1));
					span.c("core-item-replay-tab", entry.tab);
					span(LabExampleView.show_line(entry.line));
				}));
			});
			this.$log[kind].el.scrollTop = 1e9;
		}
	}

	draw_after(){
		const example = this.example;
		this.tick_after.length = 0;
		for (const kind of Object.keys(this.$after)){
			const column = example.columns[kind], after = column.after;
			this.$after[kind].empty(() => {
				if (!after){ p.c("muted core-item-replay-hint", "Press Reload the page to rebuild this object from its saved lines."); return; }
				const verdict = example.verdict(kind);
				span.c("core-item-replay-eyebrow", "After reload" + (after.n > 1 ? " #" + after.n : ""));
				example.draw(after.item, this.tick_after);
				div.c("core-item-replay-verdict " + (verdict.ok ? "is-ok" : "is-bad"), () => {
					if (verdict.ok){ b("Same as before the reload. Nothing ran twice."); return; }
					b(verdict.again ? "It did it again." : verdict.diffs.length ? "Different from before the reload." : "Same as before the reload, but not what the presses meant.");
					if (verdict.diffs.length) ul(() => verdict.diffs.forEach(d => li(d)));
				});
				div.c("core-item-replay-counts", () => {
					if (example.constructor.counts.includes("agents")) span.c("core-item-replay-count" + (verdict.fx.agents ? " is-bad" : ""), `Agents spawned again: ${verdict.fx.agents}`);
					if (example.constructor.counts.includes("ai")) span.c("core-item-replay-count" + (verdict.fx.ai ? " is-bad" : ""), `AI calls again: ${verdict.fx.ai} ($${verdict.fx.cost.toFixed(2)})`);
				});
				LabExampleView.say("core-item-replay-why", example.why(kind));
			});
		}
	}

	// ---- doing ----

	async press(one){
		const done = this.example.press(one);
		this.draw_live();
		await done;
		this.draw_all_but_after();
	}
	draw_all_but_after(){ this.draw_live(); this.draw_logs(); }

	async reload(){
		await this.example.reload();
		this.draw_live();
		this.draw_after();
	}

	async start_over(){
		await this.example.start();
		this.draw_all();
	}

	async option(key, value){
		await this.example.set_option(key, value);
		this.draw_all();
	}

	// The elapsed-time numbers tick on their own: a view of the clock, nothing is saved.
	start_clock(){
		let seen = false;
		const timer = setInterval(() => {
			if (this.el.isConnected) seen = true;
			else if (seen) return clearInterval(timer);
			this.tick_live.concat(this.tick_after).forEach(tick => tick());
		}, 500);
	}

	// Dragging the square (the layer example): pointer events on this view, so the squares may be redrawn mid-drag.
	start_drag(){
		let at = null;
		this.el.addEventListener("pointerdown", e => {
			if (!e.target.closest(".core-item-replay-layer")) return;
			at = { x: e.clientX, y: e.clientY };
			this.el.setPointerCapture(e.pointerId);
			e.preventDefault();
		});
		this.el.addEventListener("pointermove", async e => {
			if (!at) return;
			const dx = Math.round(e.clientX - at.x), dy = Math.round(e.clientY - at.y);
			if (!dx && !dy) return;
			at = { x: at.x + dx, y: at.y + dy };
			const done = this.example.move(dx, dy);
			this.draw_live();
			await done;
			this.draw_logs();
		});
		const end = () => { at = null; };
		this.el.addEventListener("pointerup", end);
		this.el.addEventListener("pointercancel", end);
	}
}
