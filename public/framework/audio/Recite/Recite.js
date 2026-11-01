import { View } from "../../core/View/View.js";
import track from "../../core/track/track.js";
import Part from "../Part.js";
import Voice from "../Voice/Voice.js";
import BargeIn from "./BargeIn.js";
import ReciteBar from "./ReciteBar.js";

View.stylesheet(import.meta, "Recite.css");

/**
 * class Recite extends Part — reads text aloud, the reverse of transcription.
 * It splits the text into sentences, has its `Voice` render each one on
 * recite-server (Kokoro, Servex/ext/recite/), and plays them on one timeline,
 * so pause, back 10 s and restart work across sentences. When the server is
 * down it falls back to the browser's own voice and keeps checking for the
 * server. Its parts: `Recite.BargeIn` (pauses when you talk) and `Recite.Bar`
 * (the one-line control). How it fits: readme.md.
 *
 *   const recite = new Recite();
 *   recite.read("Hello there. This is read aloud.");
 *   recite.pause(); recite.back(10); recite.restart();
 *   recite.bar;   // the control line
 */
export default class Recite extends Part {

	state = "idle";        // idle | loading | playing | paused | heard (paused by barge-in)
	server = "unknown";    // unknown | online | offline (then the browser's voice reads)
	error = "";            // the last failure, one plain line, shown on the bar
	url = Recite.default_url();
	voice = null;          // a Voice (one persona); Voice.PERSONAS lists them
	chunks = [];           // one per sentence: {text, start, seconds, src, pending}
	at = 0;                // the chunk playing, or paused in
	auto = Recite.remember("auto") != null ? Recite.remember("auto") === "true" : !!globalThis.matchMedia?.("(pointer: coarse)").matches;   // read new replies by themselves (on by default on a phone)
	live = null;           // the reply being streamed: {text, queued, fresh}

	constructor(...args){
		super(...args);
		this.assign(...args);   // a field named like an option overwrites it: audio/Voice/Voice.js has the note
		this.voice ??= Voice.persona(Recite.remember("voice") ?? Voice.PERSONAS[0].name);
		this.listeners = new Set();
		this.token = 0;
		this.done = new Set();   // replies already read, so the settled line after a stream is not read twice
		this.audio = typeof Audio === "function" ? new Audio() : null;   // node (the core test) has none
		this.audio?.addEventListener("ended", () => this.ended());
		this.audio?.addEventListener("timeupdate", () => this.changed());
		this.barge = new this.constructor.BargeIn({ recite: this });
		this.unlock_on_tap();
		Recite.track?.(this);
	}

	/** A phone plays sound only from a tap. A reply arrives from the network, with no tap, so the browser refused it
	 *  (NotAllowedError, "tap play") and nothing was heard. The first tap anywhere on the page (the mic, a button) plays
	 *  a silent tenth of a second on this one <audio>, which unlocks it for the rest of the visit; a reply held by that
	 *  refusal then starts. (dictation-v3, 2026-11-01) */
	unlock_on_tap(){
		if (!this.audio || typeof document === "undefined") return;
		const kinds = ["pointerdown", "touchend", "keydown"];
		const unlock = () => {
			if (this.unlocked || this.unlocking) return;   // one tap fires pointerdown AND touchend: unlock once
			const refused = this.state === "paused" && /tap/.test(this.error);
			if (this.state !== "idle" && !refused) return;   // a sentence is loaded or playing: never swap its source (pause keeps its place)
			this.unlocking = true;
			const a = this.audio;
			a.muted = true; a.src = Recite.SILENCE;
			a.play().then(() => {
				a.pause(); a.muted = false; this.unlocked = true;
				kinds.forEach(k => document.removeEventListener(k, unlock, true));
				if (this.state === "paused" && /tap/.test(this.error)) this.resume();   // the reply the browser refused
			}, () => { a.muted = false; }).finally(() => { this.unlocking = false; });
		};
		kinds.forEach(k => document.addEventListener(k, unlock, true));
	}

	/** Calls fn() on every change of state or position; returns an unsubscribe. */
	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
	changed(){ for (const fn of this.listeners) try { fn(this); } catch (e){ console.error("Recite: a listener failed", e); } }
	set(state, error){ this.state = state; if (error !== undefined) this.error = error; this.changed(); this.barge?.sync(); }

	/* ── reading ─────────────────────────────────────────────────────── */

