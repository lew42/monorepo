# Research page: structure first, paragraphs never

Load the `minion` skill, then `page`, `code` and `css`, first. The owner's words are in
`public/framework/ai/2026-09-28/harness-research/owner-words.md`; the part that matters here:

> "we want to see the structure of the research. So like whatever page you're making for this research operation, I want to see like, you know, I want to see structured content … icon items where we can have like three to five named things per section … it's sort of like outlines … an outline creates like this picture using words … the parent items and then the number of child items … we don't want to use … three paragraphs … instead of just using a quick little outline"

## Where you work

Worktree **`C:/Code/lew42/worktrees/qf-2`** (branch `worktree/qf-2`), its own server at
`http://127.0.0.1:60969/`. Edit ONLY there, and only these files (your fence):
`public/framework/ext/Research/Research.js`, `Research.css`, `readme.md`, `doc/render.md`.
Commit in the worktree. Do NOT merge — the task mastermind merges.

## Today (shoot it yourself)

`/framework/research/livereload/` at 1920: title, question, a strip of minion chips, then the
seven-line summary as huge paragraphs, then the claim tree far below the fold.
The live topic to design against is `/framework/research/harness/` — roots are sub-area
`question` nodes; claims hang under them; `verdict` lines grade nodes; `why` may start with
`credence: …` or `true: … logic: … useful: …`. Read it with
`node public/framework/ext/Research/research.mjs outline harness` (copy the file from the main tree
`C:/Code/lew42/monorepo/public/framework/research/harness/` into the worktree if you need it there; do not commit that copy).

## Deliverables (in the order the page shows them)

1. **The topic tree first**, above the fold at 1920: each root is a named icon item (icon + short name + the claim count under it, and a small tally of its verdicts: accepted / rejected / parked). A grid of these, not a list of sentences. Name = the root's text up to the first `?` or `:` (shorten sensibly).
2. **Verdicts** next: a compact view of accepted / rejected / parked counts for the whole topic, and the summary lines as a short list (normal body size, not the current huge paragraphs).
3. **Detail on click:** clicking a sub-area item opens that sub-area's claims (the existing nested `details` tree is fine for the detail). The minion strip moves below, collapsed into one line.
4. **Route it:** a clicked sub-area has its own URL (a hash like `#qnjkd` that opens and scrolls to it on load is acceptable), so reload and back land in the same place.
5. **Credence and the three judgements readable:** if a `why` starts with `credence: X`, show X as a small tag on the claim row; if a dissent/support's `why` has `true:` `logic:` `useful:` parts, show them as three labelled lines in the body.
6. The livereload topic still renders (it has no question roots — its roots are claims; the tree then shows the top roots by score, capped at 9).
7. Proof: screenshots at 1920 of both topics in `public/framework/ai/2026-09-28/harness-research/shots/` (main tree path, ok to write), zero console errors (`node Server/smoke.mjs C:/Code/lew42/worktrees/qf-2 /framework/research/harness/ /framework/research/livereload/`).

## Rules

- New class names carry the `research-` prefix (`new-css-class` skill). CSS inside the existing layer.
- No DOM after an await; no new dependency; no processes with windows (`windowsHide: true`).
- Budget about $2. End your turn with one line: what changed, and the screenshot paths.
