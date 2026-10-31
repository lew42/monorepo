# Needs your attention

Decisions only you can make. The coordinator keeps this short and removes items once answered.

## Open

1. **Phase 1 design: the core classes and their APIs.** Open the **Design** page in the app. Each decision has a recommendation and buttons; tap your choice (or add a note). Nothing gets built until you've weighed in on the opinionated ones.
2. **Calls vs changes (D14, D17, D18).** Try the [Replay Lab](https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5), then pick in D14 (what a line saves), D17 (how code reacts: your `set_<key>` hook, and whether to call it `set_state` or `on_state`) and D18 (which UI values are saved).

## Answered

- Five agent-ops / git decisions (2026-10-30): moved to the back burner (`ideas/backburner.md`). Slim `CLAUDE.md` via `@AGENTS.md` is OK in principle, to do together with the branch strategy.
- Cloudflare Pages: back burner.
- Failing-test branch: not now; test-first is the rule when building starts (`ideas/test-driven-development.md`).
- Usage tool (`check_usage`): merged on your PC.
- Usage policy: real alarm only above 100% of weekly pace; going a little over is OK for well-planned work, then slow down.
- Tag names: `ui` and `stack`; Cloudflare shown through pairings, not tags.
