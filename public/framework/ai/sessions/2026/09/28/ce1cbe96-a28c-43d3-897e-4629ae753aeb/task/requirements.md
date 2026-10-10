# The source library, the web fan-out, lessons, and one doc convention

Design: [/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md), the "Added" section. Owner's words: `2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-2.md`.

1. **The library:** `public/framework/sources/<topic>/<slug>.md`, each page converted to markdown once, with a header block (url, fetched_at, kind: docs, source code or article, authority) and one `index.jsonl` per topic. A tool `cite(topic)` lists what exists before anyone fetches again.
2. **The fan-out:** `node Server/sources.mjs "<question>" --topic <t>`: 2 or 3 cheap searchers search, then run follow-up searches from what they found, preferring documentation sites and GitHub source, and save the best pages. Use WebSearch/WebFetch in Claude agents now; the OpenRouter web plugin comes with harness step 2.
3. **Lessons:** a short rule in the `research` skill: a lesson goes in the `doc/` of the module it is about, citing its sources. Only a lesson with no module goes to `sources/<topic>/lessons.md`.
4. **The doc convention:** `doc/` everywhere (75 modules use it). Make `/docs/` URLs resolve to `/doc/`, fix every link that says `docs/`, and make the Docs tab show nested markdown at any depth as a tree (ext/files), with each file routed. The sources library uses the same browser.
5. **Seed it** with today's harness sources: the Claude Agent SDK, OpenRouter (the API, the web plugin, pricing) and opencode.

**Proof:** the library page and a 3-deep doc tree at 1920; a `/docs/` link landing right; one fan-out's cost and the pages it saved. **Fence:** `public/framework/sources/`, `Server/sources.mjs`, the Doc module's tree and routing, the `research` skill's lesson rule. Your own worktree.
