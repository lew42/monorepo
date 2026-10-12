# card-adopt — the card standard exists and nothing wears it; make something wear it

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Fastest working version first. Write no CSS unless it is needed.
2. **Clear beats brief — by far.** Plain full sentences, basics first, for an overwhelmed newcomer.
3. **Prioritize.** Most important first.

## Why this exists

The owner complained this afternoon that the dev bar's log cards had text pushed right unevenly,
about three pixels of padding, and asked for **one standard padding for all cards**. A task called
`padding-audit` answered it: it added a `.card` class and a `--pad-card` token to `framework.css`,
well reasoned, and two lint rules. Then it landed, and its own landing line says outright:

> nothing on the live site wears `.card` yet.

A verifier confirmed it tonight on the exact cards that triggered the complaint — the dev bar's own
log cards. Computed padding 12.8px, no `card` in the class list, still using a different token
(`var(--pad)`). So the standard is real, the complaint is unfixed, and the grade said done.

This is the shape of seven of tonight's eleven wrong grades: **built, demonstrated, never plugged
in.** Your job is the plugging in. It is deliberately small.

## What to build

**1. Read the standard before you apply it.** `.card` and `--pad-card` are in
`public/framework/styles/framework.css`. Read what they actually declare and what layer they are
in. If the standard itself is wrong — the wrong token, the wrong layer, a value that will not hold
at 400px or 3440px — **say so and fix the standard instead of spreading it**. A finding like "the
rule is wrong, do not adopt it yet" is a first-class result here, not a failure.

**2. Make the dev bar's log cards wear it.** These are the cards the owner actually complained
about, in `public/framework/dev/DevBar/`. Replace their ad-hoc padding with the standard. Confirm
by measuring the computed padding before and after, headless, and put both numbers in your log.

**3. Count what else should wear it, and adopt only what you can prove.** Search the repo for
elements that are cards in all but name — a bordered or raised box holding a title and some text.
Report the count. Adopt the ones you can verify with a shot in the time you have, and list the rest
in your log as named files for the next pass. **Do not do a blind sweep.** A mass rename you cannot
look at is how a design system breaks quietly.

**4. Do not touch the AI dashboard at `public/framework/ai/v/3/**`.** Another minion is rebuilding
that page right now. If its cards need the standard, that is a line in your log, not an edit.

## What you must not do

- **Never kill or restart the dev server.** Port 80 is the owner's and they are on it; 8123 is the
  mastermind's; a page-health watcher is running — leave all three alone.
- **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.**
- Do not search from the filesystem root.
- Hold reloads around your batch: `node Server/hold.mjs on "card-adopt"` … `off "card-adopt"`, and
  load a page headless before you release — a file that parses can still blank a page.
- ⚠ Before naming or renaming any class, run the `new-css-class` skill and re-read
  `public/framework/styles/css-scopes.txt`. You are mostly *applying* an existing name, which is
  the easy case, but check before you invent one.

## Prove it

Shots at 400 and 1920 of the dev bar log, before and after. The decisive number is the computed
padding on a real log card, measured in the browser, not read from the CSS — the verifier got
12.8px; say what it is now and that it matches `--pad-card`. Two numbers that must agree: the token's
value and the measured padding.

## Deliverables

1. **The dev bar cards wearing the standard**, proven by measurement.
2. **`page.js` in your task dir — one screen.** Top line, plain words: what the standard is and what
   now wears it. Then the before and after shots side by side, because that is the whole story.
   Then the count of what still does not, one click down. Run `new-page` for the shape and add the
   page to the day page's `children:` — nothing crawls.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "card-adopt (in-process agent)"`. Land with `finish-task`.

## Fences

You own: `public/framework/dev/DevBar/**`, `public/framework/styles/framework.css` (the `.card`
rule and `--pad-card` only — it is loaded by every page on the site, so touch nothing else in it),
and `public/framework/ai/2026-09-19/card-adopt/**`. One line in the day page's `children:`, one
append to its `day.jsonl`.

**Out of bounds:** `public/framework/ai/v/3/**` and `Server/**`, both owned by others tonight.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

One screen, mostly the two shots. Landing `outcome`: a headline plus at most five sentences.
