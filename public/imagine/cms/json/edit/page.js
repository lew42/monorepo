import { Page, md, div, p, span, label, select, option, textarea, button } from "/app.js";
import { source, body } from "../json.js";

/* Container: one more column in `/imagine/`'s row. Size: the default track — a form and a
   preview, stacked. Own layout: one `flex v gap` stack of controls; the preview and the log
   are `surface pad flow` cards. Regions: one. Preview: the default card.

   THE EDIT IS AN APPEND — literally, over `rpc:append`, so the write is the size of the LINE
   and `page.json` is left byte-for-byte alone. The same bargain `ext/Item` makes with its
   rows, at the size of a page. Compact is the other half: the replayed state becomes the new
   snapshot and the log goes back to zero, so neither file grows without bound.

   ⚠ Off localhost there is no dev socket, so the four buttons go quiet and the page still
     renders — reading is a fetch and needs no server. */

const FIELDS = { title: "Title", description: "Description", body: "First paragraph" };

export default new Page({
	meta: import.meta,
	title: "Edit",
	description: "Change a field and watch page.jsonl grow by exactly one line.",
	icon: "edit_note",

	content(){
		md(`Pick a page, change a field, and the log gains one line. Nothing rewrites
[\`page.json\`](/imagine/cms/json/page.json) until you press **Compact**.`);

		div.c("flex v gap", () => {
			label.c("flex v", () => {
				span.c("muted", "Page");
				this.$where = select().on("change", () => this.pick());
			});

			label.c("flex v", () => {
				span.c("muted", "Field");
				this.$field = select(() => Object.entries(FIELDS)
					.forEach(([value, text]) => option(text).attr("value", value)))
					.on("change", () => this.pick());
			});

			this.$value = textarea().attr("rows", "5").attr("spellcheck", "false");

			div.c("flex gap wrap v-center", () => {
				this.$buttons = [
					button("Set field").ac("prim").click(() => this.change("set")),
					button("Add paragraph").click(() => this.change("append")),
					button("Delete page").click(() => this.change("del")),
				];
			});

			this.$status = p.c("muted");
		});

		md(`### Rendered from snapshot + deltas`);
		this.$preview = div.c("surface pad flow");

		md(`### The log`);
		this.$log = div.c("surface pad flow");
		div.c("flex gap wrap v-center", () => button("Compact").click(() => this.compact()));

		// The parent already memoises the load; landing here cold just waits on it.
		this.parent.ready?.().then(() => this.fill());
	},

	// ── the state, as a list of paths ─────────────────────────────────────
	// `["children", "format", "children", "snapshot"]` — every odd entry is a name, which
	// is also how the live Page is found again.
	paths(node = source.state, path = [], label = "(root)"){
		return [{ path, label }, ...Object.entries(node?.children ?? {}).flatMap(([name, kid]) =>
			this.paths(kid, [...path, "children", name], path.length ? label + " / " + name : name))];
	},

	fill(){
		const keep = this.$where.el.value;

		this.$where.empty(() => this.paths().forEach(node =>
			option(node.label).attr("value", JSON.stringify(node.path))));

		if (this.paths().some(node => JSON.stringify(node.path) === keep)) this.$where.el.value = keep;
		if (!source.writable()) this.read_only();

		this.pick();
	},

	where(){ return JSON.parse(this.$where.el.value || "[]"); },

	// A field is a path: `title` and `description` sit on the node, a paragraph is the text
	// of its first block.
	field_path(path = this.where()){
		const field = this.$field.el.value;
		return field === "body" ? [...path, "blocks", 0, "text"] : [...path, field];
	},

	at(path){ return path.reduce((node, key) => node?.[key], source.state); },

	// The live Page for a state path, so an edit can redraw it where it stands.
	page_at(path){
		let page = this.parent;
		for (let i = 1; i < path.length; i += 2) page = page?.children.get(path[i]);
		return page;
	},

	pick(){
		this.$value.el.value = this.at(this.field_path()) ?? "";
		this.draw();
	},

	// ── the three ops ─────────────────────────────────────────────────────
	async change(op){
		const path = this.where();
		const text = this.$value.el.value;

		if (op === "del" && !path.length) return this.say("the root page cannot be deleted.");

		const delta = op === "set" ? { op, path: this.field_path(path), value: text }
			: op === "append" ? { op, path: [...path, "blocks"], value: { type: "md", text } }
			: { op, path };

		const before = { lines: source.lines(), bytes: source.bytes() };

		try { await source.append(delta); }
		catch (error){ return this.say(error.message); }

		this.say(`one "${op}" line appended — page.jsonl ${before.lines} → ${source.lines()} lines, `
			+ `${before.bytes} → ${source.bytes()} bytes. page.json untouched.`);

		// The delta MUTATED the node the live page holds, so its own box redraws from the
		// new state. A title or a deleted page is next-load — core builds those.
		this.page_at(path)?.redraw?.();
		this.fill();
	},

	async compact(){
		const before = { lines: source.lines(), bytes: source.bytes() };

		try { await source.compact(); }
		catch (error){ return this.say(error.message); }

		this.say(`compacted — page.json is now the replayed state; page.jsonl ${before.lines} → 0 lines, `
			+ `${before.bytes} → 0 bytes. Reload: the same tree, no deltas to replay.`);

		this.draw();
	},

	// ── what you can see ──────────────────────────────────────────────────
	draw(){
		const path = this.where();

		this.$preview.empty(() => { body(this.at(path), this.page_at(path) ?? this); });

		this.$log.empty(() => {
			const tail = source.deltas.slice(-3).map(line => JSON.stringify(line)).join("\n");
			p(`${source.lines()} lines, ${source.bytes()} bytes` + (source.lines() > 3 ? " — last three:" : ""));
			if (tail) md("```json\n" + tail + "\n```");
		});
	},

	read_only(){
		this.$buttons.forEach($button => $button.attr("disabled", "disabled"));
		this.say("read-only — no dev socket here, so nothing is written. The tree still reads.");
	},

	say(msg){ this.$status.text(msg); },
});
