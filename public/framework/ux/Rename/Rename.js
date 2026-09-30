import View, { div, span, h3, button, input, select, option, pre } from "/framework/core/View/View.js";
import { servex_url } from "/framework/dev/servex_url.js";
import { fixture_names } from "./fixtures.js";

View.stylesheet(import.meta, "Rename.css");

/** Where Servex answers `/api/hitl` — same helper every other caller already uses. */
const HITL_URL = servex_url("/api/hitl");

/**
 * `title` in, `{ok, names, source}` out — never throws. `names` is 5 suggested titles.
 * A network failure, or Servex answering `ok:false`, falls back to `fixtures.js`
 * (`source: "fixtures"` says so) — the production site is static, so that fallback is
 * what it actually shows.
 *
 *     import { rename_options } from "/framework/ux/Rename/Rename.js";
 *     const out = await rename_options("Q3 planning");
 *     // -> {ok: true, names: [5 strings], source: "assistant" | "fixtures"}
 */
export async function rename_options(title, context){
	try {
		const r = await fetch(HITL_URL, {
			method: "POST", headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ op: "rename", title, context }),
		});
		if (r.ok){
			const out = await r.json();
			if (out?.ok && Array.isArray(out.names)) return { ok: true, names: out.names, source: "assistant" };
		}
	} catch { /* Servex isn't up yet — fixtures below */ }

	return { ok: true, names: fixture_names(title), source: "fixtures" };
}

/**
 * class Rename extends View — one card title. A tap SELECTS it (a visible border);
 * once selected, pressing "Rename" — or typing "rename this" into the small field next
 * to it — asks `rename_options()` and turns the title into a dropdown of the 5 answers
 * plus "keep current". Picking one appends `{rename:{id, name, at}}` to an IN-MEMORY
 * log (`this.log`, a plain array — several `Rename`s can share one to show a combined
 * history); the latest line for this `id` always wins, and the title shows it.
 *
 *     new Rename({ id: "card-1", title: "Q3 planning", log: [] })
 *
 * The owner's own words: "I could click on a title and say, hey, can we rename this?
 * And then it suggests… maybe it turns that title into a dropdown… I guess I just need
 * like the basic function working for now." This is that basic function.
 */
export default class Rename extends View {

	render(){
		this.log ??= [];
		this.selected = false;
		this.editing = false;
		this.draw();
	}

	/* The latest {rename:{id,...}} line for THIS card wins; nothing yet shows the
	 * title it was given. */
	current(){
		const line = this.log.filter(l => l.rename?.id === this.id).pop();
		return line ? line.rename.name : this.title;
	}

	draw(){
		return this.empty(() => (this.editing ? this.dropdown() : this.head()));
	}

	head(){
		div.c("ux-rename-row flex gap-35 v-center wrap", () => {
			h3.c("ux-rename-title").attr("tabindex", "0").attr("role", "button")
				.attr("aria-pressed", String(this.selected))
				.text(this.current())
				.click(() => this.select())
				.ac(this.selected ? "ux-rename-selected" : "");

			if (this.selected){
				div.c("ux-rename-actions flex gap-35 v-center", () => {
					button.c("ux-rename-btn").attr("type", "button").text("Rename")
						.click(() => this.start());
					input.c("ux-rename-typed").attr("placeholder", "or type “rename this”…").attr("aria-label", "or type rename this")
						.on("keydown", e => { if (e.key === "Enter" && /rename this/i.test(e.target.value)) this.start(); });
				});
			}
		});
	}

	select(){
		this.selected = !this.selected;
		this.draw();
	}

	async start(){
		this.editing = true;
		this.loading = true;
		this.draw();

		const out = await rename_options(this.current());

		this.names = out.names;
		this.source = out.source;
		this.loading = false;
		this.draw();
	}

	dropdown(){
		div.c("ux-rename-row flex gap-35 v-center wrap", () => {
			if (this.loading){ span.c("muted", "asking…"); return; }

			this.$select = select.c("ux-rename-select", () => {
				option("Keep current — " + this.current()).attr("value", "");
				(this.names ?? []).forEach(name => option(name).attr("value", name));
			}).attr("aria-label", "Rename " + this.current() + " to")
				.on("change", e => this.choose(e.target.value));

			button.c("ux-rename-cancel").attr("type", "button").text("Cancel")
				.click(() => { this.editing = false; this.draw(); });

			if (this.source === "fixtures") span.c("muted ux-rename-fixtures", "fixtures: Servex /api/hitl not reachable");
		});
	}

	choose(name){
		this.editing = false;
		this.selected = false;

		if (name){
			const line = { rename: { id: this.id, name, at: new Date().toISOString() } };
			this.log.push(line);
			this.on_rename?.(line);
		}

		this.draw();
	}
}

Rename.prototype.classes = "ux-rename";

/* ---- the demo: three cards, one shared in-memory log shown beneath ------------- */

/* Three of the owner's own topics from this very brief — a title that names a real
 * thing, not a placeholder like "Card A". */
const CARDS = [
	{ id: "card-1", title: "Clarification UI for chat" },
	{ id: "card-2", title: "Rename cards by dropdown" },
	{ id: "card-3", title: "Objective marks for each statement" },
];

Rename.Demo = class RenameDemo extends View {

	render(){
		this.ac("ux-rename-demo flex v gap");
		this.log = [];

		CARDS.forEach(c => new Rename({ ...c, log: this.log, on_rename: () => this.refresh_log() }));

		div.c("h4 muted", "Log (latest line for an id wins)");
		this.$log = pre.c("ux-rename-log muted");
		this.refresh_log();
	}

	refresh_log(){
		this.$log.text(this.log.length ? this.log.map(l => JSON.stringify(l)).join("\n") : "(no renames yet)");
	}
};

export { Rename };
