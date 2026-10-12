# shots-history — what the screenshot/vision work already built

**~2,150 screenshots taken. 8 logged. 18 have prose feedback. 0 have their prompt in the repo.**
That is the whole finding. The machinery is built and works; nothing keeps the record.

## 1. Inventory

| path | what | works? |
|---|---|---|
| `Server/plugins/Shot.js` | playwright png → `os.tmpdir()`; `{url,selector,width,height}` | yes — 271 `ask-shot-*.png` on disk (116 today) |
| `Server/plugins/Screenshots.js` | `/screenshot?path=<abs>` — loopback + tmpdir fenced | yes — 200 image/png, verified |
| `Server/plugins/MCP.js` | site tools `pages` `eval` `shot` | yes |
| `Server/plugins/Ask.js` | one `claude -p` turn; `{shot}` → *"Read the screenshot at &lt;f&gt;, then: …"*; records `session_id`, `cost_usd` | yes |
| `ext/Ask/Ask.js` + `doc/shot.md` | `ask(prompt, {shot, model, tools, on})`, `thread()`, `start()` | yes |
| `ext/DesignTool/vision.js` | the "Ask Claude to look at it" button — **the only prompt in the repo** | yes, click-only by decree |
| `ext/DesignTool/audit/twin.js` | **Before/After iframes + "Accept into the review queue"** | yes — verified live |
| `ext/DesignTool/mirror.js` | element-level twin, fix applied inline to a clone | yes, via `report.js` |
| `ext/JSONL` `shot` verb + `ext/AITask/shots.js` | `{"shot":{at,path,url,width,label}}` → thumbnail wall | yes, but **8 lines exist site-wide** |
| `ai/2026-08-14/vision-sonnet/layout-analysis.json` | **the record schema Mike wants**: per image tokens, cost, ms, regions, issues[sev,what,where], prose | frozen, never given a browse page |
| `ai/2026-08-14/vision-haiku-opus/`, `vision-report/` | the same corpus across three models | frozen |
| `ai/2026-08-17/vision-baseline/baseline.json` | 18 pages × 5 axes, score + **one sentence each**, opus-5 | **this is the analysis Mike loved** |
| `ai/2026-08-17/vision-browse/` | those 18, ranked, shot beside its sentences | yes — no model, no prompt, no tokens |
| `ai/2026-08-17/human-ranking/rank/` | duel UI: two shots, click the better, 59× | yes — the round Mike disliked |
| `ai/2026-08-17/rubric-v2/`, `tier-calibration/` | reliability study; the rules tier's aggregate score deleted | yes |
| `ai/2026-08-17/designtool-ui{,-build}/shots/` | 29 evidence pngs **in the repo, untracked, not gitignored** | works, shouldn't be there |

## 2. The analysis Mike loved — and the exact prompts

`vision-baseline/baseline.json`, scorer `claude-opus-5[1m]`, 18 pages × 5 sentences of prose. Its prompt is **not in the repo** — it is `~/AppData/Local/Temp/claude/c--Code-lew42-monorepo/c6315543-…/scratchpad/prompt.txt`, one temp sweep from gone. Three prompts exist in all:

**P1 — the batch scorer** (`prompt.txt`, 5,841 bytes). Opens verbatim: *"You are scoring the visual design quality of 18 web page screenshots. Read each image with the Read tool and score it. Do not write any file. Do not investigate the codebase. Judge ONLY what you can see in each image."* Then the five axes, the 30/60/90 anchors, *"For each image also give ONE SENTENCE of raw prose feedback per dimension, naming what IN THE IMAGE drove the number."*, the 18 absolute png paths, and *"Read all 18. Then reply with NOTHING BUT a single JSON object, no prose before or after, no markdown fence"*.

**P2 — the live one, `ext/DesignTool/vision.js`** — the only prompt that lives in the repo:

> This is a screenshot of `${report.url}`. A numeric layout analyzer read it and reported:\n\n`${top}`\n\nLooking only at the picture: which of those do you actually see, which are wrong, and is there anything visibly broken the list misses? Be specific and brief — three or four sentences. Do not read any files.

**P3 — the rubric-file variant** (`mkprompts.mjs` → `prompt-v{1,2}-p{1,2}.txt`): *"Read the rubric in full: &lt;path&gt;"* … *"Score independently: do not look for, read, or open any other JSON, log or markdown file in this repo."* Used for the blind re-scores.

## 3. Asked vs delivered

- **"a report of every screenshot taken"** → 18 of ~2,150. The `shot` verb was built (`shots-in-log`, this morning) and then used 8 times.
- **"the model used, and the token consumption"** → measured per *run*, never per *shot*, and `vision-browse` displays neither.
- **"the prompts used — this is actually the most important part"** → **not one prompt is stored beside its output.** All three live in a temp dir.
- **"a textbox where I can ask the same session a question about the image"** → `ask({resume})` and `ext/Ask/chat.js` do exactly this; no browse page wires them together.
- **"not a single score / per-region specificity"** → the day went whole-page and score-first. `rubric-v2` then proved the scores don't reproduce (self-agreement **ICC 0.51**; Sonnet reproduces *itself* better, 0.711). The prose was the durable half all along.

