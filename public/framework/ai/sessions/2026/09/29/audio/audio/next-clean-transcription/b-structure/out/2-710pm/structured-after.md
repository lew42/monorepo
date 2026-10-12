# Voice session

## AI button
- I don't know the best way to cram two different voice session kind of UX into one site. [S1]
- My gut feeling is that if there were some sort of dev mode that would add an extra bottom rail where it's a dark mode one. [S2]
  - It looks way different and it follows you around from page to page. [S3]
- Maybe on each page you have a light mode AI button that's specific to that page. [S4]
- But I don't know. [S5]
- See, then I'm thinking that's too complicated. [S6]

## Persistence
- Generally speaking, if you navigate away, I think the session should still persist, especially if the voice is in recording. [S7]
  - If it's a live transcription, you definitely should follow to the next page. [S8]
    - We shouldn't just stop transcribing. [S9]

## Session log
- Maybe the creation location for that session, I don't know if that's where we save the session's log. [S10]
  - Currently we might be leaning on the Claude code session file, which lives somewhere on the file system. [S11]
- In the future, when we're using Open Router and other providers and another harness, we might need to be creating our own session files. [S12]
- We might have to think about where we're actually saving the entire session state. [S13]
- Whether or not it files something away in that page.jsonl, for example, or maybe it's a special AI subdirectory for a whole AI task management logging conversation system, we'll have to figure that all out. [S27]
  - I don't know how big the JSON-L files can get before they start getting bogged down with unnecessary data. [S28]

## Recent sessions
- We do want the ability to restart old sessions when it makes sense, even though creating a fresh session is probably the go-to for, well, at least a good frequency of the time. [S14]
  - If we're not continuing, we want to have the ability to both start a new session and continue an old session. [S15]
- We would probably need some sort of recent sessions UX. [S16]
  - That's how all the AI apps work these days. [S17]
    - You create a new session. [S18]
    - There's a list of session summaries. [S19]
- I'm trying to think through the best user experience, how that would work, how that would feel and whether it's going to be intuitive to the user, what goes where and what comes from where and where you go to find what you were working on. [S20]
- This could get really complicated really quickly. [S21]

## Context
- I do think maybe having the page in which the session is started on, that should actually be built into a new session. [S22]
  - So when you create, you click the AI button and it creates a new voice session. [S23]
  - Even if that's a global mobile rail that creates a global session, it still gets the context from that page, right? [S24]
  - That's the default setup that we're supposed to be building. [S25]
  - And so it knows which page you're on when you start. [S26]
