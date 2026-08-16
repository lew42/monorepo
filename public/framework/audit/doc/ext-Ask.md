# ext/Ask

**A small, well-built bridge that earns its place outright** — 243 lines of JS
across two files turn a browser tab into one headless `claude -p` turn, and
four real, distinct callers (the dev rail, a task's own chat, the board's
compose box, a vision second-opinion) each use a different one of its four
exports, with none unused. The docs going in were already narratively good —
every hard decision was written down in prose — but the module had no `Doc`
page at all (a plain `Page`, no Files/API/Docs tabs), no `doc/*.md`, and one
real staleness: the readme's own piece table didn't mention
`Server/plugins/Start.js`, the file that actually spawns a `start()`'d task.
The single most important thing to do to this module isn't more prose — it's
resolving the tool-scoping gap named below: the two production chat surfaces
run with **no tool restriction at all**, unlike the one path (`start()`) that
deliberately chose a floor.

## State

| | |
|---|---|
| files | 5 (`Ask.js` 90 lines, `chat.js` 73, `page.js` 80 after rewrite, `ask.css` 25, `readme.md` 130) |
| lines of JS / CSS | 243 / 25 |
| callers | 4 real: [`dev/DevBar/ask.js`](/framework/dev/DevBar/) (`thread`+`chat`, every page), [`ext/AITask/AITask.js`](/framework/ext/AITask/) (`chat`, every task page), [`ext/AITask/compose.js`](/framework/ext/AITask/) (`start`, the board), [`ext/LayoutTool/vision.js`](/framework/ext/LayoutTool/) (`ask`+`shot`, locked to `Read,Glob,Grep`). No dead exports. |
| docs before | `readme.md` only — thorough prose, no "Who uses it," a "Phase 2" list instead of "Open," and a piece table missing `Server/plugins/Start.js` entirely. `page.js` was a plain `Page`: two inline demo buttons, no Files/API/Docs tabs. Zero `doc/*.md`. |
| docs after | `page.js` rewritten as `Doc` (Files, API, Docs tabs all now real); `readme.md` restructured with a "Who uses it" section and the stale table fixed; 14 new `doc/*.md` — 5 `doc/file/*.md`, 4 `doc/method/*.md` (`ask`, `thread`, `start`, `available`), 5 `doc/<note>.md` (`task`, `process`, `fork`, `shot`, `record`). |

## What I changed

- **`readme.md`** — added "Who uses it" (the Step 2 grep, four callers, none idle); fixed the piece table, which cited only `Server/plugins/Ask.js` for "the spawn" and never mentioned `Server/plugins/Start.js` — the file that actually does `start()`'s spawn; broke out five sections over the two-paragraph limit (`task`, the process-vs-pipe decision, the fork rule, `shot`, the record shape) into `doc/*.md`, summarized and linked each; renamed "Phase 2" to "Open" per the skill's shape; added the tool-scoping paragraph the brief asked for, sourced from reading `Server/plugins/Ask.js`, `Start.js` and `vision.js` side by side.
- **`page.js`** — rewritten as `new Doc({...})`. `subject: Ask` is a **module namespace object** (`import * as Ask from "./Ask.js"`) — `Ask.js` has no class or hand-built object to hang `methods:` on, and a namespace object satisfies `ext/doc`'s documented "namespace object" subject shape for free, giving `ask`/`thread`/`start`/`available` real API pages with real source instead of prose-only notes. `chat()` stays out of the subject deliberately (it's a view factory, already covered by the Overview and its own file doc). Added a "thread(), and starting a whole task" section — `thread()`/`start()` had **zero** mention anywhere on the module's own page before this pass, despite being two of its four exports. Swapped the manual `[readme](readme.md)` link for the canonical `md.details(import.meta, "readme.md", …)` every other `Doc` page in the framework uses.
- **14 new `doc/*.md` files** — one per file, one per listed method, one per note. Full list in State above.
- Verified: `node --check` clean; `curl -s -o /dev/null -w "%{http_code}" http://localhost/framework/ext/Ask/page.js` → 200; every name in `methods`/`notes`/`files` has its `.md`, and `files:` matches the directory exactly in both directions (5 files, no `doc/`).

## Recommendations

