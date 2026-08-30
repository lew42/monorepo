import { Page, div, span, a, icon, md, p } from "/app.js";

/* Container: the app's page region — a columns host stretches to fill it. Size: this
   column is the default track (16–40em; it holds the map); the two rails are `small`;
   the reader is `full`. Own layout: core's row, plus ONE tab set inside one column.
   Regions: one per column (core's `$pages`), plus the tab panel `tabs()` builds.
   Preview: the default card.

   THE ONE OVERRIDE in the whole file is `column_host(){ return null; }` on a tab
   section — "I am content in a panel, not a track in the row". Without it `render()`
   finds the columnar ancestor and draws the section as a column BODY inside the panel:
   its own sticky head, its own `×`, a 16em floor inside a column that may be 14em. */

/* A SECTION of a chapter. Three seams, no new API:
   `tabs()` fills `regions`, which core's `container()` reads before anything else,
   so the section mounts in the panel; disowning the column host makes it render as
   an ordinary page instead of a column body; and the title is the TAB's, so the
   page must not draw an `h1` of its own — `label` is what the bar reads. */
const section = (label, content) => ({ label, title: "", content, column_host(){ return null; } });

/* A CHAPTER: the standard column, minus the row per child. Its children are tabs
   INSIDE its prose, so core's list under the panel is the same three links twice.
   `column()` is the one method that decides what a column body holds — a page whose
   children are not places overrides it, and this is the whole override. */
const chapter = config => ({
	...config,

	column(host){
		return div.c("page-column-body", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", this.title);
				a.c("page-column-close", () => icon("close")).href(this.parent.url);
			});

			div.c("page-column-prose flow", () => this.content());
		});
	},
});

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "Five levels of documentation — a rail, a chapter with in-place tabs, a member list, one full-width reader.",
	icon: "menu_book",

	initialize(){ this.columns(); },

	content(){
		md("**Rivet** — an example documentation site, five levels deep. Every level navigates *differently*, and each choice is one sentence:");

		md("1. **This column — the map.** Two areas, always on screen: nobody has to remember which half of a site they are in.\n2. **Guide — a `small` rail.** Chapters are few and ordered; a 14em list keeps the order visible while you read one.\n3. **A chapter — `tabs()`, in place.** Overview / Recipes / Pitfalls are three faces of ONE page, so they swap where they stand. A column each would push the row four deep for one screen of reading.\n4. **API — a `small` rail again.** A member list is *scanned*, not read, and it is long.\n5. **A member's source — `width: \"full\"`.** Code wants the whole host; the four columns left of it collapse into the trail above the row.");

		md("The trail is core's: a columns host draws `crumbs()` over the row and refreshes it from `activate()` **and** `deactivate()`, so it cannot lag. A tab is not a step in it — the trail stops at the chapter, because a section is a face of that page rather than a place.");

		md("**Verdict on the mix:** `columns()` + `width:` + `tabs()` carries five levels, and the two overrides it needs are both about the SAME seam — a tab child is not a column and a tab set's children are not rows. Everything else is the blessed page literal.");
	},

	children: {
		Guide: {
			icon: "description",
			width: "small",
			content(){ md("Read in order. The rail stays."); },

			children: {
				Install: chapter({
					content(){
						md("Rivet is one file and no dependencies: `npx rivet init` writes `rivet.js` beside your `package.json`.");
						md("The rest of this chapter is **one page with three faces** — click the tabs. The row does not grow.");
						return this.tabs().ac("bleed");
					},

					children: {
						Overview: section("Overview", () => {
							p("A task is a function with a name. Rivet runs the ones you ask for and the ones they depend on — once each, in dependency order.");
						}),
						Recipes: section("Recipes", () => {
							md("Watch a directory and rerun a task on change:\n\n```js\nrivet.watch(\"src\", \"build\");\n```");
						}),
						Pitfalls: section("Pitfalls", () => {
							p("A task that returns a promise is awaited; one that returns a stream is not. Return the promise.");
						}),
					},
				}),

				Tasks: {
					content(){ md("A task is `name`, `needs` and a body. There is no third concept."); },
				},

				Watching: {
					content(){ md("The watcher debounces to one run per 40ms and never overlaps two runs of the same task."); },
				},
			},
		},

		API: {
			icon: "code",
			width: "small",
			content(){ md("Two entries. Pick one, then a member."); },

			children: {
				Runner: {
					content(){ md("`new Runner(tasks)` — holds the task table and the run log. Pick a member; its source opens full width."); },

					children: {
						run: {
							title: "run(name)",
							content(){
								md("Runs `name` and everything it needs, once each, and resolves when the last one settles. Throws the first rejection.");
								md("Its source is one column further right — and that page claims the whole screen.");
							},

							children: {
								Source: {
									width: "full",
									content(){
										md("`width: \"full\"` — the four columns left of this one stood down. **The strip above the row is how they come back**, and it is `crumbs()`: core derives it from `chain()`, so it cannot disagree with where you are.");
										md("```js\nasync run(name){\n\tconst task = this.tasks.get(name);\n\tif (!task) throw new Error(\"no task \" + name);\n\tif (this.ran.has(name)) return this.ran.get(name);\n\n\tconst done = Promise.all((task.needs ?? []).map(need => this.run(need)))\n\t\t.then(() => task.body(this));\n\n\tthis.ran.set(name, done);\n\treturn done;\n}\n```");
										md("**Why `full` and not `large`:** `large` caps at 64em, which is right for a table and wrong for code read line by line beside nothing. A page claims `full` when it wants the screen — and gives it back the moment you navigate anywhere else.");
									},
								},
							},
						},

						watch: {
							title: "watch(dir, name)",
							content(){ md("Reruns `name` whenever anything under `dir` changes. Returns a stop function."); },
						},
					},
				},

				Task: {
					content(){ md("`{ name, needs, body }` — a plain object. There is no class."); },
				},
			},
		},
	},
});
