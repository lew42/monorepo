# Step 2 of list-add-ref: a demo page for Refs, at /live/demos/ref/

Budget: $3 more (on top of the first $3). Do this in the same worktree, after step 1 of `requirements.md` (beside this file) is committed.

**The ask.** The owner said this on 2026-11-09, relayed by voice-app: "the way references work, we need to make sure we're documenting these and able to demo it… visual demos where you can link me to things, I click through and see exactly how it works." It must work on a phone.

## What to build

A page at `public/live/demos/ref/`. Today's other demo is `public/live/demos/code-card/`, and `public/live/item-test/` shows "an item in its own file". Read both first and copy their shape (page.jsonl and/or page.js).

The reader should get one takeaway: **one item, two places; change it in one place and the other shows the change.**

1. **One item, shown in two lists.** List A owns the item, and list B holds a Ref to it. Make it with today's `add()` (step 1 turns that into a Ref) or with `list.ref(x)`.
2. **Edit it in one place, and the other place changes.** Give the reader a button or an editable title on the List A side. List B's copy updates with no reload. If a live edit is not possible on this page type, use a scripted "change the title" button and say so in one line on the page.
3. **Show the Ref as a card with its source.** List B's entry shows the item, plus a small line naming where it really lives: "Ref → list A / item id" (and the file, for a cross-file Ref).
4. **A short "how it works" line under the demo,** with the code as JavaScript:
   ```js
   b.add(x)   // x already lives in a → b gets a Ref, a keeps x
   x.move_to(b) // the real move
   ```
   Link `core/Item/doc/ref.md`.
5. **Mobile first.** Check it at 400 and 1200 with headless shots (the `ui-test` skill). Save the shots in `public/live/demos/ref/shots/`. Look at them yourself.

## Docs

- `public/framework/core/List/readme.md`: one line in the Ref section, linking `/live/demos/ref/`.
- `core/Item/doc/ref.md`: one line linking the demo.

## Fence

Your new folder `public/live/demos/ref/`, plus the two doc lines above. Do NOT write `/live/`'s own `page.jsonl` or `/live/done/`; the mastermind adds that link. The step-1 fence still holds: no Item.js, Store.js or core/Page/*.js. If the demo needs a change there, stop and log it. Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`.

## Report

Commit by exact path in the worktree. Then reply in under six lines: the page url on your worktree server, the shot paths, and the commit.
