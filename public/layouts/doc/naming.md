# Naming — the rules of the namespace

An id looks like `2-sidebar`. Two parts, and each one answers a different question.

**The number is how many columns the layout has on the widest screen it is meant for.**
Count the columns you see side by side on a desktop, not on your phone. If the count is not
fixed at all — the layout names a column *width* and lets the room decide — the number is the
letter `n`.

**The name says how the room is divided.** `sidebar` means one narrow column supports one wide
one. `equal` means every column gets the same share. `wall` means the count follows the room.
The name never mentions CSS.

That second sentence is the whole idea, so it is worth saying the other way round too: **a flex
row and a grid that produce the same picture are the same layout.** If you screenshotted both
and could not tell them apart, they have one id between them, and the difference — flex or grid
— is a [tag](/layouts/tag/2-column-flex/).

## The rule that decides everything else

> **An id names the DIVISION of the room. Everything else is a tag.**

Paint is a tag (`cards`, a background and padding on each column). Proportion is a tag
(`golden`, 61.8 / 38.2). Technique is a tag (`2 column flex`, `multicol`, `float`, `table`).
Which side the sidebar sits on is a tag (`left`, `right`). Whether there is a gap is a tag
(`gap`, `no gap`).

This is why there is no id called `3-cards`, even though that is a phrase people say. Cards is
paint. A three-column row of cards is [`3-equal`](/layouts/3-equal/) wearing the
[`cards`](/layouts/tag/cards/) tag — and because it is a tag, that one page shows you *every*
layout that can be painted as cards. A word that describes many layouts is worth more than a
word that describes one. `/layouts/3-cards/` still works: it is an alias, and it lands on
`3-equal`.

## Deciding whether two layouts are the same one

Ask these three, in order. Stop at the first *no*.

1. **Do they have the same number of columns at their widest?** Different numbers, different
   ids. `2-equal` and `3-equal` share a name and are not the same layout.
2. **Is the room divided the same way?** Equal shares, or a narrow column beside a wide one, or
   one column per fitted width — this is the question the name answers. Two 50/50 rows are the
   same layout whether one was built with `grid-template-columns: 1fr 1fr` and the other with
   `flex: 1 1 20em`.
3. **Would a screenshot of both, with the content removed, look the same?** If yes, they are one
   layout and the difference you were thinking of is a tag. Write the tag down instead of the
   second id.

The one exception is behaviour a screenshot cannot show — whether a column scrolls on its own,
whether a header sticks. Those are tags too (`split`, `inner scroll`, `sticky header`), because
they do not change how the room is divided.

## Adding a layout

Everything under `/layouts/` is drawn from one file, `layouts.json`. There is no page to write.

1. **Check it is not already there.** Run the three questions above against every entry with the
   same number. Most "new layouts" are an existing one with a tag you have not written down yet.
2. **Name it.** One word, describing the division, that survives being explained to somebody who
   has never built a web page. If you cannot find one, the second part of the id is a number —
   see below.
3. **Add one object to `layouts.json`.** Its shape is every other entry's; the fields are:

   | field | what it holds |
   |---|---|
   | `id` `n` `name` `title` | the id, split up, plus a human title |
   | `aliases` | every other thing people call it — each becomes a working url |
   | `summary` | two plain sentences: what is divided, and what goes in each piece |
   | `when` | one sentence: when this is the right answer |
   | `responds` | the id it becomes on a phone, and `responds_note`, one sentence saying how |
   | `tags` | count, division, paint, proportion, technique, traits |
   | `framework` | the recipe this site's own CSS already has, with a link |
   | `css` | the recipes — one per technique, each with `rules`, a `note`, and `wrap` for flex |
   | `wire` | the drawing — [`doc/wire.md`](/layouts/doc/wire/) |

4. **Add its tags to nothing.** Tag pages, tag counts and the tag row are all derived from the
   entries; writing a tag on a layout is the whole of publishing it.

## `N-equal` is a family, not a list

