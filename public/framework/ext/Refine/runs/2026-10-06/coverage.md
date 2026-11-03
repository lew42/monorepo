# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | sessions/2026/10/06/feedback-council/requirements.md | ask #1 |
| S2 | Feedback council — brief for each of the five checkers. | ask #1 |
| S3 | Card dir (read the raw words there): `public/framework/ai/council/` (and the current run directory). | ask #1 |
| S4 | Words: `words.jsonl` in the active run directory. | ask #1 |
| S5 | Asks to check: new asks extracted from `words.jsonl` plus every open ask in `public/framework/ai/council/asks.jsonl` whose latest verdict isn't `done`. | ask #3 |
| S6 | Your job. | ask #4 |
| S7 | For EVERY ask, LOOK at the real result and give one verdict: `done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix. | ask #4 |
| S8 | Prove before you call something missing. | ask #5 |
| S9 | A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it. | ask #5 |
| S10 | The live site: http://monorepo.localhost (never http://localhost/). | ask #6 |
| S11 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open). | ask #7 |
| S12 | Time the Live card load. | ask #8 |
| S13 | Check scroll on the named URLs with real overflow measures. | ask #8 |
| S14 | No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`. | ask #9 |
| S15 | Do NOT edit any repo file. | ask #10 |
| S16 | Scratch goes in your scratchpad; screenshots go to `<run-dir>/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12). | ask #10 |
| S17 | Also scan `words.jsonl` and add up to 8 extra asks the owner made there that current asks miss, with the same verdict. | ask #11 |
| S18 | Return. | ask #13 |
| S19 | Write ONE json file `<run-dir>/votes/<your-name>.json`: `{"name":"...","votes":{"A1":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}` | ask #12 |
| S20 | Then reply "done" in one line. | ask #13 |
| S21 | Never write the owner's name anywhere. | ask #14 |
| S22 | Budget about $2 each: be quick, do not over-explore. | ask #15 |
| S23 | Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots. | ask #16 |
| S24 | Markdown Explorer, Command Characters & Class Card Views (2026-10-06). | ask #2 |
| S25 | Brief recorded verbatim from the owner's dictation on 2026-10-06. | ask #2 |
| S26 | 1. The Markdown Explorer (`md/` Dynamic Path & Tab). | ask #28 |
| S27 | The Dynamic `md/` Path. | ask #28 |
| S28 | Every page/module already has an `md/` subpath. | ask #28 |
| S29 | Upgrade `<module>/md/` so it operates as a full Markdown Explorer. | ask #28 |
| S30 | Main Content Pane: Renders the module's primary `readme.md`. | ask #29 |
| S31 | Sidebar / Quick-Reference: Lists all sub-markdown files (`doc/*.md`, sibling `.md` files) for quick scanning and instant jumping (`swap_link`). | ask #30 |
| S32 | `md` Tab: Expose an `md` tab on modules that have markdown files so readers and AIs can inspect the documentation hub directly. | ask #31 |
| S33 | Authoring Benefit: Enables AIs writing pure Markdown (without JavaScript) to create dynamic, interconnected documentation that is both served raw and rendered rich. | ask #32 |
| S34 | 2. Command Characters & Mention Namespaces (`ext/Mention`). | ask #17 |
| S35 | Command Characters. | ask #17 |
| S36 | `/` — File System Paths: Strictly 1:1 with the actual file system (`/framework/core/Page/`). | ask #18 |
| S37 | No separate namespace or lookup alias; it resolves directly to the disk/URL path. | ask #18 |
| S38 | `@` — Actors: Reserved for users and agents (`@owner`, `@mastermind`, `@minion-*`). | ask #19 |
| S39 | `#` — Classes & Concepts: Reserved for object-oriented classes and framework concepts (`#Page`, `#Item`, `#List`). | ask #20 |
| S40 | Visual Distinction & Color Schemes. | ask #21 |
| S41 | Each kind gets a distinct icon + color theme so the reader learns what type of thing it is at a glance. | ask #21 |
| S42 | Class mentions get an upgraded framed icon and dark card surface (`.page-surface-dark`) so living classes visibly stand out from plain pages. | ask #22 |
| S43 | 3. Class Documentation Page Architecture. | ask #23 |
| S44 | Class Title Card. | ask #23 |
| S45 | The class itself is represented by an icon item card (icon + class name), matching its inline mention form and tree navigator row. | ask #23 |
| S46 | No Claustrophobic Cards-within-Cards. | ask #24 |
| S47 | Inside the class card, properties and methods are rendered as clean, unboxed icon items (avoiding nested boxes and borders). | ask #24 |
| S48 | Inheritance Hierarchy. | ask #25 (thin) |
| S49 | The class's own methods appear first. | ask #25 |
| S50 | Inherited base class methods appear below it (e.g. `Page`'s methods first, followed by inherited `Item` methods). | ask #25 |
| S51 | Core API & Importance Weighting. | ask #26 |
| S52 | The top of the card shows the Core API (the 5–7 most critical methods/properties). | ask #26 |
| S53 | Properties and methods are ranked by importance/usage weight (manually ranked in docs/metadata first). | ask #27 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #2 | new words | "three", "features", "which" — not in the transcript at all |
| #4 | new words | "after" — not in the transcript at all |
| #12 | new words | "shaped" — not in the transcript at all |
| #13 | new words | "after" — not in the transcript at all |
| #17 | new words | "settle", "three" — not in the transcript at all |
| #18 | new words | "straight" — not in the transcript at all |
| #19 | new words | "meaning" — not in the transcript at all |
| #25 | thin citation | cites S48 but shares no wording with it — the citation may not reflect what S48 actually says |
| #27 | new words | "members" — not in the transcript at all |
| #28 | new words | "which", "into" — not in the transcript at all |
| #32 | new words | "make" — not in the transcript at all |
