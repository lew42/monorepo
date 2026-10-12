# ai-padding — the AI page and its cards lost their padding

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Use the classes that already exist. Write no new CSS unless you must.
2. **Clear beats brief — by far.**
3. **Prioritize.** The page first, then the cards.

## The owner's words, just now

> So we seem to have broken all the layouts on the framework AI page. Uh, there's no padding on the
> page and most of the cards have no padding either. They should just have a class of pad and or be
> a card class that has padding built into it.

So: **`/framework/ai/` has no page padding, and most cards on it have none either.** The owner has
told you the fix they expect — the `pad` class on the page, and the `card` class (which carries
padding) on the cards. Treat that as a strong steer, but check it against what those classes
actually do before applying them.

## Very likely cause, so you do not hunt blind

Last night a `git stash` reverted the whole tree at 23:16 and it was restored this morning from the
stash — 1,008 files rewritten. `public/framework/framework.css` and the AI pages were among them.
It is likely a class or token that used to be applied is now missing, or a page that used to carry
`pad` no longer does. Three specific things to check first:

- `--pad` and `--pad-card` in `public/framework/framework.css`, and the `.pad` and `.card` rules.
  A sibling task fixed `--pad-card`'s floor to `1rem` yesterday (line ~303) — confirm it survived.
- Whether `/framework/ai/`'s own page and the day pages still carry `pad` / `card` classes.
- `public/framework/ext/AITask/` — the dashboard's card components. A verifier found yesterday that
  **nothing on the live site wore `.card`**, and a later task put `--pad-card` on three dev bar
  cards only. The AI dashboard's cards may simply never have been given it.

**Measure before you change anything.** Load `/framework/ai/` headless and get the computed padding
on the page container and on a real card. Put those numbers in your log. Then fix, then measure
again. The before-and-after numbers are the deliverable, not an opinion.

## What to build

**Give the page and its cards the standard padding, using the existing vocabulary.** Prefer
applying `pad` / `card` to inventing a rule. If the standard itself is wrong for these elements —
too tight, too loose, wrong at 400px or 3440px — **say so and fix the standard**, as a sibling did
yesterday; that is a legitimate answer here, not a dodge.

⚠ Run the **`css`** skill before writing any CSS and the **`new-css-class`** skill before naming any
new class. `framework.css` is loaded by every page on the site, so a change there has a blast
radius — name in your log every element that consumes what you touch.

## Prove it

Shots of `/framework/ai/` at **400, 1920 and 3440**, before and after, on your page side by side.
Computed padding numbers for the page container and a card at each width. And load
`/framework/ai/`, `/framework/ai/2026-09-19/` and `/framework/ai/v/3/` headless afterwards — all
200, no new console errors. Look at the shots as a stranger: **does it still look cramped?** That
is the only test that matches what the owner actually said.

## What you must not do

- **Never kill or restart the dev server** — port 80 is the owner's and they are looking at it
  right now; also the health watcher and whisper-server on 8178. **Never drive the owner's tabs.**
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push.** ⚠ And do not
  touch `stash@{0}` — it is the only copy of some of last night's work.
- **Stay out of `public/framework/dev/DevBar/**` and `public/framework/ux/Dictate/**`** — another
  minion is fixing dictation in those right now.
- Hold reloads around your batch (`node Server/hold.mjs on "ai-padding"` … `off`), re-take the hold
  before each batch since it self-expires after five minutes, and load a page before releasing.
- Do not search from the filesystem root.

## Deliverables

1. **The padding back**, proven by measurement at three widths.
2. **`page.js` in your task dir — one screen**, led by the before/after shots. `new-page` for the
   shape; add it to `public/framework/ai/2026-09-20/`'s `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "ai-padding (in-process
   agent)"`. Land with `finish-task`.

## Fences

You own `public/framework/ai/**` except `v/3/**` and except the 2026-09-19 and 2026-09-20 task dirs
that are not yours, `public/framework/ext/AITask/**`, `public/framework/framework.css`, and
`public/framework/ai/2026-09-20/ai-padding/**`.

## Length budget

One screen, mostly shots. Landing `outcome`: the before and after numbers, and at most five
sentences.
