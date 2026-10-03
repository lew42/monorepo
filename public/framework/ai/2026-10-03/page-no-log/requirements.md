# Fold PageLog away: Page extends Item directly

The owner, 2026-10-03, right after confirming "List gets events" is done: "definitely do
that" —

> fold PageLog away, so `Page extends Item` directly.
> - PageLog (core/Page/Log.js) is a leftover middle layer: its page.jsonl replay is now
>   the Store's job.
> - Move what is still page-specific (the file/place/tab/settings verbs, the listing)
>   onto Page or into `Page.Store`/`PageLog.Reader` as a Store part, then delete the class.
> - Keep a `PageLog` re-export only if a caller census finds outside users.
> - Smoke /framework/, /framework/ai/, /framework/ai2/ and one page.jsonl page before merging.
> Small, one merge. Don't wait on the owner.

## Why this is safe to do directly (not a worktree + minions)

The big move — `Page extends PageLog extends Item` — already landed 2026-10-02
(`ai/2026-10-02/page-extends-item/`, commit e44930ad). What's left is smaller: PageLog
itself (`core/Page/Log.js`, ~690 lines) is the one remaining middle class. This task
deletes it by moving its body onto `Page` (`core/Page/Page.class.js`), so the chain
becomes `Page extends Item` with no stop in between.

## Caller census (law 6 — keep a re-export only if outside users exist)

Grepped every `PageLog` import outside Log.js/Page.class.js:
- `core/Page/ext/Inbox/Inbox.js` — `PageLog.log_pages.get(path)`
- `ext/drawer/tabs/sessions.js` — `PageLog.listing(...)`
- `ai2/tasks.js` — `PageLog.listing(...)`
- `ai2/groups.js` — `PageLog.listing(...)`, `PageLog.loaded_listing(...)`, `PageLog.loaded_listings`

All four only ever call PageLog's **static** methods. None subclass it. So: `Log.js`
stays as a one-line compat re-export (`export { Page as PageLog, Page as default }`),
and these four files are left untouched — they keep working unchanged.

## Scope fence

Touches only `core/Page/Page.class.js` (grows) and `core/Page/Log.js` (shrinks to a
re-export). Does not touch `Task.js`, `core/Task/`, or any of yesterday's Item/List/Store
work. Readme updates: `core/Item/readme.md` and `core/Page/readme.md`'s class-chain
diagrams (say `Page extends Item`, drop the `PageLog` box).
