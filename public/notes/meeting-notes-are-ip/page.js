import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the matrix take `wide`;
   prose keeps the measure. Two regions, no children.

   The note lists three properties a piece of protected data has. Three properties is a
   matrix, so the built thing is that matrix — each property against what it permits and
   what it forbids, which is the only way to see that "accessible by many" and "can't be
   shared" are not a contradiction. */

const PROTECTED = [
	["Accessible by many", "read-only", "Many people may read it.",
		"Nobody may change it. Read is the only verb granted."],
	["Revokable access", "per person", "Access is granted to a named person.",
		"That grant can be taken back later — so it is a lookup, never a copy."],
	["Limited access", "not shareable", "The person who has it may use it.",
		"They may not pass it on. Sharing is not one of the things access buys."],
];

function access_matrix(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Protected data — the three properties");

		div.c("grid gap").style("gridTemplateColumns", "minmax(8em, 12em) 1fr 1fr").append(() => {
			["Property", "May", "May not"].forEach(h =>
				span().style({ fontWeight: "700", fontSize: "0.9em" }).text(h));

			PROTECTED.forEach(([name, tag, may, mayNot]) => {
				div.c("flex v").append(() => {
					span().style("fontWeight", "700").text(name);
					span.c("muted").style("fontSize", "0.8em").text(tag);
				});
				span.c("muted").style("fontSize", "0.9em").text(may);
				span.c("muted").style("fontSize", "0.9em").text(mayNot);
			});
		});

		span.c("muted").text("Read by many, revokable, and never onward — the three together "
			+ "are what makes a meeting note property rather than a document.");
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Meeting notes are IP",
	icon: "policy",
	description: "Read by many, revokable, and never shareable onward.",

	content(){
		this.crumbs();
		this.shot("Third parties' names are reduced to initials on this page. "
			+ "Open the photo for the full scan.");

		md(`## What the page says

**Left page — the idea.**

> **Meeting Notes = Intellectual Property**
> = ~~Protected~~ **Data**
> ☑ Accessible by many (read-only)
> ☑ Re-vokable access
> ☑ Limited access (can't be **shared**)

Then: **Attorney-Client Record?** — *"We've had the ability to record for a while…
**mandatory** — could you make attorney-client interactions **RECORD**? ⇒ Then the client
shouldn't say anything."*

**Suno Voices → partial generation?**

And an advertising plan: *2–4 wks for ads? design?* → **Landing Page** · **Instant Form?**
· **Video?**, against the channels **Meta: FB + IG** · **LI** · **G** · **X?**

**Right page — a business meeting.** Names are reduced to initials here; the substance is
kept. Written across a page dated the same week:

- **C. C.** — *Texas laser* · **Regulation? HIPAA? Medical licensing?** · **Competition?**
- **Shopify + Ads?** ☐ Inventory? ☐ Articles ☐ SEO ☐ Social — with marketplaces named as
  the competition
- Background: *aesthetic med device, 20 yrs, sales · brokerage, MedSpas* · ☑ kids in
  Chicago ☑ could work remotely
- The economics, as scribbled: a **CoolSculpting** machine is *100k–150k new*, a treatment
  cycle is about *$150* (cost 20–30¢); *buying old machines w/ usage cycles*; a site
  selling *1,000 @ ~$5*; *last month 500 cycles*; *buy at 4.5 or less, sell for 21,000* (?)
- **L.** — 20–30 h/wk → business development · a second contact reduced to **milk&honey**
- **Advantage cards? surplus** · the audience: **MedSpa owners & managers + CoolSculpting**

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-007.jpg](/notes/inbox/2026-09-06-007.jpg).`);

		md(`## What it points at

- [Security research](/imagine/platform/research/security/) — the dug verdict on what the
  platform must protect and how, which is where "revokable" and "not shareable" stop being
  adjectives and become code.
- [Where state lives](/imagine/platform/decisions/data/) — the record that says git files
  for curated content, D1 the day a stranger writes, one Durable Object per live surface.
  A meeting note that is IP is exactly the case that decision is for.
- [Who a user is](/imagine/platform/decisions/identity/) — "accessible by many" needs a
  *many*, and authorization here is one \`can(user, action, url)\` the router calls.
- [Notes · Auth, accounts and teams](/notes/auth/) — the long design record behind that,
  written before any of it was built.`);

		md("## The three properties");

		access_matrix();

		md(`The business half of the spread is a record of a conversation, not a product —
there is nothing to build from it, and it gets no widget.`);
	}
});
