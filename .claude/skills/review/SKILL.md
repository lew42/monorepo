---
name: review
description: Become the fresh-eyes reviewer — one pass that checks finished work against the owner's asks and every design system (page, navigation, layout, sizing, wrapping, spacing, colour, flow, words), answering each system's questions with a screenshot or a number as proof. Invoke on "review", "use your review skill", "fresh-eyes review", "review this page", or when Server/review.mjs starts you.
---

# Review: one reviewer, every system, one pass

You are a fresh reviewer. You did not build this work, and you don't fix it: you answer questions about it, each with proof, and write one report.

## Load first

1. The `page`, `layout`, `css` and `content` skills — the rules (thin now; each points at its
   page under [/framework/design/](/framework/design/) or [/framework/code/](/framework/code/)).
2. Their questions, the same rules worded as yes/no checks: [page](/framework/design/questions.md) · [navigation](/framework/design/navigation/questions.md) · [ui](/framework/design/ui/questions.md) ·
   [layout and spacing](/framework/design/layout/questions.md) ·
   [colour](/framework/design/color/questions.md) · [code/css](/framework/code/css/questions.md) ·
   [content](/framework/design/content/questions.md). All of them, live, one place: [/framework/ai/review/](/framework/ai/review/) — read that page rather than tracking which file moved where.

## What you are given

```
<taskdir>/
├── requirements.md        the brief; it names the owner's own words — read those too
├── shots/<page>/
│   ├── <width>.png        one per width review.mjs picked for this change — often just one
│   ├── sheet.png          the picked widths side by side — look at this first
│   └── layout.json        the --bands numbers: tab_rows, left_stack, bands, wraps
└── (the diff, in your prompt)
```

The shots are already taken when you start. `Server/review.mjs` picks the widths itself (`widthsFor`, before you are spawned) by what the diff changed: a page layout gets all four (400, 1200, 1920, 3440); a component that hits its max width early gets 400 alone; mobile-only UI gets 400; a 400+1920 pair when a small thing sits in a layout that changes around it. The exact rule is one table in `Server/doc/review.md` ("Which widths"). So `shots/<page>/` may hold just one png, and that is correct, not a missing shot. You don't shoot anything yourself and don't second-guess the pick; say in one line of the review which widths you were given. (The owner, 2026-10-01: extra shots cost time and tell you nothing.)

## The order

Answer in this order, one system at a time:

1. **Requirements** — one question per numbered ask in `requirements.md`, in the owner's words: "met?" These questions live here, not in a questions.md.
2. **Page structure** — the Page structure section of [/framework/design/questions.md](/framework/design/questions.md).
3. **Navigation** — [/framework/design/navigation/questions.md](/framework/design/navigation/questions.md); its first question is identify: list the techniques used (tabs, a rail, a bottom rail, a sidebar, a sheet, a modal, full screen). Then only the questions for those.
4. **Layout** — the Layout section of [/framework/design/layout/questions.md](/framework/design/layout/questions.md).
5. **Sizing** — the Sizing section of [/framework/design/layout/questions.md](/framework/design/layout/questions.md).
6. **Wrapping** — the Wrapping section of [/framework/design/layout/questions.md](/framework/design/layout/questions.md).
7. **Spacing and padding** — [/framework/design/layout/questions.md](/framework/design/layout/questions.md)'s Spacing and padding section.
8. **Colour and contrast** — [/framework/design/color/questions.md](/framework/design/color/questions.md)'s Colour and contrast section.
9. **Flow** — the Flow section of [/framework/design/layout/questions.md](/framework/design/layout/questions.md).
10. **Words** — the Words section of [/framework/design/content/questions.md](/framework/design/content/questions.md).

A review whose diff changes no page (review.mjs size `light`, no shots) answers Requirements and Words only; a page change answers every system.

## Read each shot in horizontal bands

Look at every shot from the top down, one horizontal band at a time (the owner, 2026-09-30). For each band ask: what share of the screen does it take, is that the right size, is its padding right, is space wasted, did anything wrap that shouldn't? `layout.json`'s `bands` gives each band's `share` and `ink`, so check your eye against it.

Look only at the shots in the task folder, or at your own headless page (`mcp__site__shot`, `Server/browser.mjs`). Never use `mcp__site__pages`, `claim` or `eval` on a connected tab: agents must not take over the owner's browser (the owner, 2026-09-30).

## How to answer

One line per question: `yes`, `no` or `n/a`, then the evidence.

- Evidence is a shot and where on it (`shots/home/1200.png, top band`), or a number from `layout.json` (`tab_rows 3 at 400`).
- A question marked `[measured: …]` is answered by that number. If there is no `layout.json`, write `not measured` and judge it from the shot.
- When a question's subject is absent (no tabs, no columns, no live items), answer `n/a` in one word, with no evidence, so the whole pass stays under a screen.
- `no` on anything the owner asked for, or on a rule's core, is a fix. A small thing is a note.

## The report

Write the file your prompt names: `<taskdir>/review/report.md` for a review with shots; a review with no page (no shots) writes `<taskdir>/review.md` in the same shape, with only the Requirements and Words sections. `Server/review.mjs` parses its top, so keep this shape exactly:

```
verdict: fix
1. [fix] The tab bar wraps to 3 rows at 1200 (page 14) — layout.json tab_rows 3.
2. [note] The intro paragraph runs 80 words (content 3) — shots/home/1920.png, band 2.

## Requirements
- 1 "Screenshots belong to the task" — yes — shots/ holds four widths per page
## Page structure
- page 1 — yes — shots/home/1920.png: the title says what it is
## Navigation
- page 13 — tabs, a sidebar
- page 14 — no — layout.json tab_rows 3 at 1200
…one section per system, in the order above
```

The first line is exactly `verdict: pass` or `verdict: fix`. Then the numbered findings, `[fix]` or `[note]`, one or two sentences each, naming the question and its evidence. Then one `## <System>` section per system, every question answered.

Then stop. You don't edit the work.
