# Investigation: one single voice assistant (pass 1)

**Finding:** the owner's "stall, then burst" most likely comes from two waits, not from the model: a batch wait of up to 12 s before the smart seat wakes, and a thought-hold of 2.5 to 8 s. Values are read from the code, not yet measured in a live session (that is pass 2).

## A sentence's trip today

```
you speak
 ├─ 700 ms   quiet closes the segment                 ux/Dictate/Dictate.js:821
 ├─ 1500 ms  quiet ends a thought                     ux/Dictate/floor.js:25
 ├─ POST     say() writes the line, mirrors to chat   Servex/agents/Sessions.js:1058
 ├─ 2.5 s    thought hold (max 8 s)                   Sessions.js defaults
 ├─ 1.5 s    fast seat waits after you spoke
 ├─ ≤ 12 s   smart seat wake batch  <-- biggest       Servex/agents/WakePolicy.js:12
 └─ reply    tail of the session file -> chat.js -> Widget.Thread
```

Sentences still show if the fast seat is gone: `say()` writes them, not the fast seat. Only `{place}` lines stop; the rule decider `ext/Refine/Placement.js` then says "same".

## Decisions (owner may change)

- **Name:** `single-voice-assistant`. `voice-assistant` is the fast seat (`Servex/agents/roles.js:98`).
- **Switch:** add the value `single` to `session_assistant()` (`Sessions.js:77`). Dual stays default.
- **Say nothing:** cheapest is not waking the seat on a trivial sentence (a `WakePolicy` gate). Whether a tool-only turn ends cleanly in the SDK is still to check.
- **Heard-only context:** cheaper with one seat, but Recite must report how far it read (`ux/Dictate/doc/turn-taking.md`, idea 4). Still parked.

## Reuse

- `core/Session/Chat`: `Chat.resurface` is the nearest to "show a Ref". A plain Ref verb is not confirmed.
- `place` and `summary` already exist in `SESSION_KEYS`.
- Pause signal: `Sessions.mid_thought()` (line 268).

## Risks

- Timers hide each other: measure before changing any.
- Dual mode must not change: reuse by parameter, never by edit.
- `mastermind-dictate-mic-sentences` is changing `ux/Dictate`: build on its merge.
- `session_assistant()` reads once at boot, so the switch needs a restart (vscode-mastermind's).
- A Sonnet seat woken per sentence with no wait is costly: keep the wake gate.

## Pass 2

- [ ] Measure one real session: `{chat}` line times against `{place}` line times.
- [ ] Read `Servex/agents/page_tools.js` for the item verbs and any Ref-to-task verb.
- [ ] Check the SDK: can a turn end with no text?
- [ ] Read `mastermind-read-aloud-next`'s brief for the reply queue.
- [ ] Web prior art on turn-taking (not done in pass 1).
- [ ] Write the confirmed findings into `ux/Dictate/doc/`.
