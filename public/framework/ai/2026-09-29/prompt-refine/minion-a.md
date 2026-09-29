# Minion A — build `Server/refine.mjs`

Load the `minion` skill first, then `code`. Your task mastermind is `task-mastermind-prompt-refine`.

## The owner's words (read them in full)

`C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\prompt-refine\owner-words.md` and the task brief `requirements.md` beside it (asks 1–5 are yours). The heart of it, verbatim: *"I want to see the raw whisper transcriptions … so that if I want to look at like wait what did I actually say … I need to have some audit ability over the raw transcriptions being converted into summarized transcriptions because … sometimes the LLM will leave out important details … and we need to make sure that the LLM isn't summarizing incorrectly like choosing different words or … being overly prescriptive or restrictive … when I haven't said it explicitly that way."* And: *"Multiple models are processing the same transcription and then they … work collaboratively to pick the best names … the best wording … the best structure."*

## Where you work

Worktree `C:\Code\lew42\worktrees\prompt-refine` (branch `worktree/prompt-refine`, server http://localhost:65317/). Commit there. Never edit the main tree `C:\Code\lew42\monorepo` (except appending to your log, below).

**Fence (you may write only these):** `Server/refine.mjs`, `Server/doc/refine.md`, `Server/ask-each.mjs` (only to export `askOnce` and guard `main()` so importing it doesn't run it), `Server/collab.mjs` (only if a small, backward-compatible hook is truly needed; say why in your log), `.claude/skills/new-task/SKILL.md`, `.claude/skills/sub-mastermind/SKILL.md`, `.claude/skills/every-prompt/SKILL.md` (one short paragraph each, see 6), and `public/framework/ai/2026-09-29/prompt-refine/runs/sample/` for your test run.

## Deliverables

1. **Check ask 1 first (read only, 10 minutes):** is the raw Whisper text kept word for word and viewable (the dictation playground's Raw tab, `public/framework/ux/Dictate/` or wherever it lives), and does `.claude/prompts/<date>.jsonl` keep typed prompts verbatim? Write the answer, with file paths, as the first section of `Server/doc/refine.md`. If raw is NOT kept somewhere, say exactly where it's lost; don't fix it.
2. **`node Server/refine.mjs <raw.txt | prompt-ref> [--out <dir>] [--models haiku,sonnet] [--collab] [--mock]`.** A prompt-ref is `<date>:<line>` into `.claude/prompts/<date>.jsonl` (0-based line; the text is at `.prompt.text`). Default `--out` is the current dir. It writes, beside each other:
   - `raw.txt` — the input, byte for byte.
   - `clean.md` — near-verbatim: fillers (uh, um, like, you know, repeated words) removed, typos and punctuation fixed, nothing else changed. **Every sentence numbered** `S1`, `S2`, … so later files can cite them. Check it mechanically: the clean text's content words should be almost all present in the raw; log the ratio.
   - `structured.md` — the owner's ideas as an outline, in the owner's own words and names, every bullet citing its sentences `[S3, S7]`.
   - `brief.md` — numbered asks for a mastermind, each citing `[S…]`, keeping the owner's names for things. A suggestion stays a suggestion ("maybe", "I think" → "the owner suggests"), never a rule.
   - `coverage.md` — the audit, the core of the task: a table with one row per clean sentence: `S# | the sentence | → ask # / "context only" / "dropped, because …"`. Built MECHANICALLY from the citations first (a sentence nobody cites is flagged uncited), then one model pass classifies only the uncited ones. Then a second table of **flags**: an ask that uses a word or a strength (must/never/always/only) that its cited sentences don't contain.
   - `refine.json` — models, cost per step, word counts at each rung, coverage numbers.
3. **Multi-model structured step.** With `--models a,b` (default Haiku then Sonnet, cheap first) each model drafts `structured.md` independently (`structured-<model>.md`); with `--collab` the choice among drafts goes through `Server/collab.mjs` (read `Server/doc/collab.md`: write a `collab.json`, run it, read `collab/tally.md`) and the winner plus its caveats becomes `structured.md`. Without `--collab`, a single cheap judge call picks and merges. Either way `refine.json` records which model's draft won, so over runs a scoreboard can say which model refines best; append one line per run to `Server/doc/refine-scoreboard.jsonl` (`{at, input, models, winner, costs}`).
4. **Reuse, don't write a third engine.** Model calls go through `askOnce` from `Server/ask-each.mjs` (export it). The collab goes through `collab.mjs`. No new npm dependency. Every Node spawn sets `windowsHide: true`.
5. **Prove it on one short sample** (a 300–600 word owner dictation from `.claude/prompts/2026-09-29.jsonl`; the text in `owner-words.md` is a good one) into `public/framework/ai/2026-09-29/prompt-refine/runs/sample/`, without `--collab` (budget). Read coverage.md yourself: does every sentence go somewhere? Is any flag wrong? Fix the prompts until it is honest. `--mock` must run with no model calls, for a free smoke test.
6. **One paragraph in each of the three skills** (new-task: "a brief made from dictation is made with refine.mjs, and coverage.md sits beside requirements.md"; sub-mastermind: same, for relays down; every-prompt: the fast assistant hands long dictation to refine.mjs rather than summarizing). Three sentences each at most; plain sentences, no jargon.
7. `Server/doc/refine.md`: what it is (one line), the command, the files it writes with a 5-line example of coverage.md, what the ask-1 check found, costs measured.

## Budget and model

About **$3** of model calls total including your test runs. You are Sonnet. Use Haiku for clean, Haiku+Sonnet for structured, Sonnet for brief and the coverage classification.

## Log and land

Append progress to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\prompt-refine\task.jsonl` with `node .claude/hooks/append.mjs` (log lines: `{"log":{"at":"NOW","msg":"minion-a: …"}}`). Commit in the worktree. Do NOT merge; your mastermind merges. When done, end your turn with: the commit hash, the exact command you ran for the sample, the coverage numbers, and anything you couldn't do.
