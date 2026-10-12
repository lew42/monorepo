# name-scrub

## The ask (verbatim)

> can you make a global claude.md rule to stop calling me Mike everywhere?
> where does that come from?  I mean, I am Mike, but I don't really want my name littered throughout.  is there a claude.md rule or skill that uses "Mike"?

> go

## Scope

- Global rule: `~/.claude/CLAUDE.md` (done in the `fans` session, 2026-08-18).
- One sweep over the repo outside `public/framework/ai/`: `CLAUDE.md` (two lines), `.claude/skills/**`, `Server/**.md`, every `readme.md` / `doc/*.md` / `.js` / `.css` under `public/`. 182 occurrences, 119 files.
- Voice: readme/doc addressed to a reader → *you*; third-person decisions → *the owner*; "Mike's rule/ask/verdict" → "the standing rule" / "the ask" / "the verdict"; "ask Mike" → "ask first".

## Not in scope

- `public/framework/ai/**` task logs and reports — dated records; left as written.
- Memory files — already scrubbed.
