import { Page, View, div, span, a, p, h3, h4, md, button, icon, details, summary } from "/app.js";
import Draggable from "/framework/ext/Draggable/Draggable.js";

// history and reasons: doc/page-notes.md

View.stylesheet(import.meta, "lists.css");

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

const group_of = Object.fromEntries(PEOPLE.map(one => [one.name, ROLE_GROUP[one.role]]));

const person = name => PEOPLE.find(one => one.name === name);
const group = id => GROUPS.find(one => one.id === id);
const members_of = id => PEOPLE.filter(one => group_of[one.name] === id);
const px = n => Math.round(n) + "px";

// see doc/page-notes.md · measure()
const measure = ($out, $target, tries = 30) => {
	if (!$out) return;
	requestAnimationFrame(() => {
		if ($target?.el?.isConnected) $out.text(px($target.el.getBoundingClientRect().width));
		else if (tries > 0) measure($out, $target, tries - 1);
		else $out.text("—");
	});
};

const member_line = m => div.c("lists-member-line", () => {
	span.c("lists-member-name", m.title);
	span.c("lists-member-role muted", m.role);
});

const member_detail = m => p.c("lists-member-detail", m.focus + " · " + m.tz + " · here since " + m.since);

// see doc/page-notes.md · MemberChip drag mechanics
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

// see doc/page-notes.md · Shape 1: Rows
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

// see doc/page-notes.md · Shape 2: Title bar
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

// see doc/page-notes.md · Shape 3: Accordion stack
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

				// see doc/page-notes.md · toggle event bug
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

// see doc/page-notes.md · Shape 4: Drill-down
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

// see doc/page-notes.md · Shape 5: Inbox rail
function inbox_shape(page){
	let selected = GROUPS[0].id;
	let opened = null; // a person's name, once you press into their detail
	let $px;

	return div.c("lists-col surface pad flex v", () => {
		div.c("lists-col-head flex v-center gap", () => { span.c("lists-col-num", "5"); h4("Inbox rail"); });

		// see doc/page-notes.md · DOM nesting trap
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

// see doc/page-notes.md · Shape 6: Launcher
function launcher_shape(page){
	let opened = null;
	let deepest_row = null;
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

		// see doc/page-notes.md · DOM nesting trap
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

		// see doc/page-notes.md · container-type
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
