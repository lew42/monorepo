import { Page, View, div, span, a, md, button, icon } from "/app.js";
import Draggable from "/framework/ext/Draggable/Draggable.js";
import { baseline } from "/imagine/paging/baseline.js";

View.stylesheet(import.meta, "team.css");

/* Container: /imagine/'s column row — this page is a column, not a screen. Size: a
   `small` 14em roster, the person on the default track, the board `large` (28–64em);
   224+224+640+832 of the 1920 row. Own layout: the board is `grid auto` on a 9em
   `--column`, so four lanes fit at 1920 and stack two-by-two at 400. Regions: core's,
   one per column. Preview: the default card.

   THE BOARD FOLLOWS YOU, and the reason is a rule in Page.css: a `default` column
   stands down the moment a real column routes NEXT TO it, and a `default` page that
   is itself routed INTO hides its own subtree (measured: /team/roster/ada/ drew two
   columns, not four). So a board declared beside the people can never be on screen
   with one of them. It is declared UNDER each of them instead — one `board()` factory,
   seven leaf pages, and whichever one is on screen reads `this.topic()`. Selecting a
   person does not filter a board; it opens HER board, which is the same sentence with
   no filter code in it.

   THE CONVERSATION is `is: "topic"` + four methods of my own (core/Page/doc/roles.md).
   The board never imports the person it sits under, the person never imports the rail,
   and the rail never imports the board — all three call `this.topic()` and get here.

   ⚠ `move()` is a CORE method (it re-addresses a subtree); a page's own verbs have to
     dodge the whole Page prototype. This one is `assign_lane()`. */

const PEOPLE = [
	{ name: "ada",   title: "Ada Bramwell", role: "Design engineer", focus: "Column widths",    tz: "GMT",   since: "2019" },
	{ name: "iver",  title: "Iver Holt",    role: "Systems",         focus: "Static deploys",   tz: "CET",   since: "2021" },
	{ name: "nell",  title: "Nell Osei",    role: "Research",        focus: "Navigation trees", tz: "GMT+1", since: "2022" },
	{ name: "rune",  title: "Rune Vasquez", role: "Design engineer", focus: "Theme tokens",     tz: "PST",   since: "2020" },
	{ name: "sable", title: "Sable Kwan",   role: "Writing",         focus: "Docs that point",  tz: "SGT",   since: "2023" },
	{ name: "tomas", title: "Tomas Reyes",  role: "Systems",         focus: "The dev server",   tz: "EST",   since: "2018" },
];

const LANES = [
	{ id: "todo",   title: "Queued" },
	{ id: "doing",  title: "In hand" },
	{ id: "review", title: "Review" },
	{ id: "done",   title: "Landed" },
];

// `lane` is only the STARTING lane — where a task sits is whatever the saved board
// says, so the fixture is the seed and the store is the truth.
const TASKS = [
	{ id: "widths",  title: "Hug and fill words",     who: "ada",   lane: "doing",  size: 3 },
	{ id: "resize",  title: "Draggable column seams", who: "ada",   lane: "todo",   size: 5 },
	{ id: "static",  title: "Drop the build step",    who: "iver",  lane: "review", size: 2 },
	{ id: "cache",   title: "Cache-bust page.js",     who: "iver",  lane: "todo",   size: 2 },
	{ id: "trees",   title: "Map the nav trees",      who: "nell",  lane: "doing",  size: 3 },
	{ id: "recon",   title: "Empty-room recon",       who: "nell",  lane: "done",   size: 1 },
	{ id: "tokens",  title: "One accent, two modes",  who: "rune",  lane: "review", size: 2 },
	{ id: "hover",   title: "Hover fills that read",  who: "rune",  lane: "done",   size: 1 },
	{ id: "readmes", title: "Readmes that point",     who: "sable", lane: "doing",  size: 2 },
	{ id: "columns", title: "Rewrite columns.md",     who: "sable", lane: "todo",   size: 3 },
	{ id: "watcher", title: "Quiet the file watcher", who: "tomas", lane: "doing",  size: 5 },
	{ id: "rpc",     title: "Close the RPC hole",     who: "tomas", lane: "done",   size: 3 },
];

const person = who => PEOPLE.find(one => one.name === who);

// Points, not chips: a lane holding one 5 is fuller than a lane holding two 1s, and
// `size` was on every fixture from the first day without ever being added up.
const points = list => list.reduce((n, task) => n + task.size, 0);

