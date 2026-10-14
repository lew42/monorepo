# Step 1 — how does a page know its own work?

**Two live sources exist today, and neither carries a page-identifying field.**

1. **Servex cards** — `GET /cards?view=open` (CORS-open, works from any page). Each row:
   `{id, title, type, status, tags, created, last}`. `tags` is described as "projects this
   card belongs to" — the closest thing to a page link — but it's almost unused: of the ~20
   cards made today (`ai/2026/09/29/`), only 3 carry any tag (`layout`, `harness`,
   `servex-system`); none say `dictate` or `mobile-nav`. A card's `id` is its own date-nested
   path (`2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom`), and its page lives at
   `/framework/ai/<id>/` — a **different id shape** from the flat `ai/2026-09-29/<slug>/`
   task folders (confirms the "two datastores" note).
2. **Servex agents** — `GET /api/agents` (CORS-open). Each row: `{id, role, model, state,
   session_id, parent, turns, cost}`. No title, no card link, no page field. An agent's `id`
   (e.g. `task-mastermind-mobile-nav`) often embeds the task name, but that's incidental,
   never a contract a page can rely on.
3. **The older flat `ai/<date>/<slug>/task.jsonl` files** (dictation-playground, prompt-refine's
   minions) aren't cards at all — no HTTP route serves them, so a page running in the browser
   can't see them. `dictation-playground` has no Servex card at all.

**What a page must carry to be found: nothing does yet.** The one thing that works today is
matching by KEYWORD: a page names a few words about its own topic, and every open card's
`title`+`id` and every live agent's `id`+`role` get substring-matched against them.

**The three named Dictate tasks, matched this way** (keywords `dictat`, `mic`, `whisper`):
- `mobile-nav` → card `2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom`, title says
  "...the mic, versions kept" → matches on **mic**.
- `prompt-refine` → card `2026/09/29/from-dictation-to-a-brief-with-nothing-l`, title
  "From dictation to a brief..." → matches on **dictat**.
- `dictation-playground` → **no card exists**, so keyword matching finds nothing; it can only
  be named by a small static list the page itself supplies (an `extra` option in `work.js`).

**Going forward:** cards already have an unused `tags` field built for exactly this. Once cards
are tagged with their project (`tags: ["dictate"]`), matching becomes exact instead of fuzzy —
`work.js`'s keyword match is the working-today fallback, not the intended long-term shape.
