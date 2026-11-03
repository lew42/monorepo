# Join the session in use; read-aloud follows every session change; same-tab links

The owner, 2026-11-01 (relayed by vscode-mastermind):
1. A page or tab must not start a new session if the latest voice session had a line within an idle threshold (one named constant, 30 min); a new tab joins it. Evidence: the Recite page started v-625csln at 18:10 while v-u48msei was live.
2. The ✦ Sheet must follow the session on every change (Switch session, a session attached after load), not just at load, and log it. Evidence: the phone logged "loaded" and "unlocked" but never "sheet follows".
3. The read-aloud bar shows in the expanded sheet whenever Recite is loaded.
4. Links in chat bubbles to site pages open in the same tab (site-relative), so dictation keeps running.

Changes: `ux/Dictate/chat.js` (`JOIN_IDLE_MS`, `ensure()` joins), `ext/drawer/Sheet.js` (`read_aloud()` first in render, on every change plus a 5 s check, logs the first "no session"; the bar placed if DictationBar found no composer), `ext/Chat/md.js` (`site_path()`), `ux/Dictate/readme.md`.
