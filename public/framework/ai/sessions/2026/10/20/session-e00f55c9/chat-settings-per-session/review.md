verdict: pass
1. [note] `agent working` comes from `Recite.cue_pending` alone, which `Recite.js:287` sets only while Recite is `auto`. With read-aloud off, the line goes from `sending` straight back to empty while the agent works. plan.md says this, so the next step can add the `stream` source the brief allowed for.
2. [note] The comment at `ux/Dictate/chat.js:291` says "one ChatStatus per page", but the block runs once per `chat()` call. Each chat adds a `Recite.on` and a `floor.on_mic` listener that is never removed. `floor` is page-global, so a second chat on the same page would also show `listening` for the first chat's mic. This is harmless with one chat per page; the comment should say what actually happens.
3. [note] The test command in `ux/Dictate/doc/settings.md` ("Status line", last line) is `node ux/Dictate/ChatStatus.test.mjs`. From the repo root it is `node public/framework/ux/Dictate/ChatStatus.test.mjs`, which is how the test file's own header says it.
4. [note] The new `changed()` calls in `audio/Recite/Recite.js` (`expect_reply`, `start_thinking`, `cancel_cue`) also wake ReciteBubble's `sync()` and ReciteHighlight's `tick()`. Both are cheap redraws, and `cancel_cue` fires only when the value flips, but `audio/Recite/readme.md` doesn't say that `on()` now fires for the cue too.

## Requirements
- Step 6, "a status line beside the mic shows the phase, named as the code names it (listening, sending, agent working, speaking)": yes. `ChatStatus.js` uses exactly those four words in that order, and `minion-settings-build-step6/status-agent-working-360.png` shows "agent working" between the mic and the gear.
- Brief: "never a new copy of state; no polling": yes. The four sources are read live. Change signals come from `Recite.on`, the new `floor.on_mic` and the page's `sending_poke`. There is no `setInterval`.
- Brief: "`ext/Chat` imports nothing from `ux/`": yes. `Composer.js` only draws an empty span (`mic.status_el`), and `chat.js` binds it.
- Brief: "must not push the composer wider at 360; may truncate": yes. `Chat.css` sets `max-inline-size: 9em` with an ellipsis, and the 360 shot does not overflow.
- Brief: "tests first": yes. `ChatStatus.test.mjs` passes 3/3 when re-run here (9 checks).
- Brief, docs (laws 9, 10): yes. There is a "Status line" section in `doc/settings.md`, an index line in `ux/Dictate/readme.md` and a Step 6 line in plan.md. Small gaps are in notes 3 and 4.
- New class (`ChatStatus`), "a page that shows its live instances": no. It holds one derived word and no state the owner would want to watch, so this is not a fix.
- Can a fresh agent continue from this folder? Yes. plan.md's Step 6 line names the worktree, the files, the shots and what is left. The worktree branch's commit hash is not recorded in plan.md; it is 05f5b079a.

## Words
- The four words match the code and the owner's list. The doc section is plain and says where each phase is read from: yes.
