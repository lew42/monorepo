# Two entries for `.claude/settings.json` — arms both remaining hooks

Everything else is already built and tested. These two entries are the only thing
between the current state and both hooks working. Paste them inside the existing
`"hooks"` object in `.claude/settings.json`.

## 1. Add a `Bash` matcher to the existing `PostToolUse` array

Goes beside the two matchers already there (`Edit|Write|NotebookEdit`, and `Skill`):

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node",
      "args": [
        "${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs",
        "post-tool-use"
      ],
      "timeout": 15
    }
  ]
}
```

**What it turns on.** The reload hold's guard. `hold-guard.mjs` has two halves: `check()`
has always been armed and runs on every write, but it can only fire if something recorded
*who took a hold* — and a hold is taken by a plain Bash command, which no armed hook could
see. So `check()` has been finding no record for any agent and correctly doing nothing,
forever. This is the missing half.

Verified 2026-09-21 by driving `ledger.mjs` with a real hook payload: `node Server/hold.mjs
on "probe — …"` wrote `{"who":"probe","what":"testing record()","released":false}`, and the
matching `off` flipped `released` to `true`. The write path was re-tested after and is
unchanged.

**Why it is one line and not a new hook file.** `ledger.mjs` now recognises a Bash call and
calls `record()` itself, so arming it is one matcher rather than a new entry point. With no
`Bash` matcher present that branch simply never runs — harmless either way.

## 2. Add a `UserPromptSubmit` array

A sibling of `PostToolUse` / `Stop` / `SessionEnd`, at the top level of `"hooks"`:

```json
"UserPromptSubmit": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "node",
        "args": [
          "${CLAUDE_PROJECT_DIR}/.claude/hooks/prompt-relay.mjs"
        ],
        "timeout": 15
      }
    ]
  }
]
```

**What it turns on.** The relay that rings the mastermind the moment you speak, instead of
it finding out on its next timer wake. `prompt-relay.mjs` is written and is currently armed
to nothing — `settings.json` has zero `UserPromptSubmit` entries, confirmed 2026-09-21.

This is the one measurably fixable stage of the 29-minute median between you saying
something and seeing a result. A real 34-minute dead stretch was recorded on 2026-09-19 with
nothing running and nobody checking.

## What this does not fix

A third settings idea — refusing a `find /` from a `PreToolUse` Bash hook — is **deliberately
left out**. It would be a fourth thing on your list for a problem that has cost CPU but never
data, and the point of this page is one paste, not a longer list. Worth doing the next time
you are in this file anyway, not on its own.
