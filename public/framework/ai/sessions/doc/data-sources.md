# Where session data lives: the SDK file is the one copy of what was said

**Answer: yes, we were duplicating the owner's prompts, mostly in files git never sees (about 185 MB on this disk), and 8 MB inside git.** The raw Claude session file at `~/.claude/projects/<dir>/<session>.jsonl` already holds every prompt word for word. Everything else should link to it: the page `/ai-logs/<id>` renders it, and `SessionIndex` gives each row `raw.transcript` (the file) and `raw.task`. Measured by `node Server/session-dup.mjs` (read-only, hashes only; 9,692 SDK files, 7.4 GB, 232,603 user lines; repo lines 138,445 = scanned 138,439 + 6 blank, they agree). A unit counts as a duplicate when a paragraph of 60+ characters, lower-cased and whitespace-collapsed, hashes the same on both sides.

| Writer (who writes it) | Files (tracked) | Text | Same text in SDK files | Verdict |
|---|---|---|---|---|
| `owner-prompts.jsonl` (a task's extraction) | 1 (1) | 7.0 MB | 6.4 MB | duplicate; already ignored for new writes (`.gitignore`); the one tracked copy needs a scripted untrack |
| `words.jsonl` (`Server/council.mjs` `collect()`, line 138) | 7 (6) | 1.7 MB | 1.7 MB | duplicate; now ignored (`.gitignore`); 6 tracked copies need the same untrack |
| session `page.jsonl` Prompt items (`.claude/hooks/prompt-relay.mjs:248`) | 4,990 (748) | 184 MB | 180 MB | duplicate; local only (ignored by `.gitignore:143`), 13 KB tracked |
| `.claude/prompts/<day>.jsonl` (prompt hook) | 7 (0) | 6.1 MB | 5.6 MB | duplicate; local only (ignored) |
| `requirements*.md` / `brief*.md` | 1,389 (1,385) | 5.4 MB | 0.19 MB | **record**: a brief is the ask a task was built from, edited and numbered; the overlap is the verbatim quotes in it |
| `chat` lines in `task.jsonl` | 1,498 (1,498) | 84 KB | 2 KB | fine; replies, not the owner's prompts |
| Dictate / voice logs (`v-*.jsonl`, whisper) | 44 (18) | 0.2 MB | 0 | not a duplicate: the voice session's own cues and cleaned text |

Inside git, 8.05 MB is duplicate: 6.37 owner-prompts, 1.66 words, 0.01 cards, plus 0.18 MB of quotes in briefs that stay.

## Decisions

- **Stop writing the copy; link instead.** A prompt is stored once, in the SDK file. Anything else holds `{session, line}` or `/ai-logs/<id>#<line>`, never the text.
- **Briefs stay.** `requirements.md` is a refined, numbered ask, not a transcript; quoting the owner's words in it is the record of what was built from.
- **Fixed today (additive, one line each):** `.gitignore` now ignores `**/words.jsonl` and `public/ai/v-*.jsonl` (voice test logs, machine state). `Server/council.mjs` and `Server/crawl.mjs` wrote to the retired `ai/YYYY-MM-DD/` day folder; they now write into `ai/sessions/YYYY/MM/DD/<slug>/`, and the two stray folders there moved by script (`ai/sessions/task-moves.jsonl` has the lines; `session-dup-check/scratch/stray-manifest.json` the manifest).
- **Needs a real edit, not made here (more than two lines, readers depend on it):**
  1. `prompt-relay.mjs:248`: `page_add` a `Prompt` item `{ref: {session, at}}` with no `text`; the `Prompt` block and `Echo` read the text from the SDK file through `/ai-logs/<id>`. The 180 MB of existing cards stays (never destructive) and shrinks only when a script drops `text` from items that match.
  2. `council.mjs collect()`: write `{source, at, session_id}` and let the council checkers resolve text from the SDK file.
  3. Untrack the 7 tracked `owner-prompts`/`words` copies with `git rm --cached`, in a script with a manifest; history keeps them.

## Re-run

`node Server/session-dup.mjs` (about 4 minutes; `--files` lists the 25 biggest files). It only reads.
