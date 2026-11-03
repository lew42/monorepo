# Dictate: exact status signals, and its live objects on screen

## The owner, 2026-10-04 (verbatim excerpts)
> the socket said, like, reconnecting or something ... I thought it said whisper was connected ... we don't want to say connected when we're not connected. We need exactly the right signal. The UI feedback should be precise and accurate and give clarity.

> think about all the signals that the program gives or could give and what would be useful to help me figure out what's going on under the hood ... How does it work from an object-oriented standpoint? Use icon items in a hierarchical way to render the actual instances. And if it's not object-oriented, make it object-oriented ... a good default view for any class should show all the methods in the API. And a good default view for the instance should show all the properties and the current state ... choose the ones that are the most structural ... properties and methods could get a weight ... that weight defines its order in the list.

## Want
1. **Every status word is earned:** list each stage (mic track, socket, Whisper, session, assistants) and the real event that proves each state (e.g. Whisper "answering" only after a real reply; socket "connected" only on open, "retrying n" on close). The status line shows exactly those; nothing optimistic. Write the table in Dictate's `doc/`.
2. **Dictate as objects:** where the pieces are loose functions or module state, give them classes (one per piece, folder = file = class name), keeping behaviour the same. Small, safe steps; no new features.
3. **A Live tab on /framework/ux/Dictate/** that renders the running instances as nested icon items (Dictate → its parts), each showing its key properties and current state, updating live; the class view lists its methods. Reuse the existing "an object → its live instances" piece of ext/Doc if there is one (law 6); a `static weights` (or an order list) per class decides which properties come first.
4. Prove: headless load → reload, screenshot of the Live tab with real states; console "[dictate]" trail matches the status line.
5. Worktree → check_page → merge.mjs. The Dictate freeze applies to everything else.

Budget: $6 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
