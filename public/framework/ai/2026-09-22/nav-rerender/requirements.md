# nav-rerender — clicking AI → AI 2 → AI in the rail must re-render every time

Minion: Sonnet, effort high. Session id `2d11d7a8-340a-430a-9095-7712229e4ab0`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
`../mastermind-servex/common.md` first. Load `code`, `ui-test`.

## The owner's words (2026-09-22 17:53 and 18:18, verbatim)

> my navigation sometimes breaks when I'm clicking between AI and AI2 and back to AI. It just
> doesn't re-render the page. I have no idea what's going on there.

> I just clicked on the AI link in the framework sidebar and I get a blank page. framework/ai
> says AI, the title seemed to have changed, but there's nothing there. It's a blank page.

## What exists

`public/framework/page.js` `children: "start ai ai2 …"`; `public/framework/ai/page.js` (V3 is
its content — `top_level` from `ai/v/3/page.js`; `servex-hardening` made the deep link mount
once at 17:36: "ai/page.js only draws the V3 board on an exact /framework/ai/ visit";
`board-declutter` is editing the same files right now in the MAIN tree — read its task log
before you touch `ai/page.js`, and prefer the smallest fix in the router or in `ai2/page.js`);
`public/framework/ai2/page.js` (`classes: "full fill"`, built 17:46); the router in
`core/Page` (`Router`, `mark_links`, `route()`); the rail (`Sidebar`). A headless load of
`/framework/ai/` renders (the mastermind shot it at 18:19) — the failure is SOFT navigation.

## Deliverables

1. **Reproduce headless** (ui-test): load `/framework/`, click the rail's AI, then AI 2, then
   AI; after each click assert the main region has content (`.v3` present for AI, "Hello
   world" or the ai2 content for AI 2) and log the DOM state when it fails. Also: AI 2 → AI
   directly, and AI → AI 2 → back button. Find the exact sequence that blanks.
2. **The cause, fixed once.** Likely candidates: the "exact /framework/ai/ visit" check from
   the hardening fix reading a stale `location` on soft navigation; `ai2`'s `full fill` page
   leaving a class on a shared container; a `Page` that draws in `content()` only on first
   mount and not on re-activation; the catalog default-child logic. Fix the cause, in one
   place, with a comment naming this task.
3. **Proof:** the three sequences pass headless, screenshots after each click into `shots/`;
   zero console errors; `/framework/ai/` deep link still mounts `.v3` exactly once.

## Fence

`public/framework/core/Page/**` (router only if the cause is there), `public/framework/ai/page.js`
(Edit, smallest change, after reading board-declutter's log), `public/framework/ai2/page.js`
(Edit), your task dir, `ai/2026-09-22/page.js` `children:`. Land by the launcher's patch.

## Length

Landing report: four sentences — the sequence, the cause, the fix, the proof.