/* THE ONLY GESTURE ON THE PAGE, and it is `ext/Draggable` doing all of it — grab,
   pointer capture, hit-testing past the dragged node, Escape, cleanup. Twenty lines
   here are the two ends nobody else can supply: what a chip looks like mid-flight,
   and what a drop MEANS.

   ⚠ Not `Sortable`. That subclass reorders an Item tree and calls `item.move()`; a
     lane is not an ordered list and a task is a plain fixture object, so the whole
     Item adapter would exist only to be ignored. Draggable is the seam that fits.
   ⚠ Everything commits through `assign_lane()` — the SAME method the person column's
     buttons call. There is one writer, so a drag cannot drift from a click, and the
     board redrawing from the store afterwards is what actually moves the chip.
   ⚠ A redraw orphans these instances, which is harmless: the registry is a WeakMap
     keyed on the element the redraw just dropped (Draggable/readme.md). */
class Chip extends Draggable {

	start(){ this.view.el.style.opacity = 0.9; }

	move(dx, dy, e){
		this.view.el.style.transform = "translate(" + dx + "px, " + dy + "px)";
		this.over(this.under(e));
	}

	/* ⚠ THE ONE LINE THAT MADE THE DROP WORK. `under()` returns the FIRST registered
	   thing beneath the cursor, and every chip on the board is registered too — so
	   dropping onto a lane that already had a card in it handed back that CARD, whose
	   `lane` is undefined, and the move was silently refused. The gesture looked
	   perfect and committed nothing (measured, 2026-08-31: dropped into Landed, board
	   unchanged). The filter says what this drag is actually looking for. */
	under(e){ return super.under(e, found => !!found.lane); }

	// A lane, and not the one this chip is already sitting in.
	drop_check(target){ return target.lane !== this.topic.lanes[this.task.id]; }

	drop(target){ this.restore(); this.topic.assign_lane(this.task.id, target.lane); }

	// Where it would land if you let go — the only feedback a drag really owes you.
	over(lane){
		if (lane === this.marked) return;
		this.marked?.view.rc("imagine-lane-over");
		this.marked = this.drop_check(lane ?? {}) ? lane : null;
		this.marked?.view.ac("imagine-lane-over");
	}

	restore(){
		this.over(null);
		this.view.el.style.opacity = this.view.el.style.transform = "";
	}
}

// How far up the chain a ref actually walked, derived the way `nearest()` finds it —
// so a number on the page cannot disagree with the walk that produced it.
const hops = (from, to) => from.chain().length - from.chain().indexOf(to) - 1;

/* Core's column, minus the rows it draws for a page's children. A person has exactly
   one child — her board — and it is already open to her right, so a nav row for it
   would be a link to the thing you are looking at. Everything else is core's, copied
   because `column()` builds the head, the prose and the rows in one pass and there is
   no seam between them. */
const quiet_column = function(){
	return div.c("page-column-body", () => {
		div.c("page-column-head", () => {
			span.c("page-column-title", this.title);
			a.c("page-column-close", () => icon("close")).href(this.parent.url);
		});

		div.c("page-column-prose flow", () => this.content());
	});
};

/* ONE BOARD, SEVEN PAGES. It renders whatever the topic has selected, so the copy
   under Ada and the copy under the roster are the same twenty lines with no argument
   between them — and `classes: "default"` is what puts it on screen without ever
   putting `/board/` in the address bar. */
