# Try it on your phone — voice to session page

You talk (or type); five stages appear live on a page, one under another. That page is the feedback loop.

## Steps

1. On the phone, open `http://10.0.0.135:8137/framework/ext/Refine/`.
2. Press the mic and speak, or just type in the box.
   - Plain `http` on a LAN hides the browser mic (the browser needs https; see [`https-lan.md`](https-lan.md)). Typing, or the phone keyboard's own dictation button, fills the same box and works the same.
3. Tap **Refine**.
4. Tap **Watch it on the session page →** (under the box). That page, `/framework/ai/sessions/<id>/`, shows the stages as they land:
   - **Raw** words: while you speak or type, until you tap Refine (about every 150 ms).
   - **Clean** sentences: a few seconds later.
   - **Structure**, **Refined prompt** (with a Copy button) and **Cards**: about 7 to 15 seconds after Refine (the model's speed).

## What to expect

- The first four stages are written by code from what you said; the **Cards** are composed in code too, with clarity flags added by a small model. That differs from the original brief ("the refining model writes the cards"); the reason is in [`voice-to-page.md`](/framework/ext/Refine/stages/doc/voice-to-page/).
- After you tap Refine, editing the box starts nothing new until you tap Refine again.
- On a phone the session page follows a read-only stream from Servex, because the live page socket is localhost-only.

- Nothing sideways at 400 px; the stages stack.
- The Whisper row on the Refine page says "Whisper stopped at HH:MM and Servex restarted it" if Whisper crashed and came back. It restarts by itself in about 2 seconds.
- A different session: add `?session=<uuid>` to the Refine URL.

## If it does not work

- No stages appear: Servex must have been restarted after the merge (`/api/voice` is a Servex route). Check `http://10.0.0.135:8137/servex/api/whisper` answers.
- Class map, wire format and decisions: [`ext/Refine/stages/doc/voice-to-page.md`](/framework/ext/Refine/stages/doc/voice-to-page/).
