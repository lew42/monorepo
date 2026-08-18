# ext/editor

A drag-and-drop page builder on the wave-1 stack (`Item`, `Sortable`, `ext/layout`,
`Saver`, `ext/Panel`) — well-built, well-recorded, and it earns its place as a
proof that the stack composes. It does **not** earn its place as a *module*: zero
lines of code anywhere else in the framework import anything it exports. It is a
page, filed under `ext/` as if it were reusable infrastructure. The single most
important thing to do to it is the split its own readme has called for since the
day it shipped — pull the widget out as `Editor.js` so the module finally has a
door — because that is also what fixes its 318-line file, its missing rename, and
its "no callers" problem all in one move.

## State

| | |
|---|---|
| files | 4 source (`History.js`, `blocks.js`, `editor.css`, `page.js`) + `readme.md` |
| lines of JS / CSS | ~445 / 42 (`page.js` 318, `History.js` 47, `blocks.js` 38) |
| callers | **0.** Nothing outside the directory imports `History`, `Block`/`Section`/`Grid`/`Card`/`Text`, or `BLOCKS`; `editor()` in `page.js` isn't exported. The only integration is `framework/ext/page.js`'s `children: "… editor …"`, which makes it a route. (One grep near-miss: `ai/2026-08-12/apps/page.js` imports an unrelated same-named `editor` from its own sandbox — not this module.) |
| docs before | `readme.md` present and unusually good (design record, traps, verdicts, open items) but 3 screens, not 1 — see below. `page.js` was a plain `Page`, not a `Doc`: zero `doc/*.md` files, no Files/API/Docs tabs, no browsable member list. `classdoc` not referenced anywhere (nothing to fix there). |
| docs after | `page.js` → `Doc` (`subject: History`, 8 methods, 2 properties, `notes: "shell"`, `files:` all 4 source files). 8 `doc/method/*.md`, 2 `doc/property/*.md`, 4 `doc/file/*.md`, 1 `doc/shell.md` (breakout), `readme.md` trimmed to one screen with a new "Who uses it" section and the shell deep-dive moved out. |

## What I changed

- `page.js`: `import { Page, … }` → `import { Doc, … }`; `new Page({…})` →
  `new Doc({…})` with `subject: History`, `properties: "past future"`,
  `methods: "act undo redo step can_undo can_redo read restore"`,
  `notes: "shell"`, `files: "blocks.js History.js editor.css page.js"`. The
  `content()` body, `preview()`, and every helper function are byte-identical —
  this was a wrapper change, not a behavior change. Verified: `node --check`
  clean, `curl` on `/framework/ext/editor/` and `/framework/ext/editor/page.js`
  both 200.
- `readme.md`: rewrote to one screen. Kept the intro + data-flow diagram, Traps,
  and a trimmed Decisions/Open (with the "swap saves", "block is data", "drag
  through act" verdicts intact — they're each already one paragraph, exactly
  what that section is for). Moved the four-subsection "shell is a panel
  workspace" deep-dive to `doc/shell.md`, summarized in one paragraph, linked,
  and added to `notes:`. Added the "Who uses it" section (Step 2's finding,
  written up).
- Wrote all 15 new `doc/**` files: 8 method, 2 property, 4 file, 1 note.

## Recommendations

1. **`ext/editor` should not be a module at all — it should be a page,
   promoted out of `ext/`.** *Claim:* everything under `ext/` is documented as
   opt-in, composable infrastructure other pages construct (`panel()`, `demo()`,
   `md()`); this is the one `ext/` with literally zero callers, because it is
   the only one that is not infrastructure — it is an application. *Cost:*
   none to assess, real work to fix — see the 2026-08-14 review's already-scoped
   plan below. **simple to state, important**
2. **Split `page.js` into `Editor.js` (the class) + a thin `page.js`.** *Claim:*
   this single move fixes three separate findings at once — the 318-line file
   (3× the house guideline), the "no importable door" gap (nothing outside the
   directory can construct or embed an editor), and is the prerequisite for the
   `ext/editor` → `ext/Editor` rename the 2026-08-14 review already ruled for.
   The closure is already shaped like a class (11 methods, 7 fields, currently
   `let`) — this is a transcription, not a redesign. *Cost:* touches 4 files
   outside this directory (`ext/page.js`, `ext/Panel/page.js`'s one link label,
   `ext/DesignTool/audit/pages.js`, `core/Item/readme.md`) plus the Windows
   two-step directory rename trap already documented. **medium, important — already
   proposed and scoped in [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/),
   waiting on "propose, wait"**
3. **Fix "opening the page writes the document."** *Claim:* `editor()` ends
   with `changed()`, called only so the status badge has something to read;
   visiting `/framework/ext/editor/` and touching nothing rewrites
   `/data/editor.json`. The badge is asking "can this write," not "did it
   write" — ask the saver directly. *Cost:* one line, in the file the split
   above is about to touch anyway. **simple, important — real bug, not a doc
   finding; flagged here per the fences**
