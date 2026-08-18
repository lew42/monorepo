# util

`util/` is three small, independent files — `is` (15 type-check booleans),
`source` (4 functions that turn running code into readable text), `markup`
(1 function that turns a live DOM subtree into readable text) — gathered
here on one rule the parent page states out loud: *two callers that must
agree.* The module earns its place; `is` and `source` clear the bar
comfortably (8 and ~16 real callers respectively), `markup` clears it by
exactly one caller today, with its own design record's promised *second*
caller never actually written. The single most important thing to do to it:
**`is.class`'s name is a trap** — it tests "constructable," not "declared
with `class`," every plain function passes, and `ext/Doc` already had to
write a second, stricter check (`Doc.is_class`) rather than trust this one.
Fix the name or the reader, not the code.

## State

| | |
|---|---|
| files | 10 real files (`is.js`, `source.js`, `markup.js`, 3×`page.js`, 3×`readme.md`, the parent `util/page.js`) → 40 with the 30 `doc/*.md` this audit added |
| lines of JS / CSS | 439 / 0 (all seven `.js` files combined; no CSS anywhere in this module) |
| callers | `is`: 4 production files ([View](/framework/core/View/), [Page](/framework/core/Page/), [ext/catalog](/framework/ext/catalog/), [ext/demo](/framework/ext/demo/)) + sandbox/task demos. `source`: 3 production files ([ext/demo](/framework/ext/demo/), [ext/Doc](/framework/ext/Doc/), [ext/highlight](/framework/ext/highlight/)) + ~13 in the `core/new/1/` proving-ground. `markup`: **1** — [ext/demo](/framework/ext/demo/)'s html pane, and only that. |
| docs before | Each of `is/`, `source/`, `markup/` had a `readme.md` and a plain `Page` `page.js` — no `Doc`, no API/Docs/Files tabs, zero files under any `doc/`. `markup/readme.md` in particular *was* a full design record with no split from the reader-facing readme. The parent `util/page.js` was already a plain `Page` (correctly — see Decisions) and needed no change. |
| docs after | All three converted to `new Doc({…})`. `is`: `subject: is`, 15 `doc/method/*.md`. `source`: `subject:` an ad-hoc `{ source, member, patched, dedent }` object, 4 `doc/method/*.md`, 1 note (`functions-not-strings`). `markup`: no subject (one loose function), Files tab only, design record split out to `doc/design.md` as a registered note. 3×`doc/file/*.md` per module (9 total) covering every file. Every `readme.md` rewritten to the skill's shape: overview, short sections, a real "Used by" table from a fresh grep, Decisions, Traps, Open. |

## What I changed

- **`is/page.js`, `source/page.js`, `markup/page.js`** — rewritten from plain
  `Page` to `new Doc({…})`. Full diff of shape, not incremental: subject,
  methods/notes/files lists, trimmed Overview content (member-by-member
  tables removed now that the API tab carries them).
