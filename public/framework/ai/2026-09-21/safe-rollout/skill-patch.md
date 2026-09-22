# The two skill edits this task could not apply directly

Deliverable 3 asks for one short section in `.claude/skills/minion/SKILL.md` and two sentences in
`.claude/skills/mastermind/SKILL.md`. This session's Edit/Write tools refused both — every attempt
to write under `.claude/` came back "Claude requested permissions to write to `.claude/skills/...`,
but you haven't granted it yet," with no way for a headless session to grant it. That's very likely
deliberate (a minion self-modifying its own operating instructions is exactly the kind of thing a
task about "don't let agents freely change things unsupervised" should not be able to do on its
own) — so this is the ready-to-paste text instead of the edit itself. Apply both with the owner's
own Edit tool, or authorize this session to retry.

## `.claude/skills/minion/SKILL.md` — insert as a new section right before `## Never`

```markdown
## Build in a worktree first, when the page is one the owner is looking at

A change to a page the owner has open should be built in a private worktree and smoke-tested there
before it ever touches the live tree — not always (a typo fix, a doc tweak don't need this), but the
bigger the blast radius (a shared module, a page on the dashboard, anything that renders without a
reload hold protecting it), the more this should happen. `node Server/worktree-up.mjs <name>` gives
you a second checkout on its own branch and its own server on a free port in one command; its
output tells you the url to load and the path to edit. `node Server/worktree-down.mjs <name>` stops
the server and removes the worktree once you're done (it refuses to discard uncommitted work — it
just says so and leaves it). This is a habit on top of the reload hold above, not a replacement for
it — a hold still matters for anything you land straight on the live tree. (safe-rollout,
2026-09-21 — the incident that prompted this: an agent hand-edited a live page.js and broke the
dashboard for about three minutes.)
```

## `.claude/skills/mastermind/SKILL.md` — append to the end of the existing section
## "Never break the page; audit a mistake when it happens" (around line 336)

```markdown
A live page.js the owner has open should be edited in a worktree first (`node
Server/worktree-up.mjs <name>`), not by hand on the live tree — a hand-edit there on 2026-09-21
(`a.attr` used where this framework has no such method) blanked `/framework/ai/` for about three
minutes before anyone caught it.
```

## `.claude/skills/minion/improvements.md` — one line, for the same reason

```markdown
- 2026-09-21 (safe-rollout): this session's Bash/PowerShell tools refused every command that runs
  code (`node --check`, `node -e`, even a bare `node Server/hold.mjs`) or mutates git (`git worktree
  add`), and every Edit/Write under `.claude/`, with no way for a headless minion to grant the
  approval they asked for — despite `.claude/settings.json` saying `defaultMode: bypassPermissions`.
  Plain filesystem writes and read-only git worked fine. If a brief asks a minion to run something
  or edit a skill, expect this to bite again until whatever launches minions passes the right
  permission mode through; in the meantime, build + hand-verify + leave a ready-to-paste patch, the
  way this task's `skill-patch.md` does.
```
