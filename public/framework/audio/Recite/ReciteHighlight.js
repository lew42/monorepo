/**
 * class ReciteHighlight — `Recite.Highlight`, the karaoke playhead: while Recite reads, the sentence being read and its current
 * word light up where they sit on the page (the chat bubble), the way a lyrics screen follows a song.
 *
 * It changes no DOM: it finds the sentence's words in the chat's text and marks them with the CSS Custom Highlight API
 * (`CSS.highlights`, Chrome 105+, Safari 17.2+, Firefox 140+; a browser without it simply shows no highlight). The current word is
 * a guess from the sentence's audio: Kokoro gives no word timings, so the words are spread over the sentence's seconds by their
 * length (`word_at`). The Recite bar shows the same sentence and word on its own line, so the playhead is visible even when the
 * text is not on the page (the demo's text box).
 *
 *   new Recite.Highlight({ recite });   // Recite makes one for itself: recite.highlight
 */
export default class ReciteHighlight {

	/** Where replies are drawn: the V1 bubbles, Chat V2 / V3, or anything marked `data-recite-root`. Newest last; searched from the end. */
	static ROOTS = ".ux-dictate-widget-thread, .chat-v3, .drawer-rail-sheet-v2, [data-recite-root]";
	static SKIP = ".audio-recite-wrap, textarea, input, script, style";   // never the bar's own copy, never a form field
	static WORD = /[\p{L}\p{N}][\p{L}\p{N}'’]*/gu;

	constructor({ recite }){
		this.recite = recite;
		this.key = null;       // which sentence the ranges below belong to
		this.ranges = null;    // one Range per word of that sentence on the page, or null when it is not on the page
		this.frame = 0;
		recite.on(() => this.tick());
	}

	static supported(){ return typeof CSS !== "undefined" && !!CSS.highlights && typeof Highlight === "function"; }

	/** The words of a sentence, as the highlight counts them. */
	static words(text){ return String(text ?? "").match(this.WORD) ?? []; }

	/** Which word is playing `fraction` (0..1) of the way through a sentence: each word gets a share of time by its length. */
	static word_at(words, fraction){
		if (!words.length) return -1;
		const total = words.reduce((t, w) => t + w.length + 1, 0);
		let acc = 0;
		for (let i = 0; i < words.length; i++){ acc += words[i].length + 1; if (acc / total > fraction) return i; }
		return words.length - 1;
	}

	/** How far through the sentence playing now, 0..1. Kokoro: the audio's own clock; the browser's voice: time since it began, against its estimate. */
	fraction(){
		const r = this.recite, c = r.chunks[r.at];
		if (!c?.seconds) return 0;
		const t = r.engine === "browser" ? (performance.now() - (c.began ?? performance.now())) / 1000 : r.audio?.currentTime ?? 0;
		return Math.max(0, Math.min(1, t / c.seconds));
	}

	/** The sentence playing and the index of its current word, or null when nothing is being read. */
	now(){
		const r = this.recite, c = r.chunks[r.at];
		if (!c || !["playing", "paused", "heard", "loading"].includes(r.state)) return null;
		const words = ReciteHighlight.words(c.text);
		return { text: c.text, words, word: ReciteHighlight.word_at(words, this.fraction()) };
	}

	/** On each change, and on every frame while playing, so the word moves smoothly between the audio's own updates. */
	tick(){
		const now = this.now();
		this.draw(now);
		cancelAnimationFrame(this.frame); this.frame = 0;
		if (now && this.recite.state === "playing" && typeof requestAnimationFrame === "function") this.frame = requestAnimationFrame(() => this.tick());
	}

	draw(now){
		if (!ReciteHighlight.supported()) return;
		if (!now){ this.clear(); return; }
		const key = this.recite.at + "|" + now.text;
		if (key !== this.key || (this.ranges && !this.ranges[0]?.startContainer.isConnected)){ this.key = key; this.ranges = this.find(now.words); }
		if (!this.ranges){ this.clear(); return; }
		CSS.highlights.set("recite-sentence", new Highlight(...this.ranges));
		const w = this.ranges[Math.min(now.word, this.ranges.length - 1)];
		if (w) CSS.highlights.set("recite-word", new Highlight(w)); else CSS.highlights.delete("recite-word");
	}

	clear(){ if (ReciteHighlight.supported()){ CSS.highlights.delete("recite-sentence"); CSS.highlights.delete("recite-word"); } }

	/** One Range per word of `words` where they appear in a chat on the page, newest match first; null when they are not there.
	 *  It matches on the first few words in a row (case and punctuation ignored), then takes the sentence's length from there. */
	find(words){
		if (!words.length || typeof document === "undefined") return null;
		const want = words.map(w => w.toLowerCase());
		const roots = [...document.querySelectorAll(ReciteHighlight.ROOTS)].filter(el => el.offsetParent !== null || el.getClientRects().length);
		for (const root of (roots.length ? roots : [document.body]).reverse()){
			const found = this.scan(root);
			const head = Math.min(4, want.length);
			for (let i = found.length - want.length; i >= 0; i--){
				let ok = true;
				for (let k = 0; k < head && ok; k++) ok = found[i + k]?.word === want[k];
				if (!ok) continue;
				return found.slice(i, i + want.length).map(f => { const r = document.createRange(); r.setStart(f.node, f.start); r.setEnd(f.node, f.end); return r; });
			}
		}
		return null;
	}

	/** Every word under `root`, in reading order: {word, node, start, end}. */
	scan(root){
		const out = [], walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: n => n.parentElement?.closest(ReciteHighlight.SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
		});
		for (let n = walk.nextNode(); n; n = walk.nextNode())
			for (const m of n.data.matchAll(ReciteHighlight.WORD)) out.push({ word: m[0].toLowerCase(), node: n, start: m.index, end: m.index + m[0].length });
		return out;
	}
}
