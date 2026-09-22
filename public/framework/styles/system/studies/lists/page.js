import { Page, View, div, span, a, p, h3, h4, md, button, icon, details, summary } from "/app.js";
import Draggable from "/framework/ext/Draggable/Draggable.js";

View.stylesheet(import.meta, "lists.css");

/* Container: a plain page under `styles/system/studies/` (moved from `/imagine/design/`'s
   columns row 2026-09-18, `ai/2026-09-18/imagine-move-2/` — the ordinary page grid applies
   here now, so `wide` and `bleed` both mean something real; this page still asks for
   neither). Every box below
   is a framed thing (a row, a bar, a card), never paint, so it stays inside the column's own
   padding (`layout` skill, "bleed is for paint"). Size: `width: "full"` claims the whole
   host row — the six columns below are 2304px of content (6 × 24rem + gaps), wider than the
   host at every width up to 3440, so `.lists-row` is a horizontal scroller by design; at
   1920 all six are one screen tall and reachable by scrolling sideways, never down. Own
   layout: one flex row of six fixed-24rem columns (`.lists-row`, `overflow-x: auto`); a
   `@container` query (not a viewport media query, so it reads the COLUMN's real width, not
   the raw viewport — the same trap Q1 warns about) flips it to a vertical stack under 40em,
   which is what "at 400 they stack" means: the outer columns host already pages one column
   at a time under 32em (`core/Page/doc/columns.md`), so my own 40em threshold is comfortably
   inside that regime. Regions: none — one `content()`, no children. Preview: the default
   card on /imagine/design/.

   THE ONE DATA SET. `PEOPLE` is copied from `/imagine/team/page.js`, not imported — that
   module's `PEOPLE`/`TASKS`/`LANES` are plain module-scope consts, never exported, and my
   fence says team/ is read-only. `GROUPS` is new: the team fixture has four lanes (a kanban
   status) but no notion of a "team" a person belongs to, so groups are the four values of
   `PEOPLE.role` — the one grouping the existing data already supports, not an invented one
   (task log, 2026-09-18). All six shapes below read the SAME `PEOPLE`/`GROUPS`/`group_of`,
   so "6 members in the data" and "6 rows drawn in shape 1" can never disagree (deliverable's
   own check) — there is exactly one place a person's group lives, `group_of`, mutated only
   by `assign_group()`.

   ⚠ Two levels of press are used everywhere BELOW rows: a row toggles its own state (open,
   selected, expanded); a chevron/handle never doubles as a drag grip on the very same element
   a click listener also owns, because Draggable's `grab()` calls `preventDefault()` on every
   `pointerdown` unconditionally (`ext/Draggable/Draggable.js`) — there is no free "it didn't
   move, so treat it as a click" from the browser once that fires. Shapes 1 and 3 (the drag
   shapes) never ALSO put a press-to-expand on the same element that is the drag handle. */

const PEOPLE = [
	{ name: "ada",   title: "Ada Bramwell", role: "Design engineer", focus: "Column widths",    tz: "GMT",   since: "2019" },
	{ name: "iver",  title: "Iver Holt",    role: "Systems",         focus: "Static deploys",   tz: "CET",   since: "2021" },
	{ name: "nell",  title: "Nell Osei",    role: "Research",        focus: "Navigation trees", tz: "GMT+1", since: "2022" },
	{ name: "rune",  title: "Rune Vasquez", role: "Design engineer", focus: "Theme tokens",     tz: "PST",   since: "2020" },
	{ name: "sable", title: "Sable Kwan",   role: "Writing",         focus: "Docs that point",  tz: "SGT",   since: "2023" },
	{ name: "tomas", title: "Tomas Reyes",  role: "Systems",         focus: "The dev server",   tz: "EST",   since: "2018" },
];

const GROUPS = [
	{ id: "design",   title: "Design engineering" },
	{ id: "systems",  title: "Systems" },
	{ id: "research", title: "Research" },
	{ id: "writing",  title: "Writing" },
];

const ROLE_GROUP = { "Design engineer": "design", "Systems": "systems", "Research": "research", "Writing": "writing" };

