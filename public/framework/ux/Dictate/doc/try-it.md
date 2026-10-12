# Try it on your phone — voice to session page

You talk (or type); five stages appear live on a page, one under another. That page is the feedback loop.

## Steps

1. On the phone, open `http://10.0.0.135:3104/framework/ext/Refine/`.
2. Press the mic and speak, or just type in the box.
   - Plain `http` on a LAN hides the browser mic (the browser needs https; see [`https-lan.md`](https-lan.md)). Typing, or the phone keyboard's own dictation button, fills the same box and works the same.
3. Tap **Refine**.
4. Tap **Watch it on the session page →** (under the box). That page, `/framework/ai/sessions/<id>/`, shows the stages as they land:
   - **Raw** words: while you speak or type, until you tap Refine (about every 150 ms).
   - **Clean** sentences: together with Raw (code does the cleaning, so there is no wait).
   - **Structure**, **Refined prompt** (with a Copy button) and **Cards**: about 7 to 15 seconds after Refine (the model's speed; measured 6.6 s on the phone walk, 6.7 s on the desktop walk). They arrive together.

## What to expect

- The first four stages are written by code from what you said; the **Cards** are composed in code too, with clarity flags added by a small model. That differs from the original brief ("the refining model writes the cards"); the reason is in [`voice-to-page.md`](/framework/ext/Refine/stages/doc/voice-to-page/).
- After you tap Refine, editing the box starts nothing new until you tap Refine again.
- On a phone the session page follows a read-only stream from Servex, because the live page socket is localhost-only.

- Nothing sideways at 400 px; the stages stack.
- If Whisper crashes, Servex restarts it by itself (about 2 seconds, up to 30 when it has to reload its speech model). The one-line status under the mic says so in a sentence ("Whisper stopped at HH:MM and Servex is restarting it", then "…restarted it"), also at 400 px where the five-step row is hidden. While the mic is open the page asks Servex every 5 s, and while Whisper is down every 2 s; healthy and idle it asks nothing. The alternative, a Servex stream of Whisper's status, needs a Servex restart and is not built.
- A different session: add `?session=<uuid>` to the Refine URL.

## If it does not work

- No stages appear: Servex must have been restarted after the merge (`/api/voice` is a Servex route). Check `http://10.0.0.135:3104/servex/api/whisper` answers. The dev site is on port 3104; nothing listens on 8137.
- Class map, wire format and decisions: [`ext/Refine/stages/doc/voice-to-page.md`](/framework/ext/Refine/stages/doc/voice-to-page/).
