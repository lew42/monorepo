# What the owner asked for in voice session v-2joydc7 (2026-09-30)

The owner said all of this by voice, on a phone, on /framework/ux/Dictate/. Each numbered item is a deliverable. The smart assistant of this session keeps this list up to date.

## Already given to a worker
- Reactions, avatars (⏩ fast, 🧠 smart, 👤 owner), inline bubbles, the composer layout: `minion-chat-reactions` (queued), [brief](../chat-reactions/requirements.md)
- The ✦ sheet becomes a page at full height, and the phone's back button always works: `minion-sheet-as-page`
- The send delay went from 2.5 s to 1.5 s: `minion-send-delay` (landed)

## Dictation into chat (given to `minion-dictation-stream`)
1. "The process of getting the dictation into the chat widget is fundamental to the whole experience. We want the dictation to flow freely."
2. "We need to get the live whisper transcription to be creating the messages right in the chat window." The words stream into a bubble as they are spoken, not into the text box first. The text box stays, as an option ("It's not a bad function to have").
3. Stream the assistants' replies token by token too: "don't we get each token in real time so that we could kind of type it out on screen as the LLMs typically do?"
4. Clean-up: "it doesn't look like you're fixing punctuation or anything." `SETTINGS.clean` is on, but the bubbles in this chat still read as raw Whisper. Find out why, and fix it.
5. No filler replies: "you don't need to say, keep going, I'm listening, noted, still with you, go ahead... most of the time just listening." The fast assistant stays silent while the owner is still talking.
6. A silence event: "the duration since last word... should be an event that fires into... an invisible message that my UI sends into the chat, but to the LLM, sort of like a tool call or an automated timestamp or event." `ux/Dictate/floor.js` already stamps `floor: speaking|done` and the pauses on each entry. Add a real "the owner went quiet for N seconds" event that the assistants receive, and use it to decide when to answer.

## System (for the system mastermind, `mastermind-servex-8`)
7. Content cards in chat: "I want the ability for you guys to reference that thing right in the chat... so you guys can create content cards of any kind." Sticky can come later.
8. Show, don't tell, as a system rule: "rather than using words to explain what you're trying to say, I want you to create structured responses that show me what you're trying to say... that needs to be worked into the system design."
9. Nothing gets lost: "When we start having a lot of people working, things can get lost in the shuffle... unless a task is assigned to a specific person... how does the system programmatically make sure tasks get done?"
10. Tasks are cards on their parent card: "as I'm asking for things, I want to see task cards show up on their parent card... system design with a familiar icon, and there's a system designer mastermind."
11. The layout catalog: "scan all the pages and... what kind of layout, what's being used in terms of all of our systems. It's sort of a catalog... in those systems, we should be able to browse all the usages. So make sure that's being done." Include screenshots of every layout.
12. Naming: "the AI Rail" is the owner's name for the ✦ rail on phones. The owner finds the drawer, rail and sheet naming confusing: "my idea of the drawer is it's the right sidebar that is kind of contextual." Settle the names.
13. Voice sessions can't start a task mastermind today (Servex refuses: "a worker may spawn only a minion or a helper"). The owner expects to start mastermind tasks from here.