	/** Read `text` from the start, dropping whatever was being read. */
	read(text){ this.stop(); return this.queue(text); }

	/** Add `text` after what is already queued; starts reading if idle. */
	queue(text){
		const first = this.chunks.length;
		for (const piece of Recite.split(text)) this.chunks.push({ text: piece, start: null, seconds: null, src: null, pending: null });
		if (this.chunks.length === first) return this;
		this.retime();
		if (this.state === "idle") this.play(first, 0);
		else this.prefetch(this.at);
		return this;
	}

	/** Play chunk `i` from `offset` seconds into it. */
	async play(i, offset = 0){
		const c = this.chunks[i];
		if (!c) return this.finish();
		const token = ++this.token;
		this.at = i;
		if (this.server === "offline" && !c.src) return this.speak_browser(i, token);
		if (!c.src) this.set("loading");
		try { await this.render(i); }
		catch (e){ if (token === this.token) this.speak_browser(i, token); return; }
		if (token !== this.token || !this.audio) return;   // paused, seeked or stopped while it rendered
		this.engine = "kokoro";
		this.audio.src = c.src;
		this.audio.currentTime = offset;
		try { await this.audio.play(); }
		catch (e){ if (token === this.token) this.set("paused", e.name === "NotAllowedError" ? "tap play: the browser wants a tap before it plays sound" : e.message); return; }
		if (token !== this.token) return;
		this.set("playing", "");
		this.unlocked = true;   // it played: no tap-unlock needed any more
		this.media_session();
		this.prefetch(i);
	}

	/** The audio of chunk `i`, once; the same promise for every caller. */
	render(i){
		const c = this.chunks[i];
		c.pending ??= this.voice.render(c.text, this.url).then(({ blob, seconds }) => {
			c.src = URL.createObjectURL(blob);
			c.seconds = seconds;
			if (this.server !== "online"){ this.server = "online"; this.error = ""; }
			this.retime();
		}, e => {
			c.pending = null;
			this.offline(e);
			throw e;
		});
		return c.pending;
	}

	/** Render the next two sentences while this one plays, so there is no gap. */
	prefetch(i){ for (const j of [i + 1, i + 2]) if (this.chunks[j] && this.server !== "offline") this.render(j).catch(() => {}); }

	/** Each chunk's start on the timeline, as far as the durations are known. */
	retime(){
		let t = 0;
		for (const c of this.chunks){
			c.start = t;
			if (c.seconds == null){ for (const later of this.chunks.slice(this.chunks.indexOf(c) + 1)) later.start = null; break; }
			t += c.seconds;
		}
	}

	ended(){ if (this.state === "playing") this.play(this.at + 1, 0); }
	finish(){ this.token++; this.at = Math.max(0, this.chunks.length - 1); this.set("idle"); }

	/* ── replies from a chat session ────────────────────────────────── */

	/** One event from a session's live wire (ext/Session `Session.stream`): the smart seat's reply is read, the owner's line pauses it.
	 *  Wire shapes: dictation-notes.md in the voice-recite task. */
	from_wire(ev){
		if (ev?.kind === "stream" && ev.role === "smart") return this.partial(ev.text);
		if (ev?.kind !== "line") return;
		const line = ev.line ?? {}, chat = line.chat;
		if (chat?.at && Date.now() - Date.parse(chat.at) > 120000) return;   // a replayed old line, not a reply just now
		if (chat?.from?.kind === "assistant") return chat.from.id === "smart" ? this.final(chat.text) : undefined;
		const add = Object.values(line).find(v => v?.replies?.add)?.replies.add;
		if (add) return add.by === "smart" ? this.final(add.text) : undefined;
		if (chat?.text && this.auto && this.barge.on) this.barge.owner_spoke(chat.text);   // ear off = manual playback
	}

	/** A reply still being written, the whole text so far: each sentence is read as soon as it ends. "" = the reply ended. */
	partial(text){
		if (!this.auto) return;
		if (!text){ if (this.live){ this.take(this.live.text, true); this.done.add(Recite.norm(this.live.text)); this.live = null; } return; }
		if (!this.live || !text.startsWith(this.live.text.slice(0, 30))) this.live = { text, queued: 0, fresh: true };
		this.live.text = text;
		this.take(text, false);
	}

