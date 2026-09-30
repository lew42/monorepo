S1. Yeah, so in terms of the per directory mastermind and when to spawn them and when to recycle them, I think for a given voice session, a follow-up question, you can use the same mastermind.
S2. So first of all, spawning a mastermind in the same directory in a let's just say it's from a different session that doesn't know about the other one.
S3. Spawning two similar masterminds should probably use the exact same prompt.
S4. And so it should be cached, generally speaking.
S5. And I don't know if we need, we should try and build in a fork situation where you can fork.
S6. I don't know.
S7. I don't think that's worth it.
S8. I think generally, just spawning a new brand new session is going to be the go-to.
S9. It's just it guarantees it's fresh.
S10. You don't have to question whether to recycle or not.
S11. The one thing that would obviously be useful is when you want the context.
S12. If you've been talking to a mastermind and you've explained the problem and we want to do a follow-up question.
S13. Obviously, we don't want to start with a fresh mastermind who has no idea what we're talking about.
S14. However, generally speaking, for any kind of questions, queries don't really modify anything.
S15. There's really no documentation necessary.
S16. However, whenever anything changes, whenever there's notes could be added probably without much kind of updating the README and needing to worry about the synchronicity of the system.
S17. However, whenever a major change happens and a merge comes in, then the README gets updated and all the documentation gets updated.
S18. And then fresh agents just they should be up to date.
S19. They should be able to read the maybe there's a log file for frankly each kind of path, whether it's a module, whether it's a page.
S20. Modules do have pages, but the page.jsonl if we just lean into that as being the single go-to log file for everything that we're automatically going to read it, that we're probably going to exhaust that at some point where we have multiple megabytes in a log file and it just takes too long to read it and parse it and render it.
S21. So we'll probably need to move away from that at some point.
S22. However, in the short term, we can just kind of use the page.jsonl as a place to have data ready.
S23. In a little bit more of a real-time, that's that append only.
S24. And so we'll probably, we'll definitely want the SDK, whether it's Claude SDK or Open Router SDK to be able to use Chokidar to watch the files.
S25. And when a Git tree is merged in, for example, and a file changes, we can react to it.
S26. And so if a log is appended to, we can route those things to the proper place, and so that each mastermind should be able to, after reading its README, decide whether it should use the MCP or even a local tool call or whatever it is to properly tail the log and get all the updates.
S27. So let's get that working and try and see how that works.
S28. I think if the AIs can stay up to date in real time, that might be the best way.
S29. Or at least one way to communicate with each other.
S30. If there's a bunch of minions all kind of working, just using a log is just kind of a matter of fact.
S31. Instead of trying to write a message to the right person and figure out how to coordinate the proper messaging frequency and detail amounts, if we lean on the file system as the place to put all that.
S32. And frankly, if we create sub files, then we can have additional if you have a per task directory, you can put a page.jsonl in there and put all the logs in there.
S33. So I don't know how the task system works currently if we're using a page.jsonl for each task.
S34. I'm not sure how the AI task system works, so I think I asked for some clarity on that a while back.
S35. But I'm not looking at my computer right now.
S36. I'm trying to make this work on mobile.
S37. The dictate page is a little fuzzy.
S38. I'm going to start telling you some stuff about this dictate page here.
S39. Okay, so the dictate page has this kind of raw, the corrected and live modes, which is kind of cool.
S40. So what I'm not sure about on that correction is it seems like number one, it, the raw transcription was doing some amount of correction, maybe taking ahs and ums out.
S41. However, I feel like a lot of times they're left in, and so I'm not sure exactly what's going on there.
S42. I'll need to test that a little bit more.
S43. In terms of the kind of refinement of the dictation, that's really what we need to work on.
S44. And so that's partially the fast assistant and its prompt and its available content modules – what kind of content cards can it put in the little chat flow.
S45. And so I was explaining a second ago, we kind of need a universal chat system.
S46. And so that's whether it's text-based, whether it's AI-based, it's sort of just a log file.
S47. And so while cramming it all in a page.jsonl, I don't know if that's the best way to do it.
S48. For a voice session that's gonna persist across the entire site.
S49. I don't know if we change over this whole thing to a global voice session that does follow you around from page to page, then you lose that automatic organization.
S50. So if you're on a specific page and you're talking about a specific module and you're having a whole conversation about it, you probably want to file that thing away on that page so that when you come back to that page and you go to the AI tab and you're looking at that page's sessions.
S51. So maybe we need a dual mode where the page itself has, you can create a new session from the page itself or you can just launch kind of a global session.
S52. But in that case, you'd have to be really careful about which one you're using because the page session should probably turn itself off when you navigate away.
S53. And that could be really annoying because you accidentally click something and it turns itself off and you were mid-thought or mid-sentence or maybe you notice, maybe you don't notice and you're continuing to transcribe forever and you're just wasting your time.
S54. That's what the Claude Code app or the Claude app on my mobile and the VS Code sidebar app, they cut out the transcription so frequently it's super frustrating because I don't even remember where it cut out and then I have to try and reread what I was saying, thinking.
