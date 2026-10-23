// SessionSettings.js — the session's Settings sub-page (the first entry of Session.MENU), at <session url>/settings/.
// A form drawn from the session class's SETTINGS; each change appends ONE {"settings":{<key>:<value>}} line to the
// session's session.jsonl through the dev socket (FsFile.append → rpc:append). Reading replays the file. Doc: doc/menu.md.
import { Page, div, p, label, input, select, option, span, small } from "/app.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import Session from "./Session.js";

export default class SessionSettings extends Page {

	// { file: the session.jsonl url, session_class: Session or a subclass }
	constructor(...args){ super({ title: "Settings", width: "fill" }, ...args); this.session_class ??= Session; }

	// The file's lines, replayed into a session; an empty session when the file does not exist yet.
	async session(){
		const text = await fetch(this.file, { cache: "no-store" }).then(r => r.ok ? r.text() : "", () => "");
		const lines = text.split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
		return this.session_class.replay(lines);
	}

	// One changed key, one line. Returns true when the dev server took it.
	save(key, value){ return FsFile.append(this.file, { settings: { [key]: value } }); }

	content(){
		const $form = div.c("flow session-settings", () => small.c("muted", "Loading…"));
		this.session().then(s => $form.empty(() => {
			p(`Saved to this session's log, one line per change: ${this.file}`);
			for (const f of this.session_class.SETTINGS) this.field(f, s.settings[f.key]);
		}));
	}

	// One labelled control, and a word after it that says whether the change was saved.
	field(f, value){
		label.c("session-settings-field flex gap-50", () => {
			span.c("session-settings-label", f.label);
			const $in = f.type === "select" ? select.c("session-settings-input", () => f.options.forEach(o => option(o || "(default)").attr("value", o)))
				: input.c("session-settings-input").attr("type", f.type === "checkbox" ? "checkbox" : "text");
			if (f.type === "checkbox") $in.el.checked = !!value; else $in.el.value = value ?? "";
			const $status = span.c("muted session-settings-status");
			$in.on("change", () => this.save(f.key, f.type === "checkbox" ? $in.el.checked : $in.el.value)
				.then(ok => $status.el.textContent = ok ? "saved" : "not saved (is the dev server running?)"));
		});
	}
}