4. **A `console.warn` when `History` is built without `read`/`restore`.**
   *Claim:* today a misconfigured `History` looks fully wired — buttons enable,
   `can_undo()` flips true — while silently doing nothing, because the defaults
   are no-ops rather than throws. One guard in the constructor makes the mistake
   loud instead of invisible. *Cost:* three lines, zero callers to break.
   **simple, useful**
5. **Cap `History.past`.** *Claim:* whole-document snapshots, uncapped, for the
   life of the page — fine at prototype scale, a real cost once someone tries
   this on a large document. *Cost:* one bound, one decision about what happens
   at the bound (drop oldest, presumably). **simple, useful**
6. *(Outside the box, ranked last on purpose.)* **Un-file this entirely — make
   `Editor` (post-split) a `panel()` template inside `ext/Panel`'s own gallery,
   the way `"clock"` is, instead of a page with its own route.** *Claim:* if the
   real deliverable is "a `Panel` region that happens to edit an `Item` tree
   instead of arranging one," then the honest home is beside the other
   templates, previewable and composable the same way, rather than a five-file
   directory under `ext/` that nothing constructs. *Cost:* large — it would mean
   `Editor` loses its own url and its own doc page, which this whole audit just
   built out; genuinely contradicts recommendation 1 above (a page needs a
   route to be visitable) and is offered as the alternative worth naming, not
   the one I'd take. **large, speculative**

## Where this module overlaps others

**`ext/Panel`**, directly and by design — the editor's shell *is* a Panel
workspace (`workspace({ saver, templates, seed })`), and its regions are Panel's
own `T`-vocabulary mechanism scoped to one instance rather than the global
registry. They are not "the same thing wearing two names": Panel is the general
arranging chrome, editor is one document-editing application built on top of it,
the same relationship `panel()` has to any other content it hosts. They should
stay two modules, but they already share code that isn't factored out — the
`store(path, key)` dev/localStorage saver-chooser is copy-pasted verbatim between
`editor/page.js:19-20` and `Panel/workspace.js:23-24` (flagged in the
2026-08-14 review, not yet fixed). That belongs in `ext/Saver` as one shared
helper, called from both.

**`ext/layout`** is not overlapping so much as *reused correctly* — the editor's
properties region is explicitly "`ext/layout`'s existing word registry, not a
parallel one" (readme's own verdict). This is the pattern the other two
relationships should follow: don't rebuild, import the vocabulary.

**`dev/DevBar`** — I did not audit it (out of my fences) but skimmed its file
list for this section. It is a third "chrome with drag/arrange/persist" surface
(`grip.js`, `settings.js`) that never touches `Item`/`Sortable`/`Saver` at all —
it is DOM-and-localStorage only. I don't see the same underlying mechanism
there; it reads as a separate, smaller thing that happens to share the word
"panel" in conversation, not in code. Someone auditing DevBar directly would
know better than I do from outside.

**The real unification question isn't Editor/Panel/layout/DevBar being one
thing** — the review two days ago already answered that (they're not; Panel is
infrastructure, Editor is the one thing built on it). It's that **`ext/editor`
is the only consumer `ext/Panel`'s workspace mechanism has ever had**, so
whether `workspace({ templates })` is the right general shape is still a sample
size of one. A second thing built on it (this audit's recommendation 6, or
something else) would be the real test of whether `templates:` is a module
API or an editor-shaped hole in Panel's design.

## Skill feedback

**Strongest point:** the skill's `page.js` instruction — *"rewrite it as
`new Doc({ … })`. Even with no class: `subject` is optional"* — has no guidance
for a module with **two** real classes to document (`History` and `Block`).
`Doc` only accepts one `subject`, so I had to pick one (`History`, the one with
actual behavior) and leave `Block`/`Section`/`Grid`/`Card`/`Text` covered only
by prose in `doc/file/blocks.js.md`, never in the API tab. That's a real
information loss — `Block.leaf()` is exactly the kind of one-line-but-important
method the API tab exists for — and the skill doesn't say whether the right
move is "pick the more important one," "add a second Doc as a child page," or
something else. I picked the pragmatic option and named it in a code comment;
a module with two co-equal classes will hit this harder than I did.

**Second:** the skill's audit checklist and the brief both assume the module
under audit constructs the thing being documented and something else calls it.
Neither says what to do when Step 2 (framework-wide usage search) comes back
**zero** and the module is, on inspection, not infrastructure at all but a page
wearing infrastructure's directory convention (`ext/`). "A module with no
callers is itself a finding" (brief) is exactly right as far as it goes, but
the skill has no next question — *is this actually a module?* — which is the
one this brief happened to ask me directly as a bonus. It should probably be in
the skill's own audit checklist as step 0, not left to be asked per-agent.

**Third, minor:** "Keep each file's doc to a screen" (§4/§5) is hard to honor
literally for a 318-line file carrying three responsibilities without either
cutting real content or restating what the source's own `⚠` comments already
say. I chose "map the ⚠ comments, don't restate them" as the resolution; worth
the skill saying so explicitly, since a 300+-line file is exactly where a
reader most wants the file doc to be more than a screen.
