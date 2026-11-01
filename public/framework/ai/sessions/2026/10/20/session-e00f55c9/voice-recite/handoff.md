# Hand-off: read replies aloud (Recite)

![The phone sheet: the Recite line above the mic, reading](proof/sheet-400.png)

## Merge, then two restarts

1. **Merge:** `node Server/merge.mjs C:/Code/lew42/worktrees/voice-recite` (branch `task/voice-recite`).
2. **Restart the site's dev server** (`restart_server monorepo`). It loads the `/recite/*` proxy that phones and the tunnel use.
3. **Restart Servex when no voice call is running.** Servex then supervises recite-server. Until then, a hand-started recite-server answers on port 8177 (python, started 2026-11-01). Servex leaves a server it did not start alone, so to hand it over: stop that python process first, then restart Servex.

## What to try on the walk (phone, `monorepo.lew42.com` or the LAN link)

1. **Tap ✦.** The new line sits directly above the mic: 🗣 (read new replies), ▶, ↺10, ⏮, the progress line, the voice, the ear.
2. **Ask something.** The reply is read aloud as it streams, sentence by sentence.
3. **Pause, play, back 10 s, from the start.** The place is kept.
4. **Talk over it.** It pauses at once and shows "heard: …". Press ▶ to go on.
5. **Let wind or a truck through.** It pauses, Whisper hears no words, and it goes on by itself ("noise — resumed"). Steady wind stops pausing it after a check or two.
6. **The ear off** means manual playback only. **The slider** beside the ear sets how loud counts as talking (the grey bar behind it is the mic level).
7. **Change the voice:** Heart, Bella, Nicole, Puck, Fenrir, George, Emma.
8. **Lock the screen:** reading goes on, with play/pause and back 10 s on the lock screen and headphone buttons.

Headphones work best; on the speaker, echo cancelling and the echo check keep it from pausing for its own voice.

## What was proven (headless, 400 px)

- First sound 0.44 s after Read; pause holds the position; back 10 s and restart land where they should; a voice change re-renders what is ahead.
- A fake mic saying "Wait, hold on…" paused it and Whisper returned those words.
- A fake wind clip paused it, Whisper returned nothing, and it resumed; after two checks the wind no longer paused it.
- A streamed reply was read once (no double read from the settled line); the owner's next line paused it.
- recite-server down: the browser's own voice reads instead, and the bar says why.

## Left on purpose

- A ▶ on each reply bubble (easy through `Recite.shared.read(text)`).
- A cloned voice (Chatterbox, 3–4 GB of VRAM): the server's `/speak` route would stay the same.
- Not tried on a real phone or through the public tunnel yet; `/recite/*` passes the site gateway exactly like `/whisper/*`.

More: [plan.md](plan.md) · [review/report.md](review/report.md) · [audio/Recite readme](/framework/audio/Recite/) · [the demo](/framework/audio/Recite/)
