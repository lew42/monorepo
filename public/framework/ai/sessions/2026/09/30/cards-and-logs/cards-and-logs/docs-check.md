# Docs check — card/ readme chain

Reviewed: card/readme.md, log/readme.md, log/whisper/readme.md, doc/system.md.

**Makes sense.** Clear top-down story: inventory -> six demos -> one rule table in
doc/system.md. The "reuse, don't reinvent" point (.card, --pad-card, --radius) is
stated consistently at every level without repeating word for word.

**Two small gaps:**
1. doc/system.md's newest, least-settled decision (cards as one-line page.jsonl
   entries with virtual routing) sits at the bottom, after all settled CSS rules -
   no flag that it's the freshest/most provisional part. Worth a marker near the top.
2. log/whisper/readme.md's "Watch out" explains the ClipMic/MicStream substitution
   mechanism in detail - that belongs in doc/clipmic.md per "docs point, they don't
   explain"; the readme should just point to it.

Nothing missing structurally. No action taken - flagging only.