const board = () => ({
	title: "Board",
	icon: "dashboard",
	// `fill`, not `large`: the board is always the rightmost open column, so it should
	// take whatever the row has left over — `large` caps at 64em and left 1424px dead
	// at 3440 (critique row 15, /imagine/paging/critique/). Caveat: if a future column
	// ever opens to the board's right, `fill` would compete with it for the leftover
	// instead of yielding — undo this if that column ever exists.
	width: "fill",
	classes: "default",

	/* UX rethink 2026-09-05 — the owner's 3-column card, built for real: this is the
	   one realm on the site where the centre column is a live thing with real numbers
	   beside it (the shape that won on `research` and `generated` and lost on every
	   menu page — /imagine/design/layout/approved/, the first nine reviewers' finding).
	   Left is the intro and the two controls; centre is the drag surface and nothing
	   else; right is every number the page was already computing, given a column of
	   its own instead of a muted line under the fold. `team.css` is the frame; every
	   class inside each region is still imagine.css's shared vocabulary. */
	content(){
		const topic = this.topic();

		div.c("imagine-board-wrap", () => div.c("imagine-board-card", () => {

			// LEFT — intro, the persistence mark, then the two live controls.
			// ⚠ `baseline()` registers its OWN page watcher the first time it runs
			//   (baseline.js `initialize()`) — it must be called exactly once, outside
			//   any `topic.watch()` callback, or every redraw mints a second mark.
			div.c("imagine-board-left flow", () => {
				// THE MISSING SENTENCE. Without this the board opened straight into four
				// unlabelled lanes and a stranger had no way to know it was a kanban
				// board you could drag, or that the roster on the left filters it.
				md("**A kanban board for this team.** Drag a task between the four lanes, or pick a person on the left to see just their work.");

				/* ⚠ THE BOARD REMEMBERS YOU, and until 2026-09-05 it did so with nothing
				     on screen saying so and NO WAY BACK — every lane you dragged was
				     permanent. Green, not amber: a board you are keeping is what this
				     page is for. The rule: /imagine/paging/doc/persistence.md. */
				baseline(topic, {
					what: "your lanes, density and sort",
					restorable: true,
					saved: () => topic.store().read()
						? "**Saved.** Your lane changes, row density and sort are kept in this browser — nobody else sees them."
						: null,
				});

				div.c("imagine-bar flex v gap wrap", $bar => topic.watch(() => $bar.empty(() => {
					const who = topic.selection;

					span.c("imagine-bar-label", who ? person(who).title : "Everyone");
					if (who) a.c("imagine-clear", () => icon("close")).href(topic.url);

					// ONE control instead of a page per density — remembered by url.
					div.c("imagine-seg flex", () => ["comfy", "compact"].forEach(mode => {
						button.c("imagine-seg-btn", mode)
							.ac(topic.density === mode && "imagine-on")
							.click(() => topic.remember({ density: topic.density = mode }));
					}));
				})));
			});

			// CENTRE — the one gesture the page exists for, and nothing beside it to
			// compete for width. `imagine-lanes`' own `--column: 9em` still floors and
			// wraps two-by-two under this card's own container query (team.css).
			// ⚠ The density class is toggled INSIDE the watcher. Set once at build
			//   time it would be right on the first paint and never again — `empty()`
			//   replaces the children of the box, not the class on it.
			div.c("imagine-board-center", $center => topic.watch(() => {
				$center.el.classList.toggle("imagine-tight", topic.density === "compact");

				const who = topic.selection, shown = topic.tasks(who);

				$center.empty(() => {
					div.c("imagine-lanes grid auto gap", () => LANES.forEach(lane => {
						const chips = shown.filter(task => topic.lanes[task.id] === lane.id);

						div.c("imagine-lane flex v", $lane => {
							div.c("imagine-lane-head flex v-center split", () => {
								span(lane.title);
								// Points, then chips: what the lane WEIGHS, then how many
								// things that is. One number was never enough to say either.
								span.c("imagine-count", points(chips) + " pts · " + chips.length);
							});

							/* ⚠ `.drag-items` is not decoration — it is the min-height that
							   makes an EMPTY lane a surface you can drop onto. Without it
							   "Review" is 0px tall and the last chip out of it can never go
							   back (Draggable/readme.md calls this the most common report). */
							div.c("imagine-lane-body drag-items flex v", $body => {
								chips.forEach(task => div.c("imagine-task", $chip => {
									span.c("imagine-task-title", task.title);
									span.c("imagine-task-who", () => {
										span(person(task.who).title.split(" ")[0]);
										span.c("imagine-size", "·" + task.size);
									});

									new Chip({ view: $chip, task, topic });
								}));

								if (!chips.length) span.c("imagine-empty", "—");

								// The lane itself: a drop site and nothing else. `handle: false`
								// — ⚠ `null` would make the whole lane a grip (readme.md).
								new Draggable({ view: $body, handle: false, lane: lane.id });
							});
						});
					})).style("--column", "9em");
				});
			}));

			// RIGHT — every readout the page already computed: how many tasks the
			// filter is showing, what each lane weighs, and this page's own live
			// counters. This used to be a monospace footnote under the fold; it is
			// the thing the owner's brief calls "readouts, metrics, feedback" — its
			// own column, not a line you had to scroll to.
			div.c("imagine-board-right flow", $right => topic.watch(() => $right.empty(() => {
				const who = topic.selection, shown = topic.tasks(who);

				span.c("muted", "Readouts");

				div.c("imagine-readouts", () => {
					div.c("imagine-readout-row flex v-center split", () => {
						span("Tasks shown");
						span.c("imagine-count", shown.length + " of " + TASKS.length);
					});

					LANES.forEach(lane => {
						const chips = shown.filter(task => topic.lanes[task.id] === lane.id);

						div.c("imagine-readout-row flex v-center split", () => {
							span(lane.title);
							span.c("imagine-count", points(chips) + " pts · " + chips.length);
						});
					});
				});

				// Labelled once, honestly: these are the PAGE's own live counters, not a
				// project metric — how many people picked, tasks moved, times the watcher
				// redrew, and how far a ref walked to get here. Left bare they read as
				// noise a stranger cannot place.
				div.c("imagine-tally flex v gap wrap", () => {
					span.c("muted", "This page's own counters —");
					span("people picked: " + topic.picks);
					span("tasks moved: " + topic.moves);
					span("redraws: " + topic.updates);
					span("ref hops: " + hops(this, topic));
				});
			})));
		}));
	},
});

