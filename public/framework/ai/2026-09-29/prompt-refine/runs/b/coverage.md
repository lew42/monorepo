# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | Okay, so the collaborative planning and consensus operation, that's sort of what the research does, right? | ask #1 |
| S2 | It's a consensus operation. | ask #1 |
| S3 | And so, creating a system that is flexible for most use cases seems to be the way to go. | ask #2 |
| S4 | So in the whole research audit or just overview, see what the agents think about how the research process went and whether what other kinds of consensus-based systems we can use multi-agent reasoning for in terms of the actual web searching. | ask #3 |
| S5 | Look into that, see how that works. | ask #3 |
| S6 | We want to optimize all these factors, right? | ask #4 |
| S7 | We want better web search. | ask #4 |
| S8 | We want better consensus. | ask #4 |
| S9 | We want collaborative benefit rather than bickering and analysis paralysis. | ask #4 |
| S10 | And so the data storage, I don't know what kind of data structures are being created, but if they're object oriented and they probably should be almost everything should just be an object with properties and methods and instances and arrays of those instances the more of the internal structure we can see via UI. | ask #5 |
| S11 | When we create some new task, creating a new research project for every new task isn't necessarily the goal. | ask #6 (thin) |
| S12 | I think part of the goal is to allow masterminds to be able to spawn minions that do things in a way where they can autonomously decide and probably almost always should. | ask #6 |
| S13 | Try to seek consensus, at least do kind of rough web searches. | ask #6 |
| S14 | And using cheap agents to just do initial searches, read a bunch of stuff, and create a collection of references, sources, websites, probably already converted to markdown so that any other agent can read them quickly. | ask #7 |
| S15 | And any minion could cite a reference, and so maybe there needs to be a directory. | ask #8 |
| S16 | We have the docs direct directory system. | ask #8 |
| S17 | Maybe looking into our current docs system where we have markdowns, and I was trying to create a system where any folder could have docs to it. | ask #8 |
| S18 | I've already ran into the problem where we're linking from to either doc or docs and using the wrong one. | ask #8 |
| S19 | And I saw some inconsistency there in terms of the path name and the tab URL. | ask #8 |
| S20 | And so I was already running into a broken link. | ask #8 |
| S21 | I don't know if doc or docs or whatever, and to have a folder of MD files is the best way. | ask #8 |
| S22 | But in terms of sources, refer web search references. | ask #9 |
| S23 | We don't have to do it for every single decision, but when it comes to architecting something, spending some cheap minions to just fan out and do a bunch of web searches and based on those web searches, do more web searches for specific things. | ask #9 |
| S24 | That's kind of the idea. | ask #9 (thin) |
| S25 | I think we could have a very sophisticated and thorough web search system that summarizes the landscape of what exists on the internet, especially if it's an authoritative source. | ask #9 |
| S26 | Go finding documentation sites, going to GitHub and looking at example code, especially source code when we're talking about a specific library, all these things that are very high value context, we definitely want to at least take a look at these things. | ask #9 |
| S27 | Note that we don't want the mastermind to read everything cause it's going to get bogged down in detail. | ask #10 |
| S28 | And that's why having the cheap minions doing fan outs and finding the best resources and creating lists of topics essentially. | ask #10 |
| S29 | The doc system and the research system should be documenting in a persistent long-term way so that we can use it in the future. | ask #11 |
| S30 | We want a documentation system just for reference, lessons learned. | ask #11 |
| S31 | If you have some minion reading a bunch of sources and there's a whole bunch of valuable lessons learned you could organize those in the right place so that a future minion or mastermind or whoever is able to find it and put it to use. | ask #11 |
| S32 | The data structure from the research, the docs, it really should just be creating docs MD files and probably organized into directories. | ask #12 |
| S33 | At least where that makes sense. | ask #12 (thin) |
| S34 | However, all that, I'm still not sure how the navigation works for the docs system. | ask #13 |
| S35 | And if we have multi-level documentation where any page could have three layers deep of documents, getting the navigation working properly, I don't think we necessarily have that working properly. | ask #13 |
| S36 | And so if we set up the research system to just have nested markdown files, we're not going to be able to browse them very easily. | ask #13 |
| S37 | Maybe the AI will be able to read them and use them properly. | ask #13 |
| S38 | And maybe that's good enough. | ask #13 (thin) |
| S39 | But yeah, try and figure out a way to generalize this whole research, web search, digging into any specific idea - here's a problem. | ask #14 |
| S40 | We got to figure out how to solve this or that. | ask #14 |
| S41 | Identify three different ways to solve it and then tell everyone else, write it down on the file system. | ask #14 |
| S42 | By the way, in this whole collaborative planning agentic work, we need to probably use rounds or steps or phases to the collaborative work. | ask #15 |
| S43 | So I was thinking if you have a bunch of agents working in parallel all at the same time and trying to collaborate, they don't know. | ask #16 |
| S44 | They're going to miss each other's responses. | ask #16 |
| S45 | They're going to go out of turn. | ask #16 |
| S46 | They're going to miss something. | ask #16 (thin) |
| S47 | And I just don't see that working as well. | ask #16 (thin) |
| S48 | If you have a mastermind that's leading the research and you have an initial phase where everyone goes and does their you give them the initial prompt and then they when they're done when everyone's done and they've all written it down into their directory or whatever. | ask #17 |
| S49 | And so on one work tree you could have each minion create their own directory in that work folder or whatever directory you're working in, then each minion can read. | ask #17 |
| S50 | I don't know if you have all the minions read each other's or maybe it's just the mastermind reads. | ask #18 |
| S51 | I don't know if the mastermind should read them all or if they should all work together. | ask #18 |
| S52 | If the mastermind reads all of them and tries to make conclusions, that's going to fry the mastermind's context or focus, I think. | ask #19 |
| S53 | So maybe you have each of the minions read maybe one or two others and then revise their own and I don't know that that whole process of reaching the consensus. | ask #20 |
| S54 | Maybe the research system has some way for each of the minions to give feedback about each kind of idea. | ask #21 |
| S55 | So okay here this is what makes sense if we had let's say a dozen minions building the same thing we need to figure out a way to refine the potential into the actual outcome. | ask #22 |
| S56 | So the name of the class the name of the properties and the names of the methods those are all very tangible things. | ask #22 |
| S57 | So for object oriented design we should be able to systematically create a consensus mechanism to vote on the best name and the best method names and property names and method arguments and whatever the core structure. | ask #22 |
| S58 | And then from there, the minions could design, well, first, once you reach consensus, then you move forward and you have them each design those or write the code for those methods and get it working. | ask #23 |
| S59 | And then through that process, they're gonna learn a lot in terms of what needs to happen and which problems to solve. | ask #24 |
| S60 | And then they could review each other's code again and say, okay, which one, are these functionally identical. | ask #25 |
| S61 | And are there any improvements we could make to any of them to make them whichever, I don't know how you arrive at the best method, maybe each minion just votes on which one they pick the best one. | ask #25 |
| S62 | And then the one that gets the most votes becomes the right one. | ask #25 (thin) |
| S63 | And maybe the minions can choose their favorite essentially with any improvements they would recommend or caveats that might be. | ask #26 |
| S64 | Important. | context only |
| S65 | And so that way, you could get simultaneously the choice, try and arrive at a decision and also be aware if maybe one, the best option is this one, but it's missing some important caveat. | ask #27 |
| S66 | And so if you just add another extra line or fix one little thing, then it's clearly the best. | ask #27 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "treat" — not in the transcript at all |
| #2 | new words | "cover" — not in the transcript at all |
| #3 | new words | "examine" — not in the transcript at all |
| #5 | new words | "surface" — not in the transcript at all |
| #6 | thin citation | cites S11 but shares no wording with it — the citation may not reflect what S11 actually says |
| #8 | new words | "between", "producing" — not in the transcript at all |
| #9 | thin citation | cites S24 but shares no wording with it — the citation may not reflect what S24 actually says |
| #10 | new words | "keep", "instead" — not in the transcript at all |
| #12 | thin citation | cites S33 but shares no wording with it — the citation may not reflect what S33 actually says |
| #13 | thin citation | cites S38 but shares no wording with it — the citation may not reflect what S38 actually says |
| #13 | new words | "address", "unclear", "person", "even", "though" — not in the transcript at all |
| #14 | new words | "solutions" — not in the transcript at all |
| #16 | thin citation | cites S46 but shares no wording with it — the citation may not reflect what S46 actually says |
| #16 | thin citation | cites S47 but shares no wording with it — the citation may not reflect what S47 actually says |
| #16 | new words | "guard" — not in the transcript at all |
| #17 | new words | "complete" — not in the transcript at all |
| #18 | new words | "unsure" — not in the transcript at all |
| #19 | new words | "watch", "frying" — not in the transcript at all |
| #20 | new words | "accordingly" — not in the transcript at all |
| #24 | new words | "implementation" — not in the transcript at all |
| #25 | thin citation | cites S62 but shares no wording with it — the citation may not reflect what S62 actually says |
| #27 | new words | "fixed" — not in the transcript at all |
