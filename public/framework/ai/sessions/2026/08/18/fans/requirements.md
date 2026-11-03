# fans

## The ask (verbatim)

> might we have a fan problem?  is this still documented somewhere?

> teh janitor thing isn't in the repo, so i'm not sure the note should?
>
> per the documentation skill, let's reference a Server/doc/janitor.md or whatever, explain the problem and solution.  then, just keep a computer-wide ~/.claude/ skill for "fans"?  i basically just come here and say, "hey, my fans", and you figure it out...
>
> did you kill it?
>
> are these claude tasks abandoned?  when you spawn minions with the fork claude skill, do they just live on or something?

## Scope

- Diagnose: live CPU sample of `claude.exe`/`node.exe`; identify the spinner; ancestry of every `claude.exe`.
- Restore: the orphaned dev server (pid 28884, ~130% core since 8/17) — janitor killed it 00:29:34; restarted detached, pid 32696.
- Repo: `Server/doc/spin.md` — the problem and the solution, no machine-specific watchdog; `Server/README.md` gets the one-line pointer.
- Machine: `~/.claude/skills/fans/SKILL.md` — "hey, my fans" → sample, name the culprit, kill (or hand Mike the line), restart the dev server detached, check the janitor log.

## Not in scope

- Root-causing *why* an orphaned `node server.js` busy-loops (upstream libuv/Windows console behavior) — documented as observed, not explained.
