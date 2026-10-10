# Minion: finish the one widget — restore choices, card pages on the session pair, inbox

Load the `minion` and `code` skills first. The owner's words: [../requirements.md](../requirements.md), ask 5 and the addition below. Card dir: `public/framework/ai/2026/09/29/audio-a-library-of-audio-parts-transcrip/`.

The owner, via the architect: "the drawer on the AI 2 page … does NOT use the per-session fast and smart assistant pair (it goes to the old card assistant and manager). Make the AI 2 drawer and card pages use the SAME widget and the SAME session pair as the ✦ sheet."

**Worktree only:** `C:\Code\lew42\worktrees\audio-consolidate` (branch `worktree/audio-consolidate`, server http://localhost:53292/). You are the only minion in it. Commit each file as soon as it works, with `git commit -m "…" -- <exact path>` (a restart once wiped uncommitted work here). Leave `files.jsonl` changes alone.

**Read only what you need:** `ux/Dictate/Widget.js` (the widget), `ext/drawer/rail.js` (the ✦ sheet, around lines 560–830), `ext/drawer/tabs/ai.js` (desktop AI tab; `send({card})` at ~line 91 is the OLD card bridge), `ext/Session/readme.md` (the pair's API), and `git show 4ce5782e -- public/framework/ext/drawer/rail.js` (what the widget swap removed).

## Fence
`ux/Dictate/Widget.js` + `.css`, `ext/drawer/rail.js`, `rail.css`, `tabs/ai.js`, `ext/drawer/readme.md`, `ux/Dictate/readme.md`. NOT `ext/Session/`, NOT `Servex/`, NOT `framework/audio/`.

## Deliverables, in this order
0. **First:** `git merge michael/dev` into the worktree (it brings `ext/drawer/inbox.js`, merged after we branched). Read every conflict; never take a side wholesale.
1. **Fix the regression.** The widget swap (4ce5782e, 381ab33f) dropped ChatPanel's `answer` + `marks: true` (the Chat HITL ✓/? choice buttons on a reply) and the sheet's resume line (`on_resume_choice`). Give Widget the same `answer(choice)` and `marks` options ChatPanel had (reuse ChatPanel's own rendering of choices; don't re-invent it) and pass them again from rail.js and tabs/ai.js exactly as before. Proof: a reply with choices shows its buttons in the sheet; clicking one calls `answer`.
2. **Card pages on the session pair.** On an AI 2 card page (`/framework/ai2/…` showing one card), the sheet and the desktop AI tab stop calling `send({card})` and use the pair: `Session.start({path: <page path>, card: <card id>})` on the FIRST sentence, then `Session.say({session, path, text, via, floor, cues})`, and draw replies with `Session.watch(file, on_line)` using the own-ats dedupe the non-card path already uses. For the "pick up where you left off" offer on a card, call `GET <servex>/api/sessions?card=<id>&limit=1` (same row shape as `Session.recent`). Delete the old card branch once nothing uses it. Until a Servex restart the `card` option is ignored server-side; prove the send, not the reply.
3. **The page inbox in the sheet.** In rail.js add `import DrawerInbox from "./inbox.js";` and `new DrawerInbox({ page }).view();` just above the widget in the phone sheet.
4. Readmes: one line each in ux/Dictate and ext/drawer for what changed.

## Proof
Headless Playwright (`windowsHide: true`, fake media flags, scripts in your session scratchpad named `wire-*.mjs`; stop what you start). Shots into this dir: `sheet-400.png` (inbox + widget + a bubble), `card-1920.png` (a card page with the drawer's widget and a sent bubble), `choices-400.png` (a reply's choice buttons). Zero console errors on those pages. If card pages fail to load at all, first check the same card on http://monorepo.localhost (the main site): if it fails there too it's not ours, say so and prove the send on the worktree another way.

## Budget
Sonnet, about $3. Log steps in your task.jsonl. End with a 4-line summary including the commit ids.

