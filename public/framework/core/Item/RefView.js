import View, { a, span, icon } from "../View/View.js";
import Ref from "./Ref.js";

View.stylesheet(import.meta, "RefView.css");

/* One Ref drawn as a row: its target's state, then "where › what" (the other file's root, then the item), live. It resolves the
   Ref on its first draw, redraws when the target or its file changes, and a Ref that finds nothing draws a "gone" row naming
   the path it looked for. `new RefView({ref})`, or `ref.view` (Item's view getter hands it `item`). Doc: readme.md, "Ref". */
export default class RefView extends View {
	// The target's state as an icon (a Task's stages; anything else has none). Kept here so core/Item imports nothing from core/Task.
	static STAGE = { idle: "check_box_outline_blank", waiting: "hourglass_empty", running: "play_circle", paused: "pause_circle", stopped: "stop_circle", complete: "check_box", loading: "hourglass_top", missing: "error_outline" };

	initialize(){
		this.ref ??= this.item;
		this.ac("ref-view");
		this.attr("data-ref", (this.ref.url ?? "") + "#" + (this.ref.path ?? ""));   // which Ref this row draws, for a test or a reader
		this.redraw = () => {
			if (this.drawn && !this.el.isConnected){ this.ref.off("target", this.redraw); return; }   // taken off the page: stop listening
			this.drawn = true;
			this.empty(() => this.row());
		};
		this.ref.on("target", this.redraw);
		this.redraw();
		if (this.ref.target === undefined) this.ref.resolve().catch(err => { this.ref._why = String(err?.message ?? err); this.ref.found(null, null); });
	}

	title_of(x){ return x?.get_one?.("title") ?? x?.id ?? ""; }

	row(){
		const r = this.ref, t = r.target, root = r._root_of_target;
		this.el.classList.toggle("is-gone", t === null);
		if (t === undefined) return void span.c("ref-view-wait muted", "… " + (r.path || r.url));
		if (t === null){
			icon("link_off").ac("ref-view-state");
			span.c("ref-view-gone", `gone: ${r.why ?? r.path}`);
			return;
		}
		icon(RefView.STAGE[t.state] ?? "subdirectory_arrow_right").ac("ref-view-state", "is-" + (t.state ?? "item")).attr("title", t.state ?? "");
		if (r.url && root && root !== t){
			a.c("ref-view-where", this.title_of(root)).href(r.url);
			span.c("ref-view-sep", "›");
		}
		const href = t.get_one?.("path");
		(href ? a.c("ref-view-title", this.title_of(t)).href(href) : span.c("ref-view-title", this.title_of(t)));
	}
}

Ref.View = RefView;
