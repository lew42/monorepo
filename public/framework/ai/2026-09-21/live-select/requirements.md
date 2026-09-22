# live-select — Live stops being a mode and becomes selection; the hour box becomes back-to-top

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

**The V3 files are yours — both siblings are done.** `ai-front` was stopped and `safe-rollout`
landed; nothing else is writing in `public/framework/ai/v/**`.

⚠ **You probably cannot execute commands.** Measured twice today: a CLI minion launched with
`--permission-mode acceptEdits` can write files but its shell refuses `node`, `git`, and anything
else that runs code — `safe-rollout` shipped two scripts it was never able to run once, and the
first one failed immediately when the mastermind ran it at harvest.

So: **try your proofs, and when the shell refuses, say exactly which command was refused and what
you would have checked.** Do not fake a measurement, do not describe a screenshot you could not
take, and do not treat code-reading as proof — an honest "written, unproven, here is the check I
need run" is worth far more than a confident claim. The mastermind runs every proof at harvest
and will come back to you with what it found.

## The three laws, short

1. **Less is more.** This is mostly *deleting* a thing that does not work and wiring what is left
   to the url. Do not build a notification system.
2. **Clear beats brief — by far.** After this, what Live does should be guessable from looking at
   it.
3. **Prioritize.** The rail's shape first (Fix 1 + 1b) — it is what the owner is looking at and
   complaining about. Then selection (Fix 2). Then the flash (Fix 3), which is optional.

## The owner's words, just now

> I think the idea with this live button is that it's more like, it's almost like selection and
> deselection. So in the timeline panel, like the left rail of the timeline view, we can get new
> updates kind of in real time. And that's what I want.

> I just saw in this 11 a.m. card, this is a little confusing … it's a white card that says 11 a.m.
> And I'm guessing, I don't know if that changes to 12 a.m. And that's like the current hour's
> worth of things, but some things are in that box and that box is sticky. **I don't like it. It
> looks kind of broken.**

> I think what we want is essentially all of the things in that column in kind of chronological
> order. And then what goes in there is a sticky button that says like back to top or something,
> which is essentially all it's going to do is that if we scroll down, then that button stays
> there where we can quickly jump back to top. And then when we're at the top, then new things
> that appear just should automatically get selected.

> Now, if we have a specific page selected … that item should stay selected. We don't want our
> view to be jumping around as new things come in … if I've selected one of the items and I'm
> viewing the details for it, the URL should change and I should be kind of locked into that one
> at least temporarily.

> I don't know if that back to top thing flashes or has a notification for new messages … we
> definitely don't want our dashboard switching automatically.

> it's almost like the live mode is deselecting … it's almost like going back to the AI V3
> dashboard or just framework slash AI if we make it the default — it's just the default view
> without anything selected … it doesn't necessarily have to automatically scroll to top, but
> maybe it should. And it's just kind of refreshes the view.

## What is actually on screen right now — measured, not guessed

A headless shot at 1600×1000 of `/framework/ai/v/3/?view=timeline` this morning shows three
distinct problems in that sticky box, and **one of them is a plain bug the owner may not even
have separated out**:

1. **The pinned cards duplicate the stream directly below them.** The box held three mini-cards —
   "Live becomes selection…", "I wake on a timer…", "The roles exist…" — and the very next thing
   down the column is the same first card again at full size. The strip is showing you what you
   can already see.
2. **There is an empty white box** immediately under the sticky strip, about 30px tall, holding
   nothing. Find out what draws it. It may be the pinned strip's own container rendering with no
   content, or a stray wrapper. **This alone accounts for a lot of "looks broken".**
3. The "11 AM · now · 11:10 AM" header pairs an hour label with a live clock, which reads as two
   different times side by side.

The strip is `.v3-axis-sticky` (`v3.css:214`), built at `page.js:519`, and it wraps the hour/clock
row plus `$pinned`. A sibling capped its height on 2026-09-20 (`ai/2026-09-20/v3-axis-fix/`) —
read that task's log before you touch it, because the cap is why it is not eating the column any
more, and you are about to remove the thing it was capping.

## Fix 1 — the column is chronological; the sticky thing is back-to-top

Replace the pinned strip with what the owner asked for:

- **The left rail is one chronological column.** Nothing is lifted out of it and shown twice.
- **What stays stuck is a small "back to top" control**, and only once you have scrolled down —
  at the top it has nothing to do and should not be there. Clicking it returns to the top.
