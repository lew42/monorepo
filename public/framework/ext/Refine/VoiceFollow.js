import * as Session from "../Session/Session.js";

const KEY = "lew42-voice-session";   // the ✦ chat's session, written by ux/Dictate/chat.js

/**
 * class VoiceFollow — lets the Refine page show what the ✦ chat (desktop drawer or phone sheet) heard, so
 * one dictation gives one result everywhere. It watches this tab's voice session file and hands the owner's
 * lines, joined, to `on_text`. Read-only: it never starts a session or a mic. See ux/Dictate/doc/asks.md.
 */
export default class VoiceFollow {
	constructor({ on_text }){
		this.on_text = on_text;
		this.file = null;          // the session file being watched
		this.lines = [];           // owner lines heard, in file order
		this.seen = new Set();
		this.stop_watch = null;
		this.look();
		this.timer = setInterval(() => this.look(), 2000);   // the session can start after this page opens
	}

	get text(){ return this.lines.join(" ").trim(); }

	look(){
		let saved = null;
		try { saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch {}
		if (!saved?.file || saved.file === this.file) return;
		this.stop_watch?.();
		Object.assign(this, { file: saved.file, lines: [], seen: new Set() });
		this.stop_watch = Session.watch(saved.file, line => this.hear(line));
	}

	hear(line){
		const c = line?.chat;
		if (!c || c.from?.kind !== "owner" || c.fix || c.level || !c.text) return;
		if (this.seen.has(c.at)) return;
		this.seen.add(c.at);
		this.lines.push(c.text);
		this.on_text(this.text, this);
	}

	stop(){ clearInterval(this.timer); this.stop_watch?.(); }
}
