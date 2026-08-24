import View, { div, span, h2, h4, p, button, progress, icon } from "../../core/View/View.js";

/* `.ui-crumbs a { text-decoration: none }` — the only CSS lesson() needs, and it
 * already exists in ui/. A ux imports ui/ templates; ui/ never imports ux/. */
import "../../ui/crumbs/crumbs.js";

/**
 * Course — chapters of lessons: a rail (left), a reading column (centre,
 * `.measure` capped) and a next-up card (right, where the row has room).
 * Extends View directly, not Wizard — doc/decisions.md has the prototype and
 * the evidence: Wizard's render()/update() inline four regions with no
 * per-region seam, so a third region and chapter-grouped nav would fork both
 * methods wholesale rather than override one seam each.
 *
 *   new Course({
 *       chapters: [
 *           { title: "Chapter", lessons: [
 *               { title: "Lesson", content(course){ return md("…"); } },
 *           ]},
 *       ],
 *   });
 *
 * State — `current` (the lesson) and `completed` (a Set of lessons) — lives on
 * the instance only, no persistence. A caller that wants it back after a
 * reload reads/writes those two through go()/complete() and composes a
 * `Saver` (ext/) around THAT — Course never imports it.
 *
 * Every region is a method a subclass overrides alone: rail(), lesson_button(),
 * lesson(), progress(), next_up(). update() is the one seam that reruns all
 * four when state changes — go(), next(), back(), complete() all call through it.
 */
export class Course extends View {

	// Own-root, like Wizard: builds directly onto `this`, no wrapper div, so a
	// caller's own words (`ui-contrast ui-compact`) land on the real root.
	render(){
		this.lessons = this.chapters.flatMap(chapter => chapter.lessons.map(lesson => ({ ...lesson, chapter })));
		this.current ??= this.lessons[0];
		this.completed ??= new Set();

		this.ac("flex v gap");

		this.$progress = div.c("flex v gap");

		div.c("flex wrap gap", () => {
			this.$rail = div.c("rail surface pad");

			// `flex-1`'s own basis is 0%, which shares a narrow row down to a
			// sliver beside `.basis`'s non-shrinking 18em rather than wrapping —
			// a floor forces the wrap instead, the same trade `.flex.auto`'s
			// per-child `--column` makes, spelled inline because the two
			// siblings here are asymmetric (one fixed, one fluid), not a tiled row.
			// No `.start` here (unlike Wizard's `$body`): between a rail and a
			// third region, "centred" is what keeps the reading column from
			// hugging the rail and leaving the next-up card stranded across a
			// dead gap at 3440 — `.measure`'s own `margin-inline: auto` inside
			// this flex-1 wrapper is the whole mechanism, no CSS of mine.
			div.c("flex-1 flex v gap").style("flex", "1 1 16em").append(() => {
				this.$lesson = div.c("measure flex v gap");
			});

			// `.basis` (framework.css): a fixed track beside a fluid one, `--column`
			// by default — set inline because 18em is a runtime token, not a new class.
			this.$side = div.c("basis surface pad flex v gap").style("--basis", "18em");
		});

		this.update();
	}

	// ---- the seams: every state change is one of these four ---------------

	go(lesson){
		this.current = lesson;
		return this.update();
	}

	next(){
		const i = this.lessons.indexOf(this.current);
		return i < this.lessons.length - 1 ? this.go(this.lessons[i + 1]) : this;
	}

	back(){
		const i = this.lessons.indexOf(this.current);
		return i > 0 ? this.go(this.lessons[i - 1]) : this;
	}

	complete(lesson = this.current){
		this.completed.add(lesson);
		return this.update();
	}

	// Every region throws its old content away and rebuilds — same trade Wizard
	// makes (draw() in Tree does too): the caller owns the data, diffing three
	// regions to preserve DOM nodes is real complexity nothing here has asked for.
	update(){
		this.$progress.empty(() => this.progress());
		this.$rail.empty(() => this.rail());
		this.$lesson.empty(() => this.lesson());
		this.$side.empty(() => this.next_up());
		return this;
	}

	// ---- the pieces composed — each exposed so a subclass overrides ONE ----

	// The progress builder: `ui/progress` is the bare element (Wizard's own
	// comment — there is no ui.progress(), the element already does this).
	progress(){
		const done = this.completed.size, total = this.lessons.length;
		div.c("h4 muted", `${done} of ${total} lessons complete`);
		return progress().attr("max", total).attr("value", done).style("width", "100%");
	}

	// The rail builder: a plain list, not ui/tree — a 2-chapter x 3-lesson
	// course wants every lesson visible always, and Tree's collapse/expand
	// machinery buys nothing when nothing collapses. doc/decisions.md.
	// ⚠ Groups `this.lessons` (the flattened copies, each carrying `.chapter`)
	// — NOT `this.chapters[i].lessons` (the original objects). go() hands a
	// row's lesson straight to `this.current`, so it has to be the copy with
	// a `.chapter` on it, or lesson()'s `lesson.chapter.title` throws.
	rail(){
		let chapter;
		this.lessons.forEach(lesson => {
			if (lesson.chapter !== chapter) h4.c("muted", (chapter = lesson.chapter).title);
			this.lesson_button(lesson);
		});
	}

	// Free navigation — click any lesson, like Tree — the opposite of Wizard's
	// step_button(), which disables everything past the current index.
	lesson_button(lesson){
		const $b = button.c("flex gap v-center", () => {
			icon(this.completed.has(lesson) ? "check_circle" : "radio_button_unchecked");
			span(lesson.title);
		}).click(() => this.go(lesson));

		if (lesson === this.current) $b.ac("prim").attr("aria-current", "true");
		return $b;
	}

	// The lesson builder: crumbs (ui/crumbs — the only markup that template
	// ships), the title, the caller's content function, then Back/Next and the
	// one gate this class has: a manual "mark complete", never a validate().
	lesson(){
		const lesson = this.current;
		const i = this.lessons.indexOf(lesson);

		div.c("ui-crumbs flex v-center gap h4").style("--gap", "0.4em").append(() => {
			span.c("muted", lesson.chapter.title);
			span.c("muted", "/");
			span(lesson.title);
		});

		h2(lesson.title);

		lesson.content.call(this, this);

		div.c("flex gap wrap split", () => {
			const $back = button("Back").click(() => this.back());
			if (i === 0) $back.attr("disabled", "");

			div.c("flex gap").style("--gap", "0.5em").append(() => {
				const done = this.completed.has(lesson);
				const $mark = button(done ? "Completed" : "Mark complete").click(() => this.complete());
				if (done) $mark.attr("disabled", ""); else $mark.ac("prim");

				const $next = button("Next").click(() => this.next());
				if (i === this.lessons.length - 1) $next.attr("disabled", "");
			});
		});
	}

	// The third region: a next-up preview, not the lesson's own mini-TOC — this
	// content is a screen long, so a TOC of its own headings is usually one
	// entry. "What's next" always has something to say. doc/decisions.md.
	next_up(){
		div.c("h4 muted", "Next up");

		const i = this.lessons.indexOf(this.current);
		const upcoming = this.lessons[i + 1];

		if (!upcoming) return p.c("muted", "That was the last lesson.");

		div.c("flex v gap").style("--gap", "0.3em").append(() => {
			span.c("muted", upcoming.chapter.title);
			h4(upcoming.title);
			button("Continue").click(() => this.go(upcoming));
		});
	}
}

export default Course;
