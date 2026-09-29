# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | All right, I want you to spawn, create a task, a mastermind. | ask #1 |
| S2 | I don't know if it's the orchestrator and the, use the research system and also use a work tree. | dropped, because it directs using a work tree for this task specifically, not just the research system |
| S3 | So this is kind of a standard task, but we're going to use the research system. | context only |
| S4 | And so the mastermind should probably orchestrate it. | ask #1 |
| S5 | And we want to look into using either Open Router or just going directly to the providers like Google's Gemini, Anthropic, OpenAI, Grok, both Groks really. | ask #2 |
| S6 | All the models, there's a lot of them. | ask #2 (thin) |
| S7 | I think Open Router is pretty cheap, but I guess one of the bigger things is whether it's better or whether it's going to have feature parity with all the individual ones. | ask #3 |
| S8 | I think each API is going to work differently. | ask #4 |
| S9 | And so trying to have a user experience that can just seamlessly switch to any model, I think we're going to have a lot of hurdles to jump over because of just API inconsistencies. | ask #4 |
| S10 | So we could try Open Router. | ask #5 |
| S11 | And what I want to do is create our own AI harness system to use with Open Router. | ask #5 |
| S12 | I think Open Router has an agent package that's supposed to be like Claude Code or an agent harness. | ask #6 |
| S13 | It's possible though that creating our own harness might be better. | ask #6 |
| S14 | Not sure about that in terms of managing the file context. | context only |
| S15 | All right, I just found my notes from building a harness. | context only |
| S16 | And so we have MCP servers. | ask #7 |
| S17 | So if we were to build a harness, it's going to work into the whole system, right? | context only |
| S18 | So right now we're using Claude Code SDK for spawning minions. | context only |
| S19 | And so if we're going to move towards Open Router, you need to be fundamentally integrated into the whole system. | dropped, because it states a real requirement: full system integration is needed before moving to Open Router |
| S20 | So work with the Servex mastermind, make sure he's involved and have a review. | ask #7, ask #8 |
| S21 | By the way, you can tell the Servex mastermind to build into the system, the task system, a review process. | dropped, because it's a concrete request to add a code-review process into the task system |
| S22 | That might be better to start with a fresh context. | context only |
| S23 | So I think what would happen is if the same agent that writes all the code tries to review their own code, they're going to be heavily biased to do whatever they've already done because that's what their text says. | context only |
| S24 | The prompt reinforces those ideas. | context only |
| S25 | If you start with a fresh agent, if you get the exact same outcome, which you probably would just because the model is using similar weights and biases. | context only |
| S26 | But if you ask it for a fresh opinion, it's possible you get fresh insight. | context only |
| S27 | So a review process should be built into most tasks. | ask #8 |
| S28 | If it's a simple task and there's not much architecture, or if it's a simple CSS fix, you don't really need to do a complex review process. | ask #9 |
| S29 | However, for building out new things, taking the screenshots, asking the user experience and layout questions, is the space used properly? | dropped, because it's a specific UX audit question (is space used properly) not just a general "do UX research" note |
| S30 | Are we displaying the right things in the right order? | dropped, because it's a specific UX audit question (right things in right order) |
| S31 | And is the user going to be able to find everything that they need? | dropped, because it's a specific UX audit question (can the user find everything) |
| S32 | It's basically navigation. | context only |
| S33 | Navigation is super important. | ask #9 |
| S34 | And so I'm not sure where the whole system design stuff is at. | context only |
| S35 | It was broken when I clicked on it a few minutes ago and I haven't had a chance to look at it. | dropped, because it flags a specific broken page that needs checking, not just a status aside |
| S36 | But yeah, spawn this research system. | context only |
| S37 | Definitely, we don't want to cook too many tokens on this. | ask #10 (thin) |
| S38 | So try and be efficient. | context only |
| S39 | Maybe do a preliminary round with an Opus, maybe one Opus and one Sonnet doing some research, see what they have to say, and then maybe start fresh and have another Opus or Sonnet review what was the preliminary plan. | dropped, because it proposes a specific two-stage research process (preliminary Opus/Sonnet pass, then a fresh review pass) |
| S40 | I think that might be the best way to do it. | ask #10 (thin) |
| S41 | Work with the Servex mastermind to document what works. | ask #11 |
| S42 | And let's try and figure out how to use Open Router to switch to any provider quickly. | ask #11 |
| S43 | And then in the future, we're going to want to pay careful attention to the cost and being able to spawn fleets of minions to use different models to approach the same task and get different opinions, and then maybe have a review process to use those similar minions to cross-reference other people's stuff to see if that produces useful outcomes. | ask #12 |
| S44 | And so part of that is, does this make sense? | ask #13 |
| S45 | Is it true? | context only |
| S46 | Is it logical? | context only |
| S47 | Can we dispute it? | ask #13 |
| S48 | Yeah, so for every research thing, and this is sort of what we want to be able to do on any card at any time. | ask #14 |
| S49 | And so this research system, we want it to be very simple and clear. | context only |
| S50 | We want to see the structure of the research. | context only |
| S51 | So whatever page you're making for this research operation, I want to see structured content. | ask #14 |
| S52 | There's another thing the Servex Mastermind should spawn a minion to design a system to architect structured content. | ask #15 |
| S53 | And what I mean by that is, number one, highly prioritized, the most essential, most foundational, most visual and familiar things. | ask #15 |
| S54 | So icon items where we can have three to five named things per section and maybe multiple sections, depending on how complex that item is. | ask #16 |
| S55 | But it's sort of like outlines. | context only |
| S56 | It's definitely naming of those items so that an outline creates this picture using words. | dropped, because it's a specific quality bar: naming should be descriptive enough that the outline paints a picture in words |
| S57 | The parent items and then the number of child items and the number of grandchild items and the way they all have meaning and communicate with each other. | ask #16 |
| S58 | That's the structure of the content that we need to work on for pretty much all the UI cards. | context only |
| S59 | When we're designing UI cards, we should be thinking about the amount of space that we want to use per card and what can go on there. | ask #17 |
| S60 | And then what goes first, how to divide the card into either rows or columns or both. | ask #17 |
| S61 | And then in terms of writing the actual content, we generally want to lean into structured content when possible. | ask #18 |
| S62 | So we don't want to use a bunch of words, three paragraphs, instead of using a quick little outline that does exactly the same thing. | context only |
| S63 | We don't want to do all this processing when really what you're saying is it's just a bulleted list, a nested list of items. | ask #18 |
| S64 | And so those UI cards, a list could be a UI card. | ask #19 |
| S65 | You don't necessarily need a background. | ask #19 |
| S66 | That should be another part of our design system. | context only |
| S67 | A core decision to be made for pretty much all content is, does it need a background? | ask #20 |
| S68 | And frankly, you probably want to have either option. | context only |
| S69 | If it has a background, it probably should have padding. | dropped, because it's a specific design rule (a card with a background should get padding) |
| S70 | And if it doesn't have a background, it probably shouldn't have padding. | ask #20 |
| S71 | And then you can nest these things. | context only |
| S72 | And then whether each thing has cards of its own, you don't want to put things in too many boxes that get distracting. | dropped, because it's a specific caution against nesting cards into too many distracting boxes |
| S73 | However, having a background with a title and then three cards on it, for example, is just one of the simplest groups, it's a navigation and it puts a label on top to show these three things are related. | ask #21 |
| S74 | And if they actually are related and each one is a big icon item, I call that an icon card, right? | ask #22 |
| S75 | So instead of having a picture on the card, it's just a big icon with the name below it. | ask #22 |
| S76 | I think that would make sense for a lot of cards, especially if they're big ideas, we might want to have different sizes of these icon cards to represent. | ask #23 |
| S77 | And frankly, it's just the page. | context only |
| S78 | The page can be, I don't know if the page itself specifies its weight, maybe it does. | context only |
| S79 | Maybe we use a generic weight. | context only |
| S80 | And so bigger cards naturally get sorted to the top. | dropped, because it's a specific feature idea: bigger cards should naturally sort to the top |
| S81 | I haven't really thought about that yet. | context only |
| S82 | But yeah, let's work on the research. | context only |
| S83 | We're building a harness. | ask #24 |
| S84 | We're potentially building a harness and we need to think about the file context in terms of when to list files, a skill system, a Claude.md plus skills that are loaded on demand, MCPs, then we need tools and a loop. | dropped, because it's a concrete checklist for the harness research (file-listing strategy, skill system, Claude.md+on-demand skills, MCPs, tools, loop) not just a general "research the harness" note |
| S85 | We need to auto compact the context. | dropped, because auto-compacting context is a specific requirement for the harness |
| S86 | We're going to want to have session IDs to fork and reuse the session. | dropped, because forking/reusing session IDs is a specific requirement for the harness |
| S87 | To resume where we were. | context only |
| S88 | And so when we come back to a previous session, a couple days later, we can just at any point in the conversation ask a question and it reuses the context so we don't have to do a bunch of work to set it all back up. | ask #24 |
| S89 | Yeah, and then we need to see the cost. | ask #25 |
| S90 | The Open Router API should have the cost built into it. | dropped, because "cost built into the Open Router API" is a specific requirement worth capturing |
| S91 | And so that shouldn't be terribly hard. | ask #25 |
| S92 | But then we're going to need an agent switching UI for the little dictation widget. | ask #26 |
| S93 | So the dictation widget is really the chat widget, right? | dropped, because it's a genuine clarifying idea (the dictation widget and chat widget are the same thing) that reframes scope |
| S94 | Everywhere we want chat, we want dictation. | ask #26 |
| S95 | And we need to work on how that works. | context only |
| S96 | But I guess we'll save that for another task. | context only |
| S97 | Yeah, all right, go ahead and launch that research. | context only |
| S98 | Oh, another thing here is permissions and sandboxing for the harness. | ask #27, ask #28 (thin) |
| S99 | This is really on the system level, the work trees, and if you have a work tree, you probably should have your own dev server. | dropped, because it's a specific architectural idea: each work tree should have its own dev server |
| S100 | And I'm thinking that maybe we try and route as much as we can using node instead of bash for everything. | dropped, because it's a specific technical directive to route through node instead of bash wherever possible |
| S101 | And if we need it, node can pass it along to bash, for example. | context only |
| S102 | However, if we use node, it's possible we have a little bit more control over the IO and processing it and responding programmatically versus relying on the AI's interpretation. | ask #27 (thin), ask #28 |
| S103 | So that's another whole aspect to add to the harness research and to try and plan. | context only |
| S104 | So as we get these results back, the next step is first we're going to research it, but then probably start with some fresh masterminds based on what was gathered from the research and then go ahead and build the harness. | ask #29 |
| S105 | And so we want to build an Open Router. | ask #30 |
| S106 | We want to build in an agent switcher, make sure the whole system is integrated so that when we create a new card on the AI dashboard. | dropped, because it's a concrete feature request (an agent switcher tied into new-card creation on the AI dashboard) |
| S107 | When we click to make a new card we want to be able to switch models and dictate in real time and so we need that whole assistant process for every page. | ask #30 |
| S108 | And so now it's possible we can use the same assistant for just getting the transcriptions. | ask #31, ask #32 (thin), ask #33 |
| S109 | It's basically just getting the prompt into the LLM and then from that point yeah. | context only |
| S110 | So maybe the assistant is more of a transparent thing where we don't necessarily need to choose the model of the assistant although maybe we do have a configuration for it somewhere. | dropped, because it's a specific design nuance: the assistant may not need model choice exposed, or only via a separate config |
| S111 | But the idea there is that when you're choosing the model you're choosing the model of the, I guess right now we're calling it the manager. | context only |
| S112 | I'm not sure if we should just call it a mastermind because that's sort of what it is and then that mastermind is able to see everything. | context only |
| S113 | So the assistant would see everything and do some quick real-time updates, that's the whole purpose of the fast assistant. | context only |
| S114 | And then the assistant, we could find a good model for it whichever is cost effective. | dropped, because "pick a cost-effective model for the assistant" is a concrete, actionable spec |
| S115 | And then it just simply cleans up and relays the transcription to the model. | ask #31, ask #32 (thin), ask #33 |
| S116 | And I want to, okay so let's get that research going. | context only |
| S117 | And work on building the harness but also let's add another task here for the dictation process. | ask #34, ask #35 |
| S118 | And so I know we've done some work on that in the past but what I've asked for is a playground to see a little bit better how it works. | dropped, because it's a concrete deliverable request: build a playground to see the (dictation/chat) system working |
| S119 | And maybe work on the process. | ask #34, ask #35 |
| S120 | So here's what I'm thinking for dictation. | context only |
| S121 | First, I'm going to send this off so you can get working on that and then I'm going to dictate the dictation updates. | context only |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #2 | thin citation | cites S6 but shares no wording with it — the citation may not reflect what S6 actually says |
| #3 | new words | "apis" — not in the transcript at all |
| #4 | new words | "account", "fact", "between", "will", "face" — not in the transcript at all |
| #6 | new words | "note" — not in the transcript at all |
| #9 | new words | "fixes" — not in the transcript at all |
| #10 | thin citation | cites S37 but shares no wording with it — the citation may not reflect what S37 actually says |
| #10 | thin citation | cites S40 but shares no wording with it — the citation may not reflect what S40 actually says |
| #13 | new words | "frame" — not in the transcript at all |
| #18 | new words | "prose" — not in the transcript at all |
| #19 | new words | "without" — not in the transcript at all |
| #24 | new words | "give" — not in the transcript at all |
| #25 | new words | "tracking" — not in the transcript at all |
| #27 | thin citation | cites S102 but shares no wording with it — the citation may not reflect what S102 actually says |
| #27 | new words | "handle", "s102" — not in the transcript at all |
| #28 | thin citation | cites S98 but shares no wording with it — the citation may not reflect what S98 actually says |
| #28 | new words | "s102" — not in the transcript at all |
| #29 | new words | "sequence", "s104" — not in the transcript at all |
| #30 | new words | "s105", "s107" — not in the transcript at all |
| #31 | new words | "s108", "s115" — not in the transcript at all |
| #32 | thin citation | cites S108 but shares no wording with it — the citation may not reflect what S108 actually says |
| #32 | thin citation | cites S115 but shares no wording with it — the citation may not reflect what S115 actually says |
| #32 | new words | "sees", "s108", "s115" — not in the transcript at all |
| #33 | new words | "s108", "s115" — not in the transcript at all |
| #34 | new words | "s117", "s119" — not in the transcript at all |
| #35 | new words | "s117", "s119" — not in the transcript at all |