- Keep whatever hour/date markers already separate the stream into readable chunks (`.v3-axis-day`,
  `.v3-axis-time`) — those are the chronology, and they are not what the owner objected to. What
  they objected to is the **box** that floats and holds cards.
- Kill the empty white box in the process, and say in your log what was drawing it.

⚠ **The pinned strip had a purpose**: a `needs-you` card could never be buried by the stream.
Removing it loses that, and the owner has 23 such cards. Do not silently drop it — either the
chronological column shows status clearly enough that a `needs-you` card is still findable, or
the back-to-top control carries the count of them. **Decide, do it, and name the alternative in a
`decision` line.** My read, which you may overturn: the count on the control is enough, because
the inbox count in the head row (`paint_count()`) already exists and this would duplicate it.

## Fix 1b — the rail becomes a scannable list. This is now the biggest item

The owner, minutes after the above, looking at the same rail:

> I do kind of want to compact this list view so that we need two different sized cards. Like we
> need big items with icons, and then like maybe smaller items. The cards are really big, so I
> have to scroll a lot to kind of read them, and there's a lot of space between them, which
> actually it doesn't look bad, but it just takes up a lot of space. And so the vertical flow
> there is huge.

> one thing that we can fix is we can put the icon on the same line as the heading for each card.
> In fact, in the details page, that's how it lines up, but in the rail the icon is on its own
> line and wastes a bunch of space.

> it seems like we're truncating some of the text from the detail page on the rail. And I'm
> thinking maybe we just want like one-liners. In fact, in the hour card, this eleven a m hour
> card, we have some of the same items as very tiny one-line previews. **I think that might be
> more like what we want in the timeline.** I want the timeline to be something that looks
> familiar and I can look over all the items and kind of understand what they're doing. And so we
> need to group them properly.

**The thing being deleted contains the answer to what replaces it.** Those tiny one-line rows in
the sticky box are `.v3-pinned-row` (`page.js:781`, `v3.css:270-278`) — icon, bold title, author,
one line, ellipsis. That shape is the target for the ordinary rail item. Keep it when you delete
the box around it.

Three concrete things, and two of them already half exist:

1. **The icon goes on the same line as the heading.** Today it does not: `page.js:1463-1465` (and
   the rail's own copy at `page.js:680-686`) builds `.v3-tile-head` holding *only* the icon, then
   `.v3-tile-title` as a **sibling block**, then `.v3-tile-sentence` as a third. Three stacked
   blocks, and `framework.css`'s `:where(.card) > * + *` puts rhythm between each — which is most
   of the "huge vertical flow". The detail page gets this right; make the rail match it.
   `v3.css:102` even documents the head as "an icon beside nothing", which is the bug written down.
2. **Two sizes, and the machinery is already there.** `tile(c, big, …)` (`page.js:1456`) takes a
   `big` flag, `weight()` (`page.js:1372`) already decides which cards deserve it, and
   `.v3-tile-big` (`v3.css:113-118`) already makes the icon 2.2em and the title larger. Today that
   is used by the **grid** view. Bring the same two-tier idea to the rail: a few big items with a
   prominent icon, everything else a one-liner. Reuse `weight()`; do not invent a second ranking.
3. **Drop the truncated detail text from the ordinary item.** `.v3-tile-sentence` is a squeezed
   copy of the detail pane's opening — the owner reads it as noise. A one-liner is title + icon +
   author/time. Keep the sentence only on the big items, if anywhere.

**"We need to group them properly"** is the vaguest part and the owner did not say by what. Do not
guess large. The chronology already groups by day and hour marker (`.v3-axis-day`, `.v3-axis-time`)
and those survive Fix 1. If a further grouping is obviously right once the list is compact — by
status, by author, by task — do the smallest version and put it in a `decision` line. If nothing
is obviously right, **do nothing and say so**; a compact chronological list may be all the
"familiar" the owner wanted.

**Measure it.** State the pixel height of one ordinary rail item before and after, and how many
items fit in a 1000px-tall viewport before and after. That ratio is the headline of your page.

## Fix 2 — Live is selection, not a mode

This is the heart of it. Today Live is a toggle that auto-scrolls. The owner's model is different
and simpler:

- **Live on = nothing is selected.** The view is the default: newest at top, the newest card
  showing in the detail pane, and as new cards arrive the newest one keeps being the one shown.
- **Selecting a card turns Live off.** The url becomes that card's own url (it already does —
  `master_detail()` handles `initial_id`, and `page.js:326-330` explains why a card's url must
  always open it). While a card is selected the view **never jumps**: new cards arriving append to
  the rail and change nothing else.
