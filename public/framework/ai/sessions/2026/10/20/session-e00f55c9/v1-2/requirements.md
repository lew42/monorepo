# Chat V1.2: V1 drawn from `session.messages`, with a send cursor and one green check (you are a mastermind, on Sonnet, high effort)

**The owner (2026-11-02, about 14:20, dictated; verbatim in the tab's prompt log):** "Let's make a V1.2 or something. Just make an additional version, add it to the list so we can try it out. If the second version works properly, then we might just switch over… once it works properly, we only need one."

## What to build
1. **A new version, V1.2, beside V1, V2 and V3.**
   - Make a new folder `ext/Chat/v1-2/` and add it to `ext/Chat/page.js` `children` ("panel drill list v2 v3" becomes "… v1-2 v2 v3").
   - It is V1 (`ext/Chat/Chat.js`), but it draws from `session.messages` through the ready adapter `core/Session/Chat/V1Bubbles.js`, not from `{chat}` lines.
   - Extend V1, don't copy it (law 6): a subclass that swaps the source. V1 itself stays untouched.
2. **The send cursor.** In the owner's bubble, a small cursor follows the text, about one sentence behind the last spoken word.
   - **Words not sent yet** sit after the cursor: the live Whisper guess and the unfinished sentence.
   - **When a sentence ends** (Whisper's `.` `?` `!`) and goes to the assistant, the cursor moves forward to the end of that sentence.
3. **One green check, no pink brain.**
   - One check mark rides with the cursor: it dims a little when a sentence is sent, and lights back up green when the assistant has received it.
   - No grey-to-green flashing per sentence: a gentle dim, then lit.
   - The 🧠 mark goes away in V1.2; with one assistant, one mark is enough.
   - The data is already there: `sent: {fast, smart}` on each Prompt message (`core/Session/Chat/readme.md`). V2 has cursor code to look at (`ext/Chat/cursors.js`, `cursors.css`); reuse it or rebuild.
4. **The layout** is the Claude-style one: `mastermind-chat-layout` is building the shared rule set right now ([its brief](../chat-layout/requirements.md)). Use that rule set; don't restyle. Message that agent before you touch `Chat.css` or the shared layout file.

## Check
- **A headless test** with the TestRunner Servex fence (never the live Servex):
  - a dictated Prompt growing sentence by sentence;
  - the cursor's position after each `sent` mark;
  - the check dimmed, then lit.
- **The V1 compare:** `node Server/ChatV1Compare.mjs` stays at 0 differing bubbles.
- **Screenshots** at 360×740 (phone UA `Android 10; K`, through `monorepo.localhost`) and at 1920, in a short walkthrough linked from the outcome.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)

**Fences:** commit by path; no `python -`. **Budget:** about $12. Report to vscode-mastermind in 3 lines, with the merge commit.
