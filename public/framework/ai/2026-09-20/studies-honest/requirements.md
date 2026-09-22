# studies-honest — an index advertising nine pages that no longer exist

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is one page. Keep it to one page.
2. **Clear beats brief — by far.** Plain full sentences, for someone who does not know what
   happened.
3. **Prioritize.** Make the page honest first; anything else is optional.

## The situation

A hard reset on 2026-09-19 at 23:16 destroyed uncommitted work across this repo. Most of it was
recovered — 346 files — but about 154 are gone for good, and **the single biggest loss is one
module: `public/framework/styles/system/studies/`.** Its own index page,
`public/framework/styles/system/studies/page.js`, still declares nine children — `size`, `spacing`,
`padding`, `scale`, `type`, `color`, `themes`, `system`, `vocabulary` — and **every one of those
directories is now empty of its `page.js`.** So the index offers nine links and all nine 404.

The recovery record is `public/framework/ai/2026-09-19/reset-recovery/lost.jsonl`; the one-screen
account is `/framework/ai/2026-09-19/reset-deep/`. Read both before you write anything.

## What to do

**Make that index page tell the truth, in one screen.** Right now it lies by omission — it
advertises a design-study module that no longer exists. A reader clicking any link gets a 404 with
no explanation.

The shape is yours, but it should answer, in plain sentences: what this module was, that it was
lost on 2026-09-19 and how, what is provably gone versus partially recoverable, and where the full
record is. Link to the recovery pages rather than restating their numbers.

**Check each of the nine before you write it off.** `lost.jsonl` marks them `partial`, `no` or in
one case `yes`. For any marked `partial` or `yes`, look at what actually survives — the sibling
recovery tasks left recovered text in their logs, and some directories may still hold a `readme.md`,
a `doc/` folder or a CSS file even though the `page.js` is gone. **A page that can be honestly
restored should be restored**, not written off. Say in your log which you checked and what you
found in each.

For the ones that are genuinely gone: remove them from the `children:` line so they stop 404ing,
and name them on the page as lost. Do not silently delete the names — a reader should be able to
see what used to be there.

⚠ **Never invent the content of a lost page.** If `padding` is gone, the index says it is gone. It
does not get a plausible reconstruction of what it might have said.

## What you must not do

- **Never `git stash`, `git checkout --`, `git reset`, `git restore`, commit or push.** Given what
  caused this, that is not a formality.
- **Never kill or restart the dev server** — port 80 is the owner's and they are using it; also
  8123, the health watcher, whisper-server. **Never drive the owner's tabs.** Headless only.
- Do not touch `CLAUDE.md` or `.claude/settings.json`. Do not search from the filesystem root.
- Hold reloads around your writes and load the page headless before releasing.

## Prove it

Load `/framework/styles/system/studies/` headless and confirm: it renders, it reads as one screen,
and **no link on it 404s.** Say the before and after link counts. Shot on your page.

## Deliverables

1. **The honest index**, no dead links.
2. **`page.js` in your task dir — one screen.** What was lost, what you restored, what is gone.
   `new-page` for the shape; add it to the day page's `children:`. ⚠ Today is **2026-09-20** and
   that day directory may not exist yet — if so the `new-task` skill tells you what a new day needs
   (`<date>/page.js`, and the date added to `ai/page.js`'s `children:`), or the whole day 404s.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "studies-honest (in-process agent)"`. Land with `finish-task`.

## Fences

You own `public/framework/styles/system/studies/**` and
`public/framework/ai/2026-09-20/studies-honest/**`, plus the one line in the day page's `children:`
and one append to that day's `day.jsonl`. Nothing else.

There are about 184 other dangling child declarations elsewhere in the repo — **they are not yours
and most are sandbox pages that error by design.** Leave them alone.

## Length budget

One screen each. Landing `outcome`: a headline plus at most five sentences.
