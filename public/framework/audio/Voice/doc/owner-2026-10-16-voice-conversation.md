# Owner notes, 2026-10-16: a full voice conversation (dictated, captured by voice-app)

Not a plan, not approved. The owner's words condensed so a later session can find them. Past work on voice output: this module (`Voice.js`: the browser's `speechSynthesis`, and since 2026-11-01 the local recite-server) and [Recite](../../Recite/readme.md), which reads replies aloud with barge-in. Past work on voice *sessions* (mic → Claude): `ai/past-work-index.md` sections "voice" and "Voice sessions".

## The missing piece

Text-to-speech is the last piece of a full voice loop: I speak, the reply comes out spoken. Past work exists on this; it should be indexed here, and it is now (see links above).

## Interjection

Voice AIs interject, but badly: they do not try a short interjection and then wait for a pause before going on. We want: quick interjection, then yield, then continue only on a positive pause.

## Said is not heard

A spoken reply takes far longer to read out than to generate. The whole reply enters the context the moment it is generated, so the model believes it was said and heard. I often stop the voice, interject, or do not read the message. Then the model never repeats the point, even when it matters later. This is a real source of lost communication.

Possible shape: on an interruption, only the part that was actually spoken reaches the context, not the whole generated reply. That may be hard; it depends on whether voice is its own process or a layer over text chat (usually the latter).

## Two renderings of one reply

A reply may need two forms:

1. written / UI — what is shown
2. spoken — what the voice engine reads

Spoken text needs things spelled out, pronounced properly, verbally articulated where text-to-speech fumbles. A `voice alt` string (phonetic spelling, spelled-out names, whatever works) that goes to the voice engine instead of the shown text. Likely depends on which voice model is in use.

## Status

Keep notes; not much AI-voice work is wanted right now. A past-work inquiry on AI voice was asked for; the index now points here.

## Addendum: barge-in

A voice agent reads its output aloud as it generates. When the user starts speaking, interrupt immediately (the only case where interrupt beats queue): the rest of the answer may no longer apply and the reply will adjust. The agent's instructions must make it hands-free: speak, do not write files, so an interrupt never cuts a sequence.
