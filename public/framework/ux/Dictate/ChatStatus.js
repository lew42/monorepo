/**
 * The status line beside the mic: ONE word for what the chat is doing right now, read from sources that already exist (never a copy of
 * their state). First true wins: speaking, agent working, sending, listening, else "". Readme: ux/Dictate/readme.md, "Status line".
 *
 *     new ChatStatus({ speaking, working, sending, listening, watch: [fn => unsubscribe, ...] })
 *
 * The four sources are plain functions returning a boolean (chat.js hands them in); each `watch` entry takes a callback to call when
 * its source changes. `subscribe(fn)` fires `fn(word)` only when the word changed.
 */
export default class ChatStatus {
	static WORDS = ["speaking", "agent working", "sending", "listening"];

	constructor({ speaking = () => false, working = () => false, sending = () => false, listening = () => false, watch = [] } = {}){
		this.sources = [speaking, working, sending, listening];
		this.fns = new Set();
		this.last = this.phase();
		for (const w of watch) w(() => this.check());
	}

	phase(){
		const i = this.sources.findIndex(f => f());
		return i < 0 ? "" : ChatStatus.WORDS[i];
	}

	check(){
		const now = this.phase();
		if (now === this.last) return;
		this.last = now;
		for (const fn of this.fns) try { fn(now); } catch (e){ console.error("ChatStatus: a listener failed", e); }
	}

	subscribe(fn){ this.fns.add(fn); return () => this.fns.delete(fn); }

	/** Shows the word in `el` (the composer's empty line beside the mic, ext/Chat/Composer.js) and keeps it current. */
	bind(el){
		el.textContent = this.last;
		this.subscribe(word => { el.textContent = word; });
	}
}
