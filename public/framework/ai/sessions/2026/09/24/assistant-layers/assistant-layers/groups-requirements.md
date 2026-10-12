# Minion brief: the lobby files each prompt into a group

Load the `minion` skill first, then `code`.

## The owner's words

"Whenever I go to the AI dashboard, I want to just start talking and have it figure out the right way to handle everything."

From the AI 2 groups brief: "When I send a new prompt about system design, the System design card should come to the top. A log entry on AI 2 should be an update to that item, not a brand-new item."

## What exists

- **The lobby** is `assistant-fast` (`Servex/agents/Assistant.js`, its brief `assistant.md`). It hears words spoken with NO card selected. Words spoken on a card go to that card's own assistant (`Layers.js`), not here. `Assistant.heard()` already returns early when the prompt's `selected` resolves to a card folder.
- **Groups** (ai2-dashboard, landed on michael/dev as 5d9113d6, not yet in this branch): `public/framework/ai2/groups.json`, an array of `{id, name, icon, about, card}`. `card` is the group's own card id, `2026/09/24/<group id>`, type `"group"`. Ids: system-design, servex, ai-dashboard, pages-markdown, cards-content, layout-columns, audits. Read the real file with `git show michael/dev:public/framework/ai2/groups.json`; use a copy as your test fixture.
- **Filing** is `servex.cards.append(group.card, {prompt: {text, raw, via: "lobby"}})`. Cards stamps the id and time, and `Layers.js` hears it as a fresh owner prompt, so that group's own assistant answers it on the group card.

## Where you work

Worktree `C:/Code/lew42/worktrees/assistant-layers`. Another minion (minion-al-proof2) is editing `Layers.js`, `Global.js`, `layers-proof.mjs` and their tests there right now: never touch those. Commit only your files (`git add <path>`), attribution `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Deliverables

1. **`Servex/agents/Assistant.js`**:
   - `groups()` reads `public/framework/ai2/groups.json` from the repo Servex runs from (`REPO`), fresh each call (it is small), and returns `[]` on any error.
   - `brief()` appends a short "Groups" section to the lobby's system prompt: one line per group, `- <id>: <name> — <about>`.
   - A new tool, `file_to_group({group, name?, about?})`, registered beside `append_prompt_event`, and added to the lobby's `allowed_tools`. With a known `group` id, it appends the CURRENT prompt (the one `heard()` last received; keep its text and raw) to that group's card as above, and returns `{ok, card}`. With an unknown id plus `name` and `about`, it creates the group card with `servex.cards.create({title: name, type: "group", by: this.id})` and files there. Listing a new group in `groups.json` is ai2-dashboard's job, not ours: say so in a comment, and log `{type: "new-group", id, card}` to the `servex` log so they can pick it up. It refuses without a current prompt.
2. **`Servex/agents/assistant.md`**: a short section. Words with no card: file them into the group they belong to with `file_to_group`, choosing from the Groups list; make a new group only when nothing fits, and say why in one clause. After filing, append nothing else: that group's own assistant answers on the group card. Keep the file's voice and keep it short.
3. **`Servex/agents/groups.test.mjs`**: plain node + `node:assert`, with a fake servex (`cards.append`, `cards.create`, `log.append`, `mcp.tool`) and a fixture groups.json passed through a constructor option: filing to a known group appends `{prompt}` to its card; an unknown id with name/about creates a card, files there and logs new-group; no current prompt is refused; `brief()` lists all seven groups. Prints `groups: N checks passed`.

## Done means

`node Servex/agents/groups.test.mjs` and the other `*.test.mjs` pass; committed. Last words: the commit hash and anything you had to guess. Never write the owner's name.
