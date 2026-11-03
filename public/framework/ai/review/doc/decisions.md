# Decisions — how `--questions` reads a `questions.md` file without being fooled by it

## A numbered line only counts as a question if it has a rule tag

`.claude/skills/review/SKILL.md`'s own "## Load first" section is a numbered list too ("1. The
page, layout, css and content skills — the rules."), but it's a set of instructions, not a
review question, and it carries no `[...]` bracket. `Server/review.mjs`'s `parseQuestionsFile()`
skips any numbered line with zero brackets, so scanning a file that happens to have OTHER
numbered lists nearby (any skill's `SKILL.md`, not just `review`'s) is safe by construction —
no special-casing which headings to skip, just "does this line name a rule."

The same function also skips a fenced ` ``` ` code block outright, because the review skill's own
example report inside one has lines shaped like `1. [fix] The tab bar wraps...` — a genuine
bracket, but a finding's KIND, not a rule tag, and it would otherwise be picked up as a fake
question.

## Balanced brackets, not a non-greedy regex

The simplest bracket extractor, `/\[([^\]]+)\]/g`, breaks on `layout/questions.md`'s own line 7:

```
7. Does each band ... ? [owner 2026-09-30] [measured: layout.json bands[].share, bands[].ink, bands[].big_empty]
```

`bands[]` is an array-index notation INSIDE the outer `[measured: ...]` bracket. A non-greedy
match stops at the FIRST `]` it sees, which is the empty one right after `bands[` — so the
"rule" comes out as `measured: layout.json bands[`, and the rest of the line
(`.share, bands[].ink, bands[].big_empty]`) is left stuck onto the question's own text, visible
to anyone reading the rendered page.

`bracketSpans()` in `Server/review.mjs` tracks bracket NESTING DEPTH instead of using a regex at
all: depth goes up on `[`, down on `]`, and a bracket segment only ends when depth returns to
zero. `bands[].share` never confuses it, because the inner `[]` only takes depth from 1 to 2 and
back to 1 — still inside the outer bracket, never mistaken for its end.

## A markdown link is not a rule tag

The review skill's own "## Load first" section links to each questions.md:
`[page](../page/questions.md) · [layout](../layout/questions.md) · ...` — square brackets, so a
plain bracket scanner reads `page`, `layout`, `css`, `content` as four "rule tags" on one numbered
line, and that line (not a real question at all) would show up on the page as a garbled fifth
system. The fix: a bracket immediately followed by `(` is a markdown link's TEXT half, not a rule
tag, and `bracketSpans()` skips it. Caught by reading the actual `questions.json` this produced
before writing the page that reads it — the file had 10 "systems" instead of the expected 9,
and the 10th was this exact line.

## The source line is text, not a link

Every system's questions.json entry names its `file` — `.claude/skills/page/questions.md`, for
example. That path is real on disk but outside `public/`, the one folder `Server/Server.js`
actually serves (`express.static("public")`). There is no URL anywhere on this site that resolves
to it, unlike `Servex/`/`Server/` files, which get their own dev-only viewer
(`Server/plugins/DevSource.js`, `file_link()`'s special case for those two folders). Building the
same thing for `.claude/skills/` would be a real second feature, and it's outside this task's
fence (`Server/review.mjs`, `Server/doc/review.md`, `public/framework/ai/review/`, one word in
`public/framework/ai/page.js`) — so the page names the file as plain text, honestly not-a-link,
rather than pointing at a URL that 404s.
