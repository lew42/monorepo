# Coverage — every rule, old skill to new page

Every section of the old skills this task touched, and the page it now lives on. Nothing dropped; the "Exception" row is the one rule that was moved OUT of design on purpose (it already has a home).

## `.claude/skills/page/SKILL.md`

| Old section | New home |
|---|---|
| Never destroy a viable version | `/framework/design/doc/job.md` |
| The six steps (what/where/properties/layout/concepts/content/best-form) | `/framework/design/doc/job.md` |
| Two tests for every element | `/framework/design/doc/job.md`, summarized on `/framework/design/readme.md` |
| Which kind of page is this? (types.json) | `/framework/design/doc/job.md` |
| Content kinds table | `/framework/design/doc/job.md`, summarized on `/framework/design/readme.md` |
| Structured content (hierarchy, background, outline, weight, icon table) | `/framework/design/content/doc/rules.md` |
| Cards: which one, when | `/framework/design/content/doc/rules.md` |
| **Exception:** "A page has an inbox" | NOT moved — stays a Servex fact at `/framework/ai/inboxes/`; the design readme and the thin `page` skill both link there instead of restating it |
| page/questions.md — Page structure (1–12) | stays where it is for now (minion B's `review.mjs` still reads the old file); the rules it checks now live at `/framework/design/doc/job.md` and `/framework/design/readme.md` |
| page/questions.md — Navigation (13–22) | `/framework/design/navigation/questions.md` (1–10) |
| page/questions.md — Controls (23–25, parked) | `/framework/design/ui/questions.md` (1–3) |

## `.claude/skills/content/SKILL.md`

| Old section | New home |
|---|---|
| Whole file (seen first/read second, let the layout say it, words when they earn it, connect the dots, the length check) | `/framework/design/content/doc/rules.md`, summarized on `/framework/design/content/readme.md` |
| content/questions.md (1–11) | `/framework/design/content/questions.md` (1–11, unchanged) |

## `.claude/skills/layout/SKILL.md` + `caveats.md`

| Old section | New home |
|---|---|
| Whole SKILL.md body (defaults, C1–C5, the five questions, spacing/bleed, content scale, the two bounds rules, rhythm, leave-the-defaults-alone table, boxes/padding/contrast, color meets color, look-at-it-then-cycle, the layout never jumps) | `/framework/design/layout/doc/rules.md`, summarized on `/framework/design/layout/readme.md` |
| caveats.md (whole file) | `/framework/design/layout/doc/caveats.md` (copied verbatim) |
| layout/questions.md (1–31) | `/framework/design/layout/questions.md` (1–31, unchanged) |

## `.claude/skills/css/SKILL.md` (only the two named slices — everything else is minion B's `/framework/code/css/`)

| Old section | New home |
|---|---|
| Icons (icon-system) | `/framework/design/ui/doc/rules.md`, summarized on `/framework/design/ui/readme.md` |
| Colour and contrast knowledge (no single heading in SKILL.md itself; the actual rules are `--wash` is the page ground, `--muted` is a percentage, and the `.h4` caveat, from `caveats.md`) | `/framework/design/color/doc/rules.md`, summarized on `/framework/design/color/readme.md` |
| The ratio rule and "color meets color" (written inside `layout/SKILL.md`, conceptually colour) | stayed physically on `/framework/design/layout/doc/rules.md#color-meets-color` (moving with the rest of layout, not duplicated); `/framework/design/color/readme.md` links to it rather than repeating it |
| css/questions.md — Colour and contrast (11–18) | `/framework/design/color/questions.md` (1–8) |
| css/questions.md — Spacing and padding (1–10) | `/framework/design/layout/questions.md` (32–41, appended) |
| Everything else (layers, the ladder, declaration placement, `new-css-class`) | untouched — minion B's `/framework/code/css/` |

## New pages, no old skill to move from

- `/framework/design/navigation/` — its rules ARE the moved Navigation questions (above); there was no navigation prose skill yet.
- `/framework/design/ui/` — its rules are the moved Icons section + the parked Controls questions (above).

## Gaps (nothing found)

None. Every section of every named source file above has a destination. The one deliberate non-move is the page-inbox exception, which is a decision, not a miss.

