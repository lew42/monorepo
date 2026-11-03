verdict: fix

## Fix

- `ext/Chat/Mic.js:67` (`same_as_last_send`) drops a real follow-up message.
  - "Okay." then "Okay, now delete the branch." within 4 s: the second is thrown away, because the earlier text matches its start.
  - Fix: compare the WHOLE of both texts, `D[S.length][T.length] / max(len)` ≤ 0.35.

## Notes

- No `requirements.md` or `owner-words.md` in this folder; commit the brief beside the task.
- `ext/drawer/rail.js:342` shows the raw class name "DrawerRailSheetChat" as the sheet title, and `ext/drawer/rail.css:314` adds compact CSS. Both are outside the bubble fix; the doc should say whether the owner asked for them.
- `collapse_repeat` (`Mic.js:74`) also folds an intended repeat ("I said stop, I said stop"). List it in the doc as a known side effect.
- `ux/Dictate/chat.js:462` is sound: an adopted echo is retagged, and the later `retag` finds nothing.
- `doc/proof/shots`: `before-navigate-*` and `after-navigate-*` are identical, so that scenario never reproduced the bug. The `dbg-*.png` shots are clutter.
- `doc/proof/*.mjs` hardcode `C:/Code/lew42/monorepo` and port 54923; resolve against `import.meta.url`.
