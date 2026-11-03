S1. So I don't know the best way to cram two different voice session kind of UX into one site.
S2. I guess my gut feeling is that if there were some sort of dev mode that would add an extra bottom rail where it's a dark mode one.
S3. So it looks way different and it follows you around from page to page.
S4. And then maybe on each page you have a light mode AI button that's specific to that page.
S5. But I don't know.
S6. See, then I'm thinking that's too complicated.
S7. And generally speaking, if you navigate away, I think the session should still persist, especially if the voice is in recording.
S8. If it's a live transcription, you definitely should follow to the next page.
S9. We shouldn't just stop transcribing.
S10. Now, maybe the creation location for that session, I don't know if that's where we save the session's log.
S11. So currently we might be leaning on the Claude code session file, which lives somewhere on the file system.
S12. In the future, when we're using Open Router and other providers and another harness, we might need to be creating our own session files.
S13. We might have to think about where we're actually saving the entire session state.
S14. We do want the ability to restart old sessions when it makes sense, even though creating a fresh session is probably the go-to for, well, at least a good frequency of the time.
S15. If we're not continuing, we want to have the ability to both start a new session and continue an old session.
S16. So we would probably need some sort of recent sessions UX.
S17. That's how all the AI apps work these days.
S18. You create a new session.
S19. There's a list of session summaries.
S20. And so I'm trying to think through the best user experience, how that would work, how that would feel and whether it's going to be intuitive to the user, what goes where and what comes from where and where you go to find what you were working on.
S21. This could get really complicated really quickly.
S22. So I do think maybe having the page in which the session is started on, that should actually be built into a new session.
S23. So when you create, you click the AI button and it creates a new voice session.
S24. Even if that's a global mobile rail that creates a global session, it still gets the context from that page, right?
S25. That's the default setup that we're supposed to be building.
S26. And so it knows which page you're on when you start.
S27. And so whether or not it files something away in that page.jsonl, for example, or maybe it's a special AI subdirectory for a whole AI task management logging conversation system, we'll have to figure that all out.
S28. I don't know how big the JSON-L files can get before they start getting bogged down with unnecessary data.
