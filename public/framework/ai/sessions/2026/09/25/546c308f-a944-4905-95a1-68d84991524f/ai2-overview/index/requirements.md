# Minion brief: the Overview's data — `overview.json`

Load the `minion` skill first. Your parent is `task-mastermind-ai2-overview`; the whole task is `public/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-overview/requirements.md`. The owner's raw words: `public/framework/ai/sessions/2026/09/28/cards/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md`, section "Continued (about 11:00 PM)". Read it.

> "on the AI2 dashboard, when I check back in, I want to see ... a summary of everything's been done ... see all these familiar things ... if you have 100% on 20 items it just gets kind of like visually exhausting, you probably just have a completed section ... Here's when this thing was requested, and here's when it was delivered, and here's how long it took, and here's how many tokens it took ... and here's the outcome, and ... link to it."

## Work only in the worktree

`C:\Code\lew42\worktrees\ai2-overview` (branch `worktree/ai2-overview`, server `http://localhost:53155/`). Never edit the main tree `C:\Code\lew42\monorepo`. Commit by exact path when done.

**Fence (the only files you write):** `Server/ai2-overview.mjs`, `public/framework/ai2/overview/overview.json`, `public/framework/ai2/doc/overview.md`. Your task log: `public/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-overview/index/task.jsonl` in the MAIN tree (append with `node .claude/hooks/append.mjs`).

## Deliverables

1. **`Server/ai2-overview.mjs`**: plain node, no new dependency, runs in under 5 s: `node Server/ai2-overview.mjs` writes `public/framework/ai2/overview/overview.json`. Reads, relative to the repo it runs in:
   - every `public/framework/ai/<date>/<slug>/task.jsonl` (merge `assign` lines, latest wins: `request`, `requested_at`, `landed_at`, `outcome`, `cost_usd`, `group`, `links`). About 800 of them.
   - `.claude/prompts/*.jsonl` (`{"prompt":{"at","author","text"}}`, only `author: "owner"`), to link an ask to the owner's own words where a task's `request` matches or quotes a prompt (a prompt whose text contains the task request's first 40 chars, or vice versa; no match is fine).
   - `public/framework/ai2/groups.json` and `public/framework/ai/cards.jsonl` if they help place a task.
2. **The concepts, fixed, in this order (importance first), at the top of the script as data:** Servex (`dns`), Page (`description`), View (`widgets`), App (`apps`), AI 2 (`dashboard`), Dictation (`mic`), Research & Collab (`science`). Each has a `match` list of words/slugs/groups. A task joins the FIRST concept whose words appear in its slug, group or request. Unmatched tasks go to no concept (count them in `unfiled`). No invented concepts.
3. **The shape** (the UI minion is building against this exactly):

```json
{"built_at":"ISO","unfiled":123,
 "concepts":[{"id":"servex","name":"Servex","icon":"dns","url":"/Servex/ or the concept's real site page",
   "open":[ASK...], "done":[ASK...], "done_count":40, "cost_usd":12.3}]}
```
   ASK = `{"task":"2026-09-28/ai2-overview","quote":"≤120 chars of the owner's request","words_url":"/framework/ai/<date>/<slug>/ or the matched card url","asked_at":"ISO","landed_at":"ISO|null","hours":1.5,"cost_usd":0.8,"outcome":"first line of outcome, markdown stripped, ≤140 chars","result_url":"first link in links, else the task page /framework/ai/<date>/<slug>/","state":"open|done"}`
   - `open` = no `landed_at`, requested in the last 7 days (older unlanded ones are dropped, count them in the concept as `stale_count`). `done` = landed; keep the newest 30 per concept, sorted newest first, `done_count` is the full number.
   - Within `open`, newest first.
4. Run it; commit the script and the json. Paste the per-concept counts (open / done / cost) into your task log as one `log` line.
5. `doc/overview.md`: ten lines — what the script reads, how a task joins a concept, how to rerun it.

Budget: about $1.50. When done, end your turn; your parent is woken. Every spawn uses `windowsHide: true` (you shouldn't need any).

