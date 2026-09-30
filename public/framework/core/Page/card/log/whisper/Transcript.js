import { View, span, a, style } from "../../../../View/View.js";

/**
 * Transcript — the running committed text, with a thin seam between each
 * commit. Click a seam to jump to the tick group that made it: the seam is
 * a plain `<a href="#whisper-tick-N">`, and `LogView` already gives that
 * tick's `<details>` a real `id` (`whisper/Instrument.js` sets `entry.id`)
 * — so the browser's own fragment-scroll does the jumping, no script needed.
 *
 *   const transcript = new Transcript();
 *   seams.on_seam((tick_id, text) => transcript.commit(tick_id, text));
 *
 * Classes carry the `log-` prefix, not `whisper-` — this whole page nests
 * inside `core/Page/card/log/`, and the task's fence only re-opened
 * `styles/css-scopes.txt` for that one `log-` line, so everything whisper-
 * specific stays inside the namespace already granted rather than asking
 * for a second one.
 */
style(`@layer theme {
	.log-whisper-transcript {
		font-size: 1.1em;
		line-height: 1.6;
	}
	.log-whisper-transcript:empty::before { content: "(nothing committed yet)"; color: var(--subtle); }

	/* The seam: a thin vertical rule between two commits, not a word of its
	   own — an em-wide target is still a fair click, even though it only
	   PAINTS a couple of pixels. */
	.log-whisper-seam {
		display: inline-block; width: 1.2em; text-align: center;
		color: var(--fill-a32); text-decoration: none; cursor: pointer;
	}
	.log-whisper-seam:hover { color: var(--prim); }
}`);

export default class Transcript extends View {
	render(){
		this.ac("log-whisper-transcript");
	}

	// `this.append(fn)` — not a bare factory call — because this runs from an
	// async event callback, long after the page's own render() returned,
	// where the ambient View.captor is app.$pages (App.js's permanent base
	// captor), not this view. `append(fn)` sets the captor to `this` itself
	// for the call, the same mechanism LogView's draw() relies on.
	commit(tick_id, text){
		if (!text) return;
		this.append(() => {
			if (this.el.children.length)
				a.c("log-whisper-seam").attr("href", "#" + tick_id).attr("title", "jump to this tick in the log").text("│");
			span(text + " ");
		});
	}
}

export { Transcript };
