# Minion C: sweep every waiting question onto a card, and fix the skills

Load the `minion` skill first. Then read `contract.md` beside this file.

The owner's words, 2026-09-28: "for things that you're waiting on me for, this is what the dashboard is for. We need to create a way where I don't, even if I miss something, I don't actually miss it forever… I'll find it in the dashboard." Deliverables 5 and 6 in `requirements.md` are yours.

## Part 1: the sweep (it writes REAL card data, through the live Servex at http://127.0.0.1:8090)
1. Gather every question now waiting on the owner:
   - the "owner's call" items in `public/framework/ai/todo.md`;
   - the "waiting on the owner" list in `public/framework/ai/2026-09-28/servex-mastermind/checkpoint.md`, and in `public/framework/ai/handover.md`;
   - open cards of `type: "question"` (`curl -s "http://127.0.0.1:8090/cards?view=open"`, then keep the questions). These already count as asks, so write NOTHING for them. Just list them.
2. Remove duplicates: the same question in two files becomes one ask. Leave out anything already decided (read `ai/2026-09-24/loose-ends/report.md` and today's logs). Write your list to `sweep.md` beside this file as a table: title (about five words), question (one plain sentence the owner can answer), options, the card it goes on, source, and `from` (the agent that should hear the answer, when one clearly owns it; otherwise leave it blank).
3. For each row: find the card it belongs to (`GET /cards?view=all`, and match by subject). When there is none, create one with `POST /card/create` `{"title": …, "type": "question", "by": "minion-waiting-sweep"}`. Then `POST /card/append?id=<card>` with `{"ask": {"id": "a-<base36 now><2 random>", "title", "question", "options"?, "from"?, "at": <ISO local offset>}}`. The live Servex does not fill in the ask id or `at` yet, so you set them. A new card of type question with an ask on it would count twice, so create new cards with `type: "card"`.
4. Check that each card's `page.jsonl` ends with your ask line, and log the count.

⚠ Only Servex writes card files: never edit a `page.jsonl` by hand, and never restart Servex. Keep each question one sentence, in plain words, answerable at a glance (load the `content` skill).

## Part 2: the skills (in the worktree `C:\Code\lew42\worktrees\waiting-on-you`, committed there)
In the "Where your words go" paragraph of each of these four skills, make the owner's question go through `card_ask` (a change of a few words, no more): `.claude/skills/mastermind/SKILL.md`, `sub-mastermind/SKILL.md`, `minion/SKILL.md`, `every-prompt/SKILL.md`. If one of them has no such paragraph, find the sentence that sends questions to a card, and change that one.

Log to `task.jsonl` beside this file with `{"log": {"at": "NOW", "msg": "minion-C: …"}}` via `node .claude/hooks/append.mjs`. End your turn with the ask count, the path to `sweep.md`, and the commit hash.
