# relay-2 state

- Rule merged 08f48afcf (13:35). The Servex running then (pid 38160, started 13:04) had the old code.
- Restarted 19:01Z (pid 36500, new code). Live check against it (stand-in tab `mastermind-livecheck`, registered via `register_session`):
  - ✅ plain tab message -> delivered to `master-assistant`
  - ✅ `@mastermind-livecheck ...` -> delivered straight to the mastermind
- Rule and code: `Servex/agents/doc/relay.md`. Proof script: `Servex/agents/relay-bypass-proof.mjs`.