## 4. Mechanics

Global playwright 1.62.1 chromium headless; `waitUntil:"load"` (never `networkidle` — the live-reload socket never idles), `$BLOCKRELOAD=true`, `await document.fonts.ready`, assert `visibilityState === "visible"`, `deviceScaleFactor: 1`, viewport shot (`fullPage` returns identical pixels — the app is a fixed-viewport shell), recycle the context every ~40 navigations. Widths in use: 390/400 · 1280 · 1400 (`Shot.js` default) · 1920 · 3440. Storage: `os.tmpdir()`, rows keyed by sha256-16 of the bytes; 97 pngs nonetheless sit under `public/framework/ai/` and **`.gitignore` names none of them**. Models were called as cold `claude -p --output-format json` (usage in the reply) or through `Ask.js`.

**Cost per image, measured, not guessed:** haiku $0.010 · sonnet $0.035 · one-element haiku via `ask()` $0.034 · sonnet whole page $0.03–0.17. The trap: 2026-08-14 resumed one session 15× and paid **$0.120/image** on 2M cache-read tokens — 3.5× the batch rate, for strictly worse independence. Fresh session per image is right, and Mike's hunch is right: image tokens scale with area, so a card crop is roughly 10× cheaper than a 1280×800.

## 5. Recommendation — reuse almost everything

1. **Don't build `ext/ScreenshotTool`. Build `ext/DesignTool/vision/`** — `vision.js` already owns the ask, `twin.js` the preview, `AITask/shots.js` the wall. One genuinely new thing: a **runner** that lives outside the browser, plus one browse page.
2. **Capture:** playwright `locator.screenshot()` per region — no crop tool needed. The region list comes from `probe.js`'s existing node walk, filtered to cards/containers. Widths **390 · 1280 · 3440**, plus any width `sweep()` flags as a breakpoint. Whole page first for context, then its regions.
3. **Ask:** a fresh `claude -p` session per image (`--session-id`, never `--resume`). **Sonnet as default** — it out-ranks both math tiers, reproduces itself best, and costs 3.5¢. Opus only to referee disagreements. One prompt with several angles, **prose only, no score** — `rubric-v2` proved the score is noise and Mike said he doesn't need one. Ask for `broken` vs `maybe` per finding, and a `decl` for each.
4. **Log — one JSONL line per shot, in the task dir**, extending the `shot` verb that already exists: `{at, path, hash, url, region_sel, width, prompt_id, model, tokens{in,out,cache_read}, cost_usd, session_id, findings:[{class, what, where, decl}]}`. **Keep `prompts/` beside it in the repo, one file per prompt, referenced by `prompt_id`** — that is the single thing that keeps getting lost.
5. **Browse:** one page, `vision-browse/row.js` copied nearly as-is — shot, prose, and the three columns it lacks: model · tokens/cost · the prompt, expandable. The ask-box is `ask(q, {resume: session_id})`, four lines, already built and working.
6. **Delete/consolidate:** `human-ranking/` (the round Mike rejected), the rubric/anchor scaffolding, and `baseline.json`'s numbers — keep its `feedback` prose, which is the corpus. Add `public/framework/ai/**/*.png` to `.gitignore` and deal with the 97 already sitting there.
7. **What goes wrong:** (a) a click-driven `ask()` on a page that re-measures on every resize is a bill wired to a gesture — Mike, with three exclamation marks — so the runner must stay outside the browser; (b) region shots lose context: a card judged alone reads fine while sitting in a broken row, so always pair region with page; (c) `hash`-keyed rows orphan silently when a page changes — that is the feature, don't "fix" it; (d) prompt text in JSON: never backslash-escape backticks.

### Before + After + Accept — it exists, it works, it is one wire from done

`ext/DesignTool/audit/twin.js` (110 lines) already *is* the UX Mike described. Open `/framework/ext/DesignTool/audit/`, click a row's rule button: two same-origin iframes of the page at the audit width, the right one with the proposals injected as a stylesheet, both scaled to fit by a shared `ResizeObserver`, the full CSS diff printed as text, and **"Accept into the review queue"**, which RPC-writes `audit/accepted.css` — a patch to read by hand; nothing imports it. Verified live just now: `{twin: true, panes: 2, accept: ["Accept into the review queue"], decl: "div.doc-well { padding: 0.6em 0.9em }…"}`. `mirror.js` is the element-scale twin (clone left, clone + inline fix right, via `report.js`); `report/shots.js`'s `pair()` is the static before/after for reports; `human-ranking/rank/duel.js` is the two-up chrome if a side-by-side *choice* is ever wanted again.

**Shortest path: the fixes `twin()` renders come from `rules.js`/`polish.js`'s `decl:` (26 of them). Make the vision runner emit the same `{sel, decl, rule, why}` shape and `twin()` renders a model's proposal with no change at all.** Then add `class: "broken" | "maybe"` — broken skips the preview and is logged as a diff, maybe goes to twin. Genuinely missing: `accepted.css` is never applied (deliberate), there is no Reject button, and no verdict is recorded so the prompt can learn from it. Those three are the only new work.