	/** A settled reply. Read whole, unless its stream was already read. The newest reply replaces what was playing. */
	final(text){
		if (!this.auto || !text) return;
		const key = Recite.norm(text);
		if (this.done.has(key)) return;
		this.done.add(key);
		if (this.live && key.startsWith(Recite.norm(this.live.text.slice(0, this.live.queued)).slice(0, 30))){ this.live.text = text; this.take(text, true); this.live = null; return; }
		this.live = null;
		this.read(text);
	}

	/** Queue the finished sentences of the live reply that are not queued yet (all of it when `all`). */
	take(text, all){
		const live = this.live, rest = text.slice(live.queued);
		const cut = all ? rest.length : Recite.complete(rest);
		if (cut <= 0 || !/\w/.test(rest.slice(0, cut))) return;
		live.queued += cut;
		if (live.fresh){ live.fresh = false; this.read(rest.slice(0, cut)); }
		else this.queue(rest.slice(0, cut));
	}

	set_auto(on){ this.auto = !!on; Recite.remember("auto", this.auto); this.changed(); }

	/* ── the playhead ────────────────────────────────────────────────── */

	/** Seconds from the start of everything queued. */
	position(){
		const c = this.chunks[this.at];
		if (!c || c.start == null) return 0;
		return c.start + (this.engine === "browser" ? 0 : this.audio?.currentTime ?? 0);
	}

	/** Seconds known so far (sentences not rendered yet are not counted). */
	duration(){ return this.chunks.reduce((t, c) => t + (c.seconds ?? 0), 0); }

	/** Which chunk holds second `t`, and how far into it. */
	find(t){
		let i = 0;
		while (i < this.chunks.length - 1 && this.chunks[i + 1].start != null && this.chunks[i + 1].start <= t) i++;
		return { i, offset: Math.max(0, t - (this.chunks[i]?.start ?? 0)) };
	}

	pause(why = "paused"){
		if (!["playing", "loading"].includes(this.state)) return;
		this.token++;
		this.audio?.pause();
		if (this.engine === "browser") globalThis.speechSynthesis?.cancel();
		this.set(why === "heard" ? "heard" : "paused");
	}

	resume(){
		if (!["paused", "heard"].includes(this.state)) return;
		const same = this.audio?.src && this.audio.src === this.chunks[this.at]?.src;
		if (this.engine === "browser" || !same) return this.play(this.at, 0);
		const token = ++this.token;
		this.audio.play().then(() => { if (token === this.token) this.set("playing", ""); },
			e => this.set("paused", e.message));
	}

	toggle(){
		if (this.state === "playing" || this.state === "loading") return this.pause();
		if (this.state === "idle") return this.restart();
		this.resume();
	}

	seek(t){
		if (!this.chunks.length) return;
		const { i, offset } = this.find(Math.max(0, t));
		this.play(i, offset);
	}

	back(seconds = 10){ this.seek(this.position() - seconds); }
	restart(){ this.seek(0); }

	stop(){
		this.token++;
		this.audio?.pause();
		globalThis.speechSynthesis?.cancel();
		for (const c of this.chunks) if (c.src) URL.revokeObjectURL(c.src);
		this.chunks = [];
		this.at = 0;
		this.set("idle");
	}

	/** Change the persona; sentences not yet played are rendered again in the new voice. */
	pick(name){
		this.voice = Voice.persona(name);
		Recite.remember("voice", this.voice.name);
		for (const c of this.chunks.slice(this.at + 1)){ if (c.src) URL.revokeObjectURL(c.src); Object.assign(c, { src: null, pending: null, seconds: null }); }
		this.retime();
		this.changed();
	}

	/* ── the server, and the fallback when it is down ────────────────── */

	/** One fetch of /health: online or offline. */
	async check(){
		try {
			const r = await fetch(this.url + "/health", { signal: AbortSignal.timeout(2500) });
			const body = await r.json();
			this.server = body.ok ? "online" : "offline";
			if (body.ok){ this.error = ""; this.engine = "kokoro"; }
		} catch (e){ this.server = "offline"; this.error = `recite-server is not answering at ${this.url}: ${e.message}`; }
		this.changed();
		return this.server;
	}

	/** Mark the server offline and try again later: 3 s, then 10 s, then every 30 s. */
	offline(e){
		this.server = "offline";
		this.error = `recite-server: ${e.message} — reading with the browser's voice for now`;
		this.changed();
		if (this.retry) return;
		const wait = [3000, 10000, 30000][Math.min(2, this.retries = (this.retries ?? 0) + 1) - 1];
		this.retry = setTimeout(async () => { this.retry = null; if (await this.check() === "online") this.retries = 0; else this.offline(new Error("still down")); }, wait);
	}

