# Skill usage audit: are the rules read and worth it?

**Owner's questions (2026-10-12, dictated):** skills load on demand, but the AI must choose to load them.
- ⬜ Are skills actually used? Is there a log of it?
- ⬜ Is there rule bloat, or rules worded slightly wrong so agents follow bad instructions?
- ⬜ Should rules live in skills (`.claude/`, less visible) or in readmes beside the code?
- ⬜ If skills go unused, why, and would node tools instead of skill prose fix it?

## Do (scripts compute; a model reads only summaries; Haiku under 60k tokens)
1. **Usage, by script:** from the raw transcripts (`~/.claude/projects/**/*.jsonl`, plus `ai/sessions/` index files, and any Skill-hook log, see memory note "Skills 2026-08-17": a Skill hook logs calls) count `Skill` tool invocations per skill, per day, per agent role. Report skills never or rarely invoked, and for the common triggers (a minion started, a task opened, a page created, a task landed) how often the matching skill was actually loaded. Write the script as a class, keep the numbers in `data/`.
2. **Bloat, by script:** words/tokens an agent pays at start: `CLAUDE.md` + its role skill + readme chain; list the rules that are duplicated across CLAUDE.md and skills (near-duplicate sentence finder), retired systems still mentioned, and rules that contradict. Build on `ai/sessions/2026/10/09/session-a07780b9/system-architect/claude-md-proposal.md`; link it, do not retype.
3. **Why unused:** for 5 sampled sessions where a skill should have fired and did not, find the cause (description wording, the agent never saw the list, the rule was in CLAUDE.md already, the tool existed instead).
4. **Recommendation (decide, record the alternative):** which rules belong in CLAUDE.md, which in a module readme or `doc/`, which as a skill, which as an enforced node tool or hook (an AI cannot forget a tool). Say how many systems there should be and what to call them. One page, a screen, with the numbers.
5. **Tool process model (answer from the code, cite files):** how Servex hosts in-process SDK tools (`Servex/agents/tools.js`, `page_tools.js`), what runs in the Servex process versus each `claude.exe` child, what happens to a session if a tool throws or the process crashes, and how Servex restarts. Does the server read a page through a real instance or by reducing `page.jsonl`? Put it in `Servex/doc/` and link it.

## Fences
Read-only analysis plus new scripts/docs: never edit CLAUDE.md or skills (propose). Never delete. Worktree for committed files; commit each step. No OpenRouter. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
