# Dictation first: the owner's direction, 2026-10-20 (19:00)

Recorded so the intent survives chat (CLAUDE.md, law 5). Words: the VS Code tab's prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`, the line after the 18:50 dictation). Essence, with the owner's certainty kept. Not a project brief: "I'm not necessarily recommending that you launch a big project right now."

## The goal

Getting dictation to work properly **on the website** is step one. The cloud voice agent and its special remote tools are a runaround taken only because it is the one thing that works; a remote control that actually works is the site dictating properly and handling prompts accurately. Real-time cleaning and prompt refinement (the transformation side) is phase two; first the transcription itself must work.

## The problems named

- **The UI.** Rendering the dictation widget properly is "a big problem" the owner has been ignoring; its look changed a couple of times, a cleanup was asked for, a few changes were asked for after it and were never done. "I still don't know why we're not able to land simple changes properly." The open and done asks are tracked in [asks.md](asks.md); the owner will check the widget on the site next.
- **Session management.** The dictate voice sessions are unclear to the owner. Wanted, as most AI apps do it: coming back after a short while (say 15 minutes) shows the last session; after hours, a new one; either way you can switch to the other (a New session button, and the old session findable). A decent session manager matters. Today: `ext/Session` continues this page's session from the last hour (`/new`), and the central store is `ai/sessions/YYYY/MM/DD/<session>/`.
- **Two assistants.** The fast and the smart assistant working in parallel "kind of worked", but two agents doing the same thing and coordinating "was kind of a headache"; the owner remembers asking for one. Today: `ext/Session` still runs two roles (`session-fast`, `session-smart`); one global fast assistant exists behind the assistant chain (`Servex/agents/Assistant.js`, `SERVEX_CHAIN=on`).
- **The font flicker.** During transcription a sentence showed in Montserrat, flipped to a monospace font for a second, then back; it looked like an indicator of how the sentence was being placed, but it was not clear.

## The shape the owner wants (should / could)

- **One assistant**, quick to respond, doing a lot of processing: a Sonnet or even Haiku minion, an interpreter, never a mastermind making important decisions. It listens to every word in real time, corrects, turns a spoken "slash that dot ext" into a clickable path (phase two).
- **Hands-free.** It should hardly ever read files (time, thinking). It makes quick, obvious decisions: route things, update the UI, hold context, pass things along. Building and designing is offloaded.
- **The voice session is global**: it persists across page transitions, has a name, can be switched between. The UI sends it automated notifications (a page navigation, any context). "Fun to build out once the data flows properly."
- **Maybe** each voice agent gets a mastermind automatically listening to the voice session. Open: who does what when two agents run (both do it, or neither), and whether they talk to each other outside the chat or everything goes through the chat.
- **Rendering unique content into the chat session** is sticky: the owner is moving to a delta-based streaming content system and finds the streaming pages hard to build. `public/live/` was the experiment (the cloud agent editing a page in real time; it worked a little, but updating the page was sluggish); "we kind of lost sight of where we were going with that". The assistant could use a page edit tool for quick, exact, simple edits (a log append, a delta); design and building go to a mastermind.
- **Long dictations** are stream of consciousness: more information than necessary. The assistant could refine, condense, make them succinct, keeping clarity; that belongs in the prompt-refinement system's docs ([ext/Refine](/framework/ext/Refine/)).
- **Whisper:** the owner wants to see the Whisper logs and the class page to understand how it works: [audio/Whisper](/framework/audio/Whisper/) (`class Whisper`, `WhisperSession`, the per-day log) and [doc/whisper.md](whisper.md) here.
- Possibly the next step is a UI redesign; the owner looks at the site first.

## Where the pieces are today

- The widget and every surface: [ux/Dictate](/framework/ux/Dictate/) ([surfaces/](../surfaces/), [doc/widget.md](widget.md), [doc/architecture.md](architecture.md)).
- The voice session and the two assistants: [ext/Session](/framework/ext/Session/) ([doc/sessions.md](/framework/ext/Session/doc/sessions.md)); the fast assistant inside Servex: `Servex/agents/Assistant.js`.
- Whisper: [audio/Whisper](/framework/audio/Whisper/), the engines in [audio/Transcriber](/framework/audio/Transcriber/).
- Refinement: [ext/Refine](/framework/ext/Refine/); the live page experiment: [/live/](/live/).

## 19:35, after trying a voice session on the site: the mobile sheet, reconnect, and how to test a responsive UI

Words: the tab prompt log, the line after the Whisper dictations (its first sentence was cut off by the microphone). Essence:

- **What worked:** the ✦ button on the mobile bottom nav started transcribing on the first visit; a voice agent was spawned, answered questions about its session quickly and in real time (every sentence sent off); dragging the sheet past about 90% snaps it open to a full page, "that actually works quite well, and I like it". Timing and placing its replies will take effort ("responding almost a little too quickly").
- **Priority one: it won't reconnect.** Figure out why, and make the button attempt a reconnect; when something fails there should be a system log of what happened, so it can be diagnosed.
- **Priority two: the UI is terrible, and screenshots prove it.** On first click the sheet puts the mic on the left, a brief description and one line beside it, then a grey button with a down arrow inside that "looks like shit" and whose purpose is unknown. Dragging up the top edge glitches, then switches to a scrollable layout that works tolerably; the page behind the sheet disappears while it is open, which is strange.
- **How to test a responsive UI (the method, must):** screenshot the sheet on first click, then resize it 20 to 40 pixels at a time and screenshot every step, so a layout switch that glitches is seen. No "magical layout switching" as you drag: one strong layout that just works, with a sticky header or footer so something is there at first and the rest grows.
- **The layout (the owner's gut):** three rows: a header, a full-width scrollable chat area, a footer with the mic control; compact. The chat area is a well: left and right padding so bubbles do not ride the device edge, **no top or bottom padding** so bubbles scroll under the header and footer, no border radius, and the parent has no padding (it was double padded). The same instructions were dictated into a voice session a day or two ago; find them there, do not re-ask.
- **The modes:** a one-line compact version so the site stays browsable (the primary mode later, when everything works) and the full wall of text now, for debugging. The sheet code: `ext/drawer/rail.js` (the sheet) mounting `ux/Dictate/chat.js`; reconnect: `ux/Dictate/Connection.js`.
