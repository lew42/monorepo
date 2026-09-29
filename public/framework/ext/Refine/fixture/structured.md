# Structured — the owner's ideas as an outline

## The worry: long rambling dictation might pollute the LLM
- Informal, filler-heavy, long transcriptions might make the LLM less intelligent or succinct, or more verbose and confused [S1, S2, S3]

## The fix: keep raw, then refine it
- The raw whisper transcriptions and the Dictate extension must stay visible [S4]
- Move from raw towards a refined prompt [S5, S6]
- Have audit ability over raw → summarized conversion [S7]

## The two failure modes to catch
- The LLM drops important details [S8]
- The LLM changes wording, or turns something into a rule that wasn't said that way [S9]
