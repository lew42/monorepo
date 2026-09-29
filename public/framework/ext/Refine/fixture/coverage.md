# Coverage — every clean sentence, where it went

| S# | The sentence | → |
|---|---|---|
| S1 | Because I think... I'm a little worried that my long rambling transcriptions pollute the IQ of the LLM. | context only |
| S2 | I'm using a lot of ahs and ums... it's kind of long and rambling. | context only |
| S3 | As the LLM processes all these tokens, it might make it less inclined to be intelligent or succinct... | context only |
| S4 | The transcription process should... let me see the raw whisper transcriptions and the dictate extension. | ask 1 |
| S5 | Then we move towards the refinement of the prompt. | ask 2 |
| S6 | Everything that I say, I want detailed, explicitly... what did I actually say. | ask 2 |
| S7 | I need to have some audit ability over the raw transcriptions being converted into summarized transcriptions. | ask 3 |
| S8 | Sometimes the LLM will leave out important details, and we need to make sure we don't do that. | ask 4 |
| S9 | We need to make sure that the LLM isn't summarizing incorrectly... when I haven't said it explicitly that way. | ask 5 |
| S10 | Having some kind of verifiability over the transcription refinement process is very important. | dropped, because it restates the point already covered by ask 3 (the coverage audit); the brief did not add a second ask for it |

## Flags — an ask using a word or strength its cited sentences don't contain

| Ask | Word | Why |
|---|---|---|
| 4 | "must never" | S8 says "we need to make sure we don't do that", not "must" or "never" — the brief tightened a wish into a rule |
