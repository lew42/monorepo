# Servex crashed at 00:31 and revived nobody (you are a mastermind, on Sonnet, high effort)

**What happened (2026-11-02, from `%LOCALAPPDATA%/lew42/servex/logs/crashes.jsonl` and `servex.jsonl`):**
- **At 06:31:40Z (00:31 local), Servex pid 50296 exited** with `0xC0000374` (heap corruption) after 1,719 s of uptime. The report is `logs/reports/report.20261102.003135.50296.0.001.json`.
- **The crumbs show a test hammering the live Servex:** `/api/session/say`, `/api/session/v-lzxm297/stream`, and `/api/sessions?…host=dictate-red-tests.localhost`. That's `mastermind-dictate-red-tests`'s browser scripts.
- **Earlier crashes:** `0xC0000409` on 10-28 and 10-29.
- **The new boot's `revive` record** (`mvyvscm8-33776`, 00:32:03) has `revived: []` and **no snapshot**. A crash leaves no `sustain --restart` snapshot, so every live agent was dropped: mastermind-chat-model, read-aloud-next, dictate-red-tests. Work stopped until someone noticed.

## Do (worktree; review; merge with `Server/merge.mjs`)
1. **Revive after a crash.** When a boot finds no fresh snapshot, rebuild the list from the registry: every agent whose last state was working or idle, with a live task and `revivable: true`. Revive those exactly as a planned restart does, telling each one "Servex crashed at <time>; resume". Add a test that fakes a crash: a registry with no snapshot.
2. **The crash cause:**
   - Read the diagnostic report (native stack, loaded modules, heap).
   - Read the existing crash work first (`agent-mastermind-servex-health.jsonl`, `agent-helper-servex-crash.jsonl`, and any `Servex/doc/*crash*`).
   - Name the most likely cause, with evidence, and fix it if it's in our code (for example a native addon, an unbounded buffer, or a stream left open per request).
   - Otherwise, write down what to watch.
3. **Tests must not hit the live Servex.** Find how the Dictate browser scripts reach it (`dictate-red-tests.localhost`, through the proxy to the real `/api/session/say`). Give them a private Servex or a stub; check whether `Servex/test` already has one. Coordinate with `mastermind-dictation-v3` (it owns `ux/Dictate`), and tell it today what to change.
4. **Document both** in Servex's readme (crash and revive) and in the test doc (`core/Test/doc/health.md`).

**Fences:** a Servex restart is fine when no voice call is live (no `v-*` session line from a real phone in the last 2 minutes); commit by path; no `python -`. **Budget:** about $15. Report to vscode-mastermind in 4 lines.
