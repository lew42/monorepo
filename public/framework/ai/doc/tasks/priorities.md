# Priorities — ranked from what the owner has said (2026-10-08)

Ranked by the owner's stated importance, then value over cost. Status is as of the evening of 2026-10-08. Each line names who owns it. Pace rule: check `node Server/usage-now.mjs` before starting anything new; over pace means queue.

1. **Sessions and token accounting (in flight, top).** One bulletproof record of every session and what it cost. Done: `AISession` cost audit matching the SDK within 0.5%, grid and In-flight strip, snapshot and composite index design. In flight: rename to `AISession` (`ai/AISession/`), then the scripted migration of UUID/card/task/hyphen folders into `ai/sessions/YYYY/MM/DD/<slug>/`, the live index, tags and filters, OpenRouter accounting (real dollars, labelled apart from Claude API-equivalent). Owner: `minion-session-class`. Goal: browse everything we spent by day, class and activity, and find the systems that burn tokens.
2. **Dictation and prompt refinement (in flight).** Done: `Prompt` class, `RefineSystem` boss, scorer, live demo on `ext/Refine`, connection map of Dictate/Refine/Echo. Next: store prompts in the session log (raw immutable, clean final with numbered sentences, refined cards citing sentence indexes), per-sentence real-time streaming, alternates and names, tags, phone mic over HTTPS, then hand-off of refined prompts to agents. Echo stays off until visible and cheap. Design: `ext/Refine/doc/vision-2026-10-08.md`.
3. **Page system: AI creates pages efficiently, streaming without headaches (designed, not built).** Composition pattern (`thing.page`/`page.thing`), CRUD/move with backlinks, directory deltas and indexing (`core/Page/doc/indexing-2026-10-08.md`), one streaming mechanism everywhere. Next: a minimal slice that proves the pattern with the session folder, then tasks.
4. **Task system (designed).** One queue, recursive tasks that live in sessions and move by reference, lifecycle, card. Needs the session folder first. Design: `2026-10-08/task-system-design/`.
5. **Inbox, Log and the AI system pages.** Study first (`mastermind-ai-system-docs`): where inbox items live, why agent creation broke, read/unread, real-time log; System tab as class architecture; readme system status.
6. **Tidy the old layout.** Merge AI 2 into AI, one date layout, zombie branches listed (141; none deleted), slug truncation bug.
7. **Notifications Lab (landed).** The Android phone test is the owner's; see its report.
8. **Housekeeping.** Code skill review (classes, `Thing.View = ...`), a census of non-class files, commit-sweeper for machine-written indexes, usage and OpenRouter accounting checks, an optional batch lane for Haiku text jobs (needs an API key; not now).

Not now: databases, multi-agent voting on alternates, VS Code hooks beyond what exists.
