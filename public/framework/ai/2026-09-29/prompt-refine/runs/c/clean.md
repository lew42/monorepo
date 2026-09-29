S1. All right, I want you to spawn, create a task, a mastermind.
S2. I don't know if it's the orchestrator and the, use the research system and also use a work tree.
S3. So this is kind of a standard task, but we're going to use the research system.
S4. And so the mastermind should probably orchestrate it.
S5. And we want to look into using either Open Router or just going directly to the providers like Google's Gemini, Anthropic, OpenAI, Grok, both Groks really.
S6. All the models, there's a lot of them.
S7. I think Open Router is pretty cheap, but I guess one of the bigger things is whether it's better or whether it's going to have feature parity with all the individual ones.
S8. I think each API is going to work differently.
S9. And so trying to have a user experience that can just seamlessly switch to any model, I think we're going to have a lot of hurdles to jump over because of just API inconsistencies.
S10. So we could try Open Router.
S11. And what I want to do is create our own AI harness system to use with Open Router.
S12. I think Open Router has an agent package that's supposed to be like Claude Code or an agent harness.
S13. It's possible though that creating our own harness might be better.
S14. Not sure about that in terms of managing the file context.
S15. All right, I just found my notes from building a harness.
S16. And so we have MCP servers.
S17. So if we were to build a harness, it's going to work into the whole system, right?
S18. So right now we're using Claude Code SDK for spawning minions.
S19. And so if we're going to move towards Open Router, you need to be fundamentally integrated into the whole system.
S20. So work with the Servex mastermind, make sure he's involved and have a review.
S21. By the way, you can tell the Servex mastermind to build into the system, the task system, a review process.
S22. That might be better to start with a fresh context.
S23. So I think what would happen is if the same agent that writes all the code tries to review their own code, they're going to be heavily biased to do whatever they've already done because that's what their text says.
S24. The prompt reinforces those ideas.
S25. If you start with a fresh agent, if you get the exact same outcome, which you probably would just because the model is using similar weights and biases.
S26. But if you ask it for a fresh opinion, it's possible you get fresh insight.
S27. So a review process should be built into most tasks.
S28. If it's a simple task and there's not much architecture, or if it's a simple CSS fix, you don't really need to do a complex review process.
S29. However, for building out new things, taking the screenshots, asking the user experience and layout questions, is the space used properly?
S30. Are we displaying the right things in the right order?
S31. And is the user going to be able to find everything that they need?
S32. It's basically navigation.
S33. Navigation is super important.
S34. And so I'm not sure where the whole system design stuff is at.
S35. It was broken when I clicked on it a few minutes ago and I haven't had a chance to look at it.
S36. But yeah, spawn this research system.
S37. Definitely, we don't want to cook too many tokens on this.
S38. So try and be efficient.
S39. Maybe do a preliminary round with an Opus, maybe one Opus and one Sonnet doing some research, see what they have to say, and then maybe start fresh and have another Opus or Sonnet review what was the preliminary plan.
S40. I think that might be the best way to do it.
S41. Work with the Servex mastermind to document what works.
S42. And let's try and figure out how to use Open Router to switch to any provider quickly.
S43. And then in the future, we're going to want to pay careful attention to the cost and being able to spawn fleets of minions to use different models to approach the same task and get different opinions, and then maybe have a review process to use those similar minions to cross-reference other people's stuff to see if that produces useful outcomes.
S44. And so part of that is, does this make sense?
S45. Is it true?
S46. Is it logical?
S47. Can we dispute it?
S48. Yeah, so for every research thing, and this is sort of what we want to be able to do on any card at any time.
S49. And so this research system, we want it to be very simple and clear.
S50. We want to see the structure of the research.
S51. So whatever page you're making for this research operation, I want to see structured content.
S52. There's another thing the Servex Mastermind should spawn a minion to design a system to architect structured content.
S53. And what I mean by that is, number one, highly prioritized, the most essential, most foundational, most visual and familiar things.
S54. So icon items where we can have three to five named things per section and maybe multiple sections, depending on how complex that item is.
S55. But it's sort of like outlines.
S56. It's definitely naming of those items so that an outline creates this picture using words.
S57. The parent items and then the number of child items and the number of grandchild items and the way they all have meaning and communicate with each other.
S58. That's the structure of the content that we need to work on for pretty much all the UI cards.
S59. When we're designing UI cards, we should be thinking about the amount of space that we want to use per card and what can go on there.
S60. And then what goes first, how to divide the card into either rows or columns or both.
S61. And then in terms of writing the actual content, we generally want to lean into structured content when possible.
S62. So we don't want to use a bunch of words, three paragraphs, instead of using a quick little outline that does exactly the same thing.
S63. We don't want to do all this processing when really what you're saying is it's just a bulleted list, a nested list of items.
S64. And so those UI cards, a list could be a UI card.
S65. You don't necessarily need a background.
S66. That should be another part of our design system.
S67. A core decision to be made for pretty much all content is, does it need a background?
S68. And frankly, you probably want to have either option.
S69. If it has a background, it probably should have padding.
S70. And if it doesn't have a background, it probably shouldn't have padding.
S71. And then you can nest these things.
S72. And then whether each thing has cards of its own, you don't want to put things in too many boxes that get distracting.
S73. However, having a background with a title and then three cards on it, for example, is just one of the simplest groups, it's a navigation and it puts a label on top to show these three things are related.
S74. And if they actually are related and each one is a big icon item, I call that an icon card, right?
S75. So instead of having a picture on the card, it's just a big icon with the name below it.
S76. I think that would make sense for a lot of cards, especially if they're big ideas, we might want to have different sizes of these icon cards to represent.
S77. And frankly, it's just the page.
S78. The page can be, I don't know if the page itself specifies its weight, maybe it does.
S79. Maybe we use a generic weight.
S80. And so bigger cards naturally get sorted to the top.
S81. I haven't really thought about that yet.
S82. But yeah, let's work on the research.
S83. We're building a harness.
S84. We're potentially building a harness and we need to think about the file context in terms of when to list files, a skill system, a Claude.md plus skills that are loaded on demand, MCPs, then we need tools and a loop.
S85. We need to auto compact the context.
S86. We're going to want to have session IDs to fork and reuse the session.
S87. To resume where we were.
S88. And so when we come back to a previous session, a couple days later, we can just at any point in the conversation ask a question and it reuses the context so we don't have to do a bunch of work to set it all back up.
S89. Yeah, and then we need to see the cost.
S90. The Open Router API should have the cost built into it.
S91. And so that shouldn't be terribly hard.
S92. But then we're going to need an agent switching UI for the little dictation widget.
S93. So the dictation widget is really the chat widget, right?
S94. Everywhere we want chat, we want dictation.
S95. And we need to work on how that works.
S96. But I guess we'll save that for another task.
S97. Yeah, all right, go ahead and launch that research.
S98. Oh, another thing here is permissions and sandboxing for the harness.
S99. This is really on the system level, the work trees, and if you have a work tree, you probably should have your own dev server.
S100. And I'm thinking that maybe we try and route as much as we can using node instead of bash for everything.
S101. And if we need it, node can pass it along to bash, for example.
S102. However, if we use node, it's possible we have a little bit more control over the IO and processing it and responding programmatically versus relying on the AI's interpretation.
S103. So that's another whole aspect to add to the harness research and to try and plan.
S104. So as we get these results back, the next step is first we're going to research it, but then probably start with some fresh masterminds based on what was gathered from the research and then go ahead and build the harness.
S105. And so we want to build an Open Router.
S106. We want to build in an agent switcher, make sure the whole system is integrated so that when we create a new card on the AI dashboard.
S107. When we click to make a new card we want to be able to switch models and dictate in real time and so we need that whole assistant process for every page.
S108. And so now it's possible we can use the same assistant for just getting the transcriptions.
S109. It's basically just getting the prompt into the LLM and then from that point yeah.
S110. So maybe the assistant is more of a transparent thing where we don't necessarily need to choose the model of the assistant although maybe we do have a configuration for it somewhere.
S111. But the idea there is that when you're choosing the model you're choosing the model of the, I guess right now we're calling it the manager.
S112. I'm not sure if we should just call it a mastermind because that's sort of what it is and then that mastermind is able to see everything.
S113. So the assistant would see everything and do some quick real-time updates, that's the whole purpose of the fast assistant.
S114. And then the assistant, we could find a good model for it whichever is cost effective.
S115. And then it just simply cleans up and relays the transcription to the model.
S116. And I want to, okay so let's get that research going.
S117. And work on building the harness but also let's add another task here for the dictation process.
S118. And so I know we've done some work on that in the past but what I've asked for is a playground to see a little bit better how it works.
S119. And maybe work on the process.
S120. So here's what I'm thinking for dictation.
S121. First, I'm going to send this off so you can get working on that and then I'm going to dictate the dictation updates.
