# Let Mike rank the 18 shots — the anchor the whole program is missing

Three scoring tiers have now been measured against each other and **none of them
is trustworthy as ground truth**:

- **The math tier is anti-correlated** with how pages look (Pearson −0.393) and can
  never emit below 70. That verdict replicated.
- **Taste's correlation flips sign between passes** (+0.266 → −0.141).
- **The Opus vision baseline does not reproduce itself** — ICC 0.510, and on four
  of six axes a blind re-score of the same pixels carried no more information than
  a fixed number.
- **Sonnet is the most repeatable scorer** (ICC 0.711) and agrees with the Opus
  baseline better than that baseline agrees with itself.

The rubric task's own conclusion: **the blocker is a missing reference standard, not
the rubric and not the model.** And it named the artifact that unblocks everything —
**Mike ordering the 18 frozen screenshots best-to-worst by eye.**

Mike, 2026-08-17: *"that way, I can see the progression from lesser scores to
higher scores, and see if i agree."* This is that, inverted: he goes first.

**Build the page that lets him do it in about five minutes.**

## What exists already — reuse it, don't rebuild it

- **The 18 frozen PNGs**, keyed by content hash, listed in
  `ai/2026-08-17/vision-baseline/baseline.json` with their absolute scratchpad
  paths. ⚠ **Read-only. Do not re-shoot and do not modify `baseline.json`.**
- **The screenshot route**: `GET /screenshot?path=<abs>` from
  `Server/plugins/Screenshots.js`, loopback-guarded, images only. Built today by
  `ai/2026-08-17/shots-in-log/` — read its `task.jsonl`. ⚠ **It needs a
  `node server.js` restart to be live, and that restart has not happened yet**, so
  build against the expectation that it works and make the missing-route state
  honest (see below).
- **The persistence stack** — `ext/Item`, `ext/List`, `ext/Saver`, `ext/Draggable`.
  Drag-to-reorder and saving already exist; this page should be a thin
  application of them, not a new mechanism (RULE#7, RULE#18).

## The interaction — five minutes, not an afternoon

Ranking 18 items by dragging one long column is tedious and error-prone at the
middle. **You choose the interaction**, but it must satisfy:

- **It yields a total ordering** usable as ground truth, best to worst.
- **It takes Mike roughly five minutes.** He will recognise the extremes instantly
  and agonise over the middle — design for that. A coarse pass (great / fine /
  weak) followed by ordering within buckets is one credible answer; there are
  others. State why you chose yours.
- **Every image is big enough to judge.** ⚠ Mike's standing complaint about the old
  previews was *"they're too hard to see"* — do not build a wall of tiny
  thumbnails. Full size on hover, click, or a side-by-side pane; a 1280×800 shot
  needs real space.
- **It survives interruption.** Save as he goes, not on a submit button.
- **It works at 3440 and at 1280.** He is usually on 3440.

## The payoff — show him whether the machines agree

Once he has ordered them, show **his ranking beside each tier's ranking of the
same 18 images**: the Opus baseline, Sonnet, taste, and the math tier. Compute
**Spearman correlation of each tier against Mike's order** and show it.

⚠ **Report spread alongside any error figure.** A constant 72 that never looked at
an image beat both real tiers on MAE — so a tier that refuses to discriminate must
not be able to look good here. Rank correlation is the honest measure; use it.

This is the moment the whole program has been building toward: it settles which of
four candidate instruments is measuring the right thing, from one afternoon of
Mike's eye.

## Where the ranking is stored

Write it as a plain JSON file in your task dir — the ordering, the timestamp, and
the image hashes it refers to (**not** the paths, since the images live outside the
repo and the hash is what identifies them). It is a *conclusion*, so it belongs in
the repo even though the images do not (RULE#12).

⚠ Keyed by hash means his judgement survives a re-shoot: if a page changes, the new
image has a new hash and honestly falls out of the ranking rather than silently
inheriting an old verdict.

## Graceful degradation, and the restart

⚠ **LAW#2 — static compatibility.** Off localhost, or with the route not yet
loaded, the page must not show a broken-image grid or a hanging spinner. Say
plainly on the page that the screenshot route needs a `node server.js` restart, so
that if Mike opens it early he learns why rather than seeing a bug. `ext/AITask`'s
`shots.js` already solved this exact problem today — read it and match its
behaviour.

**Do not restart the server yourself.** Another agent is using port 80.

## Files you own

- `public/framework/ai/2026-08-17/human-ranking/**` — your task dir, including
  `page.js` and the ranking JSON.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Read-only everywhere else.** ⚠ `ext/DesignTool/**` is being edited right now by
another agent — read it if you must, but its taste/math numbers are mid-repair, so
pull tier scores from the frozen `audit/taste.json` and `audit/findings.json` and
**say in the log which `generated_at` you used.** `ext/Panel/**` is another
session's. `vision-baseline/**` and `rubric-v2/**` are read-only sources of truth.

⚠ **Do not edit any site page.** A baseline regeneration is pending and a site edit
corrupts it. A new page under `ai/` is fine — it isn't in the audit corpus.

## RULE#13 — link it or it doesn't exist

Nothing crawls the filesystem. Make sure the page is reachable: the day dashboard
renders task dirs from `day.jsonl`, so confirm it actually appears at
`/framework/ai/2026-08-17/` and log the clickable url. A page Mike can't find is a
page that doesn't exist.

## Deliverables, in this order

1. **The working ranking page**, reachable, honest when the route is absent.
2. **The comparison view** — his order vs the four tiers, with Spearman.
3. The ranking JSON format, keyed by hash.
4. A log line stating the interaction you chose and why.

Running short? Cut 2 — but say so loudly, because 2 is the reason 1 matters.
**Never cut 1.**

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- **Capturing is synchronous — never build DOM after an `await`.** A factory call
  textually after an `await` is wrong; fill containers inside a callback
  (`$box.append(() => …)`). This page loads image data, so this trap is live for you.
- LAW#3: import paths are real URLs — root-absolute or explicit-relative with
  `.js`. LAW#4: no npm dependencies.
- Restate `@layer base, theme, site, util;` in full in any stylesheet, every rule
  inside a layer. Climb the CSS ladder and stop at the first rung that works.
- Load `code-architecture`, `layout-design` and `css-strategy` before building.
