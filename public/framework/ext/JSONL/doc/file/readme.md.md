# `readme.md`

The canonical spec for the `.jsonl` log format — cited directly from
`CLAUDE.md` and from the `new-task` skill, so this is the one file in the
module where wording changes carry the most weight. It states the format
(one verb per key), the replay contract (`assign` replays construction), what
`TaskJSONL` adds, and who in the framework actually reads these files.

## What moved out of it, and why

`agent`, `chat` and the `steps`/`step` progress pair used to each get their
own short readme section. They're now one linked paragraph pointing at
[`doc/task-jsonl.md`](../task-jsonl.md) — not because the material shrank,
but because all three are one class's worth of behavior (`TaskJSONL`, not
base `JSONL`), and that class needed its own url anyway: `Doc`'s `subject`
can only be one class, so `TaskJSONL`'s own members (which `subject: JSONL`
can't resolve — see [`page.js`](./page.js.md)) had nowhere else to become a
real page.

## The "Traps" section is new

The SPA-fallback behavior in `load()` was previously only a code comment
(`JSONL.js:36`) — true, but invisible to anyone reading the readme instead of
the source. It's the one failure mode in this module that fits the
`CLAUDE.md` definition of a trap exactly: nothing throws, nothing warns, and
the only symptom is `.loaded` quietly staying unset.

## Improvements

1. **None outstanding in the file itself** — every claim in it was checked
   against the current source and the four real callers during this pass.
   *(n/a.)*
2. **Whether `agent`/`chat`/progress belonged in the readme at all, in
   hindsight, is a judgment call this pass made rather than one CLAUDE.md
   settles.** The brief for this pass said "change only how well it says
   things, never what it says" — moving three sections to a linked note
   changes organization, not content, but it's still a structural call worth
   a second look from whoever next edits this file. *(simple, speculative —
   revert is a copy-paste if it's wrong.)*
