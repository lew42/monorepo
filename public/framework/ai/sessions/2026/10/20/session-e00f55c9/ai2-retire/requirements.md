# Retire ai2: prove every record is in the sessions store once, then plan the removal (audit only)

**The owner (2026-11-01):** "AI2 should just go away… check if AI2 still has data that needs to be merged. Be very careful about that… merge all the old records over if they haven't already. Maybe they were moved or copied over and they were never deleted. We definitely don't want duplicate session data. The AI2 definitely saved some session data, and I think there were multiple patterns… we just need to make sure our data isn't corrupted or misaccounted for or duplicated… And then the AI2 directory should probably just disappear."

**What's known:**
- `public/framework/ai2/readme.md`: ai2 was merged into ai on 2026-10-09. What's left are shims, the `/framework/ai2/` route, and some logs. The move manifest is `public/framework/ai/sessions/2026/10/09/session-6784f3f5/ai2-merge/manifest.json`, and the old page logs are in `public/framework/ai/archive/ai2/`.
- `public/framework/ai2/tasks/*/task.jsonl` (13 folders plus a parent): small stubs written by `task-migrate` on 10-17, each pointing at a real task in `public/framework/ai/sessions/…`.
- Other ai2 logs: `ai2/ai/log.jsonl`, `ai2/overview/ai/log.jsonl`, `ai2/page.jsonl` and `ai2/weight.jsonl`.
- The `/framework/ai2/<card>/` route shows cards from the old dated folders: `public/framework/ai/YYYY/MM/DD/…` and `public/framework/ai/2026-10-13/`. These are the "multiple patterns".

## Answer (read-only; a node script does the counting, law 7)

1. **Every record file under `public/framework/ai2/`:** for each one, say whether its content is in the sessions store (`public/framework/ai/sessions/YYYY/MM/DD/<session>/…`):
   - **identical:** the same lines;
   - **a pointer:** it only refers to the store;
   - **partly there;**
   - **missing.**

   Give a line count and an example for each.
2. **Every session or task record still outside the store,** under the old patterns: `public/framework/ai/YYYY/…`, `public/framework/ai/2026-10-13/`, `ai/archive/ai2/`, and the `/framework/ai2/` cards. For each, is it in the store already (by session id, or by request and requested_at)? Is it there twice? Or only in the old place?
3. **Duplicates:** any session or task in the store more than once, with different paths for the same session id.
4. **Who still reads ai2:** imports of the shims, links to `/framework/ai2/`, and Servex or Server code that reads those folders (`grep`).

## Write

- **`audit.md` in this folder:** one screen, the counts table first, then the "missing" and "duplicate" lists in full.
- **`move-plan.md`:** a scripted plan (dry run plus a manifest of every old → new path) to:
  - copy the missing records into the store;
  - mark the ones that are already there;
  - repoint the readers;
  - move `public/framework/ai2/` aside, not delete it.
- **The audit script** goes in this folder as `audit-ai2.mjs`.

## Fences

- **Read-only.** Move, delete or rewrite no record. Write only in this folder. Commit by path. Spawn no one.
- **Budget:** about $8. Sonnet.
