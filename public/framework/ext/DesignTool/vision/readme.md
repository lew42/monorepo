# vision — screenshots × a model × a prompt, one JSONL line each. The AI half of DesignTool: `analyze()` measures, this one looks.

## Use
```bash
node public/framework/ext/DesignTool/vision/run.mjs \
  --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto \
  --prompt critique-full-v1 --model sonnet --out public/framework/ai/<date>/<slug>
```
`--dry` prints the plan and a cost estimate and asks nothing · `--resume-run` skips shots already logged ·
`--turn2 css-v2` resumes each image's own session for a `decl` · `--replay <run-dir>` asks again about
that run's pngs instead of capturing · `--max-regions 4` · `--jobs 3` · `--sel ".ai-card"` names the regions yourself (every match shoots; the auto picker steps aside).
Out: `shots/*.png` (gitignored), `vision.jsonl` (a line per shot), `prompts.json` (verbatim, so a run reads alone).
Browse: [/framework/ext/DesignTool/vision/](/framework/ext/DesignTool/vision/)`?run=<out>`.

## Watch out
- **Never edit `SYSTEM` in `run.mjs`.** It is the prompt-cache key; changing it makes every call pay a cold cache write. Omitting it costs more still — the CLI default re-reads 46k of skills and CLAUDE.md per image.
- Every ask carries a context header in the user turn — url, viewport, and whether the image is the unscrolled top of a page or a region at a box. **The header is context, not judgement**: without it a heading hard against the top edge reads as "scrolled to here", and ~12 reads of the day page missed a zero-space `h1`. It stays out of `SYSTEM`, which is the cache key.
- Node only, never the browser — a paid ask on a page that re-measures on resize is a bill wired to a mouse.
- Fresh session per image. Resuming one session across images cost 3.5× for worse independence.
- The region size gates are the picker (no area cap and one box swallows every card; no height cap and a 4423px `.page` is shot whole) — and **a region costs the same as a page** ($0.068 vs $0.087): the bill is the answer plus a fixed 40k cache read, never the image. Shoot fewer, better regions.
- Measured 2026-08-17, `critique-full-v1`: sonnet **$0.072** a shot, opus **$0.195**, fable **$0.321**. **Turn 2 costs more than turn 1, and its answer length is the bill** — not the files it reads: `css-v2` uncapped ran 13.6k output tokens for **$0.40** against turn 1's $0.11, and capping `why` at 12 words and the answer at 400 brought it back. Budget turn 2 as a second run; cap opus.
- **A missing page is HTTP 200.** The SPA fallback serves index.html and `core/App` renders "Page Load Error" into it, so `--pages` typos cost a full ask and look like data — `/framework/web/` was critiqued as a design sample from the pilot on. `grab()` now checks the rendered DOM for `.active-page pre.error`.
- **Consensus needs `--replay`, not a re-run.** Capture twice and a live dashboard drifts between them, so the two asks judge different pictures and their disagreement means nothing.
- Windows/git-bash mangles `--pages /framework/…` into a `C:/Program Files/Git/…` path — prefix `MSYS_NO_PATHCONV=1`.
- Prose is the durable half; the prompts ask for no score on purpose ([../doc/decisions.md](../doc/decisions.md)).

## More
- [`prompts/`](./prompts/) — `critique-full-v1` is still `run.mjs`'s default · `critique-full-v2` adds twelve angles and a `fix` per finding · `css-v2` (turn 2: reads the cascading CSS and the `css`/`layout` skills, returns `{sel, decl, why, ladder_rung}`, may append to a skill's `improvements.md`) · `critique-full-v3` + `prompts/intent.md` folds in the false-finding modes (run, and it over-suppresses — see the verdict below) · **`critique-full-v4`** is `v2` with `fix` as a DIRECTION (`{direction, property, amount, text}` — no CSS, no px) and **`css-v3`** makes turn 2 answer every finding with a delta or an explicit `{retract: true}`. Editing one is a new id, never an edit in place: a run's lines point at it by name.
- **Measured twice, failed twice — never ship a `decl` unread.** Precision **0.17** ([vision-fixes](/framework/ai/2026-08-17/vision-fixes/quality.md): agreement *anti*-predicts correctness) and **0.25** ([vision-direction](/framework/ai/2026-08-17/vision-direction/quality.md)). But ask for a **direction** instead and it is **0.93** — right 28 of 30. **Turn 2 is blind**: `Read` and no measurements, so it argues rendered geometry and colour from source and gets both wrong. Feed it `probe()` output before asking for CSS.
- [What was already built](/framework/ai/2026-08-17/shots-history/) — the inventory and the measured costs this reuses.
