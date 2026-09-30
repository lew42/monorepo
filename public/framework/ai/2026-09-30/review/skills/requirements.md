# Minion A — the review skill and four questions.md files

Load the `minion` skill first. Your parent is task-mastermind-review. The whole task: `public/framework/ai/2026-09-30/review/requirements.md` (read it in full). The owner's words, verbatim: `public/framework/ai/2026-09-30/page-audit/owner-words.md`, sections "Continued (about 12:35 PM)" and "Continued (about 12:45 PM)" — read both; they are the acceptance test.

**Work ONLY in the worktree `C:/Code/lew42/worktrees/review`** (branch `worktree/review`). Never edit the main tree at C:/Code/lew42/monorepo. Commit there by exact path when done.

## Deliverables
1. `.claude/skills/{page,layout,css,content}/questions.md` — four new files. Read that skill's SKILL.md (and layout/css `caveats.md`, css `strategy.md`, and `public/framework/styles/framework.css`'s header if the css skill names it) first. Each file: a title line, one sentence on what it is, then `## <system>` sections, each a numbered list. Every question is ONE definitive sentence answerable yes / no / not applicable from a screenshot, `layout.json` or the page's source, and ends with the rule it comes from in brackets, e.g. `3. Is every gap and corner from the spacing clamp, never a constant? [css: the padding law]`. Question numbers restart per file; cite as `layout 4`.
   - `page/questions.md`: page structure (what it is in the title/first line, concepts first, content order open-before-done, parent's `children:` names it, routed, self-evident + necessary tests), and **navigation**: FIRST "identify": list which techniques are on the page — tabs, a rail, a bottom rail, a sidebar, a sheet, a modal, full screen (plain links need not be listed) — then one question per technique found (e.g. tabs: fits in 1 row at 1920, ≤2 at 1200, ≤3 at 400; is every tab routed).
   - `layout/questions.md`: layout (width fills 3440, the three per-box questions), **sizing** (fixed height or auto? fixed only where content can't grow), **wrapping** (nothing wraps that shouldn't: a tab bar, a title, a button row; a wrap that appears only under 1920), **flow** (reading order top to bottom matches priority; nothing hidden off-screen).
   - `css/questions.md`: **spacing and padding** (stacked left padding over 3em at 400 is a fail; .pad/.card/.bleed opted in; clamp not constants; every rule in a layer), plus **colour and contrast** (text contrast, tokens not literal colours, dark mode) unless another skill owns colour — then put them there.
   - `content/questions.md`: the words — shown before told, paragraphs ≤60 words, same name every time, a picture beside a file of words.
   - Measurable questions (tab-bar rows, stacked left padding, unexpected wraps, band share of the screen, a big band with little ink) say in the bracket `[measured: layout.json <field>]` (fields: tab_rows, left_stack, bands, wraps — see the header of Server/layout-check.mjs) after the rule, so the reviewer knows a number answers it.
   - Aim for 6–12 questions per system; the most important first. Don't invent rules the skill doesn't state; if a question the owner asked for has no rule behind it, write it anyway and bracket `[owner 2026-09-30]`.
2. One line appended to each of those four SKILL.md files, and nothing else changed there: `Review questions for this system: [questions.md](questions.md) (the review skill asks them).`
3. `.claude/skills/review/SKILL.md` (new; frontmatter `name: review` and a `description` that triggers on "review", "use your review skill", "fresh-eyes review", "review this page"). Contents, short and plain:
   - Who: a fresh reviewer, never the author. You don't build; you answer.
   - What to load: the page, layout, css and content skills, and every `questions.md` (the four above).
   - What you get: the task's requirements.md and the owner's words it names; the diff; `shots/` in the task folder (400, 1200, 1920, 3440 per page, `sheet.png` per page) and `shots/<page>/layout.json` if present.
   - The order: requirements → page structure → navigation (identify first) → layout → sizing → wrapping → spacing and padding → colour and contrast → flow. The requirements questions live HERE in this skill: one per numbered ask in requirements.md, in the owner's words, "met?" with proof.
   - How to answer: one line per question: `yes` / `no` / `n/a`, then the evidence — a shot file (`shots/<page>/1200.png`, top band), or a number from layout.json. layout.json (from `layout-check.mjs --bands`) carries per width tab_rows, left_stack (each padding layer with its px), bands (share of screen, ink, big_empty) and wraps; quote those numbers as evidence. If a page has no layout.json, the measured question answers `not measured` and is judged from the shot.
   - Read every shot in horizontal bands, top to bottom (the owner's words): the share of the screen each band takes, the right size, its padding, wasted space, unexpected wraps.
   - The report: `<taskdir>/review/report.md`. First line exactly `verdict: pass` or `verdict: fix`. Then the findings list, `N. [fix] …` / `N. [note] …` (one or two sentences, each naming its question like `(layout 4)` and its evidence) — this is what `Server/review.mjs` parses, so keep it. Then one `## <System>` section per system, each question as `- layout 4 — no — shots/x/400.png: tab bar wraps to 3 rows`.
   - Link: the question list, live, at `/framework/ai/review/` (minion B builds it).
   Keep it under ~80 lines. Follow the `content` skill (load it) for the words.

## Fence
Only the six files above in `.claude/skills/` in the worktree. Not review.mjs, not the page.

## Log and land
Your task log is already open (see your first turn). Log a line per deliverable done. When done: commit in the worktree (`git -C C:/Code/lew42/worktrees/review add <exact paths>; commit`), then end your turn with a one-paragraph summary: file paths, question counts per file, any rule you couldn't find a source for. Don't run finish-task on the parent's task; land your own.
