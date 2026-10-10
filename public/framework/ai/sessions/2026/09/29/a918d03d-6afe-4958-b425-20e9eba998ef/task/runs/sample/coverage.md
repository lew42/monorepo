# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | Just to add to that last comment, because I think, especially given this transcription kind of mode that I'm leaning into, the way that we get from my long rambling transcriptions, I'm a little worried that my long rambling transcriptions pollute the IQ of the LLM because I'm using a lot of ahs and ums and likes and I'm using a very informal speech and it's kind of long and rambling. | ask #1 |
| S2 | As the LLM processes all these tokens, it might make it less inclined to be intelligent or succinct or it's going to be more verbose or just, I don't know, get confused about all the extra wording. | ask #1 |
| S3 | So I guess what I'm thinking is that the transcription process should, as I've tried to explain in the past, definitely it should, I want to see the raw whisper transcriptions and the dictate extension. | ask #2 |
| S4 | So then, then we move towards the refinement of the prompt. | ask #2 |
| S5 | Okay, so everything that I say, I want detailed, explicitly so that if I want to look at wait what did I actually say and I need to have some audit ability over the raw transcriptions being converted into summarized transcriptions because I don't sometimes the LLM will leave out important details and so we need to make sure we don't do that, and we need to make sure that the LLM isn't summarizing incorrectly choosing different words or, being overly prescriptive or restrictive or when I haven't said it explicitly that way. | ask #3 |
| S6 | And so having some kind of verifiability over the transcription refinement process is very important. | ask #4 |
| S7 | And I think that's actually one of the best features that my system could work on is kind of, and it might mean using a multi-agent process. | ask #5 |
| S8 | Multiple models are processing the same transcription and then they kind of work collaboratively to pick the best names for different things, pick the best wording for different things, pick the best structure for how to structure the prompt, both for my sake and for the mastermind who's going to receive the end prompt, whatever the requirements are that get handed off because right now I'm dictating these long walls of text and then you, the mastermind, are summarizing them and passing them off to another mastermind and I'm not sure how detailed you're making the requirements and whether you're doing any preliminary thought processing or you're just passing it off kind of raw. | ask #5, ask #6 |
| S9 | If you're summarizing it greatly, maybe that's part of the disconnect here is that you summarize what I say in a few words, but I've said a lot of words and then all the things, all the details that I've asked for don't get passed on. | ask #7 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "investigate", "full", "context", "possibly" — not in the transcript at all |
| #2 | new words | "build", "show", "first" — not in the transcript at all |
| #4 | new words | "ensure" — not in the transcript at all |
| #6 | new words | "investigate", "currently", "before", "made" — not in the transcript at all |
| #7 | new words | "reducing", "down" — not in the transcript at all |
