import { Page, md, div, p, button, textarea, span } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";

/* Container: /imagine/'s columns row. Size: `large` (28-64em) — source beside preview is
   two columns of content, which the default 40em track cannot hold. Own layout: one
   `.flex.auto gap` pair with `--column: 20em`, so it folds to one column under ~44em.
   Regions: one. Preview: the default card.

   THE WHOLE CMS. `rpc:write` (Server/plugins/SocketServer/Runtime.js) has written any file
   under public/ since long before this page existed; FileSaver has used it for JSON since
   the persistence stack landed. Markdown is the same call with the JSON.stringify left out —
   and a markdown file in git is content a human can diff.

   ⚠ `rpc:write` does NOT mute the socket that wrote (LiveReload.mute() is opt-in and only
   Start.js and Ask.js call it), so saving reloads this very tab. `$BLOCKRELOAD` is core's
   own escape hatch (Socket.changed():147) and is lifted after the 300ms flush. The one-line
   server fix is in doc/decisions.md. */

const FILE = "/imagine/cms/welcome.md";
const DRAFT_DELAY = 400;   // ms — a light debounce, one store write per pause in typing

export default new Page({
	meta: import.meta,
	title: "Edit",
	description: "Change welcome.md in the browser; the file on disk changes. Publishing is git commit.",
	icon: "edit_note",
	width: "large",

	content(){
		md(`Editing [\`public${FILE}\`](${FILE.replace(/\.md$/, "/")}) — the real file, not a copy.
Save writes it through the dev socket; \`git diff\` then shows your words.`);

		// ⚠ Built synchronously, filled in a callback — a factory call after the
		// `await` below would land in whatever captor is current by then.
		div.c("flex auto gap", ($panes) => {
			this.$source = textarea().attr("rows", "18").attr("spellcheck", "false");
			this.$preview = div.c("surface pad flow");
			$panes.style("--column", "20em");
		});

		div.c("flex gap v-center wrap", () => {
			this.$save = button("Save").ac("prim").click(() => this.save());
			this.$status = span.c("muted");
			this.$draft_note = span.c("muted", "draft · restored").hide();
			this.$discard = button("Discard draft").click(() => this.discard()).hide();
		});

		this.load();

		md(`## The whole deploy story

1. You typed. **2.** Save wrote \`public${FILE}\` on disk. **3.** \`git diff\` shows the
paragraph you changed, as a paragraph. **4.** \`git commit && git push\` — the host serves
the new file. There is no build, no database migration, and no admin account.

Off localhost there is no dev socket, so this page goes read-only and says so — the same
rule [\`FileSaver\`](/framework/ext/Saver/doc/backends/) has always followed.`);
	},

	// Three seams now: where the text comes from, where it goes, and where an
	// UNSAVED edit waits between them — `this.store()` (core, keyed on this page's
	// own url) patched on every pause in typing. Swap any one for a different
	// backend and nothing above this line changes.
	async load(){
		const text = await fetch(FILE).then(r => r.ok ? r.text() : "").catch(() => "");
		this.original = text;

		// A draft only means something if it differs from what's already on disk —
		// otherwise it's a stale patch from a session that never diverged.
		const draft = this.store().get();
		if (draft.text !== undefined && draft.text !== text){
			this.$source.el.value = draft.text;
			this.show_draft();
		} else {
			this.$source.el.value = text;
		}

		this.$source.on("input", () => this.edit());
		this.draw();
		if (Socket.singleton().disabled) this.read_only();
	},

	draw(){
		this.$preview.html("");
		this.$preview.append(() => md(this.$source.el.value || "*Nothing yet.*"));
	},

	// Redraws every keystroke; the store write waits for a pause — cheap, but not
	// worth one call per character.
	edit(){
		this.draw();
		clearTimeout(this.draft_timer);
		this.draft_timer = setTimeout(() => {
			this.store().patch({ text: this.$source.el.value });
			this.show_draft();
		}, DRAFT_DELAY);
	},

	async save(){
		const socket = Socket.singleton();
		if (socket.disabled) return this.read_only();

		this.say("saving…");
		window.$BLOCKRELOAD = true;                       // don't reload myself over my own write
		const reply = await socket.async_rpc("write", FILE, this.$source.el.value);
		setTimeout(() => { window.$BLOCKRELOAD = false; }, 1200);

		if (reply?.response === "write successful"){
			this.original = this.$source.el.value;
			clearTimeout(this.draft_timer);
			this.store().clear();
			this.hide_draft();
			this.say(`saved — public${FILE} changed on disk. Commit it to publish.`);
		} else {
			this.say("the server refused the write.");   // kept: a failed save is not a saved draft
		}
	},

	// Explicit, like save — throws the in-progress text away and returns to disk.
	discard(){
		clearTimeout(this.draft_timer);
		this.store().clear();
		this.$source.el.value = this.original;
		this.draw();
		this.hide_draft();
		this.say("draft discarded — back to the file on disk.");
	},

	show_draft(){ this.$draft_note.show(); this.$discard.show(); },
	hide_draft(){ this.$draft_note.hide(); this.$discard.hide(); },

	read_only(){
		this.$save.attr("disabled", "disabled");
		this.say("read-only — no dev socket here, so nothing is written.");
	},

	say(msg){ this.$status.text(msg); },
});
