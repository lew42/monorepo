/* THE TIMELINE ENGINE, ON ITS OWN. Two small classes, and neither one knows what a
   video is — which is the whole point of lifting them out of `youtube.js`:

     Cues    a sorted list of marks, and ONE comparison per read
     Clock   a time source that can be paused and resumed

   `Player` drives `Cues` from `getCurrentTime()`; `/imagine/scenes/tour/` drives the
   SAME class from a `Clock` and walks the 3D pager's urls with it. An engine welded to
   a YouTube player could only ever have done the first one. doc/cues.md */

export class Cues {

	constructor(...args){
		this.assign(...args);
		this.marks ??= [];
		this.crossed = -1;
	}

	assign(...args){ return Object.assign(this, ...args); }

	// The owner replaces this by assign, so the engine has no event system of its own
	// and a page keeps listening to the ONE object it already holds.
	fire(){}

	add(list){
		this.marks = [...this.marks, ...list].sort((a, b) => a.at - b.at);
		return this;
	}

	// ONE comparison: how many marks are behind the playhead. Moving forward runs the
	// ones just crossed — which is also what makes a forward SCRUB fast-forward the
	// room. Moving back fires `reset` and replays from the start, so scrubbing lands
	// on exactly the state a playthrough would have built. No cue needs an undo.
	run(time){
		let to = -1;
		while (this.marks[to + 1] && this.marks[to + 1].at <= time) to++;
		if (to === this.crossed) return this;

		let from = this.crossed;
		if (to < from){ this.fire("reset"); from = -1; }

		this.crossed = to;

		for (let i = from + 1; i <= to; i++){
			this.fire("cue", this.marks[i], i);
			this.marks[i].fn?.(this.marks[i], this);
		}

		return this;
	}

	// The mark the playhead is inside — the "which chapter am I in" question, which is
	// the same question as "what was the last thing crossed".
	current(){ return this.marks[this.crossed]; }

	// A new list means the old crossings are meaningless: the next read replays.
	rewind(){ this.crossed = -1; return this; }

	// REPLACE the list. An authoring tool edits its marks while the clock runs, and
	// appending is the wrong verb for that. `marks/` is the one page that needs it.
	set(list){ this.marks = []; return this.rewind().add(list); }
}

/* A PAUSE-AWARE CLOCK. `performance.now()` never stops, so a timeline built on it
   jumps forward by however long you were paused; banking the elapsed seconds on every
   pause is the whole fix. Seconds, because that is what a cue's `at` is. */
export class Clock {

	constructor(...args){ this.assign(...args); this.at = 0; this.since = null; }
	assign(...args){ return Object.assign(this, ...args); }

	time(){ return this.since === null ? this.at : this.at + (performance.now() - this.since) / 1000; }
	running(){ return this.since !== null; }

	start(){ this.since ??= performance.now(); return this; }
	pause(){ this.at = this.time(); this.since = null; return this; }
	toggle(){ return this.running() ? this.pause() : this.start(); }

	// ⚠ The mark has to move WITH the bank, or a seek while running is undone by the
	//   elapsed time still hanging off the old `since`.
	seek(s){
		this.at = Math.max(0, s);
		if (this.since !== null) this.since = performance.now();
		return this;
	}
}

/* THE TWO FORMATTERS, here rather than in `youtube.js`, because a time on a timeline
   has nothing to do with a video — and importing the player just to print "1:32" would
   have pulled a stylesheet and a Google loader into the 3D scenes.

   92.4 → "1:32", 3725 → "1:02:05". ⚠ The hour branch is not decoration: a two-hour talk
   read "127:14" before it, and `marks/` emits these strings for a human to paste. */
export function clock(s){
	s = Math.max(0, Math.floor(s || 0));

	const pad = n => String(n).padStart(2, "0");

	return s < 3600
		? `${Math.floor(s / 60)}:${pad(s % 60)}`
		: `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}

// The inverse: "6:00", "1:02:05" and "360" all mean a number of seconds.
export function seconds(text){
	const parts = String(text).trim().split(":").map(Number);
	return parts.reduce((total, part) => total * 60 + (part || 0), 0);
}
