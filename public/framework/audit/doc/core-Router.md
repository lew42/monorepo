# core/Router

**Router is small (146 lines, zero dependencies, zero CSS) and earns its place
outright — it is the entire url-to-DOM tier, "no reload, nothing to register, no
route table" is literally true, and the design record already reads like a
finished case study.** The docs going in were *narratively* excellent — every
verdict, trade-off and backed-out idea was written down — but *mechanically*
rotted: there was no Files tab at all, and roughly thirty `Router.js:N` /
`App.js:N` line citations across fourteen files had drifted from the real
source, three of them pointing at a `console.log` that no longer exists. The
single most important thing to do to this module is not writing more prose — it's
what this pass did: re-anchor every citation to the file that actually exists,
because a wrong line number is silent until someone clicks it.

## State

| | |
|---|---|
| files | 3 (`Router.js` 146 lines, `page.js` 58 lines, `readme.md` 136 lines) — no CSS |
| lines of JS / CSS | 146 / 0 |
| callers | 4 real call sites, 1 real importer. [`core/App`](/framework/core/App/) is the only `import { Router }` (`App.js:3`, re-exported `App.js:110`) and constructs the one instance (`App.js:56`). Three others call `app.router.mark_links()` bare, for late-rendered links: [`ext/tabs`](/framework/ext/tabs/) (`tabs.js:55`), [`ext/catalog`](/framework/ext/catalog/) (`catalog.js:62`), [`ext/AITask`](/framework/ai/) (`dashboard.js:115`). No other module reaches into the Router. |
| docs before | `readme.md` already had Decisions / Measured / Proposed / Open, all thorough and dated; `page.js` was already a `Doc` (not `classdoc`) with `properties`/`methods`/`notes` complete — all 13 method docs, all 3 property docs, all 10 note docs existed. **No `files:` key, no `doc/file/*.md` at all — no Files tab.** ~30 stale `Router.js:N`/`App.js:N` citations across 14 files; 3 references to a `console.log` already deleted from the source; `mark_links.md`'s own caller list was wrong (cited a file that doesn't call it, missed two real callers). |
| docs after | added `files: "Router.js page.js readme.md"` + 3 new `doc/file/*.md`; corrected ~30 line citations in 14 files; deleted 3 stale console.log references; rewrote `mark_links.md`'s caller list against a fresh grep; added a "Who uses this" section to the readme; fixed a fragile "eleven lines above" claim that was never going to survive an edit. |

## What I changed

