# Text prep: what Recite sends to a voice engine (an idea, not built yet)

**The owner (2026-11-01):** "down the road, get it working first". Relayed from the web voice session.

1. **Plain English in:** the text a voice engine gets should be as close to plain spoken English as possible.
   - Strip markdown.
   - Normalise punctuation and sentences.
   - Turn tables into sentences, or skip them.

   Each engine handles markdown and punctuation differently, so one clean input is the safe base.
2. **A pronunciation library:** phonetic respellings for words engines fumble, applied automatically. For example, `JSONL` becomes "j son l"; Claude reading it aloud mangles it differently every time.
3. **Read-aloud directives (maybe):** spans inside generated text that tell Recite how to say something.
4. **One library for every engine** (Kokoro, Chatterbox, later ones), with a per-engine tweak only where one engine gets a word wrong.

A related rule for replies meant to be read aloud: avoid tables, and spell out what reads badly (the dictation-v3 brief).

Linked from [the Recite readme](../readme.md).
