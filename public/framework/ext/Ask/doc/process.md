# A turn is a process, not a pipe

The obvious reading of "let the browser talk to a live Claude Code session" is
a wrapped terminal — a pty, a named pipe onto an interactive `claude`'s stdin,
something a browser tab could type into and watch respond in real time. **This
module does not do that.**

## What it does instead

`claude -p --resume <id>` starts a fresh process, replays the whole session
from its transcript on disk, takes exactly one turn, and exits. Measured: 2.5s
for a trivial haiku turn, most of it process startup and the transcript
replay, not the model call itself.

## Why

Continuity is the **file**, not a kept-alive process. That means:

- nothing to supervise between turns — no child process outliving its request
- nothing to reconnect to after a dev server restart
- no orphan process to pin a core on Windows (`CLAUDE.md`'s own warning about
  exactly this failure mode, for the *interactive* CLI)

## The cost

A turn is not free-form interactive. There are no permission prompts a human
answers mid-turn — `-p` answers them from the permission mode instead
(`acceptEdits` for `start()`'s spawned sessions; whatever `claude -p`'s own
default is for `ask()`/`chat()`, since neither sets `--permission-mode`). And
there's no steering a turn once it's running: the child isn't kept, so there's
nothing to interrupt.

## What "Phase 2" would look like

`--input-format stream-json` keeps one child alive across many turns instead
of re-spawning per message — cheaper and faster per turn, because the
transcript doesn't have to be replayed from scratch each time. The price is
back to a process to supervise: what happens to it on a dev server restart,
what happens if two tabs both think they own it, whether a mid-turn interrupt
becomes possible. Worth it once turn latency (not cost) is the actual
complaint — nobody has said that yet.
