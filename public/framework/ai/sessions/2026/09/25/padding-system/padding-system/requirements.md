# Why padding keeps going missing — fix the system

Card: `public/framework/ai/2026/09/25/why-padding-keeps-going-missing/` (read its page.jsonl; the owner's raw words are on `public/framework/ai/2026/09/25/now/page.jsonl`).

## The owner, verbatim (2026-09-25, on the Now card)

> Take a screenshot of this now card. It has zero padding. ... It's right at the border and then the three cards with a big number on them, to do, delivered, and all. Those each are also full left. The checkboxes below are full left. The button below is full left. The tab content area needs padding. Just add that page. had class to the content area for each tab.

> and maybe figure out why the mastermind hasn't figured out a layout system that properly works. Like we need to ask the question, how wide is this thing, Does it need padding? How does it interact? What is the system to identify padding correctly? Like why are we still missing padding? The padding, the layout skills should be invoked every time any kind of layout is being designed. I mean, this is really the paging skill, I think. ... because the paging skill is layout Navigation. Everything.

Correction (the owner, relayed by servex-mastermind-opus): "I don't know if we want to make padding the default. Sometimes we don't want padding and we don't want to have to fight it off. There's a class. PAD you add it when you need padding, and I just put some default padding on there." So `.pad` stays opt-in. The fix is the habit (the page skill asks) and the check (it catches forgotten padding, and ignores regions deliberately marked `.bleed`).

## Root cause (measured by the task mastermind)

1. The owner's "full bleed" meant the tab STRIP; the agent took it for the whole content area, and nothing asked "does the content inside need padding?".
2. `Server/padding-check.mjs` exists, but on the Now card with its padding stripped it reports **0 violations** (80 text nodes scanned). It climbs the text's ANCESTORS looking for a painted or bordered box; the edge here is a NEIGHBOUR's (the inbox column's grey ground and border sits just left of the text), so the climb finds a wide ancestor and measures 350px of room. It also skips controls (buttons, checkboxes) and never measures framed boxes (the stat tiles) at all.
3. It runs only when an agent remembers to. The automatic landing check (`Server/on-landing.mjs` → `layout-check.mjs`) never measures padding.

## Deliverables

### Minion A — the edge check (worktree `C:\Code\lew42\worktrees\padding-system`, server http://localhost:54954/)
Fence: `Server/padding-check.mjs` only (inside the worktree). `Server/health.mjs` imports `MEASURE` and `check_page` from it: keep both exports and their return shape working.
1. Detect edges by what is ACTUALLY beside the ink, not by ancestry: for each piece of ink, sample the point just outside its left and right side (within the floor) with `elementFromPoint`; a different painted ground, a border, the viewport edge, or the routed page's own box edge = touching.
2. Ink = text (as now) + controls (button, .btn, input incl. checkbox, select, textarea) + framed boxes (an element with a border or its own opaque ground different from its parent's, measured as one rect).
3. Skip anything inside `.bleed` or `[data-bleed]` (the deliberate opt-out), plus the existing NOT_TEXT exclusions and horizontal scrollers.
4. Proof, all in the brief's log: (a) the Now card with padding stripped (`addStyleTag` `.ai2-tiny-panel .page { padding: 0 !important }` at http://monorepo.localhost/framework/ai2/2026/09/25/now/) → FAIL naming the question text, a stat tile and a checkbox; (b) the same card unstripped → clean or only real findings you list; (c) three pages you did not build (/framework/styles/, /framework/core/Page/, /framework/ai2/) → no new false-positive flood; paste counts before/after.
5. Also export `async function edges(urls, { base, widths })` returning `{ url, width, violations, worst }[]` so `Server/smoke.mjs` (being built by the quickfix-worktrees mastermind) and `on-landing.mjs` can import one function.
6. Commit in the worktree branch `worktree/padding-system`. Do not merge.

### Minion B — the page skill as the umbrella (main tree)
Fence: `.claude/skills/page/SKILL.md` only (untracked in git; edit in the main tree `C:\Code\lew42\monorepo`).
1. Rewrite step 4 (Layout) as instruction, not restriction: for the page AND every region/box on it, answer in a line each — *How wide is it?* (at 1280 and 3440) · *Does it need padding?* (answer is `.pad` for a region, `.card` for a framed box, or a deliberate no marked `.bleed`) · *How does it meet its neighbours?* (the ground and border on each side; text needs room from every one of them) — then hand off to the `layout` skill for the details.
2. Name the trap in one line: "full bleed" is for a strip or a band's paint; the content inside a bled container still gets `.pad`.
3. Say the check runs by itself on landing and how to run it by hand: `node Server/padding-check.mjs <path> --base http://monorepo.localhost` (Git Bash needs `MSYS_NO_PATHCONV=1`).
4. Keep the whole skill short: the step may grow by at most ~8 lines. Load the `content` skill first. Plain full sentences.

## Never
Every Node spawn sets `windowsHide: true`. Don't touch `public/framework/ai2/card.js` or `ai2.css` (manager-now owns the Now card). Don't restart servers. Don't drive the owner's tabs (headless Playwright only, global module: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`).