// The one writable fact in the whole page: which group a person is in right now. Seeded
// from role, reassigned only through `assign_group()` — a demo, so nothing here is saved.
const group_of = Object.fromEntries(PEOPLE.map(one => [one.name, ROLE_GROUP[one.role]]));

const person = name => PEOPLE.find(one => one.name === name);
const group = id => GROUPS.find(one => one.id === id);
const members_of = id => PEOPLE.filter(one => group_of[one.name] === id);
const px = n => Math.round(n) + "px";

// Read a live width off whatever element is the DEEPEST thing currently on screen in a
// column, and print it into that column's own note line. rAF, not a resize watcher — the
// column's width is a fixed `rem`, so it only changes when the DOM inside it changes shape
// (a press), and every press already calls this again.
// ⚠ The FIRST call happens inside `content()`, before this page's own built subtree has
// been attached to the live document — one `requestAnimationFrame` fires too early and
// reads `isConnected: false` every time, forever (measured: every one of the six "Deepest
// content" lines stuck at "—" on a cold load, no interaction). A later call (any press)
// always worked, because by then the page had settled — which is what hid this for a
// while: the mount delay outlasts a single frame, so the readout retries across frames
// until the element is really there, capped so a genuinely gone target still gives up.
const measure = ($out, $target, tries = 30) => {
	if (!$out) return;
	requestAnimationFrame(() => {
		if ($target?.el?.isConnected) $out.text(px($target.el.getBoundingClientRect().width));
		else if (tries > 0) measure($out, $target, tries - 1);
		else $out.text("—");
	});
};

// The shared two-line row every shape but the launcher's sheet and the drill's detail draws
// the same way: a name at body weight, the role one size down and muted beside it.
const member_line = m => div.c("lists-member-line", () => {
	span.c("lists-member-name", m.title);
	span.c("lists-member-role muted", m.role);
});

// The detail line every "go deeper" shape (4, 5, 6) ends on — the same three facts, never
// re-typed per shape.
const member_detail = m => p.c("lists-member-detail", m.focus + " · " + m.tz + " · here since " + m.since);

/* ════ THE DRAG, shared by shapes 1 and 3 ═══════════════════════════════════════════════
   Copied in shape from `/imagine/team/page.js`'s `Chip` (read-only reuse, not an import —
   team/ is a leaf page, not a module) — grab, hit-test past the dragged row, drop, restore.
   A drop TARGET is `new Draggable({ view, handle: false, group_id })`; `under()` filters
   the hit-test down to those (`found => !!found.group_id`), so it never lands on another
   dragged row. `page` is the Page instance, so `drop()` writes through the one seam,
   `assign_group()`, that both shapes and any future shape would share. */
class MemberChip extends Draggable {
	start(){ this.view.el.style.opacity = "0.85"; }

	move(dx, dy, e){
		this.view.el.style.transform = `translate(${dx}px, ${dy}px)`;
		this.over(this.under(e));
	}

	under(e){ return super.under(e, found => !!found.group_id); }

	drop_check(target){ return !!target && target.group_id !== group_of[this.member.name]; }

	drop(target){ this.restore(); this.page.assign_group(this.member.name, target.group_id); }

	over(target){
		if (target === this.marked) return;
		this.marked?.view.rc("lists-drop-over");
		this.marked = this.drop_check(target) ? target : null;
		this.marked?.view.ac("lists-drop-over");
	}

	restore(){
		this.over(null);
		this.view.el.style.opacity = this.view.el.style.transform = "";
	}
}

/* ════ 1 · ROWS — a plain list, drag only ═══════════════════════════════════════════════
   Title level (`.h4`, the compact label size), one line under each member, a hairline
   between rows, indent per level via padding — and nothing to press. The only gesture is
   picking a row up: every member row is a `MemberChip`, every group title is a drop
   target, so this is the baseline "can hierarchy read from indent, weight and size alone,
   with no box and no toggle at all" shape. */