- `page.js` — added `files: "Router.js page.js readme.md"` (previously absent — no Files tab existed for this module).
- `doc/file/Router.js.md`, `doc/file/page.js.md`, `doc/file/readme.md.md` — new, each with a ranked Improvements list.
- `doc/constructor.md`, `doc/method/assign.md`, `doc/method/listen.md` — fixed `App.js:63` → `App.js:56` (the constructor call site moved); `constructor.md` and `listen.md` also had a paragraph about a `console.log` in the constructor that no longer exists — deleted.
- `doc/method/click.md` — fixed `Router.js:12`→`11`; its "Simplicity" section claimed "a third of the body is a `console.log`" — also gone from the source, rewritten.
- `doc/method/{activate,chain,go,link_clicked,load,load_segments,mark,mark_links,root,shared_depth}.md`, `doc/property/{active,app,marked}.md` — every `Router.js:N` citation re-verified against the live file and corrected (offsets ranged from +1 to +17 lines, growing toward the end of the file — consistent with several small trims over time, not one edit).
- `doc/method/root.md` — the claim `this.app.root` sits "eleven lines above the method called `root`" no longer held (they're 43 lines apart) and was never going to survive the next edit either; replaced with two direct citations.
- `doc/method/mark_links.md` — the caller list cited `ext/tabs/tabs.js:53` (now `:55`) and `framework/ui/page.js:29`, which **does not call `mark_links` anywhere** (confirmed by grep — the true grep hit list is `ext/tabs`, `ext/catalog`, `ext/AITask/dashboard.js`, none of which were all three listed). Rewrote against `grep -rn "\.mark_links\("` on the live tree, with links.
- `readme.md` — added "Who uses this" (the Step 2 usage search, sourced from the same grep); fixed the "Proposed" section's stale caller claim to match.
- Verified: `node --check` clean on `page.js`; `curl` on `page.js` returns 200; every `properties`/`methods`/`notes`/`files` name in `page.js` has its `.md` on disk and vice versa (13 methods, 3 properties, 10 notes, 3 files — exact match both directions).

## Recommendations

1. **Stop hand-citing exact line numbers in prose; cite the enclosing method/property instead.** This is the finding of the pass: every single numeric citation in this module had drifted, several by double digits, and nothing detects it — a reader clicks through believing a stale number. `` `Router.js` — inside `activate()` `` survives any edit that doesn't rename the method; `` `Router.js:92` `` survives none. *(medium — touches ~30 lines across 14 files if applied everywhere; simple per-file. important.)*
2. **`ext/catalog` and `ext/AITask` calling `mark_links()` were undocumented callers before this pass** — a real module with real production usage that the "framework-wide usage search" step of the skill exists specifically to catch. Fixed this pass, but it shows the search has to be re-run per audit, not trusted from last time. *(simple, important — done.)*
3. **`root()`'s name collides with `app.root`** (a `Page` vs. the app's root `Element`, one class apart) — the readme already proposes `scope()`, weighed against two other options, and recommends it. Still unapplied; two call sites, both in `Router.js`. *(simple, useful — outside my fences.)*
4. **The double-click race is "known, cheap, unbuilt."** Two clicks start two walks and the slower can win silently; the readme's own recommendation (option c, a stamped last-write-wins counter) is one counter and one `if` in `activate()`. Nobody has reported it, but it is the one behavioral gap with a concrete fix already designed. *(simple, useful.)*
5. **Outside-the-box:** the "Measured" section is static prose (0.2ms median navigation, 89µs `mark()`, etc.) written from a one-time benchmark run against `core/new/1/`. Since this module has zero runtime dependencies and is trivially instrumentable, those numbers could be a live `demo()` on the Overview — "click to navigate 500 times, watch the median" — turning a claim into a rerunnable proof, and it would also be the honest test for recommendation 4 above (does the stamped counter change the median). *(large — needs a harness; speculative, but this module is small enough that it's plausible.)*

## Where this module overlaps others

**None as a peer — but it is the one place three other tiers' "did my late-rendered
links get marked" problem actually gets solved**, and solved the same way three
independent times (`ext/tabs`, `ext/catalog`, `ext/AITask`), which is itself a
signal: three unrelated modules hit the identical "I built anchors after `mark()`
ran" seam and each pasted in the same bare `mark_links()` call. That's not
duplication worth merging — the fix is genuinely one line each — but it's evidence
the "render late, then re-mark" pattern is common enough that a fourth caller is
likely, and the readme's own rejected alternative (a `MutationObserver` on `$app`)
trades three visible one-liners for one invisible one. I'd leave it as three
visible calls; the readme already reached that verdict and I see no reason to
relitigate it.

## Skill feedback

**The skill has no guidance for a module that already mostly passes the
checklist.** Every step under "Auditing an existing module" assumes gaps to fill;
when the actual finding is "narratively complete, mechanically rotted" (line
numbers, not missing prose), the skill doesn't say how much new writing is
warranted versus how much restraint to exercise. I erred toward small, targeted
fixes over rewriting an already-good readme — but this is a judgment call the
skill leaves entirely to the auditor, and I'd bet every agent auditing an
already-thorough module (this one, `core/Sidebar` per its own audit file) makes
the same guess independently rather than being told.

Second, sharper piece of feedback: **"`doc/file/<path>.md` — one for EVERY file in
the module" doesn't say whether `readme.md` documents itself.** I resolved it by
precedent (`ext/Doc/doc/file/readme.md.md` exists) rather than instruction, and
`core/Sidebar`'s audit file records hitting the exact same ambiguity independently.
Two audits rediscovering the same unstated rule in one pass is the skill's own
signal to spell it out: *"`readme.md` gets `doc/file/readme.md.md` too."*
