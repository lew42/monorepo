# Feedback council: were the asks done?

**44 asks · 19 done · 24 partly · 1 not done · 6 the council disagrees on.** Five Sonnet checkers voted independently.

![Live at 3440](shots/council-5-B-3440.png)

*Live at 3440, one of the shots the checkers took (all in `shots/`).*

## Look at these first: the council disagrees

- 🟡 **A5 Detail pages scroll (x3)** — partly **2/5** (1 not done, 2 partly, 2 done)  
  the URL named (ext/Panel/md/doc/decisions/) is a 404 now; other decision pages scroll. At 1920x700, /framework/core/Panel/md/doc/decisions/ and /framework/ai/ai-dashboar…  
  **Fix:** Re-check the two named URLs (one is now a 404); measure ai-dashboard overflow
- 🟡 **B12 AI 2 works without Servex** — partly **2/5** (2 not done, 2 partly)  
  cards read off static files (ai2/fold.js), agents/Live need Servex; never tested with Servex stopped. Live page needs Servex by design (agents are Servex's); static beha…  
  **Fix:** Load /framework/ai2/ with Servex stopped (a private copy) and fix what breaks
- ✅ **C7 Feedback council: five minions check everything was done properly.** — done **3/5** (2 partly, 3 done)  
  five council minions running (minion-council-1..5 on the AI page)
- 🟡 **C8 Audit of the week's tasks: a minion per prompt, finds unfinished and half-finished work.** — partly **2/5** (2 partly, 2 done)  
  Landed: 176 of 184 tasks audited, one Sonnet minion each (6:05 PM).  
  **Fix:** Link the audit result (176 of 184 tasks) from ai/readme.md
- ✅ **D2 Always consider which branch each agent/owner is looking at.** — done **3/5** (2 partly, 3 done)  
  .claude/skills/mastermind/SKILL.md:64 'Always consider which branch each agent, and the owner, is looking at'  
  **Fix:** Confirm the wording
- 🟡 **D10 Layout skill covers border radius and gaps; approved layouts most of the time, checked at four widths.** — partly **2/5** (1 not done, 2 partly, 2 done)  
  layout SKILL.md lines 30-33 cover rounded corners and gaps; I did not confirm the 'four widths' and 'approved layouts' wording.  
  **Fix:** Add one line: prefer the approved layouts, check at four widths

## Not done or partly

- ❌ **C5 Ready agent per module (short readme as the way in, no old bloated agents).** — NOT DONE **4/5** (4 not done, 1 partly)  
  no ask_module tool, no per-module agent. .claude/skills has no per-module ready agents, only role skills; no per-module short-readme agent seen  
  **Fix:** Build ask_module (already in todo.md, item 3)
- 🟡 **A1 Live card loads fast, or is removed (x7)** — partly **3/5** (3 partly, 2 done)  
  Headless cold load of /framework/ai2/ lands on /live/ and renders in ~2.7s at 1920 and 3440 (includes app boot); the in-app click was not timed because my selector misse…  
  **Fix:** Cold load of /framework/ai2/ takes 1.7 to 4.6 s (a click on Live is 0.1 to 0.7 s): defer the 32k-px .ai2-rows render, lazy-render the rail
- 🟡 **A2 Show, don't tell; words after the picture (x5)** — partly **4/5** (4 partly, 1 done)  
  CLAUDE.md 'Show it with the widget' plus content skill; AI 2 cards still show long text blocks, e.g. right column of Live at 3440 is a long bulleted assistant reply (sho…  
  **Fix:** Trim prose previews: Landed rows and the Live chat column still print text walls
- 🟡 **A3 Layouts work at 3440, not a mobile layout stretched (x5)** — partly **5/5** (5 partly)  
  Card page at 3440 has rail + wide main + right chat column, no big empty area (shots/council-5-A3-card-3440.png). Files overview page at 3440 has a nearly empty left col…  
  **Fix:** Empty state of /framework/ai2/ says Pick something on the left: land on Live; stretch the Live grid at 3440; fill the ext/Files overview page
- 🟡 **A4 Page padding is right (x4)** — partly **5/5** (5 partly)  
  Both shots show content inset from the rail; main element padding measured 0px because padding sits on inner columns. ai-dashboard route rendered only 64 chars (title 'l…  
  **Fix:** Run layout-check on the about page and the ai2-full card, then set --pad
- 🟡 **A6 Card content is clear at a glance (x3)** — partly **4/5** (4 partly, 1 done)  
  Landed card 'Live' shows '[object Object],[object Object]...' as its preview line (council-3-A1-live-3440.png); other cards show headline + link.  
  **Fix:** Landed preview prints [object Object]: stringify the outcome in the Landed row; shorten the Live log preview
- 🟡 **B3 Clicking a Live agent opens a top-aligned column, not a tab with white space.** — partly **4/5** (4 partly, 1 done)  
  Clicking Live card lands on /ai2/live/, a full page with two columns at 1920 and 3440; the click-an-agent-opens-a-column path was not exercised  
  **Fix:** Click one Running-now row and confirm the opened column is top-aligned
- 🟡 **B5 The list is time-based, newest card on top, timestamps back.** — partly **4/5** (4 partly, 1 done)  
  Rail ordering newest-first for Live and days; timestamps present on Live (4:18 PM) but not on grouped cards  
  **Fix:** Verify newest-first and timestamps in the list
- 🟡 **B6 Any agent can add a card to the top of the list at once** — partly **3/5** (3 partly, 2 done)  
  New-card composer exists in rail ('say anything - it starts a new card'); agent-side create_card MCP tool exists. Instant top insertion not exercised.  
  **Fix:** Create a card with create_card and watch it appear at the top at once
- 🟡 **B8 Cards update programmatically** — partly **4/5** (4 partly)  
  Live page shows running agents that change (8 working, 6 working at two loads), so it updates; the flashing-card behaviour not observed  
  **Fix:** Open the Servex card while an agent runs and confirm it shows in-flight state
- 🟡 **B9 Segmented progress bar: N equal segments turn green as steps finish; owner can tell what the bars mean.** — partly **4/5** (4 partly, 1 done)  
  Rail cards show segmented bars (Live card has 2 segments, orange), group cards a solid bar; not the N-segment green shape everywhere.  
  **Fix:** Segment the group-row bars; turn done segments green
- 🟡 **B11 Rounded corners: a gap between cards, or rounding only on the whole stack.** — partly **4/5** (4 partly, 1 done)  
  Task rows on the card page are separate boxes with gaps between them; the rail rows are flush with no gap  
  **Fix:** Rail rows are flush with no gap: round only the stack, or add a gap
- 🟡 **B13 Finished cards need not stay in the list** — partly **4/5** (4 partly)  
  Rail hides archived cards (archived (16) link at the bottom); finished cards still listed under Cards (327)  
  **Fix:** Hide landed cards from the main list by default (archive exists)
- 🟡 **B15 Back-button icon on the about page is aligned.** — partly **3/5** (3 partly, 1 not done)  
  About page back-button icon not looked at  
  **Fix:** Screenshot the about page back button and align the icon
- 🟡 **B16 Live chat/text uses a comfortable reading width; no independently scrolling narrow areas.** — partly **4/5** (4 partly, 1 done)  
  Fast assistant chat is a narrow box ~360px inside a 1.4k column; Working-on text at right is wide-ish and cut off at page bottom (right column overflows the viewport).  
  **Fix:** Remove the nested scrollers (ai2-rows, chatbox-log); cap the chat width
- 🟡 **C3 Page MCP: change layouts, add content, create pages and sub-pages; in the dev-server MCP or Servex MCP.** — partly **3/5** (2 done, 3 partly)  
  mcp__servex__create_page, list_pages, read_page, set_layout, place tools exist in this session, so a page MCP exists. Not tried.  
  **Fix:** Try create_page and set_layout once on a scratch page
- 🟡 **C4 Page system upgrade: simpler, live JSONL pages documented, core pages page less wordy.** — partly **4/5** (4 partly)  
  Commit 15291daa shortened core/Page docs; live JSONL pages appear used (ai/2026/09/24/ai-dashboard/page.jsonl)
- 🟡 **C6 CSS audit by directory with a tree view of CSS amounts, proposals to reduce; tokens + container queries on columns.** — partly **4/5** (4 partly, 1 done)  
  ai/2026-09-25/css-audit exists, 'landed: explorer, ranked plan and padding curves; up to 8,599 of 35,769 lines can go' per Live note  
  **Fix:** Open css-audit and confirm the tree view page exists
- 🟡 **D1 Never pop up a Node process: hidden flag, told to everyone.** — partly **5/5** (5 partly)  
  Rule is in the minion and code skills; windowsHide is set in Server/health, on-landing, Shot, Start, Whisper, worktree-up. Other Server files (AILogs, Ask, Assistant, Ca…  
  **Fix:** Finish the sweep: 16 files still spawn without windowsHide (in todo.md)
- 🟡 **D4 Skills are instructive, not restrictive ("could/should", not "have to" unless a law).** — partly **5/5** (5 partly)  
  Skills still contain 'must' or 'have to' (mastermind 8, fork-claude-session 6, code 4, ui-test 3, sub-mastermind 3).  
  **Fix:** Soften non-law must/never lines to should/could
- 🟡 **D7 Monitor: watcher of console errors per worktree, layout check with screenshots before committing.** — partly **4/5** (1 done, 4 partly)  
  Server/layout-check.mjs and padding-check.mjs exist and minion skill mentions the landing layout check; no per-worktree console-error watcher found in skills  
  **Fix:** Add a per-worktree console-error watcher line to the servex-mastermind skill (health-supervisor exists)

## Done

- ✅ **B1 Live is the default view** 5/5 — Bare /framework/ai2/ redirects to /ai2/live/; Live toggle button beside +New card (shot). 'New card' pill on …
- ✅ **B2 Live preview text is useful, not "16 running, four working" or a paragraph of error text.** 3/5 — Live rail row reads '8 working · 2 tasks running'; Live page lists named agents with role and topic, no error…
- ✅ **B4 Usage is in the left-nav header, shows three windows (five hour, weekly Fable, weekly all) with on-pace markers, and matches the real usage.** 4/5 — Three bars 5-hour 5%, weekly Fable 0%, weekly all 8% at the top of the rail
- ✅ **B7 The composer header (text box, send, overview, New card) is tidy: aligned, clear hierarchy; New card starts transcribing.** 4/5 — Composer: text box + Send, then New card, Live, auto-transcribe, overview link, card count; tidy and aligned …
- ✅ **B10 Token / dollar cost on previews and detail pages, subtasks summed into the parent.** 4/5 — Group rows show $25.55+ etc; card page shows '2 agents · $13.44+ mastermind $4.53 · minions $8.92' per task, …
- ✅ **B14 Every view a click reaches is routed** 5/5 — Clicking rail rows changes the URL: /framework/ai2/2026/09/24/system-design/ and /framework/ai2/live/; commit…
- ✅ **C1 File-explorer widget: file tree, click a file, see highlighted code (in the demo system), maybe two columns.** 3/5 — http://monorepo.localhost/framework/ext/files/ shows a file tree with index.html, app.js, page.js and highlig…
- ✅ **C2 Clarity agent: checks every proposed/finished task for clarity, managed by the Servex mastermind.** 4/5 — .claude/skills/clarity/ (SKILL.md, flags.jsonl, improvements.md); Server/clarity.mjs
- ✅ **D3 Pace usage: stay under pace early in the week; downgrade new tasks to Sonnet until caught up.** 5/5 — mastermind SKILL.md:136 weekly window stay under pace early; :151 step down the ladder to Sonnet
- ✅ **D5 Mastermind: batch related tasks, cross-module = one worktree with two teams.** 5/5 — mastermind SKILL.md:49-54 related tasks batch into one mastermind and worktree; two modules = two masterminds…
- ✅ **D6 Concurrency: never block, be notified.** 5/5 — minion, mastermind and auditor skills state concurrency: never block, be notified.
- ✅ **D8 Servex mastermind does no routine work; oversees audits.** 5/5 — servex-mastermind SKILL.md says it does no routine work and oversees audits.
- ✅ **D9 Anything not asked for goes into ai/todo.md; ai/readme.md points there.** 5/5 — ai/todo.md exists (105 lines) and ai/readme.md points to it line 7 and 21.
- ✅ **D11 Route everything is noted in CLAUDE.md and the page skill.** 5/5 — CLAUDE.md line 18 'Route everything'; new-page SKILL.md mentions routing.
- ✅ **D12 Servex can be restarted without the owner (sustain script).** 5/5 — Servex/sustain.mjs exists, referenced in mastermind SKILL.md:198 and servex-mastermind
- ✅ **D13 Assistant structure: a fast assistant per card, master assistant, mastermind, each with an identifier when they message.** 4/5 — skills assistant, master-assistant, mastermind exist; messages show 'Manager · manager-ai-dashboard', 'Master…
- ✅ **D14 Owner can message a mastermind from the browser Live tab.** 4/5 — /framework/ai2/live/ at 3440 has a chat column 'talk to the assistant about what is running' plus Fast assist…

## Extra asks the checkers found

- Landed preview must not print object text — **not done**: '[object Object],[object Object]' in the Live entry of the Landed list.
- Live right column not cut off at viewport bottom — **partly**: Note text runs past 1080px in the third column; page itself scrolls (.page 4784>1080).
- AI 2 empty state should not say 'Pick something on the left' — **not done**: shots/council-4-ai2-1920.png
- AI page (v/3) still crowded: 40 chips of agents above the fold — **partly**: shots/council-4-live-1920.png
- Owner asked that chat replies use the right-hand column with newest message pinned — **done**: Card page at 3440 has a right chat column with role labels above each message (shots/council-5-A3-card-3440.png)

## Caveats

- Checkers took a fast pass (about $0.50 each). A row with a 3/5 or lower vote, or "nobody proved it", needs a human look.
- Nobody scanned the ~200 lines spoken on cards in depth; the extras above are all they found.
- Every vote with its evidence: `votes/council-1..5.json`. The asks: [asks.md](asks.md) · words: [owner-words.md](owner-words.md), [ai2-prompts.md](ai2-prompts.md) · brief: [requirements.md](requirements.md).