function rows_shape(page){
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "1"); h4("Rows"); });

		const $body = div.c("lists-col-body lists-rows");
		const $note = p.c("lists-note", () => {
			span("Drag a member row onto another group's title to reassign them — nothing else here presses. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		const redraw = () => $body.empty(() => {
			let deepest = null;

			GROUPS.forEach(g => {
				const members = members_of(g.id);

				const $title = div.c("lists-rows-group", () => { span.c("h4", g.title + " · " + members.length); });
				new Draggable({ view: $title, handle: false, group_id: g.id });

				members.forEach(m => {
					deepest = div.c("lists-rows-member", () => { member_line(m); });
					new MemberChip({ view: deepest, member: m, page });
				});
			});

			measure($px, deepest);
		});

		redraw();
		page.watch(redraw);
	});
}

/* ════ 2 · TITLE BAR — a bar with two real buttons, no drag ════════════════════════════
   Each group is a `.surface` bar: a bigger title (`.h3` — the contrast with Rows' `.h4` IS
   the point, "how big is the title" answered two different ways on the same page), a menu
   button that opens a real sort toggle (name / role — the member rows below actually
   reorder), and a settings button that shows the group's two properties inline: its id and
   its member count. Members list underneath, plain, no press — this shape stops at the
   members level on purpose (its own two presses are both about the GROUP, not the person;
   pairs naturally with 4 or 6 for the person-level "go deeper"). */
function titlebar_shape(page){
	const open_menu = {}, open_props = {}, sort_by = {};
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "2"); h4("Title bar"); });

		const $body = div.c("lists-col-body lists-bar-list");
		const $note = p.c("lists-note", () => {
			span("Press menu to sort a group's members; press settings to show its two properties. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		const redraw = () => $body.empty(() => {
			let deepest = null;

			GROUPS.forEach(g => {
				const key = sort_by[g.id] ?? "name";
				const members = [...members_of(g.id)].sort((a, b) =>
					key === "role" ? a.role.localeCompare(b.role) : a.title.localeCompare(b.title));

				div.c("lists-bar surface", () => {
					div.c("lists-bar-row flex v-center split gap", () => {
						h3.c("lists-bar-title", g.title);
						div.c("flex gap-25", () => {
							button.c("lists-bar-btn").click(() => { open_menu[g.id] = !open_menu[g.id]; redraw(); }).append(() => { icon("sort"); });
							button.c("lists-bar-btn").click(() => { open_props[g.id] = !open_props[g.id]; redraw(); }).append(() => { icon("tune"); });
						});
					});

					if (open_menu[g.id]) div.c("lists-seg flex gap-25", () => ["name", "role"].forEach(k =>
						button.c("lists-seg-btn").ac(key === k && "lists-on").text("by " + k)
							.click(() => { sort_by[g.id] = k; redraw(); })));

					if (open_props[g.id]) p.c("lists-bar-props muted", "Group id: " + g.id + " · Members: " + members.length);
				});

				members.forEach(m => { deepest = div.c("lists-bar-member", () => { member_line(m); }); });
			});

			measure($px, deepest);
		});

		redraw();
		page.watch(redraw);
	});
}

/* ════ 3 · ACCORDION STACK — flush zero-gap, one open, drag onto any header ════════════
   The exact mechanism `ui/accordion` documents: `<details>` sharing one `name`, so the
   browser (not JS) keeps only one open — see `ui/accordion/accordion.js`'s two rules for
   the hairline and the flush stack, re-declared here under this module's own prefix rather
   than imported (ui/ is consumed, never edited, and its CSS is scoped to its own class).
   ⚠ A closed panel has no visible drop surface (the UA hides everything but the summary),
   so the DROP TARGET is the header — always on screen, open or shut — not the panel body;
   otherwise "drag onto a closed group" would have nowhere to land (task log, 2026-09-18). */
