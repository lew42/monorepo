# Ask 2a: the single seat gets `nothing`, `say` and `retract_say` (Budget: $5)

Load the `minion` skill first. Work in the worktree `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`; first run `git merge michael/dev` there, it is behind). Tests first, commit by exact path after each working step, do not merge or push (the mastermind reviews and merges). Never stash, never touch the owner's tabs or kill servers.

The owner's words: [owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md), ask 2, and [ux/Dictate/doc/principles.md](/framework/ux/Dictate/doc/principles.md) (read both; "How the voice agent works" and "Top priority: answer the most recent thing first"). Read [Servex/agents/Sessions.js](/Servex/agents/Sessions.js) `single_say` / `single_cue` (~:736-768), `heard()` (~:1605) and `set_floor` / the `floor` verb first.

## What to build (server side only; the Recite queue and the brief are separate later steps)

1. **Three tools for the single seat (and only it):** `nothing` (ends a turn, writes nothing anywhere), `say({text, re?})` (returns `{id}`), `retract_say({id})`. Find how the single seat's tools are registered (`roles.js` / the seat's `allowed_tools` / where `item` is given to it) and add them the same way. No new MCP server.
2. **Plain text is never a reply.** For a single seat `heard()` stops turning the turn's text into a chat reply or read-aloud (the `cue_open` path at ~:1617 goes). Only `say` produces something the owner hears or sees as a reply. A turn that ends in plain text writes a muted `skip` line, as the fast seat's do (`{skip:{why}}`), so nothing is lost for debugging.
3. **A `say` is queued, not spoken.** The session keeps `s.says` (id, text, `re`, queued_at). It is released by the gate below. Release writes the reply the way `heard()` writes one today (same `write()` -> `mirror_chat` -> `ChatWriter` path, so the messages list and the read-aloud see it exactly as before; do not build a second path).
4. **The gate is the page's own pause signal.** The page already reports the floor (`set_floor`, "speaking" / "done"; ext/Chat/doc/floor.md). A queued say is released only after the floor has been `done` for `say_gate_ms`: default 1500; 600 when the last owner sentence is a question (ends with `?`); 3000 when more than 5 owner sentences arrived since the last release (a long dictation). All three configurable per session settings and at boot (`SERVEX_SESSION_SAY_GATE_MS` etc, follow how `single_pause_ms` is read at :275). A new owner sentence (floor `speaking`) cancels the pending release timer; the say stays queued.
5. **Newest first, one at a time.** When the gate opens, release only the NEWEST queued say. Older ones stay queued; each next one waits its own gate (the read-aloud has time to finish). A say older than 10 queued items or 10 minutes is dropped with a `skip` line (`why: "stale"`), not spoken. (The "you may speak" cue to the agent and retract/replace-while-pending: the agent can already call `retract_say({id})` any time; do not add a cue.)
6. **The `(pause)` cue no longer asks for a reply.** `single_cue` / `s.cue_open` are removed as the "reply now" prompt. The brief currently relies on `(pause)` for filing, so DO NOT delete the cue itself in this step: leave `(pause)` sending exactly as today (the brief rewrite is the next step, with its own risk note). Only its power to produce a reply goes.

## Proofs (a test file `Servex/agents/say-tools.test.mjs`, one lean command, under a second each, no live Servex)

- plain text turn -> no reply line, one `skip`;
- `say` -> nothing written until the gate; after `say_gate_ms` of floor `done` -> one reply written through `ChatWriter` (a Reply in `session.messages`);
- a floor `speaking` between cancels the release, the say stays queued;
- two says queued -> the newest is released first, the older one only after a second gate;
- `retract_say` removes a queued say; `nothing` writes nothing;
- the question gate (600 ms) and the long-dictation gate (3000 ms) each picked by the rule above;
- replay a recorded session (a real one: `public/framework/ai/sessions/2026/11/03/…/v-z0jonhy/session.jsonl`, or any recent `v-*` session) through the single seat with a stub agent that calls `say`/`nothing`, asserting the messages list has no reply the owner would hear before the gate.
Also run the existing `Servex/agents/*.test.mjs` the change touches (session tests, `Sessions.plugins.test.mjs`) and report any you had to change and why.

## Fences
Own: `Servex/agents/Sessions.js` (single-seat paths only), where the single seat's tools are registered, the new test, the readme/doc lines. Do not edit `Servex/agents/single-voice-assistant.md` (the next step) or the chat-settings files. Document it: one short section in `Servex/agents/readme.md` index (the tools, the gate, `say_gate_ms`) and the file:line of each piece (law 9).

## Report
One screen in your `task.jsonl` as log lines: what changed (file:line), test commands and output, anything you chose differently and the alternative. Then one line to the mastermind via the harness.