1. **Tool scoping is opt-in and the two production chat surfaces opt out of nothing.** `dev/DevBar/ask.js`'s thread panel and `AITask.chat()`'s task chat both call `chat()`/`ask()` with no `tools` argument at all (`Server/plugins/Ask.js`'s `turn()` only pushes `--tools` if `tools != null`), so a prompt typed into either gets `claude -p`'s own default permission mode — nothing here narrows it. `Start.js` is the one path that chose a floor on purpose (`--permission-mode acceptEdits`, with a comment explaining why not `bypassPermissions`). This isn't a bug I can point to a broken line for — it may be the intended trust boundary for a localhost-only, single-user tool — but it's an inconsistency between two paths built by the same hand, and it's exactly what the brief asked me to surface plainly. *(medium to decide, small to apply once decided — important. Not fixed; written down top of this list per the fences.)*
2. **`page.js`'s `asker()` and `ext/LayoutTool/vision.js`'s `run()` are near-duplicate hand-rolled "ask button" components** — button → disabled/"thinking" state → `ask()` → success renders text + cost/duration, failure renders the error message, reset. Two independent copies of the same seven-step shape. A shared `askButton(label, prompt, opts)` in `Ask.js` or `chat.js` would collapse both and give every future one-off "ask a question, show the answer" caller the same component for free. *(simple, useful — the two call sites are 20-ish lines each, and the merge is mechanical.)*
3. **`thread()`'s `opts.request` field is plumbed all the way to the server and has zero callers.** `dev/DevBar/ask.js`'s `add()` — the only caller of `thread()` — calls it bare. Either wire it from the "name this thread" prompt that's already being asked for (the prompt text *is* the request), or drop the parameter; an unused-but-plumbed option reads as load-bearing to the next person who finds it. *(simple, useful.)*
4. **No timeout or cancellation on a spawned turn**, client or server side. A hung `claude` process leaves the caller's `await` pending forever, and there's no way to abandon one short of navigating away. Given every real chat surface in the framework now routes through this module, this is the one robustness gap that would be felt everywhere at once. *(medium, important — the deepest technical gap found, but outside this pass's fences to fix.)*
5. **Outside-the-box: let a chat "graduate" into a task.** Today `thread()` (a conversation, no process) and `start()` (a whole unsupervised session) are two disconnected doors — a chat that turns out to need real work redone requires the human to retype the ask into the board's compose box from scratch. A "promote this chat" action could call something `start()`-shaped but forked from the chat's own `chat_session_id` instead of a fresh prompt, carrying the whole conversation's context into an `acceptEdits` session in one click. *(large, speculative — genuinely new surface, not a doc fix, but it closes a gap between two features that already do 90% of the work independently.)*

## Where this module overlaps others

**`ext/AITask` is the clean case** — it depends on `ext/Ask` (`chat()`) rather than reimplementing any part of it, which is the layering this module's design already gets right: `Ask` is the transport and the panel, `AITask` is the record. No overlap worth flagging there.

**Two real overlaps exist, both small:**

- `page.js`'s `asker()` and `ext/LayoutTool/vision.js`'s `run()` (Recommendation 2, above) — the same "ask button" shape, built twice, in two different modules, by two different hands.
- `dev/DevBar/ask.js`'s `threads()` (walks `directory.json` for child dirs holding a `task.jsonl`) and `ext/AITask/dashboard.js`'s task enumeration are two independent readers of the same "which dirs under here are tasks" question over the same `directory.json`. Neither is inside this module's fence to touch, but both are `ext/Ask`-adjacent enough that a future pass on either `dev/DevBar` or `ext/AITask` should check whether one directory-walking helper could serve both.

Outside those two, `ext/Ask` doesn't look like Editor/Panel/`ext/layout`/DevBar/demo wearing a sixth name — it's the one module in that neighborhood whose job (a socket RPC to a CLI process) genuinely doesn't overlap a layout or persistence concern.

## Skill feedback

**The "namespace object" subject shape is under-specified for a real module of loose exports, and I had to make a judgment call with zero precedent in the codebase.** `ext/doc/readme.md` lists four subject shapes — class, function-with-properties, namespace object, or none — and gives `ui` as the namespace-object example, but every module I could find that documents loose functions (`ext/files`, and this module before my pass) instead skips `subject:` entirely and falls back to `notes:`/`files:`, per the skill's own line: *"nothing at all — a module of loose functions documents itself with notes: and files: and never passes one."* That sentence reads as a rule ("never"), but it left real API surface — `ask`, `thread`, `start`, `available` — with no source-backed page, only prose. I found that `import * as X from "./file.js"` produces exactly the namespace-object shape `member()` already knows how to read (confirmed against `util/source/source.js`), used it, and it worked — `grep -rn "import \* as" --include=page.js` across the whole framework returns nothing else, so this is a pattern of one. The skill should either say "a namespace import works for a loose-function file, and here's the shape" or explicitly rule it out — right now a reader has to notice the tension between "never passes one" and the four-shapes list and resolve it themselves, and the two prior audits of loose-function modules (`ext/files`, and this one's own predecessor) both apparently resolved it the same way I almost did: by not trying.

Second: **the skill's readme template names "Decisions / Traps / Open" as three headings a readme "carries," but doesn't say what counts as a Decision versus an ordinary aspect section** — this module's readme had five substantial design calls (the fence, process-vs-pipe, fork-vs-resume, `shot`, the record shape) that read equally as "Decisions" or as plain topic sections, and I ended up putting only two under an explicit "## Decisions" heading and leaving three as bare topic headings, on a feel for which ones had a real rejected alternative versus which ones were just "how it works." A firmer rule (a Decision has a stated alternative that was weighed and rejected; a topic section doesn't) would have made that call mechanical instead of a guess.