function accordion_shape(page){
	let open_id = GROUPS[0].id;
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "3"); h4("Accordion"); });

		const $body = div.c("lists-col-body lists-acc");
		const $note = p.c("lists-note", () => {
			span("Press a header to open it and close the others; drag a member onto any header, open or shut, to reassign them. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		const redraw = () => $body.empty(() => {
			let deepest = null;

			GROUPS.forEach(g => {
				const members = members_of(g.id);
				const is_open = open_id === g.id;

				/* ⚠ Setting `open` on a FRESH `<details name>` (the line right below) fires its
				   own `toggle` event, same-tick, on THIS same element — not only on a real
				   click. Without the `open_id !== g.id` guard, redrawing (which recreates
				   this very element with `open` set again) re-fires it forever: measured
				   7,384 rebuilds in 300ms before this guard existed, one per animation frame
				   budget the loop could steal (task log, 2026-09-18). The guard reads as "only
				   a SWITCH away from the current group is a real toggle" — the programmatic
				   one restating the group that's already open never qualifies. */
				const $item = details.c("lists-acc-item").attr("name", "lists-accordion")
					.on("toggle", e => { if (e.target.open && open_id !== g.id) { open_id = g.id; redraw(); } });
				if (is_open) $item.attr("open", "");

				$item.append(() => {
					const $head = summary.c("lists-acc-head flex v-center split gap", () => {
						span.c("h4", g.title);
						span.c("lists-acc-count muted", members.length + (members.length === 1 ? " member" : " members"));
					});
					new Draggable({ view: $head, handle: false, group_id: g.id });

					div.c("lists-acc-body", () => members.forEach(m => {
						const $row = div.c("lists-acc-member", () => { member_line(m); });
						new MemberChip({ view: $row, member: m, page });
						if (is_open) deepest = $row;
					}));
				});
			});

			measure($px, deepest);
		});

		redraw();
		page.watch(redraw);
	});
}

/* ════ 4 · DRILL-DOWN — the column replaces itself, a crumb to go back ═════════════════
   `view` is a crumb trail (`["groups"]`, `["groups","design"]`, `["groups","design","ada"]`)
   — the whole shape is "redraw the body from the last crumb", so open/back is one function
   either direction. The phone regime the owner named: one column, two presses to a person's
   detail, no drag (drag belongs to the flat shapes, 1 and 3 — a column that is ABOUT to
   throw its own DOM away on the next press is not where a pointer-capture gesture wants to
   live). */
function drilldown_shape(page){
	let view = ["groups"];
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "4"); h4("Drill-down"); });

		const $crumbs = div.c("lists-crumbs flex v-center gap-25");
		const $body = div.c("lists-col-body lists-drill");
		const $note = p.c("lists-note", () => {
			span("Press a group to replace the list with its members; press a member for the detail. A crumb goes back. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		const crumb_label = (id, i) => i === 0 ? "Groups" : i === 1 ? group(id).title : person(id).title;

		const redraw = () => {
			$crumbs.empty(() => view.forEach((id, i) => {
				if (i > 0) span.c("lists-crumb-sep muted", "›");
				const $c = div.c("lists-crumb").text(crumb_label(id, i));
				if (i < view.length - 1) $c.attr("tabindex", "0").attr("role", "button")
					.click(() => { view = view.slice(0, i + 1); redraw(); });
				else $c.ac("lists-crumb-current");
			}));

			$body.empty(() => {
				let deepest = null;

				if (view.length === 1){
					GROUPS.forEach(g => {
						deepest = div.c("lists-drill-row").attr("tabindex", "0").attr("role", "button")
							.click(() => { view = ["groups", g.id]; redraw(); })
							.append(() => { span.c("h4", g.title); span.c("muted", members_of(g.id).length + " members"); });
					});
				} else if (view.length === 2){
					members_of(view[1]).forEach(m => {
						deepest = div.c("lists-drill-row").attr("tabindex", "0").attr("role", "button")
							.click(() => { view = ["groups", view[1], m.name]; redraw(); })
							.append(() => { member_line(m); });
					});
				} else {
					deepest = member_detail(person(view[2]));
				}

				measure($px, deepest);
			});
		};

		redraw();
		page.watch(redraw);
	});
}

/* ════ 5 · INBOX RAIL — a rail that never moves, a view that swaps ═════════════════════
   The shape `core/Page/overview/columns/uses/inbox/` names: a narrow rail of groups on the
   left (always visible, press switches which group is loaded) and the rest of the 24rem
   column as the "full view" — group's members, and pressing one of THOSE swaps the view
   again to their detail, with its own back link. The rail and the view share the column as
   one `flex` row, `7rem` + the rest (`--gap` between) — narrow enough to read a group name,
   generous enough that the view is not the cramped side of the split. */
