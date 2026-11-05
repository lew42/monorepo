# The session page is the report

Expected cost: about $6. Sonnet. Load the `page`, `layout` and `ui` skills, and `ui-test` to prove it.

The owner's words: "I'd appreciate it if I could get a UI that actually works... Make sure your session detail page looks nice. Like, that's the report page. You should be able to link me to it... I should be able to see an overview of all the stuff I'm asking for. What tasks have you done? Are they complete? How much did it cost?" On the sessions list: "last time I looked at it, it hurt my eyes."

The test page is this session: `/framework/ai/sessions/5132a480-c10b-4dc0-8d72-8e6bf9e6f483/` on `monorepo.localhost`. Never `http://localhost/`.

## 1. Look first

Screenshot `/framework/ai/sessions/` and this session's page at 400, 1200 and 1920, headless. Say in a few lines what's wrong, and whether the list page is worth saving. Reuse `ai/AISession/` classes; don't start a second page.

## 2. Build the detail page so the top screen answers, in order

1. **Completion:** one big number, and done / open / stopped counts.
2. **What the owner asked:** each prompt in one line, with whether it's resolved.
3. **Every task and child session:** one row each, nested: title in plain words, complete or not, cost, duration, and commits. This is the table the owner wants at the end of a session.
4. **Total cost and duration.**

Everything else (raw messages, the full log) folds below or moves to a tab. It streams live, by plugging into the record, with no polling. Read from the methods on `Session` and `Task`.

`mastermind-completion-truth` owns the score and is changing how completion is computed and how prompts are counted. Message it before you start, agree on the method names you'll call, and don't edit `Task.js` or `Session.js`.

## 3. Fix the list page

If it's worth saving: one clean list, newest first, with title, completion, cost, duration. Recommend first if it should instead be replaced, and do the smaller thing.

## Done means

- Screenshots at all three widths in `shots/`; the top screen readable by someone who has never seen it.
- `check_page` clean on both pages, and the same number on the page as from the item tool.
- Landed with `merge.mjs` after a review; the page's readme current.
- Report the URL. Zero footprint.