- **Turning Live back on = deselecting.** It returns to the bare `/framework/ai/v/3/` url (or
  `/framework/ai/` if `ai-front` has made that the front door — check what it landed), clears the
  selection, and shows the newest again. The owner: *"it doesn't necessarily have to automatically
  scroll to top, but maybe it should."* **Scroll to top; it is the deselect gesture and a
  half-scrolled deselect reads as a bug.** Note it as the reversible part.

So the Live button's job is one line of meaning: **"show me the newest, nothing pinned open."**
Make its label or title say that. Its on/off look was set on 2026-09-20 — primary background on,
dimmed off — keep that; it is right and the owner asked for it.

The existing "Live turns itself off when you scroll or click" behaviour becomes almost free under
this model: clicking a card selects it, which is what turns Live off. Scrolling away is less
obvious — the owner did not repeat that request this time. **Your call**, in a `decision` line:
my read is that scrolling should NOT drop Live any more, because under the new model Live means
"nothing selected", and scrolling down the rail does not select anything.

## Fix 3 — the flash, kept small

> I don't know if that back to top thing flashes or has a notification for new messages

They are unsure, so build the smallest honest version: **when a card is selected and new cards
arrive, the back-to-top control shows that something is new** — a count, a dot, a subtle change.
No sound, no popup, no auto-switching. The whole point of the paragraph is *"we definitely don't
want our dashboard switching automatically."* Clicking it goes to the top and, per Fix 2, that is
also the deselect.

If you cannot make it read well in the time you have, **ship Fixes 1 and 2 and say so** — they are
the request; this one is the owner thinking out loud.

## Prove it

Drive it (`ui-test`), do not describe it. Shots at **1920 and 400**:

- The left rail before and after — the sticky box gone, the column chronological, no empty box,
  items compact with the icon beside the heading. **How many items fit in 1000px, before and after.**
- Scrolled down: back-to-top present. At the top: absent.
- Live on, nothing selected, a new card appended to `board.jsonl` **in your own scratch copy** —
  show the newest becoming the shown one.
- A card selected: its url in the address bar, then a new card arrives — show the view did not
  move, and the back-to-top control showing something is new.
- Click Live with a card selected: url returns to the bare board, selection cleared, top of rail.

Then headless, 200 and no console errors: `/framework/ai/`, `/framework/ai/v/3/`,
`/framework/ai/v/3/?view=now`, `/framework/ai/v/3/?view=grid`, and one card's own url.

## What you must not do

- **Never write to `public/framework/ai/board.jsonl` or `verdicts.jsonl`** — the owner's real words
  and real verdicts. Test against a scratch copy in your own task dir and compare the leading
  lines of the real file before and after (it is appended to by others while you work, so a whole
  hash will not match).
- **Never kill or restart the dev server** — port 80 is the owner's and they are watching this
  exact page; also whisper on 8178 and the health watcher. **Never drive the owner's tabs.**
  Headless only; your own server is `PORT=8092 node server.js`, killed at landing.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**, and do not touch
  `stash@{0}`.
- **Stay out of** `public/framework/framework.css`, `public/framework/dev/DevBar/**`, and
  `public/framework/ai/page.js` unless `ai-front` has landed and left it as you need it.
- Hold reloads around each batch (`node Server/hold.mjs on "live-select — <what>"`), re-take before
  each one, load the page before releasing.
- Run the `css` skill before writing CSS, `new-css-class` before naming one. Search scoped to the
  repo, never from the filesystem root.

## Deliverables

1. **Fixes 1, 1b and 2**, proven by the shots. Fix 3 if it lands cleanly.
2. **`page.js` in your task dir — one screen**, led by the before/after of the left rail.
   `new-page` for the shape; add it to `public/framework/ai/2026-09-21/`'s `children:`.
3. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "live-select"`. Three `decision`
   lines — what replaced the pinned strip's purpose, whether scrolling still drops Live, and
   whether Live scrolls to top. One `log` line naming what drew the empty white box.
   Land with `finish-task`.

## Fences

You own `public/framework/ai/v/3/**` (not its data files) and
`public/framework/ai/2026-09-21/live-select/**`, plus one line in the day page's `children:` and
one append to its `day.jsonl`.

## Length budget

One screen, mostly shots. Landing `outcome`: what the left rail is now, what Live now means, and
at most five sentences.