function inbox_shape(page){
	let selected = GROUPS[0].id;
	let opened = null; // a person's name, once you press into their detail
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "5"); h4("Inbox rail"); });

		// ⚠ `$rail`/`$view` must be built INSIDE `$body`'s own capture callback — a plain
		// `div.c(cls)` with no callback self-appends to whatever captor is ALREADY active
		// (here, `.lists-col`), not to the sibling view just built a line above it. Two
		// shapes below (this one and the launcher) actually nest a box inside a box, so
		// both use the callback form for that reason (code skill §1, the capturing trap —
		// this is its "same tick, still wrong parent" cousin, not the after-`await` one).
		let $rail, $view;
		const $body = div.c("lists-col-body lists-inbox flex gap", () => {
			$rail = div.c("lists-inbox-rail flex v");
			$view = div.c("lists-inbox-view");
		});
		const $note = p.c("lists-note", () => {
			span("Press a group in the rail to load it; press a member in the view for their detail. The rail never moves. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		const redraw_rail = () => $rail.empty(() => GROUPS.forEach(g => {
			div.c("lists-inbox-rail-row").ac(selected === g.id && "lists-inbox-rail-on")
				.attr("tabindex", "0").attr("role", "button")
				.click(() => { selected = g.id; opened = null; redraw_rail(); redraw_view(); })
				.append(() => { span.c("h4", g.title); span.c("muted", members_of(g.id).length); });
		}));

		const redraw_view = () => $view.empty(() => {
			let deepest = null;

			if (opened){
				const $back = div.c("lists-crumb").attr("tabindex", "0").attr("role", "button")
					.text("‹ " + group(selected).title).click(() => { opened = null; redraw_view(); });
				deepest = member_detail(person(opened));
			} else {
				members_of(selected).forEach(m => {
					deepest = div.c("lists-drill-row").attr("tabindex", "0").attr("role", "button")
						.click(() => { opened = m.name; redraw_view(); })
						.append(() => { member_line(m); });
				});
			}

			measure($px, deepest);
		});

		redraw_rail();
		redraw_view();
		page.watch(() => { redraw_rail(); redraw_view(); });
	});
}

/* ════ 6 · LAUNCHER — a sheet slides up, the list underneath never moves ═══════════════
   A flat list identical in shape to Rows (no drag here — the launcher's own gesture is the
   press, not a second gesture competing for the same row) — press a member and a sheet,
   `position: absolute` inside a `position: relative` column body, slides up from the
   column's own bottom edge to cover it. The list underneath is never touched: it is not
   scrolled, not resized, not re-rendered — only a class toggles on the sheet. */
function launcher_shape(page){
	let opened = null;      // a person's name, once a row is pressed
	let deepest_row = null; // the list's own deepest thing, so the readout has a number
	                        // to fall back on the moment the sheet is closed again
	let $px, $list, $sheet;

	const redraw_list = () => $list.empty(() => {
		deepest_row = null;

		GROUPS.forEach(g => {
			const members = members_of(g.id);
			div.c("lists-rows-group", () => { span.c("h4", g.title + " · " + members.length); });

			members.forEach(m => {
				deepest_row = div.c("lists-rows-member").attr("tabindex", "0").attr("role", "button")
					.click(() => { opened = m.name; redraw_sheet(); })
					.append(() => { member_line(m); });
			});
		});

		if (!opened) measure($px, deepest_row);
	});

	const redraw_sheet = () => {
		$sheet.el.classList.toggle("lists-launcher-open", !!opened);
		$sheet.empty(() => {
			if (!opened) return void measure($px, deepest_row);

			const m = person(opened);
			div.c("lists-launcher-head flex v-center split gap", () => {
				h3(m.title);
				button.c("lists-bar-btn").click(() => { opened = null; redraw_sheet(); }).append(() => { icon("close"); });
			});
			const $detail = member_detail(m);
			measure($px, $detail);
		});
	};

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "6"); h4("Launcher"); });

		// Same nesting note as the inbox rail above: `$list` and `$sheet` are built INSIDE
		// this callback so they land as children of `.lists-launcher-host` (which needs
		// `position: relative` for the sheet's `position: absolute` to slide up against),
		// not as its siblings.
		div.c("lists-col-body lists-launcher-host", () => {
			$list = div.c("lists-rows");
			$sheet = div.c("lists-launcher-sheet");
		});

		const $note = p.c("lists-note", () => {
			span("Press a member and a sheet covers the column with their detail; the list beneath does not move. Deepest content: ");
			$px = span.c("lists-note-px", "—");
		});

		redraw_list();
		redraw_sheet();
		page.watch(redraw_list);
	});
}

