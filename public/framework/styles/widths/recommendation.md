# The finding

**Arrangement 2 — restrained, start-aligned — is the default now**, applied directly in
`core/Page/Page.css`: `.page-content-rows` (the box every card list draws its rows into) caps
itself at `--measure` (today, 40em ≈ 677px at 3440) no matter what wraps it.

## Why this one, not the other three

- **Arrangement 1 (full width) is the bug, measured.** At 3440 it ran to 2864px — over four
  times arrangement 2's 677px. Past about 1600px a reader's eye can't track a line that long;
  this is the owner's exact complaint, reproduced with the real card markup, not guessed at.
- **Arrangement 3 (centred) reads as a floating block, not page content.** Every other element
  on this site — headings, paragraphs, the page title — starts from the page's own left wall.
  A centred card list is the only thing on the page that wouldn't; it would read as a modal or
  a dialog sitting in the middle of a page that otherwise aligns left. Centring is right for a
  **stand-alone** reading column (an article, which is what the framework's own `.measure` class
  is for); a card list living inside a page with other content isn't that.
- **Arrangement 4 (flowing text + cards) proves the "share one margin" ask already works** —
  with no new CSS. A bare paragraph and `.page-content-list` both answer to the same cap and
  land on the same left edge automatically, because both are ordinary content in the page's
  `main` grid track. Nothing needed building for this part; it was already true.

## The alternative, and why it's not a real conflict

The owner's own caution: *"I don't want to just restrain them, because then you can't easily
have full-width pages."* That's about the **page itself** being restrained — whether a whole
page can still bleed to the edges. This fix caps the **row**, not the page: a page using `full`
or `bleed` is untouched, and a block that genuinely wants no cap still has it — `.wide` (the
page grid's own opt-out, already built, demonstrated live in arrangement 1 above). So the
`.page-content-list` default changed; the page-width system it was warning about did not.

## What the fix is, concretely

One line added to `core/Page/Page.css`:

```css
.page-content-rows { display: flex; flex-direction: column; gap: var(--pad-well); max-width: min(var(--measure), 100%); }
```

Because it's on `.page-content-rows` itself — not on the page's own grid — it also fixes the
actual bug: the AI board's card detail panel (`ux/Card/Card.css`, `.page.ai2-card-page`)
overrides the page grid entirely for its own split-pane layout (one column, no `main`/`wide`
tracks), so neither the ordinary page's cap nor `.wide`'s opt-out ever reached it. The old
default there was genuinely uncapped — arrangement 1 on this lab page recreates that absence
(`.wide` plus a local override, together removing both the page-grid cap and today's new
`.page-content-rows` cap) to keep the "before" case comparable after the fix ships. The fix
living on the row itself means the Now card gets it for free, with no change to
`ux/Card/Card.css` at all.