export default new Page({
	meta: import.meta,
	title: "Team",
	// Plain terms: this is the card's own blurb, read BEFORE anyone clicks in — it is
	// where "four columns, one ref, no imports between them" (true, but author-only
	// jargon) used to sit, promising an architecture instead of a page.
	description: "A sample team's kanban board — six people, twelve tasks, four lanes. Drag a task to move it, or click a person to see just theirs.",
	icon: "groups",

	classes: "imagine-team",

	// The one word that makes this page findable from anywhere below it.
	is: "topic",

	selection: null,
	picks: 0,       // people opened
	moves: 0,       // lanes assigned
	updates: 0,     // watcher runs

	/* ⚠ `initialize()` runs inside the constructor, AFTER `naming()` — so `this.url`
	     exists and `this.store()` already has its key. It runs after `declare()` too,
	     which is why nothing in a child may read this state before it renders. */
	initialize(){
		const saved = this.store().get({ lanes: {}, density: "comfy", sort: "name" });

		this.lanes = { ...Object.fromEntries(TASKS.map(task => [task.id, task.lane])), ...saved.lanes };
		this.density = saved.density;
		this.sort = saved.sort;
	},

	// Not core, and it does not want to be — the ref is the framework's job, the
	// conversation is these four lines (core/Page/doc/roles.md).
	watch(fn){ (this.watchers ??= []).push(fn); fn(); },
	bump(){ this.updates++; this.watchers?.forEach(fn => fn()); },

	select(who){ this.selection = who; if (who) this.picks++; this.bump(); },

	// The one real write. Path-based storage: the key is this page's own url.
	assign_lane(id, lane){
		this.lanes[id] = lane;
		this.moves++;
		this.store().patch({ lanes: this.lanes });
		this.bump();
	},

	remember(part){ this.store().patch(part); this.bump(); },

	tasks(who){ return who ? TASKS.filter(task => task.who === who) : TASKS; },
	load(who){ return points(this.tasks(who).filter(task => this.lanes[task.id] !== "done")); },

	/* THE DENOMINATOR the rail never had. "8 pts" is a number with nothing to compare
	   itself to; a bar needs a full mark, and the honest one is not invented — it is
	   the BIGGEST open load on the team right now, so the fullest row is always full
	   and every other row is drawn to scale against a real person's week.
	   ⚠ Never 0: an empty board would divide by it and every bar would be NaN wide. */
	ceiling(){ return Math.max(1, ...PEOPLE.map(one => this.load(one.name))); },

	/* THE ROSTER RAIL, by hand. Core's `column()` gives one flat label per child, which
	   is right for a list of sections and wrong for a roster: these rows carry a role, a
	   live load and a selected mark — and the board child must not appear among them.

	   ⚠ An overridden `column()` must stamp its own width class: `width:` is a field
	     nobody reads until core's `column()` runs, and this replaced it.
	   ⚠ Redrawing the rows drops Router.mark_links()'s marks, so the open row would go
	     dark on the very click that opened it. Ask for the pass back. */
	column(host){
		return div.c("page-column-body page-column-small", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", this.title);
				/* ⚠ This said "1 of 6" while all six rows were still on screen — a
				   count that promised a filter the rail has never done. What it can
				   honestly say is the team's whole open load, which is the one number
				   the six bars below are all fractions of. */
				span.c("imagine-count", $n => this.watch(() =>
					$n.text(this.load() + " pts open")));
			});

			/* The second control that replaces a file per arrangement. Sorting by load
			   reads the SAVED lanes, so this rail reorders itself when an assignment
			   changes two columns to its right. */
			div.c("imagine-seg imagine-seg-rail flex", () => ["name", "load"].forEach(key => {
				button.c("imagine-seg-btn", "by " + key, $b => this.watch(() => {
					$b.el.classList.toggle("imagine-on", this.sort === key);
				})).click(() => this.remember({ sort: this.sort = key }));
			}));

			div.c("imagine-rows", $rows => this.watch(() => {
				const order = this.sort === "load"
					? [...PEOPLE].sort((one, two) => this.load(two.name) - this.load(one.name))
					: PEOPLE;

				const ceiling = this.ceiling();

				$rows.empty(() => order.forEach(one => {
					const load = this.load(one.name);

					a.c("imagine-row").ac(this.selection === one.name && "imagine-row-on")
						.href(this.url + one.name + "/")
						.append(() => {
							span.c("imagine-row-name", one.title);
							span.c("imagine-row-meta", () => {
								span(one.role);
								span.c("imagine-load", load + " pts");
							});

							/* The bar is what makes `by load` worth sorting by: the order
							   alone says who is first, and this says by how much. It is
							   the same number as the text beside it, drawn — never a
							   second source, so the two cannot disagree. */
							span.c("imagine-bar-track", () =>
								span.c("imagine-bar-fill").style("width", Math.round(load / ceiling * 100) + "%"));
						});
				}));

				this.app?.router?.mark_links();
			}));
		});
	},

	// The board first, so arriving at /imagine/team/ opens with everyone's work; then
	// one page per person, each carrying a board of their own.
	children: [
		board(),

		...PEOPLE.map(one => ({
			name: one.name,
			title: one.title,
			description: one.role + " — " + one.focus,

			column: quiet_column,

			content(){
				const topic = this.topic();

				md("**" + one.role + "** · " + one.focus + " · " + one.tz + " · here since " + one.since);

				md("**Assignments.** Move one and the board on the right redraws, and so does the rail on the left if it is sorted by load. It is saved against the roster's **url**, so it is still there after a reload.");

				div.c("imagine-assign flex v gap", $list => topic.watch(() => $list.empty(() => {
					topic.tasks(one.name).forEach(task => {
						div.c("imagine-assign-row flex v-center gap wrap", () => {
							span.c("imagine-assign-title", task.title);

							// ⚠ `wrap`: `.imagine-seg` in imagine.css is `overflow: hidden` at
							// `width: max-content` — right for a 2-button toggle, but here
							// four lane buttons in this narrow assignment column clipped
							// "LANDED" down to "LAND" with no ellipsis and no warning
							// (measured 2026-09-04, 1280×900, person column at its 16em
							// floor). Wrapping to two rows is the smallest fix that stays
							// inside this page; undo it if `.imagine-seg` itself ever
							// learns to wrap.
							div.c("imagine-seg flex wrap", () => LANES.forEach(lane => {
								button.c("imagine-seg-btn", lane.title)
									.ac(topic.lanes[task.id] === lane.id && "imagine-on")
									.click(() => topic.assign_lane(task.id, lane.id));
							}));
						});
					});
				})));

				div.c("imagine-tally flex gap wrap", $t => topic.watch(() => $t.empty(() => {
					span("open load: " + topic.load(one.name) + " pts");
					span.c("muted", "· this page's own counters —");
					span("people picked: " + topic.picks);
					span("tasks moved: " + topic.moves);
					span("redraws: " + topic.updates);
				})));

				md("`this.topic()` walked **" + hops(this, topic) + " hop** up from here, **" + (hops(this, topic) + 1) + "** from the board beside me. Neither file names the other.");
			},

			// The whole cross-column write, one line each way.
			activated(){ this.topic().select(this.name); },
			deactivated(){ if (this.topic().selection === this.name) this.topic().select(null); },

			children: [board()],
		})),
	],
});
