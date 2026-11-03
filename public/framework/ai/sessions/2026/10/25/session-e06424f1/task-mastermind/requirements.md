# Smart assistant wakes by tailing its own session log

The owner's words: [v-sq8y7db session.jsonl](/framework/ai/sessions/2026/10/25/v-sq8y7db/) ("that should just be you tailing your session log... no message transport system or secondary system").

## Asks (branch `worktree/qf-8`)
- [ ] 1. A session tails its own `session.jsonl` and gets new lines raw, in real time, replacing the wake rules (12 s pause / question / name / 6 sentences). Built as opt-in `POST /api/session/settings {session, tail: true}`; `Follow` gained `skip_by` and `heard` (owner chat, `{place}`, Question items). Not yet proven in a live call. Docs: `Servex/doc/follow.md`, `ux/Dictate/doc/wake-policy.md`.
- [ ] 2. The fast seat's `{place}` lines land in `session.jsonl` in the [Prompt record](/framework/core/Task/doc/prompt-record.md) shape. Needs a role-text change and an item-tool check.
- [x] 3. Say whether core `Session` is used server-side, and pick Follow or `updates()`. Proof: the voice seats don't use it (`Sessions.js` writes raw lines); decision is `Servex/Follow.js`, `updates()` stays for external sessions.
- [x] 4. Prove with a real run first. Proof: a spawned agent following its own file got its new line verbatim in about 3 s.

## Next
- [ ] Replace the wake rules (`waker`, `WakePolicy.js`, `feed_smart`) once tail mode is proven live; subscribe the seat at session start; add a `tail` switch to the dictation widget and a `tail_ms` route.
- [ ] Restart Servex to load it, at a time the owner picks, never during a call.
