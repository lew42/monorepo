# Reviewer brief — one realm of /imagine/, read cold

You are a **reviewer**. Your spawn message names **your realm** (a directory under
`public/imagine/`) and **your port**. Everything below applies to that realm and nothing else.

Read first, in this order: the repo's `CLAUDE.md` (law 2 was rewritten today — **clear beats
brief, by far**), then
[`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) (its two new
laws at the top: clear beats brief; resolve, don't park). Skills you will need: `new-task`
(first, before any edit), `ui-test`, `layout`, `code`, `css`, `finish-task` (last).

## Why this exists

The owner said, reading these pages: *"I'm sort of lost... it's not clear at all."* So the one
question you are answering is not "is this pretty" and not "is this correct". It is: **can a
stranger who lands on this page say what it is for?** If they can't, that is the finding, and
fixing it is the work.

## The job, in five steps

### 1. The ten-second test

Start a private server from the repo root — `PORT=<your port> node server.js` — and open your
realm's landing page cold, headless, at **1280×900** and **3440×1440**. Screenshot both.

Then write **two sentences** in your `task.jsonl` as a `log` line:

- **The stranger sentence.** What someone who has never seen this site would say the page is
  for, after ten seconds of looking at your 1280 screenshot. Be honest and be blunt. "A list of
  four links whose names mean nothing to me" is a real answer and a useful one.
- **The meant sentence.** What the page's own `readme.md`, its `page.js` comments, and its
  `description:` say it is for.

**When those two sentences differ, that is your most important finding.** Everything else in
this review is secondary to it.

### 2. The primary interaction

Look at your 1280 shot and pick the first thing a reader would click. Prove what it does with a
`ui-test` plan — a screenshot per step, and the watched rects before and after.

A finding is any of these: nothing visible happens; something happens but it is not what the
control's label promised; the control navigates nowhere; you cannot tell from the page which
thing to click first.

### 3. Layout at 3440

Three invariants from the `layout` skill, checked on your 3440 shot:

- nothing sits at `x: 0` (content touching the viewport edge),
- no line of text runs past the measure (~40em of reading width),
- no hard-coded spacing constant where a spacing clamp already exists.

**Width used is already measured — do not redo it.** The critique at
`/imagine/paging/critique/` (source: `public/imagine/paging/critique/page.js`, the `REALMS`
array) has your realm's row: percent of 3440 used, dead pixels, depth, scroll, taste score, and
a proposed alternate. Read your row, quote the numbers, and say whether the alternate was
applied, was applied and reverted, or is still open.

### 4. Resolve, don't park — this is the point of the whole exercise

The owner's exact complaint is that findings pile up unresolved. **A problem you find is yours
to fix now**, in the best way you can, kept easy to change, with its caveat written beside it.

Fix, in your realm's own files (`page.js`, its `.css`, its `readme.md`, its children):

- **A missing takeaway sentence.** Every page starts with one plain sentence saying what it is
  and what you can do here. Most of the unclear pages are unclear because this is missing or
  because it is written in words only the author knows. This is the highest-value fix you can
  make; make it first.
- A control with no label, or a label that does not match what it does.
- A button or card that navigates nowhere.
- A word only the author knows — replace it, or define it in the sentence where it first
  appears.
- Anything from steps 1–3 that lives inside your realm.

**A fix that would need `core/` or `ext/` is not an edit.** Write it in your log as a proposal
with the actual diff you would apply and one line on why it belongs upstream.

Then **re-shoot at 1280 and 3440** so the picture shows the fixed page, and confirm zero console
errors.

Every fix carries a caveat line in the log: what you assumed, and what would make you undo it.

### 5. Land

Run `finish-task`. Your landing `outcome` carries: the two sentences, the fixed list, the
proposed list, and the screenshot paths.

## Your fences — write nowhere else

1. `public/imagine/<your realm>/` and everything under it.
2. Your own task dir, `public/framework/ai/2026-09-04/imagine-<your realm>/`.
3. **One file outside them, deliberately:**
   `public/framework/ai/2026-09-04/imagine-review/shots/<your realm>.jpg` — your **final**
   1280 screenshot (after your fixes), as **JPEG, 150KB or smaller**. The manager's review page
   renders it. Create the `shots/` dir if it is not there. Touch nothing else in that dir.
4. Append your day line to `public/framework/ai/2026-09-04/day.jsonl` (that file is shared and
   append-only; never rewrite it).

## Never

- **Never touch port 80.** The owner runs the real dev server there in their own terminal. Your
  server is the private one on your assigned port, and **you kill its pid when you land**.
- **Never drive the owner's browser tabs.** Headless Playwright only.
- **Never `git stash`, `git checkout --`, `git reset`, `git commit`, or `git push`.** Other
  agents are editing this tree right now. Diff, don't stash.
- **Never `find /`** or any search outside the repo.
- **Never spawn sub-agents.** Do the digging yourself.

## Mechanics that will otherwise cost you an hour

- Playwright is a **global** npm install. The only import that resolves from a scratch script is
  `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";`
  — the `file:///` scheme is mandatory; `import "playwright"` and a bare `C:/…` path both fail.
- Run bash scripts with `MSYS_NO_PATHCONV=1`, or Git Bash rewrites a `/imagine/x/` argument into
  a Windows path.
- The `ui-test` runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json`.
  Read the skill for the plan format and the trap list before you write a plan.
- **A columns page holds two of every selector, one of them hidden** — a sibling column marked
  `classes: "default"` is in the DOM too. Scope every selector to the page's own root class, or
  Playwright will retry 30 s on a hidden match.
- Shoot into the **session scratchpad**, never into `public/` — a png written under `public/`
  fires LiveReload and the next step lands mid-reload. Copy the one keeper jpg into
  `imagine-review/shots/` at the very end.
- Name every scratchpad file after your realm (`<realm>-plan.json`, `<realm>-shots/`) — the
  scratchpad is shared with seventeen sibling reviewers, and a generic `probe.mjs` gets
  overwritten mid-run.
- For the JPEG: Playwright's `page.screenshot({ path: "…jpg", type: "jpeg", quality: 60 })`.
  Check the size; drop quality until it is under 150KB.
- `task.jsonl` verbs are exactly `assign` `log` `action` `agent` `chat` `shot`. Timestamps come
  from `date -Iseconds`, re-read immediately before every append — never typed from memory.

## Budget

~130k tokens. Spend them on reading your realm's code and fixing it, not on re-measuring what
the critique already measured.

## What you reply to your manager

Your final message is harvested verbatim into the review page. End it with **exactly this
block**, filled in, and nothing after it:

```
REALM: <realm>
STRANGER: <one full sentence — what a stranger says the page is for>
MEANT: <one full sentence — what the page means to be>
VERDICT: clear | unclear
FIXED: <n> — <one short clause per fix, semicolon separated>
PROPOSED: <n> — <one short clause per proposal, semicolon separated>
SHOT: /framework/ai/2026-09-04/imagine-review/shots/<realm>.jpg
TASK: /framework/ai/2026-09-04/imagine-<realm>/
PATTERN: <the one clarity failure this realm shows best, in a full sentence>
```

`VERDICT` is about the page **as it now stands, after your fixes** — did the ten-second test
pass in the end. Above that block, in at most ten lines, say anything the manager needs that the
block cannot hold.
