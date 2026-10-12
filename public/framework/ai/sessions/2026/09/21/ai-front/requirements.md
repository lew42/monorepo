# ai-front — the AI page opens on V3, and the tabs get their padding back

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Use the classes that exist. Do not redesign V3.
2. **Clear beats brief — by far.** After your change a stranger should be able to land on
   `/framework/ai/` and see what matters without hunting.
3. **Prioritize.** Padding first (it is visible and small), then the default view, then the
   links-out region. The fourth item is a question, not a build.

## The owner's words, just now

> the AI framework slash AI page should default to V3. And there should be a link to any
> important things on V3. So the timeline view with the rail and the details columns, maybe that
> needs to be a separate tab. The tabs along the top on the AI V3 page — I don't know, they don't
> seem to be, well, okay, I guess they work. The now tab doesn't have any padding. The grid tab
> doesn't have any padding. The cards are butting up against the sidebar with zero spacing on two
> of those. The timeline page does have padding.

## Fix 1 — Now and Grid have no padding. The cause is already found

Do not re-diagnose this. `v3.css:31-35` says the board deliberately dropped the `pad` utility
class to go full bleed, and `.v3-wall` is `display: contents` (`v3.css:78`), so the wall itself
cannot pad anything. **Timeline has padding only because its own two columns each carry it** —
`.v3-inbox` and `.v3-right-col` both set `padding: var(--pad)` (`v3.css:180-181`). Now and Grid
render into the same bare `$wall` and nobody supplies it.

So: **give the Now and Grid views the same default padding the timeline's columns already have**,
in whatever way keeps one source of truth rather than three copies of `padding: var(--pad)`. The
owner's steer is the house vocabulary — `pad`, `gap`, `card`. Reach for the existing classes
before writing a rule; run the `css` skill before any CSS and `new-css-class` before naming one.

⚠ **Do not break the timeline's full bleed.** The board is deliberately edge-to-edge so the split
view can run the full height — `.v3-board:has(.v3-split)` at `v3.css:167` depends on it. Whatever
you do must leave the timeline looking exactly as it does now. Prove that with a before/after shot
of the timeline as well as of the two broken views.

**Measure, do not describe.** State the computed inline padding on a Now card and a Grid card, and
the gap between a card's edge and the sidebar, before and after, at 1920 and at 400.

## Fix 2 — `/framework/ai/` opens on V3

Today `/framework/ai/` is V1 (the rail of task dirs) and V3 lives at `/framework/ai/v/3/`.
The owner wants the AI page to land on V3.

**My decision, which you may overturn with evidence:** give V1 its own url under `v/` and render
V3's board at `/framework/ai/`. A bare redirect is the tempting one-liner and it is wrong here —
the picker's own first entry is `{ text: "V1", href: "/framework/ai/" }` (`ai/v/versions.js:26`),
so redirecting that url leaves V1 with no address at all and the picker looping back to V3.

Whatever route you take, these must all still hold afterwards:

- The version picker still gets you from any version to any other, V1 included.
- The day dirs and task dirs under `/framework/ai/<date>/<slug>/` still resolve — that routing
  lives in `ai/page.js`'s own `route()` and is used by every link in every task log on the site.
- `/framework/ai/log/` and `/framework/ai/effort/<slug>/` still work; they are routes on the same
  page.
- `/framework/ai/process/` is still reachable.

If moving V1 turns out to be larger than it looks, **say so and do the smaller thing** — a
defended smaller change beats a half-finished large one. Put the reasoning in a `decision` line
with the alternative named.

## Fix 3 — the links out of V3

> there should be a link to any important things on V3

V3 is a stream of cards and nothing else; V1's rail is how you currently reach the task dirs, the
log and the process page. Once V3 is the front door, those have to be reachable from it.

Add **one small region** — your judgement where, but it should not push the cards down the page —
linking the handful of things worth reaching: `/framework/ai/process/`, the newest day board,
`start-here` (`/framework/ai/2026-09-20/start-here/`), `/framework/ai/log/`, and the version
picker if it is not already on V3. **A handful, not a directory.** If you find yourself listing
more than six, you are building V1 again — stop and pick the six.

## Fix 4 — this one is a question, answer it in a log line

> the timeline view with the rail and the details columns, maybe that needs to be a separate tab

It already is: `timeline` is its own tab beside `now` and `grid` (`page.js:330`). The owner hedged,
so they may not have realised, or they may mean the rail and the detail should become two separate
tabs. **Do not split them.** Load the page, look at whether the timeline tab reads as its own
thing, and write one `log` line saying what you found. If the tab labels are genuinely unclear,
say what you would rename them to — but change nothing about the tab structure this pass.

## Prove it

Drive it (`ui-test`), do not describe it:

- Now, Grid and Timeline at **1920 and 400**, before and after. The padding numbers are the
  headline.
- `/framework/ai/` after the change: shot of what the owner now lands on.
- Click through the links-out region and confirm each one resolves.
- Then headless, all 200 with no console errors: `/framework/ai/`, `/framework/ai/v/3/`,
  `/framework/ai/v/2/`, `/framework/ai/process/`, `/framework/ai/log/`,
  `/framework/ai/2026-09-20/start-here/`, and one task dir under a date.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`.** They hold the owner's
  real words and real verdicts. Read them freely.
- **Never kill or restart the dev server** — port 80 is the owner's and they are looking at this
  exact page; also whisper on 8178 and the health watcher on its own pid. **Never drive the
  owner's tabs.** Headless only; if you need a server of your own, `PORT=8091 node server.js` and
  kill it at landing.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**, and do not
  touch `stash@{0}` — it is still the cleanest copy of two days of work.
- **Stay out of** `public/framework/framework.css` and `public/framework/dev/DevBar/**`.
- Hold reloads around each batch (`node Server/hold.mjs on "ai-front — <what>"`), re-take the hold
  before each one (it expires after five minutes), load the page before releasing.
- Search with Glob/rg scoped to the repo, never from the filesystem root.

## Deliverables

1. **The four items above**, proven by the shots.
2. **`page.js` in your task dir — one screen**, led by the before/after padding shot and what
   `/framework/ai/` now opens on. `new-page` for the shape.
3. **The day scaffold**, because 2026-09-21 is a new day: `public/framework/ai/2026-09-21/page.js`
   (clone `2026-09-20/page.js`, change the two date strings and the `children:`) **and**
   `2026-09-21` added to `ai/page.js`'s `children:` — without both, the day 404s and this task is
   invisible.
4. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"worker": "ai-front"`. One `decision` line on how you made `/framework/ai/` open on V3, naming
   the alternative. One `log` line for Fix 4. Land with `finish-task`.

## Fences

You own `public/framework/ai/v/**`, `public/framework/ai/page.js`,
`public/framework/ai/2026-09-21/**`, and the `children:` line of `ai/page.js`. Nothing else.

## Length budget

One screen, mostly shots. Landing `outcome`: the padding numbers before and after, what
`/framework/ai/` now opens on, and at most five sentences.
