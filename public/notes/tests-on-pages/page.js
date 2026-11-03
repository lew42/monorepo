import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): the app's main region under /notes/, a plain page grid — /notes/ is a
   root realm, not a columns host. The photo takes `wide`; prose and the small table keep the
   measure, because a two-column table of five rows is narrower than the measure at every one
   of 400 / 1280 / 1920 / 3440. Own layout: `.md` prose flow, nothing else. Two regions
   (crumbs, content), no children. Preview: the photo thumb NotesNote draws.

   The buildable thing here is the version ladder on the right page — the owner writes two
   numbering schemes side by side and picks the second. Two columns of five rows is a table,
   so it is a table. Everything else on the spread is a question, not an interface. */

export default new NotesNote({
	meta: import.meta,
	title: "Tests on pages",
	icon: "rule",
	description: "Define, render, preview — opt in to auto-run.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page opens somewhere else entirely.** Three lines that belong to no system —
\`Organize Event → Sell Tickets…\`, \`Jan 6th, Vax…, Fluoride?\`, \`UI of Truth\` — and then
the architecture question the rest of the spread hangs off:

> **Single socket system for json & sqlite?**

with a sketch: one box labelled **Server**, a smaller box under it split \`json | sql\`, an
arrow out to four boxes labelled **Clients**. Then what that costs:

> for offline, client needs full app logic… ☑ opfs ☑ json ☑ sqlite ☑ **Sync**
>
> However, for now, let's just get something basic working

**The bottom half of the left page is a test API,** sketched in five lines:

- \`test.fn\` **OR** \`test.tests?\` — one function, or a bag of them
- \`new Test({ name, value, args? })\`
- \`test.add\` — \`Class.test = test(Class)\`
- \`test("str", fn)\` — *// async fn…*

**The right page works out when a test renders itself.** That is the whole question:

- \`test(Class)\` with no body → **auto render?**
- *indent shouldn't matter*
- \`test(Class, () => { test("one", …) });\` — a **Class** ⇒ don't auto render… *or even*
  \`test({ render: false }, () => {})\`?
- \`test\` splits two ways: **node / deferred**, and **ui, auto-render? routed?**
- \`.test.js\` → \`export test(…)\` ⇒ **do NOT** auto render *(at root, or /parent, so in the
  test file (?))*
- \`page.js test()\` → **auto render…**

and it closes on the rule the whole page was looking for:

> **tests on pages… auto render?** do we want control over them? More like:
> ☑ define & render & preview? ☑ let user opt in to auto-run?

A margin note beside it: \`test.add(another)\` ↳ *not new… didn't run* (?).`);

		md(`## The version ladder, as the page draws it

The right page compares the ordinary semver climb against a scheme where the leading digit
*means* something. The owner writes the second one out and keeps it.

| normally | now |
| --- | --- |
| \`0.0.0\` | **0** — basic, progression |
| \`0.0.1\` | **1** — core, stable, simple |
| \`0.0.N\` | **2** — features, etc |
| \`0.1.0\` | then **1** opens its own \`0 / 1 / 2\` |
| \`0.1.1\` | |

The left column counts releases. The right column says what a release **is**, and the site
runs on it today: \`v0.0.0\` in the repo readme is the "basic, progression" rung, not a
release number that is behind.`);

		md(`## What it points at

- [ext/Saver](/framework/ext/Saver/) — the \`.save()\` end of the same stack. The socket
  sketch on the left page is asking who owns writing; Saver is the answer this site
  shipped, and the note beside it, [Does \`.save()\` hold up?](/notes/does-save-hold-up/), is
  the next page of the same notebook.
- [The data decision](/imagine/platform/decisions/data/) — "single socket system for json
  & sqlite?" is exactly the call that record makes: git files for curated content, D1 the
  day a stranger writes, one Durable Object per live surface, R2 for media.
- [ext/demo](/framework/ext/demo/) — "define & render & preview" already exists here under
  a different word: a demo's **exhibit** block defines a thing, renders it, and shows it
  beside its own code. What the note adds is the *opt in to auto-run* switch.
- [dev/Socket](/framework/dev/Socket/) — the site's one live socket, which is what the
  server-to-clients sketch turned into: the page listens, the server pushes, nothing polls.
- [ext/DesignTool](/framework/ext/DesignTool/) — the closest thing the site has to a UI test
  runner. **There is no test-tooling page yet**; UI gestures are proved by the \`ui-test\`
  skill driving headless Playwright, which lives in the skill and not on the site.`);

		md(`Nothing on the spread is a screen — it is an API being talked into shape, plus one
numbering scheme. The ladder is the one thing with a shape, so the ladder is what is built.`);
	}
});
