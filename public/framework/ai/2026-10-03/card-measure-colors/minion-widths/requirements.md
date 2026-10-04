# Widths lab: one measure, one margin for cards and flowing text

Load the `minion` skill first. Then the `page` skill (you're building a page) and the `layout`
skill (you're sizing cards against `--measure`). Then come back here.

## The owner's words (verbatim, from the task brief)

> At 3440 the Now card's sections run the full width. I don't want to just restrain them,
> because then you can't easily have full-width pages. But with our bleed system we should
> have control over card widths, and maybe putting the measure on them is the way: the whole
> card hits the measure. Try putting a paragraph of text outside one of these cards, just in
> the flow: we won't always want cards. Flowing text and cards should share the same margin,
> and we should be able to explore the options: centred, restrained, or full width.

## What you're building

A new page at `public/framework/styles/widths/page.js` (a real page, linked from
`public/framework/styles/page.js`'s `children:` string — add `widths` to that string yourself,
it's a one-line edit, do it last, right before you commit, so nobody else collides with you on
that file).

**Content:** reuse the Now card's three real sections so the demo is honest, not lorem ipsum.
Read them live: `read_page("/framework/ai/2026/10/03/now/")` (an MCP call), or just copy these
three (title, then its text, both markdown) — they're already final:

1. **"AI system: the dashboard you're reading"** — landed-today / working-on-now bullets (ask
   the Now card for the current text, it changes; a short paraphrase is fine if the page is
   stale by the time you read it — the point is three realistic paragraph-length sections, not
   these exact words).
2. **"Page system: how every page stores and draws itself"** — same shape.
3. **"Servex and your machine"** — same shape.

Each is a `.card` (title + markdown body) — exactly what `core/Page/Page.css`'s
`render_content_list()` draws today (`.page-content-list` → `.page-content-rows` →
`.page-content-row.card`). Read that CSS (`core/Page/Page.css` around line 780) before you build
— don't invent a second card shape.

**Four arrangements, same three cards each time**, stacked top to bottom on the page so a
reader scrolls through all four without navigating:

1. **Full width.** The three cards as they render today — no `--measure` cap, no `.measure`.
2. **Restrained, start-aligned.** Each card at `--measure` (the framework token,
   `/framework/framework.css`, already `max-width: min(var(--measure), 100%)` via `.measure`),
   left-aligned, NOT centred.
3. **Restrained, centred.** Same width, centred (`margin-inline: auto` — the `.measure` class
   already does this; use it, don't re-derive it).
4. **Mixed: flowing text + cards, one shared left edge.** A plain paragraph of real prose (write
   2-3 sentences about what this lab is testing) OUTSIDE any card, in the normal flow, directly
   above or beside the three cards — and the paragraph's left edge and the cards' left edge must
   land on the exact same x position, both constrained to the same measure. This is the owner's
   literal ask ("flowing text and cards should share the same margin") — prove it by eye in the
   screenshot, not by reading CSS numbers.

Label each of the four sections with a heading naming what it is, so a reader scrolling the page
knows which arrangement they're looking at before they see it (CLAUDE.md: show, don't tell, but a
one-line label before each block is not "telling" — it's keeping four similar blocks apart).

## Screenshots

At 1920 and 3440. Use the `site` MCP tool's `shot` call (loads a URL in a fresh headless
Chromium, returns a PNG) — NOT Playwright driving a live tab, and NOT the owner's own browser
(CLAUDE.md / the `ui-test` skill: never drive the owner's live tabs). Save the two PNGs into
this page's own folder (`public/framework/styles/widths/`), and embed both ON the page itself
(an `<img>`/`demo()` — show the screenshots, don't just link them, per CLAUDE.md "show, don't
tell"). You'll need the dev server to actually have this page before you can shoot it — write
the page, let the live reload pick it up (reloads are held for this whole task; see "Hold" below),
then shoot once it's in.

## The recommendation

At the bottom of the page, in plain sentences: which of the four you'd default a card's content
list to, and why, in terms of what the screenshots actually show (not CSS theory). Say what the
alternative was and why it lost.

**If restrained (arrangement 2 or 3) is clearly better** at both 1920 and 3440 — meaning:
`.page-content-list` (used by every card on the AI board, `core/Page/Page.css`) should default
to it — make that change yourself in `core/Page/Page.css`'s `.page-content-rows-col` /
`.page-content-row` rules (small: cap the row at `--measure`, keep start or add centering per
your finding). If it's NOT clearly better (e.g. full-width genuinely reads fine and the owner's
own words say "I don't want to just restrain them, because then you can't easily have full-width
pages" — take that seriously), leave `.page-content-list` alone and say so, with your reason,
on the page. Either way: say what you did and why, in one paragraph, visible on the page.

## Fence — files you may touch

- `public/framework/styles/widths/` (new: `page.js`, the two screenshot PNGs, `readme.md` if you
  add one)
- `public/framework/styles/page.js` — ONE line, the `children:` string, last, right before commit
- `core/Page/Page.css` — ONLY the content-list row-width rules, only if your finding says to
  change them (above)
- This brief's own directory for your log: `public/framework/ai/2026-10-03/card-measure-colors/minion-widths/task.jsonl` — open it with `new-task` style logging before your first edit if it doesn't exist (check first; it may already be a live child of the parent task).

Don't touch `framework.css`, `.claude/skills/`, or anything under `minion-grounds/` — a sibling
minion is building the colour lab in parallel and may be editing `framework.css` at the same
time.

## Hold reloads

Reloads for this whole task are held: `node Server/hold.mjs on "minion-widths — widths lab"`
before your batch of writes if you need a fresh hold (check first — the parent may already have
one running; holds expire after 5 minutes, so re-issue if yours runs long), write the batch, load
the page to confirm it works, `node Server/hold.mjs off "minion-widths"` when you release it.
Nothing starts a server of its own — the dev server is already running.

## Land

Commit your files (small commits, by exact path — this is the main tree, not a worktree; don't
`git add -A`). Log your work in your task.jsonl (`new-task`/`finish-task` shape). Report back to
your parent (`task-mastermind-card-measure-colors`) with: the page URL, the two screenshot paths,
and your one-paragraph recommendation — that's what gets relayed up, not a transcript.