	/** The browser's own voice reads chunk i, then the next. No seeking inside a sentence. */
	speak_browser(i, token){
		const c = this.chunks[i];
		this.engine = "browser";
		c.seconds ??= c.text.length / 15;   // an estimate, so back 10 s still steps back a sentence or two
		this.retime();
		this.set("playing");
		this.voice.speak(c.text, () => {
			if (token !== this.token || this.state !== "playing") return;
			this.engine = this.server === "online" ? "kokoro" : "browser";
			this.play(i + 1, 0);
		});
	}

	/** Lock-screen and headphone-button controls (Android shows them while it plays). */
	media_session(){
		const ms = globalThis.navigator?.mediaSession;
		if (!ms || typeof MediaMetadata !== "function") return;
		ms.metadata = new MediaMetadata({ title: this.chunks[0]?.text.slice(0, 60) ?? "Recite", artist: "Recite — " + this.voice.name });
		const set = (action, fn) => { try { ms.setActionHandler(action, fn); } catch {} };
		set("play", () => this.resume());
		set("pause", () => this.pause());
		set("seekbackward", () => this.back(10));
		set("previoustrack", () => this.restart());
		set("stop", () => this.stop());
	}

	/** The one-line control (`Recite.Bar`). */
	get bar(){ return new this.constructor.Bar({ recite: this }); }

	/* ── statics ─────────────────────────────────────────────────────── */

	/** On this machine, recite-server itself; anywhere else (a phone, the tunnel), the page's own /recite proxy. */
	static default_url(){
		const h = globalThis.location?.hostname;
		const local = h === "localhost" || h === "127.0.0.1" || h?.endsWith(".localhost");
		return local || !globalThis.location ? "http://127.0.0.1:8177" : globalThis.location.origin + "/recite";
	}

	/** Reply text as sentences a voice can say: markdown, code and links taken out, each piece 20–300 characters. */
	static split(text){
		const plain = String(text ?? "")
			.replace(/```[\s\S]*?```/g, " (a code block) ")
			.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			.replace(/https?:\/\/\S+/g, " a link ")
			.replace(/`([^`]*)`/g, "$1")
			.replace(/^\s*(#{1,6}|[-*+]|\d+\.)\s+/gm, "")
			.replace(/[*~]+/g, "")
			.replace(/(^|\s)_+|_+(?=\s|$)/g, "$1")   // _emphasis_, but never the _ inside snake_case
			.replace(/[|>]+/g, " ");
		const sentences = plain.split(/(?<=[.!?…:;])\s+|\n+/).map(s => s.replace(/\s+/g, " ").trim()).filter(s => /\w/.test(s));
		const out = [];
		for (const s of sentences){
			const last = out[out.length - 1];
			if (last && out.length > 1 && last.length < 20 && last.length + s.length < 300) out[out.length - 1] = last + " " + s;   // the first stays short: it starts sooner
			else if (s.length <= 300) out.push(s);
			else out.push(...(s.match(/.{1,280}(\s|$)|\S+/g) ?? [s]).map(x => x.trim()).filter(Boolean));
		}
		return out;
	}

	/** Where the last finished sentence of `s` ends (0 = none yet): a stop followed by a space, or a line break. */
	static complete(s){ let end = 0; for (const m of String(s).matchAll(/[.!?…:;](?=\s)|\n/g)) end = m.index + 1; return end; }

	/** Text compared loosely: spaces and markdown marks do not count. */
	static norm(s){ return String(s ?? "").replace(/[\s*_`#>]+/g, " ").trim().toLowerCase(); }

	/** One remembered setting (the voice, barge-in on/off, its threshold) in localStorage. */
	static remember(key, value){
		try {
			if (value === undefined) return globalThis.localStorage?.getItem("lew42.recite." + key) ?? null;
			globalThis.localStorage?.setItem("lew42.recite." + key, String(value));
		} catch { return null; }
	}

	/** The one Recite a page's chat views share, so two views never read over each other. */
	static get shared(){ return Recite._shared ??= new Recite(); }
}

Recite.BargeIn = BargeIn;
Recite.Bar = ReciteBar;
Recite.SILENCE = "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";   // 0.1 s of silence, 8 kHz: what unlock_on_tap() plays
track(Recite);

export { Recite };
