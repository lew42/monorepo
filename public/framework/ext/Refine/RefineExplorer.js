import { View, div, span, a, h4 } from "../../core/View/View.js";
import DefaultView from "../../ux/Content/Object/DefaultView.js";
import RefineSystem from "./RefineSystem.js";

/**
 * class RefineExplorer extends View — the live INSTANCE explorer of the Refine system: how many of each
 * class exist right now, the class architecture card, and the framework's own default object tree
 * (`ux/Content/Object/DefaultView`) of the running `RefineSystem`, which opens down through its
 * `Prompt`, `Whisper` and `WhisperSession`s to their properties and logs.
 *
 *   const explorer = new RefineExplorer({ subject: system });
 *   explorer.draw();      // call after the system changed; throttled so dictation stays smooth
 *
 * No page-specific tree: the tree IS DefaultView (law 6). The counts are computed from the live objects.
 */
export default class RefineExplorer extends View {

	render(){
		this.ac("refine-explorer");
		this.$body = div.c("refine-explorer-body");
		this.paint();
	}

	/** Throttled repaint: at most one per 400 ms, so a stream of Whisper chunks stays smooth. */
	draw(){
		if (this.timer) return;
		this.timer = setTimeout(() => { this.timer = 0; this.paint(); }, 400);
	}

	/** The instances that exist now: [class name, count, href]. */
	counts(){
		const s = this.subject;
		return [
			["RefineSystem", 1, "/framework/ext/Refine/md/doc/architecture/"],
			["Prompt", 1 + s.history.length, "/framework/ext/Refine/md/doc/prompt/"],
			["Whisper", 1, "/framework/audio/Whisper/"],
			["WhisperSession", s.whisper.sessions.length, "/framework/audio/Whisper/"],
			["Whisper requests", s.whisper.sessions.reduce((n, x) => n + x.requests.length, 0), "/framework/audio/Whisper/"],
			["Model runs (sessions)", s.prompt.runs.length, "/framework/ai/sessions/"],
		];
	}

	paint(){
		const s = this.subject;
		this.$body.empty(() => {
			div.c("refine-section", () => {
				h4.c("refine-prompt-h", "Instances now");
				this.counts().forEach(([name, n, href]) => div.c("refine-part", () => {
					a(name).href(href).ac("refine-class-key");
					span.c("refine-s-scores", String(n));
				}));
			});
			div.c("refine-section", () => {
				h4.c("refine-prompt-h", "RefineSystem: the boss and the parts it composes");
				RefineSystem.parts.forEach(part => div.c("refine-part", () => {
					a(part.name).href(part.href).ac("refine-class-key");
					span.c("refine-part-job", part.job);
					span.c("refine-s-scores", part.relation);
				}));
			});
			div.c("refine-section refine-section-tree", () => {
				h4.c("refine-prompt-h", "The live system (click to open; properties and logs)");
				new DefaultView({ subject: s, open: 1 });
			});
		});
	}
}
