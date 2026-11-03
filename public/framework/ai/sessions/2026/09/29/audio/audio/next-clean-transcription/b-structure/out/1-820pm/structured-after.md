# Decisions Tab and Dictate Pipeline

## UX (Decisions tab)
- Tapped an option on the Open Router Brains decisions tab, it marked "chosen" with no way to un-tap it — that's a UX thing. [S1, S2, S3]
- Don't mind it standing as the chosen answer. [S4]
- Not sure any AI is actually acting on that choice. [S5]
- Actually, the decisions UX looked pretty good — isn't terrible yet. [S19, S21]
- Like the orange border on the card — it draws a clear visual hierarchy. [S20]
- Like the nested cards for structure — can't overdo nesting since it eats padding space, but structure beats a wall of text, especially on mobile, so I like that. [S22, S23, S24, S25]

## Decision Policy
- Couple of things: don't want to have to approve all these little decisions. [S6, S7]
- If it's the recommended option, just go with it — do it and present the alternatives, framed as "we decided this, here were the alternatives." [S8, S9, S10]
- If the chosen option works, stick with it and just note there was an alternative and move on; if it doesn't work, try the alternative. [S11, S12, S13]
- Don't want anything hung up by these insignificant decisions — it's not clear yet until we get in and try, and they could change later anyway. [S14, S15]
- Just get an MVP working as fast as possible, to see if it's even worth pursuing or should be abandoned — do the best we can, as quickly as we can, and definitely don't create standstills. [S16, S17, S18]

## Structured Refinement
- Looked at the structured prompt system's refinement step — it's very impressive, and I like the way it works. [S26, S27]
- There's not enough real structure yet — what's produced is more like condensing or summarizing several statements into one, and that's fine, but it's really just condensing, not structuring. [S28, S29, S30, S31, S32]
- The structure part is really about putting familiar names on things, like headings — asking "what is this thing called?" [S33, S34]
- If there's a clear H1 — the thing being talked about — it should be written out first as the primary visual anchor that contextualizes everything else (e.g. "class Page"). [S35, S36, S37]
- Then name the first H2 — use an existing name if one already exists (e.g. "Layout"). [S38, S39, S40, S41]
- Bullet points under that heading give tangible, familiar, easy-to-digest context — that's the structure I was looking for, so it could be a bit more structured. [S42, S43, S44]

## Clean Transcription Mode
- Each refinement stage should show up in the dictate documentation/UX and mobile rail as a refined prompt, but I also want to dig backwards into what was actually transcribed. [S45]
- As the system evolves, want a modular setup where each layer of the pipeline can run a different model and a different prompt. [S46]
- A fast/smart model could clean up the transcript as long as it never changes meaning — no swapped, dropped, or added words, except a clear mistranscription or a grammatical fix for fast speech — there are some strong cases for slight tweaks. [S47, S48, S49, S50, S51]
- But generally the fast assistant's job is just to clean up the transcription quickly so text appears on screen as fast as possible. [S52]
- Want lower-level access to the raw Whisper transcription in the dictate widget, especially while streaming, to see how it works. [S53, S54]
- Converting raw to clean transcription (no "ahs" and "ums" on the UI) is the fast assistant's job — skip the strikethrough/corrections idea (keep it for debug mode) and just call this "clean transcription mode," pairing raw Whisper with the fast assistant's refinement. [S55, S56, S57]
- To do that in real time, may need to raise how often Whisper's input gets processed, pumping in frequent additions. [S58, S59]
- The fast assistant can probably iron out punctuation and seams from garbled audio between chunks, or better, the architecture should reduce the number of seams itself, maybe via multi-phase consensus/comparison eliminated programmatically. [S60, S61, S62]
- Clean transcription mode's first job is just to keep the real words and their order, minus the ahs and ums, so it reads more professionally — getting that prompt and model right will take work, but it's the first step. [S63, S64, S65, S66]
- Clean transcription can still be rambling and out of order, without headings or an outline — it's disorganized. [S67, S68]

## Streaming and Audio Cues
- As clean transcription builds, new messages keep getting added to it. [S69]
- Important: we're not reading responses aloud yet during transcription (though we might later), and we shouldn't respond while the user is still talking. [S70, S71]
- Right now the UI decides when to "send it off," maybe by measuring audio levels. [S72]
- Sending audio cues (like pauses) to the fast assistant LLM could be useful, though not sure Whisper can supply that properly. [S73, S74]
- E.g. pause start/end times (a three-second pause) sent to the fast LLM so it gets a real-time sense of audio cues. [S75, S76, S77]
- It's an interesting question and I'm not sure how to handle it yet. [S78, S79]
