# Classes: the detail behind CLAUDE.md

The root [CLAUDE.md](/CLAUDE.md) keeps the four class rules (the framework is classes; write classes, not function bags; show the class; design the architecture first). The finer points that used to sit beside them live here. Load it when you write a class or a page about one. The `code` skill and `code/patterns` hold the working rules.

Related: [writing.md](writing.md) · [readmes.md](readmes.md) · [claude-md-archive.md](claude-md-archive.md)

## Moved from CLAUDE.md (2026-10-12)

These sentences were cut from the root `CLAUDE.md` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in `CLAUDE.md` at `87afbdd55`. The map is `public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md`.

<!-- claude-md:L32 -->
**Classes are the structure; show them** — L32.3, L32.4

Document a thing as its class: an icon + class name card with its core API (the properties and methods that matter most, judged by an agent, not a weighting system), and show live instances where they exist (a running Servex, its agents). A reader should see the structure, not paragraphs about it.

<!-- claude-md:L54 -->
**Write classes, not function bags** — L54.6, L54.7

When extending `Page`, mind its large API (it extends `Item`) so method names do not clash. A reader should see how the pieces fit from the class hierarchy alone.

<!-- claude-md:L56 -->
**Show the class** — L56.3, L56.5

A default renderer that walks a class's properties is acceptable; a class needing a better view gets its own. Tags that point at code use the familiar repo path plus class (`ext/Refine`, `core/Page`, `Server/refine.mjs`) so a reader knows where it is.

<!-- claude-md:L58 -->
**Design the class architecture before you build** — L58.3

Choose names with care: short, specific, never reusing a native or framework name, a word that sounds like a system or manager for the orchestrator.
