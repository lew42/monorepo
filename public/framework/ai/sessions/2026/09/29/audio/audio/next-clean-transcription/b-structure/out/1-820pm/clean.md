S1. Okay, on this decisions tab, the Open Router Brains decisions tab, I just clicked on, I think it was something along the lines of use the Claude SDK with Open Router.
S2. Seems a little fishy, seems like it's not meant to work properly and could backfire, but I was just kind of scrolling and/or tapped on it anyway, and it said it changed it to chosen as if I've approved this, and I couldn't tap it again to unchoose it.
S3. So that's a little bit of a UX thing.
S4. I don't necessarily mind that as being a chosen answer.
S5. I'm not sure if any AI is actually acting on it as a result of me doing that.
S6. Couple of things.
S7. I don't want to have to approve all of these little decisions.
S8. If you think that's the recommended option, just go with it.
S9. Just do it and present the alternatives.
S10. So it's like we decided to do this and here were the alternatives.
S11. If the one that you chose works properly, everything seems to work, just stick with it.
S12. And then we can, we've made note that there was an alternative and we move on.
S13. If it doesn't work, you could try an alternative.
S14. However, I don't want anything to be hung up by these kind of insignificant decisions, or at least they could change in the future.
S15. It's not really clear until we get in there and try and figure it all out.
S16. And so just getting an MVP working, getting something working so I can see how this works, see if it's even something worth pursuing or abandon it entirely.
S17. Just do the best you can as quickly as we can.
S18. We definitely don't want to create these standstills.
S19. Now, having said that, the whole decisions UX actually looked pretty good.
S20. I liked the orange border on the card that draws a nice, clear visual hierarchy.
S21. So the decisions UX isn't terrible yet.
S22. I like the nested cards.
S23. We can't overdo nested cards because the more you nest, the more you lose space to padding.
S24. However, it does provide visual hierarchy and on mobile and just in general, when you have a large, long scrolling list of text, instead of having a wall of text, having some structure to it goes a long way.
S25. So I like that.
S26. It needs work, but again, whenever we're doing these AI processes, in fact, when I was looking at the structured prompt system, the refinement, and that actually is very impressive.
S27. I like the way it works.
S28. There's not enough structure.
S29. So the structure that was produced is more like just an extra refinement over the cleaning up.
S30. And so it condenses several statements into one, just a little bit more, and that's fine.
S31. But I would almost call that condensing or summarization.
S32. It's like putting multiple statements together.
S33. Really, the structure part is about putting those familiar names, like the headings.
S34. What is this thing called?
S35. First, if there's a thing, if there's an H1 that we're talking about, if we don't see it written out clearly as the starting point, that's the primary visual anchor.
S36. Boom, class page could be an H1.
S37. This is the thing we're thinking about and it contextualizes everything else.
S38. Okay, well then what's the first H2?
S39. Well, come up with a name for it.
S40. If a name already exists, like layout, boom.
S41. Layout is H2.
S42. And then you put some bullet points inside that and now we have a whole bunch of really tangible, familiar, easy to digest context.
S43. So that's the kind of structure that I was looking for.
S44. So we could get a little bit more structured.
S45. However, at each stage of that refinement process, that should be built into whatever dictate documentation and user experience and the mobile rail where we're dictating and we want to see a refined prompt, but I also want to be able to dig backwards into the actual text to see what was actually transcribed.
S46. But as that system evolves, I think we're headed in the right direction, but we will want to be able to configure a modular approach where each layer of that whole operation could be a different model and a different prompt, because it probably could or should be.
S47. Now, we could potentially just have any model, especially a little bit smarter or faster model, go from the cleaned-up state, so that the fast model could just clean it up, as long as it's sure not to transform meaning.
S48. You don't want to switch words.
S49. You don't want to drop words.
S50. You don't want to really add words, except if it's a clear mistranscription or somebody was speaking quickly and an extra word is more grammatically correct or something.
S51. There are some strong use cases for slight tweaks.
S52. However, generally the fast assistant's job would be to transcribe it or to clean up the transcription quickly so that we can get the text on the screen for the user as quickly as possible.
S53. And to clarify, my thinking is that in the dictate widget, we want to see lower-level access to the Whisper transcription in its raw essence.
S54. So I can understand it a little bit more, especially if we're streaming, I want to be able to see how this works.
S55. And converting those raw transcriptions into cleaned transcriptions, I think is a good step for the fast assistant so that we don't need to put the ahs and the ums onto the UI, we just put the clean transcription onto the UI.
S56. The idea of having strikethroughs and corrections was just to help me visualize and we can still do that in debug mode, but I don't think that's necessary, let's call this a clean transcription mode.
S57. So the clean transcription mode pairs the raw Whisper with the fast assistant's refinement of that transcription.
S58. And maybe to have that in real time, we need to dial up the frequency of how soon it's processing each input from Whisper.
S59. As Whisper streams, we might want to just pump in lots of very frequent additions to the transcription.
S60. And then maybe the fast assistant irons out a lot of that punctuation or the seams, if we have garbled audio at different parts of the seams, the fast assistant is likely smart enough to figure that out and just fix it.
S61. So maybe that helps with some of that problem.
S62. We probably want to get the architecture working so that we reduce the number of seams, or maybe by consensus over several phases, be able to do a local comparison as you were saying, and eliminate those programmatically, which would probably be better.
S63. But yeah, so a clean transcription mode is really just that first step of maintaining the verbal essence, the actual words, the actual ordering of words and ideas, without the ahs and the ums, so it sounds a little bit more professional if you were reading it back.
S64. Definitely without the ahs and the ums.
S65. And getting that prompt correct and the model, that's going to take some work.
S66. But that's the first step.
S67. The clean transcription can still be rambling, out of order, without headings, without that kind of outline-type information hierarchy.
S68. It's disorganized.
S69. And as we're building this clean transcription, new messages are essentially being added to it.
S70. And very important in this transcription phase is that we're not reading responses aloud yet, but we might at some point.
S71. And so we don't want to respond while the user is transcribing.
S72. So that's important: the harness or the UI, frankly, whatever's listening, I think right now our UI is measuring the audio levels, maybe, and maybe deciding when to send this thing off.
S73. And we might be restructuring how this works, but sending these audio cues to the LLM, the fast assistant, might be a useful thing.
S74. And I'm not sure if Whisper can do that properly.
S75. So for example, a pause, how long the pause is—I don't know if we have a pause start and then a pause end.
S76. So if it's a three-second pause, the start time and the end time are sent into the fast LLM.
S77. And so it can get a real-time sense for when audio cues are happening.
S78. It's an interesting question.
S79. I'm not sure how to handle that.
