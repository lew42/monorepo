# Step A: a menu on every page, and the drawer's tabs

Design (one picture, one table): [/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md). Owner's words: `2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words.md`. This is ① and ② plus Sessions.

1. **The menu:** a ☰ button, top right, on every page (site chrome in `public/app.js`). It opens `ext/drawer`. It must not cover the page head or the dev bar; check at 1280 and 3440.
2. **Tabs:** AI, Sessions, Dictation, Settings, Admin. Each is routed (`?drawer=sessions` or a child URL), so a reload lands on the same tab.
3. **AI tab:** the card's existing composer (chat and dictate) moves in, with a model picker that only shows the choice for now (the provider comes with harness step 2).
4. **Sessions tab:** every thread on this page, read from the dev bar Ask's store (`<page>/ai/<slug>/task.jsonl`, whose `chat_session_id` resumes a thread). One click jumps back into a thread. On a card, the card's own sub-threads show here too.
5. **Dictation, Settings, Admin:** Dictation embeds what task-mastermind-dictation-playground built; the other two start with what exists (the dev bar's settings) and nothing new.
6. **Docs:** `ext/drawer/doc/` gets the tab model, with a screenshot first.

**Proof:** shots at 1280 and 1920 of the drawer open on a plain page and on a card; a reload on `?drawer=sessions`; an old Ask thread resumed from the Sessions tab.

**Fence:** `public/app.js` (the menu only), `ext/drawer/`, the drawer's tab files, and the composer's move. Before editing the composer, check list_agents and the AI 2 card for an AI 2 lead or the dictation playground working on the same files. Work in your own worktree.
