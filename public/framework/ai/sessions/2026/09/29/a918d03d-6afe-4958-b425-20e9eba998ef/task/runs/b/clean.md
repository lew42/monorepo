S1. Okay, so the collaborative planning and consensus operation, that's sort of what the research does, right?
S2. It's a consensus operation.
S3. And so, creating a system that is flexible for most use cases seems to be the way to go.
S4. So in the whole research audit or just overview, see what the agents think about how the research process went and whether what other kinds of consensus-based systems we can use multi-agent reasoning for in terms of the actual web searching.
S5. Look into that, see how that works.
S6. We want to optimize all these factors, right?
S7. We want better web search.
S8. We want better consensus.
S9. We want collaborative benefit rather than bickering and analysis paralysis.
S10. And so the data storage, I don't know what kind of data structures are being created, but if they're object oriented and they probably should be almost everything should just be an object with properties and methods and instances and arrays of those instances the more of the internal structure we can see via UI.
S11. When we create some new task, creating a new research project for every new task isn't necessarily the goal.
S12. I think part of the goal is to allow masterminds to be able to spawn minions that do things in a way where they can autonomously decide and probably almost always should.
S13. Try to seek consensus, at least do kind of rough web searches.
S14. And using cheap agents to just do initial searches, read a bunch of stuff, and create a collection of references, sources, websites, probably already converted to markdown so that any other agent can read them quickly.
S15. And any minion could cite a reference, and so maybe there needs to be a directory.
S16. We have the docs direct directory system.
S17. Maybe looking into our current docs system where we have markdowns, and I was trying to create a system where any folder could have docs to it.
S18. I've already ran into the problem where we're linking from to either doc or docs and using the wrong one.
S19. And I saw some inconsistency there in terms of the path name and the tab URL.
S20. And so I was already running into a broken link.
S21. I don't know if doc or docs or whatever, and to have a folder of MD files is the best way.
S22. But in terms of sources, refer web search references.
S23. We don't have to do it for every single decision, but when it comes to architecting something, spending some cheap minions to just fan out and do a bunch of web searches and based on those web searches, do more web searches for specific things.
S24. That's kind of the idea.
S25. I think we could have a very sophisticated and thorough web search system that summarizes the landscape of what exists on the internet, especially if it's an authoritative source.
S26. Go finding documentation sites, going to GitHub and looking at example code, especially source code when we're talking about a specific library, all these things that are very high value context, we definitely want to at least take a look at these things.
S27. Note that we don't want the mastermind to read everything cause it's going to get bogged down in detail.
S28. And that's why having the cheap minions doing fan outs and finding the best resources and creating lists of topics essentially.
S29. The doc system and the research system should be documenting in a persistent long-term way so that we can use it in the future.
S30. We want a documentation system just for reference, lessons learned.
S31. If you have some minion reading a bunch of sources and there's a whole bunch of valuable lessons learned you could organize those in the right place so that a future minion or mastermind or whoever is able to find it and put it to use.
S32. The data structure from the research, the docs, it really should just be creating docs MD files and probably organized into directories.
S33. At least where that makes sense.
S34. However, all that, I'm still not sure how the navigation works for the docs system.
S35. And if we have multi-level documentation where any page could have three layers deep of documents, getting the navigation working properly, I don't think we necessarily have that working properly.
S36. And so if we set up the research system to just have nested markdown files, we're not going to be able to browse them very easily.
S37. Maybe the AI will be able to read them and use them properly.
S38. And maybe that's good enough.
S39. But yeah, try and figure out a way to generalize this whole research, web search, digging into any specific idea - here's a problem.
S40. We got to figure out how to solve this or that.
S41. Identify three different ways to solve it and then tell everyone else, write it down on the file system.
S42. By the way, in this whole collaborative planning agentic work, we need to probably use rounds or steps or phases to the collaborative work.
S43. So I was thinking if you have a bunch of agents working in parallel all at the same time and trying to collaborate, they don't know.
S44. They're going to miss each other's responses.
S45. They're going to go out of turn.
S46. They're going to miss something.
S47. And I just don't see that working as well.
S48. If you have a mastermind that's leading the research and you have an initial phase where everyone goes and does their you give them the initial prompt and then they when they're done when everyone's done and they've all written it down into their directory or whatever.
S49. And so on one work tree you could have each minion create their own directory in that work folder or whatever directory you're working in, then each minion can read.
S50. I don't know if you have all the minions read each other's or maybe it's just the mastermind reads.
S51. I don't know if the mastermind should read them all or if they should all work together.
S52. If the mastermind reads all of them and tries to make conclusions, that's going to fry the mastermind's context or focus, I think.
S53. So maybe you have each of the minions read maybe one or two others and then revise their own and I don't know that that whole process of reaching the consensus.
S54. Maybe the research system has some way for each of the minions to give feedback about each kind of idea.
S55. So okay here this is what makes sense if we had let's say a dozen minions building the same thing we need to figure out a way to refine the potential into the actual outcome.
S56. So the name of the class the name of the properties and the names of the methods those are all very tangible things.
S57. So for object oriented design we should be able to systematically create a consensus mechanism to vote on the best name and the best method names and property names and method arguments and whatever the core structure.
S58. And then from there, the minions could design, well, first, once you reach consensus, then you move forward and you have them each design those or write the code for those methods and get it working.
S59. And then through that process, they're gonna learn a lot in terms of what needs to happen and which problems to solve.
S60. And then they could review each other's code again and say, okay, which one, are these functionally identical.
S61. And are there any improvements we could make to any of them to make them whichever, I don't know how you arrive at the best method, maybe each minion just votes on which one they pick the best one.
S62. And then the one that gets the most votes becomes the right one.
S63. And maybe the minions can choose their favorite essentially with any improvements they would recommend or caveats that might be.
S64. Important.
S65. And so that way, you could get simultaneously the choice, try and arrive at a decision and also be aware if maybe one, the best option is this one, but it's missing some important caveat.
S66. And so if you just add another extra line or fix one little thing, then it's clearly the best.
