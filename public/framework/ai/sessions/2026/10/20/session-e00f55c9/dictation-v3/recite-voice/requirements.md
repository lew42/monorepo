Budget: $9

# Read-aloud inside the dictation chat: voice engines, speed and voice in the dictation settings, a Sample button, "switch your voice", and a mic that ignores the read-aloud

Load the `minion` skill first, then the `code` and `ui` skills. Owner's words: [../requirements.md](../requirements.md) (the Read-aloud bullets and "Added by the owner"). The whole plan: [../plan.md](../plan.md) (you are piece B; decisions 5–8). Readmes first: `public/framework/audio/Recite/readme.md`, `public/framework/audio/Recite/doc/architecture.md`, `public/framework/audio/Voice/` (readme if any), `public/framework/ext/Chat/readme.md`.

**Worktree:** `C:/Code/lew42/worktrees/dictation-v3` (branch `task/dictation-v3`, its own server at `http://dictation-v3.localhost/`). Work and commit only there, by path, after each working step.

**Fence (only these files):** `public/framework/audio/Recite/*`, `public/framework/audio/Voice/*`, `public/framework/ext/Chat/Mic.js` (the settings rows and the echo drop only), `public/framework/ux/Dictate/chat.js` (the voice command only). Another builder works in `ext/Chat/v3/` and `ext/drawer/` at the same time: do not edit those.

## Build, in this order

1. **Voice engines.** `Voice` takes an `engine`. Two engines, one class per file, beside `Voice.js`: `KokoroEngine` (recite-server, today's code moved, not rewritten) and `BrowserEngine` (`speechSynthesis`, today's fallback). An engine says which parameters it supports (`speed` for both; `pitch` for the browser). A future GPU model is one more engine file. Nothing outside `audio/` changes because of this.
2. **Voice and speed in the dictation settings.** The gear panel is `settings_panel()` in `ext/Chat/Mic.js:314`. Add a "Read-aloud" group: the voice (the seven personas), speed (0.7–1.5), and a **Sample** button that plays one short line in the chosen voice, plus a **Sample all** that plays one line in each voice, saying its name. Store them in Recite's existing localStorage keys (`lew42.recite.voice`, add `lew42.recite.speed`) so the Recite bar's own voice menu and the settings always agree.
3. **"Switch your voice" by voice.** When an owner sentence matches something like "switch/change (your|the) voice (to <name>)", Recite switches (to the named persona, else the next one) and says "Now I sound like <name>." in the new voice. The sentence is still sent as a normal line. Hook it where `ux/Dictate/chat.js` sends an owner line; keep the matching in Recite (`Recite.voice_command(text)`, a pure function you can test).
4. **The mic must not transcribe the read-aloud.** Whisper heard "Here is a reply. Read aloud." several times (the owner, 2026-11-01). (a) Check the capture's `getUserMedia` constraints ask for `echoCancellation`, `noiseSuppression`, `autoGainControl` (find where the dictation mic opens it, probably `ux/Dictate/capture.js` or `ext/Chat/Mic.js`; if it is outside your fence, report the line, don't edit). (b) In `ext/Chat/Mic.js`, beside the duplicate drop (`same_as_last_send`, near line 749): while Recite is playing or within 1.5 s after, drop a finished sentence when most of its words (say 60%+) appear in the text Recite read in the last 20 s. Log the drop with `DictateHealth.event` as the duplicate drop does. The owner's own words still go through. Ask Recite through a small method (`Recite.shared.heard_itself(text)`), so Mic.js holds no Recite logic. A setting "while reading aloud: ignore echoes / mute the mic text" picks this or a full mute.
5. **Speech-friendly text.** Before rendering, Recite strips markdown marks, reads a table as "a table with N rows" and skips it, reads a code block as "a code block", and turns a path or URL into its last readable word. A pure function, tested.

## Prove it

- Extend `Recite.test.mjs`: the engine switch (Kokoro down → browser engine), speed reaches the request, `voice_command()` cases (5+), `heard_itself()` true for the read sentence and false for a new one, the markdown/table cleaner (5+ cases).
- Headless shots at 400 and 1200 of the settings panel with the Read-aloud group, in `shots/` here. Read them yourself.
- Update `audio/Recite/readme.md`, `audio/Recite/doc/architecture.md` and the Voice readme in the same commit as each class (the owner: "document as you build").

**Never:** restart or kill any server or Servex, start or stop recite-server, run `python`, drive the owner's tabs, stash. Log progress lines in your own `task.jsonl` (`node .claude/hooks/append.mjs`). If short of budget, cut "Sample all" first, then step 5's code-block and path rules.