- **19 new `doc/method/*.md`** (15 for `is`'s checks, 4 for `source`'s functions), plus 2 notes — `doc/functions-not-strings.md` (`source`) and `doc/design.md` (`markup`'s relocated design record).
- **9 new `doc/file/*.md`**, one per real file in the three submodules (`is.js`, `source.js`, `markup.js`, and each module's own `page.js`/`readme.md`) — 30 new `doc/*.md` files in total.
- **All three `readme.md` rewritten**: conceptual overview, a real "Used by" section from a fresh grep of `public/` (not reused from stale prior counts — several had drifted, see Recommendations), Decisions/Traps/Open.
- **`markup/readme.md` split**: the old file was entirely design-record prose. Moved verbatim (with one correction, see Recommendation 2) to `doc/design.md`, registered via `notes: "design"`, and wrote a genuinely short readme in its place.
- Caught and fixed my own instance of the relative-link trap `audit/modules/ext-markdown.md` already flagged: several `doc/*.md` cross-references I first wrote as `[text](./doc/method/x.md)` resolve, through `md.resolve`, to a raw file fetch rather than the rendered page — corrected to absolute `/framework/.../api/x/` links throughout.
- Did **not** touch `util/page.js` (the parent index) — it is already the same shape as `core/page.js` and `ext/page.js` (plain `Page`, no `Doc`), which is the established, correct pattern for a category index with no members of its own.

## Recommendations

1. **Bug: `util/source/source.js`'s `member()` and `ext/Doc/Doc.js`'s `declaration()` are two independent implementations of the same descriptor read.** *(file: `public/framework/util/source/source.js:53-59` vs `public/framework/ext/Doc/Doc.js:225-237`)* Both do `(subject.prototype && getOwnPropertyDescriptor(subject.prototype, name)) ?? getOwnPropertyDescriptor(subject, name)`, nearly line for line — `declaration()` only adds the `Doc.intrinsic` guard and formats a value instead of returning a function. This is exactly the "two callers that must agree" drift `source.js`'s own readme warns against, sitting one file away from the fence I can't cross. *Cost:* small — `declaration()` could call `member()`-adjacent plumbing instead of re-implementing the fallback chain; the intrinsic guard and value-formatting stay `Doc`'s own. *(simple, important — out of fence, can't apply)*
2. **`is.proto` and `is.mobile` have no callers, and `is.proto(Array.prototype)` answers wrong on the most obvious input.** Already recorded as a prior finding in `is/readme.md`; re-verified today, still true. Delete both; keep the other five zero-caller checks, which cost one line each and complete a guessable vocabulary. *(simple, useful — not applied, per the fence)*
3. **`is.class` answers "constructable," not "was this declared with `class`."** Every plain function passes. `ext/Doc` needed the real question and wrote `Doc.is_class` rather than trust this one — which means the framework already has two different answers to "is this a class" living one import apart, and only one of them is actually right on `function(){}`. Rename `is.class` (`is.constructable`?) or fold `Doc.is_class`'s source-text test in as a stricter sibling. *(simple, important — the clearest naming trap in the module)*
4. **`markup()`'s own design record promised a second caller that never arrived.** It has exactly one (`ext/demo/demo.js:94`). Not wrong to have moved it to `util/` — `source` earned the same move on the same one-plus-anticipated-one reasoning and it paid off — but the design record should say "anticipated," not imply it already happened. Fixed today in `doc/design.md` and `readme.md`; flagging here since it's the kind of drift that's easy to re-introduce. *(simple, useful)*
5. **Outside-the-box: `is`, `source` and `markup` could be one page.** All three exist because "two callers must agree" — the same one-sentence rule, stated identically in `util/page.js`. A single `Doc`-like page with three `subject:` groups (or three `overview:` cards, each opening a full member list) would put the shared rationale in one place instead of three near-identical readme intros. *Cost:* real — it would fight `Doc`'s one-subject-per-page assumption hard enough that it's probably not worth it, and three small pages that each load fast beats one that tries to be three things. Ranked last on purpose. *(large, speculative)*

## Where this module overlaps others

**`markup`'s phrasing/block-tag whitelist is the third of three.** `ext/markdown`'s `block_tags` and `ext/highlight`'s `block_parents` ask adjacent but not identical questions ("may I put a `<p>` here," "may I put a `<pre>` here," "does this child force a newline") and agree today by coincidence, not by sharing code — `markup/doc/design.md §3a` already names this as "a real smell" without proposing a merge. From where I sit: not obviously one thing, because the three questions really are different, but a shared "which HTML tags are block-level" constant that each file specializes would remove the coincidence.

**`ext/Doc`'s `Doc.declaration()` should probably not exist as a second implementation of `source.member()`.** See Recommendation 1 — this is the sharpest overlap in the audit, and it's a duplication *between* a module in this fence and one just outside it, not within `util/` itself.

**`is`, `source` and `markup` do not overlap each other** — each answers a question the other two don't (type of a value / text of a function / text of an element), and nothing in any of the three could absorb another without becoming a grab-bag. The only thing they share is the *reason* they exist (Recommendation 5), not the code.

## Skill feedback

- **Constructing an ad-hoc `subject` object for a file of unrelated standalone exports isn't documented anywhere, and it's exactly the shape `source.js` is.** `source.js` exports four independent functions, not one object — there's nothing in the file for `member()` to read as a single subject. The fix, `const subject = { source, member, patched, dedent }` built at the `page.js` call site purely for documentation, works because the values are the same function references — but I only found this by reading `Doc.js`'s `member()` implementation myself, not from `ext/Doc/readme.md`'s four-subject-kinds list ("a class, a function with properties, a namespace object, or nothing") or the skill, both of which imply the namespace object already exists in the source file like `is` does. This is precisely the pattern the brief's own task hint pointed at (`member()` "generalized... for the new ext/Doc") without spelling out that a page.js may *construct* the namespace object rather than merely document one that's already there. One worked example in `ext/Doc/readme.md` would close this gap for the next module shaped like `source.js`.
- **The relative-link-inside-`doc/*.md` trap bit me too, fresh, despite reading the skill start to finish.** I wrote `[text](./doc/method/x.md)` several times before catching it — and only caught it by reading a sibling audit (`ext-markdown.md`) that hit the same thing first. The skill's own "rules that keep biting" list has the `import.meta`-vs-document fetch trap but not this one, which is the same family of bug one layer up (the link *inside* the fetched content, not the fetch itself). This should be promoted into the skill text itself, not left to be independently rediscovered per module.
- **`doc/file/<path>.md`'s naming for a file that already ends in `.md` (i.e. `readme.md` itself, which every existing `Doc` module lists in `files:`) produces a doubled extension — `doc/file/readme.md.md`.** Correct, and I only confirmed it by reading `ext/Doc`'s own `doc/file/` directory listing; the skill's one example (`overview/urls/page.js` → `doc/file/overview/urls/page.js.md`) never shows this case even though it's the single most common file every module lists.
- Everything else matched: the six-artifact checklist, the four-kinds-of-file table, and the improvements-ranked-last structure for `doc/file/*.md` were all exactly as described and fast to apply once read.
