verdict: fix
1. [fix] Item 8 asked for "a cheap anomaly check" that would catch something like the unread dot stretched to 8×38. Nothing in the diff checks for that. `Server/doc/health.md` only says "A layout scan is not part of it yet." Item 10's "a layout scan comes later" covers the layout scan, but it does not cover item 8's anomaly check. Either build a small check (for example, a round mark whose width and height differ by more than 2×), or record on the card that it was deliberately deferred and why.
2. [fix] The shots don't match the diff. In `shots/…JSONL/1920.png` (rail, third card) the new section is titled "experiment and review / Two verbs the skills already write". The diff's `page.js` titles it "experiment, review, shots and bands / Four verbs, one line each". Re-shoot `/framework/ext/JSONL/` so the review gate sees the page that will land.
3. [note] `JSONL.apply()` is now lenient in two ways that could change state without any warning. (a) A line with no verb that has an `at` and nothing to read is merged with `assign`, so a stray `{"at":…,"title":"x"}` would silently rename the task. (b) A single verb with stray keys folds them into the verb's value, and a string value becomes `{…stray, msg}`, which a handler expecting a string (`agent`, `ask`) may not understand. The validator now refuses both shapes on write, so the risk is limited to old lines. It is still worth one demo or test line each.
4. [note] Items 1–7 (the Proposal class, the node-led loop, the Inbox, impact weights, the architect's §6 list, the phased UI loop) are not in this diff. [plan.md](../plan.md) defers them to wave B, which matches the owner's "DO THESE FIRST". This review covers wave A only.
5. [note] Item 9 ("main is production") is a policy, not code. The monitor and the guard support it, but no skill or doc in the diff tells a mastermind when it may write straight to main. One line in the new-task or minion skill would close this.
6. [note] At 400, the wrap list shows the bottom rail's "AI" and "More" buttons at 3.2 lines, and at 1200–3440 it shows `mode-btn` and `drawer-menu` at 1.7–1.8 lines. These come from the site chrome, not from this diff, and are probably icon-ligature measurement noise. Nothing to fix here.

## Requirements
- 1 "A Proposal class: a content widget that is also a process" — n/a — deferred to wave B (plan.md)
- 2 "Reuse the proposer" — n/a — wave B
- 3 "The Inbox shows it live" — n/a — wave B
- 4 "Node-led, not memory-led" — n/a — wave B
- 5 "Decisions are weighted by impact" — n/a — wave B
- 6 "Build the architect's accepted proposal" — n/a — wave B
- 7 "A phased UI feedback loop" — n/a — wave B
- 8 "a stall check (long tasks over 2 s) and a cheap anomaly check… make it a single instance" — partly. Yes on the stall check: Server/health.mjs checks for a long task over 2 s or a page still busy 10 s after load, and doc/health.md shows a 3 s busy loop flagged at 3.0 s. Yes on the single instance: the health-supervisor.mjs lock is checked by pid and command line, and supervisor-twice.log shows the second copy exiting with code 0. **No** on the anomaly check (finding 1).
- 9 "The main branch is production" — partly — the monitor and the guard support it, but no rule is written for a mastermind (finding 5)
- 10 "A monitor agent… on a TEMPLATE change… NOT on log appends: console errors, a screenshot, stalls over 2 s; report to the editor AND the dashboard" — yes — TEMPLATE_RE skips `.jsonl/.json/.md` ("data only, no check"), each check takes a 1920×1080 shot into ai/health/shots/<date>/, health-guard reports to the editor, and report_to_dashboard() writes one line per batch to the task
- 11 "Validated writes only… first make the validated route the default, then wire the guard" — yes — append.mjs validates against jsonl-schema.mjs, append_log validates through check_event() and fails open, the new-task skill points at the tool, and jsonl-guard.mjs is now wired in .claude/settings.json beside git-guard
- 12a "The validator refuses an unknown verb or a flat line, naming the right shape" — yes — jsonl-schema.mjs check(), with tests for both refusals and for `experiment`/`review` passing
- 12b "Register experiment and review in the reader" — yes — TaskJSONL.verbs adds experiment, review, shots and bands; flat lines render through `flat()`
- 12 "A Playwright check on the monitor counts these warnings" — yes — doc/health.md item 4 counts `JSONL: unknown verb` warnings as one finding

## Page structure
- page 1 — yes — shots/…JSONL/1920.png, top band: "JSONL", with a one-line lede under the import
- page 2 — yes — the left rail of section cards (Overview, TaskJSONL, experiment…, Streaming)
- page 3 — yes — what it is, then the demo, then the verbs, then streaming
- page 4 — n/a
- page 5 — yes — an existing ext/ page
- page 6 — yes — the tabs are routed (Overview/API/Docs/Files)
- page 7 — yes — the Doc type
- page 8 — yes — each section card has a title and a one-line description
- page 9 — yes
- page 10 — yes — the demo renders the four verbs as lines rather than describing them
- page 11 — yes — the new section is titled by its verbs
- page 12 — n/a

## Navigation
- navigation 1 — tabs, a rail (the section cards), a bottom rail at 400
- navigation 2 — yes — layout.json tab_rows 1 at every width
- navigation 3 — yes
- navigation 4 — yes — four tabs
- navigation 5 — yes — the rail sits beside the main column at 1920 and 3440 and becomes a horizontal scroller at 400 (shots/…/400.png)
- navigation 6 — yes — not measured; the rail is static in the shots
- navigation 7 — yes — the 400 shot ends on content above the bottom rail
- navigation 8 — n/a
- navigation 9 — n/a
- navigation 10 — n/a

## Layout
- layout 1 — yes — 3440 shows the site nav, the section rail and a wide main column (sheet.png)
- layout 2 — yes — Docs three-region
- layout 3 — yes — the prose holds its measure (widest_text 518–672) and the demos go wide
- layout 4 — yes
- layout 5 — yes
- layout 6 — n/a
- layout 7 — yes — bands: doc-well 0.067–0.087 share with ink 0.17–0.45, tab-panel at 1.4–1.8; none is big_empty
- layout 8 — yes — the short rail is spread down the page beside its own sections
- layout 9 — yes — at 3440 the empty share is 0.785, but the prose stays at 672px, so the space is accepted as gutter
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes

## Sizing
- sizing 13 — yes
- sizing 14 — yes
- sizing 15 — yes — the code blocks scroll sideways at 400
- sizing 16 — yes — the code and the demo frame scroll by design
- sizing 17 — yes — the title band is 0.067 share at 400
- sizing 18 — yes — overflow_x false at every width
- sizing 19 — n/a — this diff adds no CSS

## Wrapping
- wrapping 20 — yes — only chrome wraps are listed (finding 6)
- wrapping 21 — yes — the same wrap list at 1200, 1920 and 3440
- wrapping 22 — n/a
- wrapping 23 — yes — 400 stacks to one column
- wrapping 24 — note — "rendered as one lin…" is clipped on the rail card in 1920.png; the description changes in the diff (finding 2)

## Spacing and padding
- spacing 33 — yes — left_stack at 400: h1 28px, p 28px
- spacing 34 — yes — one layer at 400
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — n/a — no new CSS
- spacing 38 — n/a
- spacing 39 — yes
- spacing 40 — n/a
- spacing 41 — n/a — no new CSS
- spacing 42 — yes — the diff adds no CSS

## Colour and contrast
- colour 1 — yes — dark ink on a light ground; the code uses the existing theme
- colour 2 — yes
- colour 3 — n/a — no new colours
- colour 4 — yes
- colour 5 — not measured — light shots only
- colour 6 — yes
- colour 7 — yes — the section cards share one style
- colour 8 — n/a

## Flow
- flow 25 — yes
- flow 26 — yes — overflow_x false at every width
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — widest_text is at most 672
- flow 31 — n/a
- flow 32 — yes — left_stack p at 400 is 28px, a single layer

## Words
- words 1 — yes — the new section shows a live demo of the four verbs
- words 2 — yes
- words 3 — yes — the new md() paragraph is about 40 words; the doc comments in JSONL.js are long, but they are source
- words 4 — yes
- words 5 — no in the shot, yes in the diff — the shot's title names two verbs where the section has four (finding 2)
- words 6 — yes — each demo has a single caption
- words 7 — yes
- words 8 — yes — TaskJSONL and AITask are linked
- words 9 — yes — doc/health.md links its proof logs; the JSONL docs sit beside live demos
- words 10 — yes
- words 11 — yes
