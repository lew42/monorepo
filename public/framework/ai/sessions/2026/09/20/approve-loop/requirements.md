# approve-loop — make approving obvious, and fix the detail page's spacing

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Use the classes that exist. The controls are already built — make them legible.
2. **Clear beats brief — by far.** A button whose effect you cannot predict has failed.
3. **Prioritize.** The feedback loop first. The spacing second. Both are small.

## The owner's words, just now

> we need to get back to a stable feedback loop where you show me something and I either click yes
> or no, or it's approve or I can give feedback on it. And so that was kind of the idea here is
> that we need a way for me to approve things. And I think I saw one approve button, but it wasn't
> really clear what would happen if I click it.

> on the detail page, the layouts are broken, there's not enough vertical spacing on a lot of
> things. There's no padding on these sub cards. It says four inside. And the titles are blue, like
> they're links, they should be black or maybe the primary color.

> it's like just add the default padding and default gap, and everything should work properly.

## Fix 1 — make the feedback loop legible. This is the real deliverable

**The controls already exist.** Approve and Improve were built yesterday (`ai/2026-09-19/inbox-zero/`
— read its task log first). Verdicts append to `public/framework/ai/verdicts.jsonl` through
`VERDICTS_URL` in `v/3/timeline.js`; a verdict never edits the card, and pressing again undoes it.
So **nothing here needs inventing — it needs to say what it does.**

Three things, in order:

- **Say what the button will do, before it is pressed.** The owner saw an Approve button and could
  not predict the result. A label, a title, a line of helper text — your call, but after your change
  someone who has never seen this page should be able to say what happens.
- **Show that something happened, after it is pressed.** Right now the card leaves the list, which
  is easy to read as "it vanished". Make the result visible and the undo obvious.
- **Put the controls on the detail page too**, not only in the list. The owner is reading a card's
  detail when they form an opinion; that is where they want to act on it.

⚠ **Do not redesign the verdict model.** Append-only, never edit the card, undo by appending again.
Measured yesterday: read-modify-write on a shared file lost 98.5% of updates and the file still
parsed. Append, always.

**"Yes or no" versus "approve or improve".** The owner used both phrasings. There is already an
`ask` mechanism on cards (`ask: ["yes","no"]` renders buttons and writes an answer back — see
yesterday's v3-timeline work). Decide whether these are one thing or two, and say why in a
`decision` line. My read, which you may overturn: an `ask` is the mastermind asking a question, and
a verdict is the owner judging finished work — different, and both should stay. But if you can
collapse them into one control that is clearer, that is a better outcome; argue it.

## Fix 2 — the detail page's spacing

The owner named four things: not enough vertical spacing, no padding on sub-cards, sub-cards showing
a bare "4 inside", and **titles rendering blue like links when they should be black or the primary
colour**.

⚠ **Before you write any CSS, re-read `public/framework/framework.css`.** A sibling has just
restored four derived spacing tokens (`--gap-70/50/35/25`) and their utility classes, which had gone
missing and were silently zeroing padding across eleven files. **Some of what the owner is
describing may already be fixed by that restoration.** Load the detail page and measure first — fix
only what is still wrong, and say in your log which of the four complaints the token restoration
already resolved.

The owner's steer is explicit and it is the house vocabulary: **default padding and default gap.**
Reach for `pad`, `gap` and `card` before writing a rule. Run the `css` skill before any CSS and
`new-css-class` before naming anything.

On the blue titles: find out *why* they are blue — an anchor inheriting link colour is the obvious
suspect — and fix the cause rather than painting over it with a colour override.

## Prove it

Drive it (`ui-test`), do not describe it:
- Detail page at **1920 and 400**, before and after. State the computed padding on a sub-card and
  the vertical rhythm between sections, both before and after.
- A shot of a title, showing it is no longer link-blue.
- **The loop, end to end:** press Approve on a card and shot the visible result; press undo and shot
  the return; press Improve, type a sentence, and shot it arriving in the mastermind's inbox.
- Then `/framework/ai/v/3/` and `/framework/ai/` headless: 200, no console errors.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`.** They hold the owner's
  real words and real verdicts. Test against a scratch copy in your own task dir and prove the real
  files are untouched — hash them before and after. ⚠ `board.jsonl` is appended to by others while
  you work, so compare the leading lines, not the whole hash.
- **Never press a verdict as the owner.** `send()` takes an author override (`window.$VERDICT_AUTHOR`);
  use it. A test press recorded as the owner is fabricated input in a permanent record — that
  happened yesterday and had to be corrected by appending.
- **Never kill or restart the dev server** (port 80 is the owner's; whisper on 8178; the health
  watcher). **Never drive the owner's tabs.** Headless only, private server if you need one.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/framework.css`, `public/framework/ext/AITask/**`,
  `public/framework/dev/DevBar/**` and `public/framework/ai/2026-09-20/start-here/**` — siblings
  are in all four.
- Hold reloads around each batch, re-take the hold before each one, load the page before releasing.

## Deliverables

1. **Both fixes**, proven by the shots above.
2. **`page.js` in your task dir — one screen**, led by the loop working: press, result, undo.
   `new-page` for the shape; add it to `public/framework/ai/2026-09-20/`'s `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "approve-loop (in-process
   agent)"`. One `decision` line on ask-versus-verdict. Land with `finish-task`.

## Fences

You own `public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-20/approve-loop/**`.

## Length budget

One screen, mostly the loop shown working. Landing `outcome`: what a reader can now predict that
they could not before, plus at most five sentences.