const NOTES = [
	["Rows",       "Wins: reads fastest, costs nothing but a hairline. Fails: no room for a third fact — every property beyond name + role needs another shape."],
	["Title bar",  "Wins: two real group-level controls (sort, properties) live right where the title is. Fails: a `.surface` bar per group is the heaviest ground on the page, and it never reaches a person's own detail."],
	["Accordion",  "Wins: one open at a time keeps a long roster to one screen's height; the flush stack reads as one list, not six boxes. Fails: a closed group hides its members from a casual scan — you must already know to open it."],
	["Drill-down", "Wins: the phone shape — one column, always full width, two presses to a person. Fails: the crumb is the only way back, and the groups list is gone while you're two levels deep."],
	["Inbox rail", "Wins: the rail never moves, so switching groups costs nothing; a person's detail opens without losing the rail. Fails: an 8rem rail truncates a long group title, and the view pane starts cramped until you count the rail's 7rem out of the 24rem total."],
	["Launcher",   "Wins: the list is genuinely undisturbed — no scroll position lost, no re-render. Fails: the sheet hides the list entirely while it's open, so you can't compare two people without closing and reopening."],
];

export default new Page({
	meta: import.meta,
	title: "Lists",
	description: "Six ways to show the same group → member → detail list — a plain list, a title bar, an accordion, a drill-down, an inbox rail, a launcher — over one shared team fixture, with drag-to-reassign in two of them.",
	icon: "list",
	width: "full",

	watchers: [],

	// One writer, shared by shapes 1 and 3 (and by anything that watches). No `move()` —
	// that is a core Page method; `assign_group()` dodges the whole Page prototype the
	// way `/imagine/team/`'s `assign_lane()` does.
	watch(fn){ this.watchers.push(fn); },
	assign_group(name, group_id){
		if (group_of[name] === group_id) return;
		group_of[name] = group_id;
		this.watchers.forEach(fn => fn());
	},

	content(){
		md("**Six shapes, one question each: how big is the title, is it a bar, is it an accordion, does pressing a row go deeper — replace the column, launch a sheet, or switch to a rail's full view?** Every column below shows the same six people in the same four groups (drag two of them to prove it). Scroll sideways at this width; each column is a fixed 24rem — a phone.");

		/* ⚠ `container-type` lives on THIS wrapper, one level up from `.lists-row` — a
		   container can't restyle itself from inside its own `@container` query (css
		   skill; measured here too: `.lists-row`'s own `flex-direction` rule silently
		   never applied until it moved to a real descendant). `.lists-row` only needs to
		   be a child of the sized box, not the box itself. */
		div.c("lists-row-host", () => div.c("lists-row flex gap", () => {
			rows_shape(this);
			titlebar_shape(this);
			accordion_shape(this);
			drilldown_shape(this);
			inbox_shape(this);
			launcher_shape(this);
		}));

		details.c("lists-notes").append(() => {
			summary("Notes — where each shape wins, where it fails");

			div.c("lists-notes-list flow", () => NOTES.forEach(([title, note]) => p(() => {
				span.c("h4", title + " — ");
				span().backticks(note);
			})));

			md("**For the site's own sidebar** — a deep tree of pages, not a fixed set of four groups — **shape 4, drill-down, is the closer fit.** The sidebar is a phone-width rail in practice (it sits beside the page, not across the whole screen) and a page tree can run far deeper than two levels, which is exactly drill-down's case: replace-and-crumb costs nothing extra at any depth, where accordion (shape 3) only holds two levels before nesting an accordion inside an accordion — the thing `ui/accordion`'s own readme already rules out — and inbox rail (shape 5) is built for a rail that stays put beside a SINGLE open item, not a tree you descend into.");
		});
	},
});