`equal` is the one word that works at any count, so **every `N-equal` is a legal id** — the book
draws `2-equal` and `3-equal` because those are the counts real pages use, and
[`/layouts/5-equal/`](/layouts/5-equal/) answers with the family rather than a 404, because one
real site in forty-seven (django's docs) has a footer of exactly five columns that never wraps.

Past three, ask first: a fixed count above three is nearly always a card wall written the hard
way, and [`n-wall`](/layouts/n-wall/) — which names a column *width* and lets the room count the
tracks — is what was wanted. A footer is the honest exception, because there the count really is
deliberate. `4-equal` was drawn once, then deleted for exactly this reason; it is now an alias
and lands on `n-wall`. [`doc/decisions.md`](/layouts/doc/decisions/) has the reasoning.

## The words the corpus asked for

Thirty-two real sites were captured and tagged on 2026-09-08 by minions who did not have a word
for what they were looking at, so they invented one and flagged it. Each invention gets one of
three answers, and here they all are. **A word joins the standard only if it describes many
layouts;** the rest are corpus tags, which need no definition here, or they are not layouts at all.

| what they invented | the answer | why |
|---|---|---|
| `carousel` (7 sites) | **a word** — a `behaviour`, [defined](/layouts/tag/carousel/) | A row that will not fit has two answers: wrap and stack, or stay on one line and scroll. That is a real fork, it applies to any row, and seven sites take the second branch. |
| `fixed sidebar` (1) | **a word**, as [`sticky`](/layouts/tag/sticky/) | The real distinction is sticky (scrolls, then stops) versus fixed (never scrolls at all). One word, defined, covers both — and it applies to headers as much as sidebars. |
| a 5-column footer with no id | **a rule** — see the family, above | The standard did not lack a name; it lacked the sentence saying `equal` works at any count. |
| `no max-width` (1) | a corpus tag | It is the *absence* of `1-centered`'s cap, which is what [`1-flow`](/layouts/1-flow/) already means. Nothing new to define. |
| `right-aligned` (1) | a corpus tag | Same division as `1-centered` — a capped column in a bigger room — with the leftover put on one side instead of split. A trait, exactly like `left`/`right` on a sidebar. Not added to `1-centered`'s own tags, because that entry's definition says "split evenly" and the standard must not contradict itself on its own page. |
| `full-bleed video` (1) | a corpus tag | What fills a band, not how the room divides. `1-bands` already carries `bleed`. |
| `overlapping cards` (1) | a corpus tag | Negative margins fanning a deck. Paint on a row, and one site in 47. |
| `bento` (2) | already an alias | It is what the industry calls [`4-1`](/layouts/4-1/), and a fashion word rather than a description, so it stays an alias and never a name. |
| `scroll-pinned hero` (1) | **not a layout** | Scroll choreography, written in JavaScript. It changes *when* you see a band, never how the room is divided. |
| `layout switcher` (1) | **not a layout** | arstechnica.com lets the reader pick between four views. It is a control that swaps layouts; each of the four already has its own id. |
| `cookie modal` (1) | **not a layout** | An overlay on top of the page. It hides a layout; it is not one. |
| `bot wall` (1) | **not a layout** | A page that is not the site — a capture artefact worth recording next door, and nothing to name here. |

The four drawing gaps that were *not* naming gaps — an off-screen drawer, an arrow carousel, an
infinite marquee, an overlapping deck — are answered in [`doc/wire.md`](/layouts/doc/wire/),
along with the one field that was genuinely missing (`stack`).

## When you cannot name it

Use a number: `4-1`, `4-2`, and so on — the number counts up within that column count, and means
nothing except "the first one we could not name". There is exactly one today,
[`4-1`](/layouts/4-1/), the layout the industry calls a bento grid. `bento` is a fashion word
rather than a description, so it is an alias, not the name.

A numbered layout is a standing invitation. When a word turns up that a newcomer accepts, rename
it, keep the number as an alias so old links work, and write the reason in
[`doc/decisions.md`](/layouts/doc/decisions/).

## The words

Every word the standard defines is on [the tags page](/layouts/tag/), with its meaning and its
kind — `division`, `paint`, `proportion`, `trait`, `behaviour`, `fallback`. They live in
`layouts.json` under `words`, one sentence each.

A word earns its place by describing **many** layouts. If a proposed word would apply to exactly
one entry, it is that entry's name, not a word. If it would split one entry in two, it is a tag.

## Renaming

Rename freely, but never silently. Keep the old id in `aliases` — every alias is a working url,
so nothing that ever linked here breaks — and write the reason in `doc/decisions.md`.

## The CSS classes we did not add

**None of these names is a CSS class, and that is on purpose.** `2-sidebar` is a name for a
picture, and the picture already has a dozen ways to be built; a class called `.2-sidebar` would
have to pick one of them and would then be lying to everybody who built it the other way. (It
could not even be written: a CSS class may not start with a digit without escaping.)

The framework already has the words that *do* build these pictures — `.cols.half`,
`.cols.main-aside`, `.grid.three`, `.wall`, `.measure`, `.flex.auto` — and every entry shows the
one that applies, first, before its hand-written recipes. Those are the classes. The ids are the
vocabulary you use to *talk* about layouts, in a design review, in a tag, in a site's record.

If a class ever does earn its place here, it would be for the one thing the framework's
vocabulary genuinely cannot say — a *ceiling* on a flexible track, which `cols-main-aside` still
has to hardcode. That is a proposal for `styles/layouts/`, not for this namespace.
