# core/Item + core/List

Two files, 175 lines of JS together, and they are the base of the whole
persistence stack — `ext/Saver`, `ext/editor`, `ext/Panel`, `ext/Draggable` all
sit on `Item`. Both classes are well-built and both readmes were already
excellent design records before this audit touched them; the gap was purely in
the browsable layer — no `Doc`, no per-member pages, no record of who actually
calls either class. That gap is now closed. The single most important thing to
do next is not to either file: it's to decide, on purpose, whether `List`
survives as its own class — see **Where this module overlaps others** below;
the readme itself already contains a recorded dissent arguing it shouldn't.

## State

| | |
|---|---|
| files | 6 (`Item.js`, `Item/readme.md`, `Item/page.js`, `List.js`, `List/readme.md`, `List/page.js`) |
| lines of JS / CSS | 175 / 0 (`Item.js` 118, `List.js` 57 — no CSS in either) |
| callers | `ext/Panel` (`Panel extends Item`; `Item.open` in `workspace.js`), `ext/editor` (`Block extends Item` in `blocks.js`; `Item.hydrate`/`Item.open` in `page.js`; `History.js` restores through `Item.hydrate`), `ext/Draggable` (demo page only, imports both to *show* `Sortable` imports neither). `List` has exactly **one** real caller: `Item.js` itself. `ext/Saver` deliberately imports neither. |
| docs before | Both readmes already near-final (traps, verdicts, open items — written by the 2026-08-13 council). Both `page.js` were a plain `new Page({...})` with no `subject`/`properties`/`methods`/`notes`/`files`, no per-member pages, and no "used by" record. Zero `doc/*.md` existed. `classdoc` was never referenced (nothing to fix there). |
| docs after | `Doc` on both pages. Item: 5 properties, 20 methods, 1 note (`envelope`), 3 files documented. List: 3 properties, 10 methods, 1 note (`adoption`), 3 files documented. 38 new `.md` files total. Both readmes gained a **Used by** section and a link into their new note. |

## What I changed

- Wrote `doc/property/*.md` (5 Item, 3 List) and `doc/method/*.md` (20 Item, 10
  List) — every name in each page's `properties`/`methods` string now has its
  file.
- Wrote `doc/envelope.md` (Item) and `doc/adoption.md` (List) — the two
  cross-cutting topics that span multiple members and were previously only
  implicit in the readmes' Verdicts/Traps sections.
- Wrote `doc/file/*.md` for all six real files (`Item.js`, `List.js`, both
  `readme.md`, both `page.js`), each ending in a ranked Improvements list.
- Added a **Used by** section to both readmes, from the grep in Step 2.
- Converted both `page.js` from `new Page({...})` to `new Doc({...})`: added
  `subject`, `properties`, `methods`, `notes`, `files`; trimmed a little
  overview prose that the new API tab now carries verbatim; added inline links
  from the Overview into the two new notes. The existing demo content — Item's
  18-check live test suite, List's interactive four-button outline — is
  untouched apart from that.
- Fixed a latent bug while doing so: **List's `page.js` never imported
  `List`**, so `subject: List` would have been a `ReferenceError` the moment I
  added it. Added `import List from "./List.js"`.
- Verified: `ls` against both `files:` (exact match), every `properties`/
  `methods`/`notes` name has its `.md` on disk (exact match, shown in my full
  audit work), `node --check` on both rewritten `page.js` (clean), and
  `curl -s -o /dev/null -w "%{http_code}"` on both page urls → `200`/`200`.

## Recommendations

1. **`List.find(fn)` collides in meaning with `Item.find(id)`.** One is a flat,
   one-level `Array.prototype.find`-alike; the other is a recursive id lookup
   over the whole subtree. Same name, unrelated contracts, on two classes a
   reader will hold in their head at the same time. Rename `List.find` (e.g.
   `first`); zero real callers today (`List.find` has no non-demo caller at
   all), so the rename is free. *(simple, important.)*
2. **`Item.find(id)` never short-circuits.** `walk()` has no early exit, so a
   lookup by id visits every node in the document even after finding its
   match. Fine at the sizes exercised today; a document with hundreds of nodes
   pays for it on every call. *(simple, useful — not urgent, but cheap to fix
   now versus expensive to diagnose later as "the editor feels slow.")*
3. **`List`'s page has no automated checks; `Item`'s has eighteen.** A reader
   of `/framework/core/List/` sees a live demo but no proof — the claims in
   the prose ("one listener, every change") are asserted, not tested on load,
   the way `Item`'s page tests all eighteen of its own claims. Porting the
   `row()`/`checks` pattern from `Item/page.js` is close to a copy-paste.
   *(medium, important — this is the biggest asymmetry between the two
   pages.)*
4. **`move()` trusts its caller for the cycle guard.** Every real call site
   guards with `contains()` first, but the guard isn't in `move()` itself — a
   future caller that forgets it can build an infinite structure with no
   error. Moving the check into `move()` costs one comparison on the common
   (already-guarded) path. *(simple, important — this is the one way this
   module can be made to fail outside its own contract.)*
5. **`Item.assign` and `List.assign` are byte-identical one-liners.** Not
   worth a shared base today. Recorded so that if a third persistence class
   ever wants the same constructor shape, this is the trigger, not a reason to
   act now. *(simple, speculative.)*
