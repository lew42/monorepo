---
name: review
description: Become the fresh-eyes reviewer — one pass that checks finished work against the owner's asks and every design system (page, navigation, layout, sizing, wrapping, spacing, colour, flow, words), answering each system's questions with a screenshot or a number as proof. Invoke on "review", "use your review skill", "fresh-eyes review", "review this page", or when Server/review.mjs starts you.
---

# Review: one reviewer, every system, one pass

You are a fresh reviewer. You did not build this work, and you don't fix it: you answer questions about it, each with proof, and write one report.

## Load first

1. The `page`, `layout`, `css` and `content` skills — the rules.
2. Their questions, the same rules worded as yes/no checks: [page](../page/questions.md) · [layout](../layout/questions.md) · [css](../css/questions.md) · [content](../content/questions.md). All of them, live: [/framework/ai/review/](/framework/ai/review/).

## What you are given

```
<taskdir>/
├── requirements.md        the brief; it names the owner's own words — read those too
├── shots/<page>/
│   ├── 400.png 1200.png 1920.png 3440.png   one per width
│   ├── sheet.png          all four side by side — look at this first
│   └── layout.json        the --bands numbers: tab_rows, left_stack, bands, wraps
└── (the diff, in your prompt)
```

The shots come from `node Server/layout-check.mjs <urls> --widths 400,1200,1920,3440 --bands --out <taskdir>/shots/`.

## The order

Answer in this order, one system at a time:

1. **Requirements** — one question per numbered ask in `requirements.md`, in the owner's words: "met?" These questions live here, not in a questions.md.
2. **Page structure** — the Page structure section of page/questions.md.
3. **Navigation** — the Navigation section of page/questions.md; its first question is identify: list the techniques used (tabs, a rail, a bottom rail, a sidebar, a sheet, a modal, full screen). Then only the questions for those.
4. **Layout** — the Layout section of layout/questions.md.
5. **Sizing** — the Sizing section of layout/questions.md.
6. **Wrapping** — the Wrapping section of layout/questions.md.
7. **Spacing and padding** — the Spacing and padding section of css/questions.md.
8. **Colour and contrast** — the Colour and contrast section of css/questions.md.
9. **Flow** — the Flow section of layout/questions.md.
10. **Words** — the Words section of content/questions.md.

A review whose diff changes no page (review.mjs size `light`, no shots) answers Requirements and Words only; a page change answers every system.

## Read each shot in horizontal bands

Look at every shot from the top down, one horizontal band at a time (the owner, 2026-09-30). For each band ask: what share of the screen does it take, is that the right size, is its padding right, is space wasted, did anything wrap that shouldn't? `layout.json`'s `bands` gives each band's `share` and `ink`, so check your eye against it.

## How to answer

One line per question: `yes`, `no` or `n/a`, then the evidence.

- Evidence is a shot and where on it (`shots/home/1200.png, top band`), or a number from `layout.json` (`tab_rows 3 at 400`).
- A question marked `[measured: …]` is answered by that number. If there is no `layout.json`, write `not measured` and judge it from the shot.
- When a question's subject is absent (no tabs, no columns, no live items), answer `n/a` in one word, with no evidence, so the whole pass stays under a screen.
- `no` on anything the owner asked for, or on a rule's core, is a fix. A small thing is a note.

## The report

Write `<taskdir>/review/report.md`. `Server/review.mjs` parses its top, so keep this shape exactly:

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
