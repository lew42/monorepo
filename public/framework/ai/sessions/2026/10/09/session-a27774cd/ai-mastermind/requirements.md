# AI mastermind: study the AI system, make its readmes true

The owner, 2026-10-09 ~18:05 (VS Code tab 7efd07d5): a mastermind that studies the AI system (Servex, its tools, the SDK, sessions, cards, the board, voice/dictation, spawning, accounting) and keeps its documentation right, so every later agent starts from true readmes.

## Do
1. **Read the readme chain**: root `CLAUDE.md` → `public/framework/ai/readme.md` → `Servex/readme.md` → the child readmes each names. Sanity-check each on ingest: up to date? stale? unclear? a major subsystem missing (the `ai/readme.md` must index Servex, the dev server, MCP servers, models, VS Code sidebar tabs, browser voice agents, sessions, accounting, transcription, the page system)? Fix only **major** errors and omissions, one line each, verified against the code (a quick grep, not a deep read). No skill refinement (the system architect did that today).
2. **Find what is stuck**: the owner sees several stalled VS Code sessions on `/framework/ai/sessions/`. By script, list the sessions marked working/in-flight with no transcript line in 10+ minutes, what launched each (Servex SDK spawn vs VS Code vs `claude` CLI), and why they still read as running. Agents are meant to be launched through the Servex SDK (`spawn_agent`), never as loose CLI or VS Code sessions; say which launcher made any that were not.
3. **A one-screen AI system map** (update the existing `/framework/ai/` System tab or its doc, do not make a second one): each system, one line, its class and readme, how it streams.
4. Help the page mastermind (`mastermind-page-system`) when it asks how Servex injects context or tools.

## Rules
Sonnet; Haiku helpers only for bulk reading, each under 60k tokens, never for decisions. Commit after each step. Land with finish-task and a `Note:` card listing what was stale and what was fixed.
