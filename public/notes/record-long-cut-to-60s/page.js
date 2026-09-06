import { md, div, span, label, input } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and both built things take
   `wide`; prose keeps the measure. Two regions, no children.

   Two buildable bits: the daily-update list is a checklist, and the beat sections
   (A · AB · BA · BC) are a strip you can read left to right. Both are tiny, so both
   are here rather than one being described. Nothing persists — tick it, reload, gone. */

const DAILY = ["progress", "something personal (about me)", "something useful",
	"funny? enjoyable", "new song?"];

const SECTIONS = ["A", "AB", "BA", "BC"];

function daily_checklist(){
	return div.c("surface pad flex v gap wide", () => {
		span().style("fontWeight", "700").text("Every day — record the same basic message");
		DAILY.forEach(item => label.c("flex gap v-center", () => {
			input().attr("type", "checkbox");
			span(item);
		}));
		span.c("muted").text("Five beats, the same five every day. Nothing here is saved — "
			+ "a reload is the note's own list again.");
	});
}

function section_strip(){
	return div.c("surface pad flex v gap wide", () => {
		span().style("fontWeight", "700").text("Use Suno to create beat parts");
		div.c("flex gap wrap", () => SECTIONS.forEach(name => {
			div.c("pad flex v-center h-center").style({ border: "1px solid var(--line)",
				borderRadius: "var(--radius)", minWidth: "4.5em", fontWeight: "700" }).text(name);
		}));
		span.c("muted").text("Four boxes on the page: a section, then the three pairings of "
			+ "it. AB is A running into B — which is the note's own answer to a seam.");
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Record long, cut to 60s",
	label: "Cut to 60s",
	icon: "movie_edit",
	description: "Record the long version, cut the garbage, then cut it to a minute.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — the pipeline.** In the margin: *Products? Suno? Events?*

- **Intro / Outro → Mobile?**
- **Record, light edit, upload, right from the app?** → *One app…? Does it save to the
  phone? → reupload?*
- **Riverside? Discord? Zoom? Meet?** and, underlined, **Email List?** → *makes it real?*
- **Video Ask:** ① Ad → Click → VideoAsk → ? → *follow up VA? → email? SMS?*
- **Boom, Clap** — 1. kick 2. snare 3. kick 4. snare
- **Use Suno to create beat parts** — four boxes: **A**, then **AB**, **BA**, **BC**
- **How to make epic content?** → inspire → purpose → $value$
- **Brand & on-brand content**
- A sketch: \`XY\` → \`XY | XY\` labelled *reverse?*, then \`XY ? XY\` — **can you heal a seam?**
- **CHASING SUCCESS / TRIAL & FAILURE** — ☑ fail ☑ try ☑ fail ☐ ?

**Right page — the edit.**

> **COMPLEXITY = difficult, lengthy, slow**

*~~? week~~ **Every day** — record the same basic message:* **daily update** — ☑ progress
☑ something personal (about me) ☑ something useful ☑ funny? enjoyable ☑ new song?

A storyboard beside it: three frames — a photo, a title, an X — labelled *logo + outro?*,
*photos*, ☑ *Text*, with *&lt;emotion&gt;* underneath (*loud? soft? none?*), *story?* and
☑ *Narration? ← better voice*.

**How do I edit to song?** ① *How long? If **long** (> 1 min), it's much different.*

- ☑ Record the long version
- ☑ Cut out the garbage **= long cut**
- ☑ Cut it down to **1 min**…

> **Keep it < 60s = way better for everything**

And in the right margin: *"The question is, how do you weave? Say things, take an
interlude to let it sink in."* Then: **1 email list** — ☑ badass ☑ skills ☑ anyone.
**Opt-ins? Generate a fingerprint?**`);

		md(`## What it points at

- [Video research](/imagine/platform/research/video/) — the dug verdict on video for the
  platform: what it costs, what it needs, and what it does not.
- [Feeds · video](/imagine/feeds/video/) — how video renders on this site today.
- [Who a user is](/imagine/platform/decisions/identity/) — "opt-ins? generate a
  fingerprint?" is this decision's question, and it is already answered: one \`users\` row
  and a stateless cookie, no vendor and no fingerprint.
- Companions in this notebook: [Shotgun or lav](/notes/shotgun-or-lav/) is the rig,
  [Anchor point, optional](/notes/anchor-point-optional/) has the view counts that
  started this, and [One video, everywhere](/notes/one-video-everywhere/) is where the
  finished cut goes.`);

		md("## The daily list, live");

		daily_checklist();

		md("## The beat sections");

		section_strip();

		md(`Everything else on the spread is a decision to make, not an interface — which
tool to record in, whether an email list makes it real, how long is too long. Those get
links, not widgets.`);
	}
});
