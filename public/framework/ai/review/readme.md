# Review questions — every question a fresh reviewer asks, per system, read live from the skills' own rules

The `review` skill asks nine systems of questions, in order: requirements, page structure,
navigation, layout, sizing, wrapping, spacing and padding, colour and contrast, flow, then
anything else (today, content's own "Words"). This page shows every one of them, live — never a
copy typed out by hand, so a new rule in a skill's `questions.md` shows up here the moment it's
written.

## Use

`node Server/review.mjs --questions` reads every skill's own `questions.md` (plus the review
skill's own `SKILL.md`, in case it ever grows numbered questions the same way) and writes
[`questions.json`](questions.json), which this page fetches and renders. `main()` in
`Server/review.mjs` also runs this at the start of every real review, so the file — and this page
— never go stale even if nobody runs the command by hand.

To add a question: add a numbered line to the owning skill's `questions.md`, in the shape
`N. <question>? [<skill>: <rule>]` (a second bracket, `[measured: layout.json <field>]`, is
allowed when the review skill can answer it from a number instead of an eyeball). Re-run
`--questions`, or just run a review — no other file to touch.

## Watch out

- A numbered line with no `[...]` bracket is a plain step, not a question, and is skipped —
  this is what keeps the review skill's own "## Load first" numbered list (no brackets) out of
  this page's count: [`doc/decisions.md`](./doc/decisions.md)
- A rule tag can contain its own balanced `[]` (`layout: questions.md`'s
  `[measured: layout.json bands[].share, ...]`) — a naive bracket regex truncates at the FIRST
  `]`, which is that inner one, and leaves the rest of the line stuck on the question's text.
  `Server/review.mjs`'s `bracketSpans()` tracks nesting depth instead: [`doc/decisions.md`](./doc/decisions.md)
- A markdown link (`[page](../page/questions.md)`, in the review skill's own "## Load first"
  list) looks exactly like a rule tag to a bracket scanner — skipped because a real rule tag is
  never immediately followed by `(`: [`doc/decisions.md`](./doc/decisions.md)
- Each system's "Source: …" line is plain text, not a link — `.claude/skills/` is outside
  `public/`, the only folder this site's dev server actually serves
  (`Server/Server.js`'s `express.static("public")`), so there is no URL for it to point at.
  Open it in an editor instead: [`doc/decisions.md`](./doc/decisions.md)

## More

- [The page itself](/framework/ai/review/) — the systems as tiles, then every question
- `.claude/skills/review/SKILL.md` — the review skill that asks these questions, and how
- `Server/doc/review.md` — the four-turn review process this page's questions feed into
- Files that matter: `page.js` (show, don't tell), `questions.json` (generated — never hand-edit)
