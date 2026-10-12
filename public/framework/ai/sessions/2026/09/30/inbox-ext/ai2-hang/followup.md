# Follow-up to the ai2-hang brief: two more owner items, after the freeze fix

These come from servex-mastermind-opus, relaying the owner (2026-09-30). The freeze fix stays first. Do these after it, in the same worktree, and commit each one. They go out in the same small merge.

## 1. The × (archive) button on the preview rows

It sits out of line with the row head, and its hover does nothing. Fix it the way commit 9ecda14e fixed the unread dot: `align-self`, `min-block-size` and `block-size` (see `git show 9ecda14e` on michael/dev). The × should sit centred on the row's first line, and its hover should show. Prove it with a before-and-after crop at 1920 and at 400, with the hover shown.

## 2. A pinned "Now" card

- **The data:** `public/framework/ai/now/page.jsonl`, in the MAIN tree (servex-mastermind-opus made it: class `/framework/ai2/card.js`, id `now`, one note). Copy it into the worktree as-is.
- **What the owner wants:** a quick card to go to and edit right now, always shown on the AI 2 Inbox the way the Live card is. It is pinned at the top of the rail, above Live, and imported by hand, not found by a scan.
- **Route it in two places:**
  1. On AI 2 at `/framework/ai2/now/`, the way `live` is routed (`ai2/page.js` ~line 111, `card_page(this, …)`). Add `now` to the reserved ids beside `live`.
  2. At `/framework/ai/now/`. Today that 404s, because `ai/page.js` only reaches a child it names or routes. Add one small `route()` case for `now` in `ai/page.js`, which shows the same card.
- **Proof:** both urls load the card with zero console errors, it heads the AI 2 rail at 400 and 1920, and a reload on either url lands on it.

## Fence

Your fence widens to include `public/framework/ai/now/` (new, in the worktree) and `ai/page.js`, but only the `route()` case for `now`. The rail minion takes `ai/page.js` over after you, so keep that edit to a few lines.

## 3. The × must archive (added 16:30, the owner)

Pressing × only toggled read/unread and the row stayed. It must archive: the row leaves the Inbox, and still shows in the Log (the archived filter) and in search. Look at `archive()` in `ai2/page.js` (~line 792) and `archive_row` in `ai2/rules.js`. Prove it headless: press ×, and the row is gone, then it is found by search. Your fence widens to `ai2/rules.js`. Minion `priority` works in the same worktree, on `needs-rule.js`, `inbox.js`, `faces.js`, `groups.js` and `log.js`: stay out of those.

## 4. INBOX ZERO (added 16:35, the owner; this is now the top of the merge)

The owner wants inbox zero. Order: finish the Now card if it's nearly done, then:
1. **× archives and it sticks** (section 3). Reload: the row stays gone.
2. **"Clear all"**: a button in the rail head that archives every row currently shown in the Inbox in one press, as the owner's own action. It writes the same `status: archived` lines × does, through the same `archive_row`. There are about 336 open cards today, so it must batch and not freeze. One confirm is fine ("Archive N rows?").
3. **The display rule**: in `relist()` (`ai2/page.js`), the Inbox shows only rows with `it.score >= min`, where `min` defaults to 90 and comes from `?min=` in the url. Search and the archived filter ignore `min`. The rest leave by the display rule alone, with no writes. Minion `priority` gives every row a numeric `score` that decays with age (in `inbox.js`/`needs-rule.js`). Until theirs lands, treat a missing score as 0.
Proof: at 1920, the rail before and after, × then reload, clear all then reload, `?min=0` shows everything. Zero console errors. Ship it the moment it works: message me.
