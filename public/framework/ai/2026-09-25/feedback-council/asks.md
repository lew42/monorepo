# The asks (one line each, from the owner's words)

Source words: `owner-words.md` (numbers below = its message numbers "#") and `ai2-prompts.md`.
`x` = how many times the owner said it. Newest / most-repeated first.

## A. Said the most

- **A1 Live card loads fast, or is removed** x7 — "Clicking on the live card takes like four seconds to load. I've mentioned this seven times. Fucking fix it already. Or remove the live card if it can't be fixed." (#49, #50)
- **A2 Show, don't tell; words after the picture** x5 — "I want to see. I don't want to read things… three-page response makes me want to throw up." Files via the file widget, objects as live instances, a folder as a path over its contents. In CLAUDE.md, the `content` skill, and known to the Servex mastermind. (#49, #51, #53, #55)
- **A3 Layouts work at 3440, not a mobile layout stretched** x5 — "50% of the page is just empty space"; overview list "two to three words per line"; live tab "wonky"; detail pages "still too small, should fill the rest of the page." (#16, #31, #39, #40, #49)
- **A4 Page padding is right** x4 — "put padding on the goddamn page. This about page has zero padding"; ai2-full card 18px in a 1350px card. Use the default clamped `--pad`, reuse existing classes, no new CSS. (#44, #45, #51)
- **A5 Detail pages scroll** x3 — "this page doesn't scroll" (…/Panel/md/doc/decisions/, …/ai-dashboard/). (#20, #32, #35)
- **A6 Card content is clear at a glance** x3 — "every card should help me understand where we were, where we're going": done ticked, to-dos unticked, one-line state, objects shown as live instances, linkable names; no verbose logs. (#41, #49, #54)

## B. AI 2 dashboard and Live

- **B1 Live is the default view** — "when you first click on the AI2 dashboard, it goes to the live tab"; a toggle by the New-card button; a "new card" button appears when scrolled. (#54)
- **B2 Live preview text is useful, not "16 running, four working" or a paragraph of error text.** (#49)
- **B3 Clicking a Live agent opens a top-aligned column, not a tab with white space.** (#49)
- **B4 Usage is in the left-nav header, shows three windows (five hour, weekly Fable, weekly all) with on-pace markers, and matches the real usage.** (#8, #29, #54)
- **B5 The list is time-based, newest card on top, timestamps back.** (#47, #48)
- **B6 Any agent can add a card to the top of the list at once** ("create a card that appears at the top of my list… right now go"). (#48, #49)
- **B7 The composer header (text box, send, overview, New card) is tidy: aligned, clear hierarchy; New card starts transcribing.** (#48)
- **B8 Cards update programmatically** (the flashing Servex card shows what is in flight when opened). (#42)
- **B9 Segmented progress bar: N equal segments turn green as steps finish; owner can tell what the bars mean.** (#41, #44)
- **B10 Token / dollar cost on previews and detail pages, subtasks summed into the parent.** (#27, #31)
- **B11 Rounded corners: a gap between cards, or rounding only on the whole stack.** (#42)
- **B12 AI 2 works without Servex** (a static dashboard must not need it). (#52)
- **B13 Finished cards need not stay in the list** ("if they're finished, I don't even know if they need to still be in this list"). (#47)
- **B14 Every view a click reaches is routed** (about link changed the page but not the URL; reload loses your place). (#51)
- **B15 Back-button icon on the about page is aligned.** (#51)
- **B16 Live chat/text uses a comfortable reading width; no independently scrolling narrow areas.** (#8, #16)

## C. Tools the owner asked for

- **C1 File-explorer widget: file tree, click a file, see highlighted code (in the demo system), maybe two columns.** Mastermind spawned. (#51, #55)
- **C2 Clarity agent: checks every proposed/finished task for clarity, managed by the Servex mastermind.** (#54)
- **C3 Page MCP: change layouts, add content, create pages and sub-pages; in the dev-server MCP or Servex MCP.** "One of the top priorities." (#46)
- **C4 Page system upgrade: simpler, live JSONL pages documented, core pages page less wordy.** (#46)
- **C5 Ready agent per module (short readme as the way in, no old bloated agents).** (#11, #46)
- **C6 CSS audit by directory with a tree view of CSS amounts, proposals to reduce; tokens + container queries on columns.** (#45)
- **C7 Feedback council: five minions check everything was done properly.** (#55, this task)
- **C8 Audit of the week's tasks: a minion per prompt, finds unfinished and half-finished work.** (#24)

## D. Rules the owner wanted written into the skills / docs

- **D1 Never pop up a Node process: hidden flag, told to everyone.** (#34, #47) — todo.md has 16 files left.
- **D2 Always consider which branch each agent/owner is looking at.** (#36)
- **D3 Pace usage: stay under pace early in the week; downgrade new tasks to Sonnet until caught up.** (#11, #29, #30, #33, #38)
- **D4 Skills are instructive, not restrictive ("could/should", not "have to" unless a law).** (#28)
- **D5 Mastermind: batch related tasks, cross-module = one worktree with two teams.** (#9)
- **D6 Concurrency: never block, be notified.** (#6, #10, #14)
- **D7 Monitor: watcher of console errors per worktree, layout check with screenshots before committing.** (#10, #28)
- **D8 Servex mastermind does no routine work; oversees audits.** (#43)
- **D9 Anything not asked for goes into ai/todo.md; ai/readme.md points there.** (#31)
- **D10 Layout skill covers border radius and gaps; approved layouts most of the time, checked at four widths.** (#40, #42)
- **D11 Route everything is noted in CLAUDE.md and the page skill.** (#51)
- **D12 Servex can be restarted without the owner (sustain script).** (#7, #10)
- **D13 Assistant structure: a fast assistant per card, master assistant, mastermind, each with an identifier when they message.** (#22, #23)
- **D14 Owner can message a mastermind from the browser Live tab.** (#13)

## E. Not yet extracted

`ai2-prompts.md` holds ~200 further lines the owner spoke on cards (dictation, chat, layout-columns, prompt-mechanics, live). Each minion also reports **extra asks** it finds there that are not A–D, with the same verdict.
