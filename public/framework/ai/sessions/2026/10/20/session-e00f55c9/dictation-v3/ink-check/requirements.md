# Check: raw Whisper words go from dim to strong in V1, V2 and V3 at phone size

Budget: $3. Load the `minion` skill first. Read-only: you change no code. The owner's ask: raw Whisper words show dim (the guess, `--draft-ink`) and then strong once sent (`--final-ink`). This was merged by the whisper-path work (see `git log --oneline -S"--final-ink" | head`).

Do:
1. Find the three views: the dictation chat's V1, V2 and V3 (the view switch is in `public/framework/ux/Dictate/`; `doc/chat.md` names them). Find where each one paints a guess and a sent line, and which CSS variable each uses.
2. Take headless shots at 400x860 on `http://monorepo.localhost/` (a page with the dictation chat), one per view, showing a guess line and a sent line. Use `Server/Browser.mjs` (import it as `file:///C:/Code/lew42/monorepo/Server/Browser.mjs`). Force the state if speaking is not possible: inject a guess and a sent line the way the code does, and name how. Put the shots in `shots/` here.
3. Measure the computed colour of the guess and the sent text in each view (`getComputedStyle(...).color`), along with the values of `--draft-ink` and `--final-ink`.

**Deliverable:** one log line in this dir's `task.jsonl` per view (`node .claude/hooks/append.mjs`): view, guess colour, sent colour, pass or fail, shot path. Then a 3-line report to `mastermind-dictation-v3`. A fail names the file:line that paints the wrong colour, and a one-line fix (do not apply it).

**Never:** restart or kill any server, drive the owner's tabs, `git stash`. Commit only the shots and your task.jsonl, by exact path.
