# Prompt refinement: ONE process for dictation and for every typed prompt, with zero detail lost: requirements

Budget: $15 (step 1 is about $1; the past-prompt batch waits for its own go/no-go).

The owner, 2026-10-02 (trimmed; the full words are in `.claude/prompts/2026-10-02.jsonl`, the prompt at 21:03): "summarize all of my prompts into prompt instances… I don't want you having to use a tool to rewrite my long prompts and copy and paste… prompt refinement… exactly how the dictate app is supposed to work. That absolutely has to be the same process… turning a massive rambling prompt into a coherent summarized UI card with little sections… a streaming thing… the clean transcript is half the battle… zero detail lost… the prompt gets chunked in a systematic way where the AI decides how to chunk it, but the program makes sure the entire prompt is chunked… capitalization, punctuation, filler removal are fine, but don't summarize in different words… unless I correct myself ('not this, I meant that'): then strike it… leave a clarification question for later… use the system's names (CLAUDE.md, the modules) to fix misheard concepts… flag an unclear passage red, and in the live chat play a sound… this is the perfect test for low-level minions… combine my prompt with your response into a prompt + response hybrid, like a chat, with modes from the clean transcript down to a condensed snapshot… log your responses too… keep the full session logs for the record."

## What exists (build on it; law 6)
- **Every prompt is already logged verbatim:** `.claude/prompts/<date>.jsonl` (`{"prompt": {at, session_id, author, text}}`), written by a hook (the `every-prompt` skill).
- **The ladder already exists:** `ext/Refine` + `Server/refine.mjs` turn raw text into clean, then structured, then a brief, with a COVERAGE table (every source sentence mapped). That's the "program makes sure the whole prompt is chunked" check.
- **Dictate's clean step** (ux/Dictate) cleans live segments separately. That's the duplicate to merge.

## Build
1. **One refine process, two speeds:** `refine(text, {stream})` in one module, used by Dictate (streaming, per segment) and by the prompt log (whole prompt). Dictate's own clean step is replaced by it.
2. **Clean = near-verbatim, enforced by code:** only capitalization, punctuation and filler removal. A word-level diff check by node rejects a clean line that adds or replaces content words, except (a) an explicit self-correction, which is shown as a strike, and (b) a fix to a known name from the module/CLAUDE.md glossary, which is shown as `misheard → Name`.
3. **Structure = every sentence placed:** the model groups sentences under headings (it may reorder). Node checks that every source sentence id appears exactly once (the coverage table). A missing sentence fails the run.
4. **Flags:** an unclear passage gets a red flag and a clarification question saved with it (answerable later). In live Dictate, a red flag plays a short sound.
5. **The prompt card:** each logged prompt gets a refined card. Modes: Condensed (headings only, each self-explanatory and clickable) → Structured → Clean → Raw. The prompt and my reply are shown as one exchange (prompt first, reply beside or below it).
6. **Log the replies too:** the Stop hook appends the assistant's final reply for the owner's sessions to the same daily prompts log (`{"reply": {at, session_id, text}}`), so prompts and replies pair by session and time.
7. **The litmus test for cheap models:** cleaning one short prompt is the first rung of the model ladder (machine-checked by the diff and coverage rules above, no opinion needed). Run 3 cheap models, compare, and pick the refine model by the data.
8. **Batch the past (separately approved by its own go/no-go):** run the winner over the logged prompts since 09-30 and attach a card to each.

## Session records (decided by vscode-mastermind, 2026-10-02)
- **Done:** Claude Code deleted transcripts after 30 days by default (the oldest kept one was from 09-04). `cleanupPeriodDays: 3650` is now set in the user settings, so transcripts are kept for years.
- **Not in git:** transcripts hold secrets (an API key was pasted into a session) and would bloat the repo. Instead, a nightly node job copies new transcripts to `%LOCALAPPDATA%/lew42/transcripts/` (a local archive). The refined prompt log, which is derived and screened, is what gets committed.

## Rules
A Sonnet task mastermind. Coordinate with @task-mastermind-one-dictation, which owns the Dictate widget (it adopts `refine()`; it doesn't build a second one). Never wait on the owner.