6. **Outside-the-box: let `List` disappear, and give `Item` a `Symbol.iterator`
   and three static-ish helpers instead of a whole class.** The readme already
   records Steve's dissent for a bare `Array`; a middle path neither readme
   considers is *no second class at all* — `item.items` stays a plain `Array`,
   `Item` grows `#adopt(child)` as a private instance method it calls from
   `add`/`move`, and `notify` becomes a one-line call to `this.emit` directly
   from those two Item methods (there is no third mutator today —
   `insert_before` exists solely because `move()` needs it). This deletes the
   `owner ?? this` indirection entirely, because there'd be nothing but the
   Item to adopt into. It also deletes the one architectural question this
   audit keeps circling back to. Cost: `List`'s `readme.md` explicitly weighed
   and rejected exactly this shape once already — reopening it means either a
   new argument has appeared (this audit found one: a **one-caller class**,
   see below) or it's re-litigating a settled council call. *(large,
   speculative — but it's the idea worth having someone other than this
   agent's own reasoning weigh in on.)*

## Where this module overlaps others

**Is the Item/List split earning its keep, or is it one idea wearing two
names?** Leaning **wearing two names, mildly** — three observations, in
increasing order of weight:

- `List` has exactly one real caller in the entire framework: `Item.js`. Not
  "mostly used through Item" — *zero* other code constructs a `List` or calls
  a `List` method directly (the two demo-only imports in `ext/Draggable`
  exist purely to assert `instanceof List` in a check, and `List/page.js`'s
  own demo talks to it through `Item` verbs, deliberately, per its own
  readme). A class whose only consumer is the class it was extracted from is
  the textbook shape of "this used to be inline and someone pulled it out for
  readability," not "this is an independent abstraction with its own
  callers."
- The readme's own recorded dissent (Steve, cut) argued for a bare `Array` and
  was overruled on the grounds that `adopt`/`owner` "have to live somewhere."
  That's true, but "somewhere" doesn't have to be a class with its own file,
  its own readme, its own doc tree, and its own page — it could be two private
  methods on `Item`. The council weighed *Array vs. List-the-class*; it does
  not look like it weighed *List-as-separate-module vs. List-as-Item's-
  private-helper*, which is the actual axis this audit landed on.
- Against that: `List` genuinely is data-shaped and view-agnostic in exactly
  the way `Item` is, the file is 57 lines and costs almost nothing to keep
  separate, and "one caller today" is not "one caller forever" — `ext/Panel`'s
  `workspace.js` or a future canvas view is a plausible second consumer that
  wants the collection without the node. That's a real argument for keeping
  the seam even while it's unused.

Net: I would not merge them without asking — this is exactly the "propose
before major surgery" case `CLAUDE.md` names, since it changes a class
boundary three other modules build on. But the audit brief asked for an
honest read, and the honest read is that `List` is currently justified by an
argument about the *future* (a second consumer that hasn't shown up) more than
by anything in the *present* codebase.

Separately, smaller overlap worth naming: **`Item.on`/`off`/`emit` is a third,
independent event-bubbling implementation in this framework.** `View` has its
own DOM-event handling (`click`, `.on`), and `Page`/`Router` have navigation
events. None of the three share code with `Item`'s bubbling — each was built
for its own layer and none imports another. That's plausibly correct (DOM
events, route events and document-model events are genuinely different
things), but it's the kind of "same idea, N names" pattern `CLAUDE.md` asks
audits to flag, so: flagged, not diagnosed — I didn't audit `View`'s or
`Router`'s event code and can't say whether unifying them is worth it.

## Skill feedback

**Strongest finding: the skill has no answer for `Symbol.iterator` (or any
well-known symbol) as a documented member.** `List` implements
`[Symbol.iterator]()` — it's real, load-bearing API (`for...of` over a list is
a documented pattern in its own page) — but `methods:` is a hand-typed,
space-separated string of plain names, and `Doc.member()`'s lookup has no path
to a symbol-keyed property. I worked around it by mentioning the iterator in
the class-shape code block instead of giving it a real API page, which means
it's the one member of `List` that the Files/API system genuinely cannot make
browsable. The skill's "six artifacts" checklist should either say "well-known
symbols are out of scope, document them in prose" explicitly, or `Doc` should
grow a way to name one (even something as blunt as
`methods: "each find [Symbol.iterator]"` with a special-cased lookup). Right
now an auditor discovers the gap by trying it and watching nothing render, and
the skill's own worked example (`View`) has no symbol-keyed members so it
never surfaces there.

Second: the skill's audit checklist (`## Auditing an existing module`) doesn't
mention `doc/file/<path>.md` for `readme.md` and `page.js` themselves, and I
had to find that convention by example (`ext/doc`'s own `doc/file/readme.md.md`
and `doc/file/page.js.md`) rather than from the skill text, which only says
"one for EVERY file in the module (never for `doc/` or `ai/`)" — technically
correct once you notice `readme.md` and `page.js` count as "every file," but
easy to read as being about source files only, and I initially drafted this
audit assuming only `Item.js`/`List.js` needed file docs before checking
`ext/doc` and finding otherwise. A one-line example in the skill (the way it
already gives `View.js.md` → `View.js`) would have saved that detour.

Third, smaller: the skill's own worked "Improvements" example
(`## Auditing an existing module` → `doc/file` template) is the only doc/file
sample shown with a ranked list; `ext/doc`'s real `doc/file/Doc.js.md` — the
system's own reference implementation — has **no** Improvements section at
all. An auditor following the skill literally and an auditor following the
nearest real example get different answers about whether that section is
required. I followed the skill's literal text (it's a "must," stated plainly)
over the example's precedent, but it's worth the skill and `ext/doc` agreeing
with each other.
