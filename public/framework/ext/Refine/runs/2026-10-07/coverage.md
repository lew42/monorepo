# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | [sessions/2026/10/07/feedback-council/checker-1/requirements.md] | ask #1 |
| S2 | Checker checker-1 — feedback council (run 2026-10-07/feedback-council) | ask #1 |
| S3 | You are checker checker-1, one of 5 checkers verifying open owner asks against the live site. | ask #1 |
| S4 | Read first | ask #2 |
| S5 | Card dir (raw words): public/framework/ai/council/ | ask #2 |
| S6 | Full ask history: public/framework/ai/council/asks.jsonl (latest line per id wins) | ask #2 |
| S7 | This run: public/framework/ai/sessions/2026/10/07/feedback-council/ | ask #2 (thin) |
| S8 | No new words landed today (words.jsonl is empty); check only the asks below, nothing to extract. | ask #2 |
| S9 | Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer) | ask #3 |
| S10 | A1: Live card loads fast, or is removed (last verdict: partly; last evidence: Headless cold load of /framework/ai2/ lands on /live/ and renders in ~2.7s at 1920 and 3440 (includes app boot); the in-app click was not timed because my selector missed the button. Shot shots/council-3-A3-ai2-3440.png. Card claims ~0.5s.) | ask #9 |
| S11 | A2: Show, don't tell; words after the picture (last verdict: partly; last evidence: CLAUDE.md 'Show it with the widget' plus content skill; AI 2 cards still show long text blocks, e.g. right column of Live at 3440 is a long bulleted assistant reply (shots/council-4-livecard-3440.png)) | ask #14 |
| S12 | A3: Layouts work at 3440, not a mobile layout stretched (last verdict: partly; last evidence: Card page at 3440 has rail + wide main + right chat column, no big empty area (shots/council-5-A3-card-3440.png). Files overview page at 3440 has a nearly empty left column with a tall empty card and text stuck in a 400px column (shots/council-5-C1-files-3440.png)) | ask #20 |
| S13 | A4: Page padding is right (last verdict: partly; last evidence: Both shots show content inset from the rail; main element padding measured 0px because padding sits on inner columns. ai-dashboard route rendered only 64 chars (title 'lew42') so its padding is unverified.) | ask #21 |
| S14 | A5: Detail pages scroll (last verdict: partly; last evidence: At 1920x700, /framework/core/Panel/md/doc/decisions/ and /framework/ai/ai-dashboard/ both returned 200 with NO element taller than its box, so they neither overflow nor scroll in my probe: either the content fits, or it is clipped. /framework/ai2/live/ has a working inner scroller.) | ask #23 |
| S15 | A6: Card content is clear at a glance (last verdict: partly; last evidence: Landed card 'Live' shows '[object Object],[object Object]...' as its preview line (council-3-A1-live-3440.png); other cards show headline + link.) | ask #8 |
| S16 | B11: Rounded corners: a gap between cards, or rounding only on the whole stack. (last verdict: partly; last evidence: Task rows on the card page are separate boxes with gaps between them; the rail rows are flush with no gap) | ask #13 |
| S17 | B12: AI 2 works without Servex (last verdict: partly; last evidence: Live page needs Servex by design (agents are Servex's); static behaviour not tested) | ask #10 |
| S18 | B13: Finished cards need not stay in the list (last verdict: partly; last evidence: Rail hides archived cards (archived (16) link at the bottom); finished cards still listed under Cards (327)) | ask #12 |
| S19 | B15: Back-button icon on the about page is aligned. (last verdict: partly; last evidence: About page back-button icon not looked at) | ask #7 |
| S20 | Job | ask #4 |
| S21 | For EVERY ask above, LOOK at the real result and give one verdict: done / partly / not done / done-but-wrong, one line of evidence (URL, screenshot path, file:line), and for anything not done the smallest fix. | ask #4 |
| S22 | Prove before you call something missing. Search the repo (git log, grep, .claude/skills/, CLAUDE.md) before writing "not done". | ask #4 |
| S23 | The live site: http://monorepo.localhost (never http://localhost/). | ask #1 |
| S24 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs; no mcp__site__eval on tabs the owner has open). | ask #5 |
| S25 | Time the Live card load. | ask #5 |
| S26 | Check scroll on named URLs with real overflow measures. | ask #5 |
| S27 | No window may pop up: windowsHide: true, -WindowStyle Hidden. | ask #5 |
| S28 | Do NOT edit any repo file. | ask #6 |
| S29 | Scratch goes in your scratchpad; screenshots to public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-1-<ask>.png only for evidence shots (keep <=12 total). | ask #6 |
| S30 | Return | ask #6 (thin) |
| S31 | Write ONE json file public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-1.json: {"name":"checker-1","votes":{"<id>":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}} | ask #6 |
| S32 | Cover every id listed above. | ask #6 |
| S33 | Then reply "done" in one line. | ask #6 |
| S34 | Budget about $2: be quick, do not over-explore. | ask #6 |
| S35 | Never write the owner's name anywhere. | ask #6 |
| S36 | [sessions/2026/10/07/feedback-council/checker-2/requirements.md] | ask #1 |
| S37 | Checker checker-2 — feedback council (run 2026-10-07/feedback-council) | ask #1 |
| S38 | You are checker checker-2, one of 5 checkers verifying open owner asks against the live site. | ask #1 |
| S39 | Read first | ask #2 |
| S40 | Card dir (raw words): public/framework/ai/council/ | ask #2 |
| S41 | Full ask history: public/framework/ai/council/asks.jsonl (latest line per id wins) | ask #2 |
| S42 | This run: public/framework/ai/sessions/2026/10/07/feedback-council/ | ask #2 (thin) |
| S43 | No new words landed today (words.jsonl is empty); check only the asks below, nothing to extract. | ask #2 |
| S44 | Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer) | ask #3 |
| S45 | B16: Live chat/text uses a comfortable reading width; no independently scrolling narrow areas. (last verdict: partly; last evidence: Fast assistant chat is a narrow box ~360px inside a 1.4k column; Working-on text at right is wide-ish and cut off at page bottom (right column overflows the viewport).) | ask #26 |
| S46 | B3: Clicking a Live agent opens a top-aligned column, not a tab with white space. (last verdict: partly; last evidence: Clicking Live card lands on /ai2/live/, a full page with two columns at 1920 and 3440; the click-an-agent-opens-a-column path was not exercised) | ask #11 |
| S47 | B5: The list is time-based, newest card on top, timestamps back. (last verdict: partly; last evidence: Rail ordering newest-first for Live and days; timestamps present on Live (4:18 PM) but not on grouped cards) | ask #15 |
| S48 | B6: Any agent can add a card to the top of the list at once (last verdict: partly; last evidence: New-card composer exists in rail ('say anything - it starts a new card'); agent-side create_card MCP tool exists. Instant top insertion not exercised.) | ask #16 |
| S49 | B8: Cards update programmatically (last verdict: partly; last evidence: Live page shows running agents that change (8 working, 6 working at two loads), so it updates; the flashing-card behaviour not observed) | ask #17 |
| S50 | B9: Segmented progress bar: N equal segments turn green as steps finish; owner can tell what the bars mean. (last verdict: partly; last evidence: Rail cards show segmented bars (Live card has 2 segments, orange), group cards a solid bar; not the N-segment green shape everywhere.) | ask #18 |
| S51 | C3: Page MCP: change layouts, add content, create pages and sub-pages; in the dev-server MCP or Servex MCP. (last verdict: partly; last evidence: mcp__servex__create_page, list_pages, read_page, set_layout, place tools exist in this session, so a page MCP exists. Not tried.) | ask #45 |
| S52 | C4: Page system upgrade: simpler, live JSONL pages documented, core pages page less wordy. (last verdict: partly; last evidence: Commit 15291daa shortened core/Page docs; live JSONL pages appear used (ai/2026/09/24/ai-dashboard/page.jsonl)) | ask #46 |
| S53 | C5: Ready agent per module (short readme as the way in, no old bloated agents). (last verdict: partly; last evidence: mcp__servex__readme_modules tool exists (spawn a mastermind across named modules' readmes) and sub-mastermind SKILL.md references it, but there is still no single short per-module 'ready agent' skill replacing old bloated agents.) | ask #48 |
| S54 | C6: CSS audit by directory with a tree view of CSS amounts, proposals to reduce; tokens + container queries on columns. (last verdict: partly; last evidence: ai/sessions/2026/09/25/css-audit/css-audit exists, 'landed: explorer, ranked plan and padding curves; up to 8,599 of 35,769 lines can go' per Live note) | ask #47 |
| S55 | Job | ask #4 |
| S56 | For EVERY ask above, LOOK at the real result and give one verdict: done / partly / not done / done-but-wrong, one line of evidence (URL, screenshot path, file:line), and for anything not done the smallest fix. | ask #4 |
| S57 | Prove before you call something missing. Search the repo (git log, grep, .claude/skills/, CLAUDE.md) before writing "not done". | ask #4 |
| S58 | The live site: http://monorepo.localhost (never http://localhost/). | ask #1 |
| S59 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs; no mcp__site__eval on tabs the owner has open). | ask #5 |
| S60 | Time the Live card load. | ask #5 |
| S61 | Check scroll on named URLs with real overflow measures. | ask #5 |
| S62 | No window may pop up: windowsHide: true, -WindowStyle Hidden. | ask #5 |
| S63 | Do NOT edit any repo file. | ask #6 |
| S64 | Scratch goes in your scratchpad; screenshots to public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-2-<ask>.png only for evidence shots (keep <=12 total). | ask #6 |
| S65 | Return | ask #6 (thin) |
| S66 | Write ONE json file public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-2.json: {"name":"checker-2","votes":{"<id>":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}} | ask #6 |
| S67 | Cover every id listed above. | ask #6 |
| S68 | Then reply "done" in one line. | ask #6 |
| S69 | Budget about $2: be quick, do not over-explore. | ask #6 |
| S70 | Never write the owner's name anywhere. | ask #6 |
| S71 | [sessions/2026/10/07/feedback-council/checker-3/requirements.md] | ask #1 |
| S72 | Checker checker-3 — feedback council (run 2026-10-07/feedback-council) | ask #1 |
| S73 | You are checker checker-3, one of 5 checkers verifying open owner asks against the live site. | ask #1 |
| S74 | Read first | ask #2 |
| S75 | Card dir (raw words): public/framework/ai/council/ | ask #2 |
| S76 | Full ask history: public/framework/ai/council/asks.jsonl (latest line per id wins) | ask #2 |
| S77 | This run: public/framework/ai/sessions/2026/10/07/feedback-council/ | ask #2 (thin) |
| S78 | No new words landed today (words.jsonl is empty); check only the asks below, nothing to extract. | ask #2 |
| S79 | Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer) | ask #3 |
| S80 | C8: Audit of the week's tasks: a minion per prompt, finds unfinished and half-finished work. (last verdict: partly; last evidence: Landed: 176 of 184 tasks audited, one Sonnet minion each (6:05 PM).) | ask #49 |
| S81 | D4: Skills are instructive, not restrictive ("could/should", not "have to" unless a law). (last verdict: partly; last evidence: Skills still contain 'must' or 'have to' (mastermind 8, fork-claude-session 6, code 4, ui-test 3, sub-mastermind 3).) | ask #43 |
| S82 | D7: Monitor: watcher of console errors per worktree, layout check with screenshots before committing. (last verdict: partly; last evidence: health-supervisor.mjs exists and is named in servex-mastermind SKILL.md:31 and sub-mastermind SKILL.md:207, but sub-mastermind SKILL.md itself says the per-worktree watcher does not actually start while the main one runs (one global lock) — documented as a known gap, not fixed.) | ask #50 |
| S83 | E1: Padding should be opt-in, not default: add a .pad class you add where you need it (e.g. each tab's content area), rather than fighting off a default page padding. (last verdict: not checked; last evidence: (none)) | ask #22 |
| S84 | E10: Give the fast and smart assistants each a chosen icon that doubles as their avatar and username inline next to each message (e.g. two arrows for Fast, a brain for Smart), instead of separate labeled blocks. (last verdict: not checked; last evidence: (none)) | ask #31 |
| S85 | E11: Add lightweight reactions to chat: the fast assistant can send a quick emoji (thumbs up, check mark) instead of a sentence when a simple acknowledgment is enough, falling back to one if the smart assistant hasn't replied in time. (last verdict: not checked; last evidence: (none)) | ask #32 |
| S86 | E12: When the owner references a specific thing in chat, keep it visible as a context card (the page's icon and name at the top, the related content inside) instead of only describing it in prose. (last verdict: not checked; last evidence: (none)) | ask #33 |
| S87 | E13: Build a standing, browsable catalog of the layout and navigation patterns actually used across every page on the site (not a one-off audit), so the systems can be browsed by usage. (last verdict: not checked; last evidence: (none)) | ask #24 |
| S88 | E14: Make sure tasks never get lost when many agents are working: every task/card should visibly nest under its parent card with a recognizable icon, so the owner can always see what belongs to what. (last verdict: not checked; last evidence: (none)) | ask #19 |
| S89 | E15: Fix the ask-by-voice sheet's header: it's misaligned with too much vertical space, drop the redundant back button (keep the X), make the header compact, and merge the settings gear and the overflow "more" button into one menu so the chat gets the remaining space. (last verdict: not checked; last evidence: (none)) | ask #35 |
| S90 | Job | ask #4 |
| S91 | For EVERY ask above, LOOK at the real result and give one verdict: done / partly / not done / done-but-wrong, one line of evidence (URL, screenshot path, file:line), and for anything not done the smallest fix. | ask #4 |
| S92 | Prove before you call something missing. Search the repo (git log, grep, .claude/skills/, CLAUDE.md) before writing "not done". | ask #4 |
| S93 | The live site: http://monorepo.localhost (never http://localhost/). | ask #1 |
| S94 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs; no mcp__site__eval on tabs the owner has open). | ask #5 |
| S95 | Time the Live card load. | ask #5 |
| S96 | Check scroll on named URLs with real overflow measures. | ask #5 |
| S97 | No window may pop up: windowsHide: true, -WindowStyle Hidden. | ask #5 |
| S98 | Do NOT edit any repo file. | ask #6 |
| S99 | Scratch goes in your scratchpad; screenshots to public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-3-<ask>.png only for evidence shots (keep <=12 total). | ask #6 |
| S100 | Return | ask #6 (thin) |
| S101 | Write ONE json file public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-3.json: {"name":"checker-3","votes":{"<id>":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}} | ask #6 |
| S102 | Cover every id listed above. | ask #6 |
| S103 | Then reply "done" in one line. | ask #6 |
| S104 | Budget about $2: be quick, do not over-explore. | ask #6 |
| S105 | Never write the owner's name anywhere. | ask #6 |
| S106 | [sessions/2026/10/07/feedback-council/checker-4/requirements.md] | ask #1 |
| S107 | Checker checker-4 — feedback council (run 2026-10-07/feedback-council) | ask #1 |
| S108 | You are checker checker-4, one of 5 checkers verifying open owner asks against the live site. | ask #1 |
| S109 | Read first | ask #2 |
| S110 | Card dir (raw words): public/framework/ai/council/ | ask #2 |
| S111 | Full ask history: public/framework/ai/council/asks.jsonl (latest line per id wins) | ask #2 |
| S112 | This run: public/framework/ai/sessions/2026/10/07/feedback-council/ | ask #2 (thin) |
| S113 | No new words landed today (words.jsonl is empty); check only the asks below, nothing to extract. | ask #2 |
| S114 | Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer) | ask #3 |
| S115 | E16: Chat should auto-scroll to the newest message by default, stop doing so once the owner scrolls up, and show a "jump to bottom" button to return. (last verdict: not checked; last evidence: (none)) | ask #28 |
| S116 | E17: Add a "clean transcribe" mode toggle that sends dictation straight into the chat as it's spoken, with no separate editable text area, and consider making it the default. (last verdict: not checked; last evidence: (none)) | ask #38 |
| S117 | E18: Fix duplicate messages: assistant replies (and sometimes the owner's own transcriptions) are appearing twice in the same chat or card. (last verdict: not checked; last evidence: (none)) | ask #27 |
| S118 | E19: Restore the microphone start/stop sound cue; it stopped playing, so there's no audio signal that listening started or ended when not looking at the screen. (last verdict: not checked; last evidence: (none)) | ask #36 |
| S119 | E2: On the Now card, chat stays a persistent right sidebar; the tiny top tabs should not include chat. (last verdict: not checked; last evidence: (none)) | ask #42 |
| S120 | E20: Replace the fixed-height audio level bar with a small pulsing dot that grows with volume, floats anywhere (e.g. bottom-right corner), and can be tapped to reopen the dictation sheet. (last verdict: not checked; last evidence: (none)) | ask #39 |
| S121 | E21: Build a text-to-speech "Voice" class/system, pairing with the existing Whisper dictation, with streaming output, switchable voices, and conversational timing rules (don't interrupt too soon) for a full voice-chat mode. (last verdict: not checked; last evidence: (none)) | ask #51 |
| S122 | E22: When a reply mentions a card or task, it must be a real clickable hyperlink, not plain text the owner has to copy and paste to navigate to. (last verdict: not checked; last evidence: (none)) | ask #29 |
| S123 | E23: Closing the dictation sheet should not stop the microphone from listening, and opening it can auto-start the mic; the two states (listening vs. sheet visible) should be independent. (last verdict: not checked; last evidence: (none)) | ask #37 |
| S124 | E24: Set up remote/mobile access to the site through a Cloudflare Tunnel (preferred over Tailscale or a new paid service, since Cloudflare is already in use) instead of relying on the local Wi-Fi IP. (last verdict: not checked; last evidence: (none)) | ask #52 |
| S125 | Job | ask #4 |
| S126 | For EVERY ask above, LOOK at the real result and give one verdict: done / partly / not done / done-but-wrong, one line of evidence (URL, screenshot path, file:line), and for anything not done the smallest fix. | ask #4 |
| S127 | Prove before you call something missing. Search the repo (git log, grep, .claude/skills/, CLAUDE.md) before writing "not done". | ask #4 |
| S128 | The live site: http://monorepo.localhost (never http://localhost/). | ask #1 |
| S129 | Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs; no mcp__site__eval on tabs the owner has open). | ask #5 |
| S130 | Time the Live card load. | ask #5 |
| S131 | Check scroll on named URLs with real overflow measures. | ask #5 |
| S132 | No window may pop up: windowsHide: true, -WindowStyle Hidden. | ask #5 |
| S133 | Do NOT edit any repo file. | ask #6 |
| S134 | Scratch goes in your scratchpad; screenshots to public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-4-<ask>.png only for evidence shots (keep <=12 total). | ask #6 |
| S135 | Return | ask #6 (thin) |
| S136 | Write ONE json file public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-4.json: {"name":"checker-4","votes":{"<id>":{"v":"done\|partly\|not done\|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}} | ask #6 |
| S137 | Cover every id listed above. | ask #6 |
| S138 | Then reply "done" in one line. | ask #6 |
| S139 | Budget about $2: be quick, do not over-explore. | ask #6 |
| S140 | Never write the owner's name anywhere. | ask #6 |
| S141 | [sessions/2026/10/07/feedback-council/checker-5/requirements.md] | ask #1 |
| S142 | Checker checker-5 — feedback council (run 2026-10-07/feedback-council) | ask #1 |
| S143 | You are checker checker-5, one of 5 checkers verifying open owner asks against the live site. | ask #1 |
| S144 | Read first | ask #2 |
| S145 | Card dir (raw words): public/framework/ai/council/ | ask #2 |
| S146 | Full ask history: public/framework/ai/council/asks.jsonl (latest line per id wins) | ask #2 |
| S147 | This run: public/framework/ai/sessions/2026/10/07/feedback-council/ | ask #2 (thin) |
| S148 | No new words landed today (words.jsonl is empty); check only the asks below, nothing to extract. | ask #2 |
| S149 | Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer) | ask #3 |
| S150 | E25: Support threaded replies to one specific card or comment, not only appending to the general chat stream. (last verdict: not checked; last evidence: (none)) | ask #34 |
| S151 | E3: The Now card's tiny top tabs should be real routed pages using the page route mechanism, not hash identifiers. (last verdict: not checked; last evidence: (none)) | ask #41 |
| S152 | E4: The layout/padding skill should be invoked every time any layout is designed, possibly folded into the paging skill since paging already covers layout and navigation. (last verdict: not checked; last evidence: (none)) | ask #44 |
| S153 | E5: The dictation-to-chat pipeline is too slow: text took 4-5 seconds to appear after transcribing, and the assistant's response took about 5 more seconds; speed up both. (last verdict: not checked; last evidence: (none)) | ask #40 |
| S154 | E6: Selecting an element (e.g. a code block) through the hamburger/element picker shows a context pill but the assistant says it never sees that selected context when the message is sent; wire the selection through to the prompt. (last verdict: not checked; last evidence: (none)) | ask #30 |
| S155 | E7: Build a three-column layout explorer: left = layout categories (one/tw | ask #25 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "five", "s106", "s107", "s108", "s128", "s141", "s142", "s143" — not in the transcript at all |
| #2 | thin citation | cites S7 but shares no wording with it — the citation may not reflect what S7 actually says |
| #2 | thin citation | cites S42 but shares no wording with it — the citation may not reflect what S42 actually says |
| #2 | thin citation | cites S77 but shares no wording with it — the citation may not reflect what S77 actually says |
| #2 | thin citation | cites S112 but shares no wording with it — the citation may not reflect what S112 actually says |
| #2 | thin citation | cites S147 but shares no wording with it — the citation may not reflect what S147 actually says |
| #2 | new words | "count", "s109", "s110", "s111", "s112", "s113", "s144", "s145", "s146", "s147", "s148" — not in the transcript at all |
| #3 | new words | "verifies", "s114", "s149" — not in the transcript at all |
| #4 | new words | "s125", "s126", "s127" — not in the transcript at all |
| #5 | new words | "s129", "s130", "s131", "s132" — not in the transcript at all |
| #6 | thin citation | cites S30 but shares no wording with it — the citation may not reflect what S30 actually says |
| #6 | thin citation | cites S65 but shares no wording with it — the citation may not reflect what S65 actually says |
| #6 | thin citation | cites S100 but shares no wording with it — the citation may not reflect what S100 actually says |
| #6 | thin citation | cites S135 but shares no wording with it — the citation may not reflect what S135 actually says |
| #6 | new words | "most", "s100", "s101", "s102", "s103", "s104", "s105", "s133", "s134", "s135", "s136", "s137", "s138", "s139", "s140" — not in the transcript at all |
| #8 | new words | "which" — not in the transcript at all |
| #9 | strength word | uses "must", not found in the cited sentence(s) |
| #10 | new words | "whether", "untested", "decide", "acceptable" — not in the transcript at all |
| #12 | new words | "ones" — not in the transcript at all |
| #14 | new words | "leads", "come" — not in the transcript at all |
| #17 | new words | "seen" — not in the transcript at all |
| #20 | strength word | uses "must", not found in the cited sentence(s) |
| #22 | new words | "such" — not in the transcript at all |
| #23 | strength word | uses "must", not found in the cited sentence(s) |
| #23 | new words | "until" — not in the transcript at all |
| #25 | new words | "s155" — not in the transcript at all |
| #27 | new words | "s117" — not in the transcript at all |
| #28 | new words | "s115" — not in the transcript at all |
| #29 | new words | "s122" — not in the transcript at all |
| #30 | new words | "s154" — not in the transcript at all |
| #34 | new words | "attach", "s150" — not in the transcript at all |
| #36 | new words | "audible", "away", "s118" — not in the transcript at all |
| #37 | new words | "s123" — not in the transcript at all |
| #38 | new words | "s116" — not in the transcript at all |
| #39 | new words | "becomes", "s120" — not in the transcript at all |
| #40 | new words | "s153" — not in the transcript at all |
| #41 | new words | "become", "s151" — not in the transcript at all |
| #42 | new words | "s119" — not in the transcript at all |
| #44 | new words | "might", "s152" — not in the transcript at all |
| #51 | new words | "s121" — not in the transcript at all |
| #52 | new words | "phone", "s124" — not in the transcript at all |
