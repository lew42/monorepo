verdict: fix
1. [fix] Step 4 is only half done. The brief asks for a List view so that "any view just renders the list", and plan.md step 4 says "`ChatList` becomes 'render the list'". But `ext/Chat/list/ChatList.js:33-53` keeps its own keyed loop (`els` Map, `dirty` Set, `prev.after(el)`) and now has a second copy of the Ref → RefView branch. That makes two keyed reconcilers and two Ref branches (Law 6). Either draw `session.messages` through `DefaultView.reconcile()`, giving ChatList a `child()`-style hook that builds the bubble, or say in plan.md why ChatList stays separate.
2. [fix] `core/List/readme.md` (the new `List.View = DefaultView` bullet) says "ext/Chat/list draws `session.messages` through the same `DefaultView.reconcile()`". That is false: ChatList has its own `draw()` loop and never imports DefaultView (Law 9). Fix this together with finding 1, or reword it.
3. [note] `List.View` is set only as a side effect of importing `ux/Content/Object/DefaultView.js` (DefaultView.js, end of file). On a page that never imports it, `list.render()` still returns `undefined` (`core/List/List.js:420`). The List readme says so, but nothing on the List page shows which pages get a view.
4. [note] `ChatList.js:48` builds `new RefView({ ref: m, where: false })` without `capture: false`. If `draw()` ever runs inside a capturing render, the row lands in the captor first. That is the trap `ux/Content/Object/readme.md` warns about, and `DefaultView.reconcile()` passes `capture: false` for the same reason.
5. [note] `list-view.test.mjs:4` imports `file:///C:/Code/lew42/monorepo/Server/Browser.mjs`, so from a worktree it runs the main tree's Browser. Its fallback base is `http://chat-model.localhost` (line 6), which goes stale once the worktree is gone; `TestRunner` passes `SITE_URL`, so it does run (results.jsonl: ok, 5655 ms, 05:55:59). Siblings in `ext/Chat/` use the same hard-coded path; `core/Task/TasksPage.test.mjs` shows the relative form.
6. [note] `ext/Chat/list/fixture/session.jsonl` was regenerated (all 29 lines rewritten with new ids and times), but it still holds no Ref. So the demo at /framework/ext/Chat/list/ never shows the new `.chatlist-msg.is-ref` row that this step added. Add a `tasks.add` (or a Ref line) to the fixture writer so the demo shows the change.
7. [note] Index churn: `public/framework/ai/files.jsonl`, `public/framework/files.jsonl` and the v2/v3 fixture `files.jsonl` gain pairs of add-then-`gone` lines for temporary test folders (`process-test-*`, `prompt-tasks-test-*`). They are harmless, but they are noise that a test cleanup should not write into the index.
8. [note] The shots (400 and 1920) are of `chat-model/builder/`, which this diff does not render. No shot shows the List view or ChatList, so the browser test is the only visual proof of this step.

Widths given: 400, 1920. The diff is commits a5ab51bf6 and 12d2e7621 on worktree/chat-model (step 4). The test `ux/Content/Object/list-view.test.mjs` is in results.jsonl as ok. Task `s4` is filed on session.jsonl line 7, and `s4/session.jsonl` logs the work.

## Requirements
- 4 "A List view that re-renders on insert, remove, move and sort (the Store delta)" — yes. `List.View = DefaultView`, and `reconcile()` is keyed by member. list-view.test.mjs checks add, remove, move and order, and checks that rows which did not change are not rebuilt (13 checks).
- 4 "so that any view 'just renders the list'" — no. ChatList still runs its own reconcile loop (finding 1).
- 4 "Find the existing List view first and extend it" — yes. It extends `DefaultView.child()` and `reconcile()`; no new view class.
- 2 Ref "renders it" — yes. A Ref member draws through RefView in both DefaultView and ChatList, and the test checks the `ref-view` class.
- Fences: no edits to `ext/Chat/v3`, `ux/Dictate` or V1's renderers — yes. The only files touched there are v2/v3 fixture `files.jsonl` index lines.
- Docs, Law 9 — partly. `ux/Content/Object/readme.md` and `ext/Chat/list/readme.md` are current, and the test is indexed. `core/List/readme.md` has a false claim (finding 2).
- Could a fresh agent continue from the folder alone? — yes. plan.md has the steps, session.jsonl has s4, and s4/session.jsonl logs what was wired.
- New class with live instances? — n/a (no new class).

## Words
- The readme bullets are plain and name their files — yes, apart from the false ChatList claim (finding 2).
