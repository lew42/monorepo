# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | Yeah, so in terms of the per directory mastermind and when to spawn them and when to recycle them, I think for a given voice session, a follow-up question, you can use the same mastermind. | ask #1 |
| S2 | So first of all, spawning a mastermind in the same directory in a let's just say it's from a different session that doesn't know about the other one. | ask #3 |
| S3 | Spawning two similar masterminds should probably use the exact same prompt. | ask #2 |
| S4 | And so it should be cached, generally speaking. | ask #2 |
| S5 | And I don't know if we need, we should try and build in a fork situation where you can fork. | ask #3 |
| S6 | I don't know. | ask #3 (thin) |
| S7 | I don't think that's worth it. | ask #3 |
| S8 | I think generally, just spawning a new brand new session is going to be the go-to. | ask #4 |
| S9 | It's just it guarantees it's fresh. | ask #4 |
| S10 | You don't have to question whether to recycle or not. | ask #4 |
| S11 | The one thing that would obviously be useful is when you want the context. | ask #5 |
| S12 | If you've been talking to a mastermind and you've explained the problem and we want to do a follow-up question. | ask #5 |
| S13 | Obviously, we don't want to start with a fresh mastermind who has no idea what we're talking about. | ask #5 |
| S14 | However, generally speaking, for any kind of questions, queries don't really modify anything. | ask #6 |
| S15 | There's really no documentation necessary. | ask #6 |
| S16 | However, whenever anything changes, whenever there's notes could be added probably without much kind of updating the README and needing to worry about the synchronicity of the system. | ask #7 |
| S17 | However, whenever a major change happens and a merge comes in, then the README gets updated and all the documentation gets updated. | ask #8 |
| S18 | And then fresh agents just they should be up to date. | ask #8 |
| S19 | They should be able to read the maybe there's a log file for frankly each kind of path, whether it's a module, whether it's a page. | ask #9 |
| S20 | Modules do have pages, but the page.jsonl if we just lean into that as being the single go-to log file for everything that we're automatically going to read it, that we're probably going to exhaust that at some point where we have multiple megabytes in a log file and it just takes too long to read it and parse it and render it. | ask #10 |
| S21 | So we'll probably need to move away from that at some point. | ask #10 |
| S22 | However, in the short term, we can just kind of use the page.jsonl as a place to have data ready. | ask #11 |
| S23 | In a little bit more of a real-time, that's that append only. | ask #11 |
| S24 | And so we'll probably, we'll definitely want the SDK, whether it's Claude SDK or Open Router SDK to be able to use Chokidar to watch the files. | ask #12 |
| S25 | And when a Git tree is merged in, for example, and a file changes, we can react to it. | ask #12 |
| S26 | And so if a log is appended to, we can route those things to the proper place, and so that each mastermind should be able to, after reading its README, decide whether it should use the MCP or even a local tool call or whatever it is to properly tail the log and get all the updates. | ask #13 |
| S27 | So let's get that working and try and see how that works. | ask #14 |
| S28 | I think if the AIs can stay up to date in real time, that might be the best way. | ask #14 |
| S29 | Or at least one way to communicate with each other. | ask #14 |
| S30 | If there's a bunch of minions all kind of working, just using a log is just kind of a matter of fact. | ask #15 |
| S31 | Instead of trying to write a message to the right person and figure out how to coordinate the proper messaging frequency and detail amounts, if we lean on the file system as the place to put all that. | ask #15 |
| S32 | And frankly, if we create sub files, then we can have additional if you have a per task directory, you can put a page.jsonl in there and put all the logs in there. | ask #16 |
| S33 | So I don't know how the task system works currently if we're using a page.jsonl for each task. | ask #17 |
| S34 | I'm not sure how the AI task system works, so I think I asked for some clarity on that a while back. | ask #17 |
| S35 | But I'm not looking at my computer right now. | ask #17 (thin), ask #28 |
| S36 | I'm trying to make this work on mobile. | ask #17 (thin), ask #28 |
| S37 | The dictate page is a little fuzzy. | ask #18 |
| S38 | I'm going to start telling you some stuff about this dictate page here. | ask #18 |
| S39 | Okay, so the dictate page has this kind of raw, the corrected and live modes, which is kind of cool. | ask #19 |
| S40 | So what I'm not sure about on that correction is it seems like number one, it, the raw transcription was doing some amount of correction, maybe taking ahs and ums out. | ask #20 |
| S41 | However, I feel like a lot of times they're left in, and so I'm not sure exactly what's going on there. | ask #20 |
| S42 | I'll need to test that a little bit more. | ask #20 |
| S43 | In terms of the kind of refinement of the dictation, that's really what we need to work on. | ask #21 |
| S44 | And so that's partially the fast assistant and its prompt and its available content modules – what kind of content cards can it put in the little chat flow. | ask #21 |
| S45 | And so I was explaining a second ago, we kind of need a universal chat system. | ask #22 |
| S46 | And so that's whether it's text-based, whether it's AI-based, it's sort of just a log file. | ask #22 |
| S47 | And so while cramming it all in a page.jsonl, I don't know if that's the best way to do it. | ask #23 |
| S48 | For a voice session that's gonna persist across the entire site. | ask #24 |
| S49 | I don't know if we change over this whole thing to a global voice session that does follow you around from page to page, then you lose that automatic organization. | ask #24 |
| S50 | So if you're on a specific page and you're talking about a specific module and you're having a whole conversation about it, you probably want to file that thing away on that page so that when you come back to that page and you go to the AI tab and you're looking at that page's sessions. | ask #24 |
| S51 | So maybe we need a dual mode where the page itself has, you can create a new session from the page itself or you can just launch kind of a global session. | ask #25 |
| S52 | But in that case, you'd have to be really careful about which one you're using because the page session should probably turn itself off when you navigate away. | ask #26 |
| S53 | And that could be really annoying because you accidentally click something and it turns itself off and you were mid-thought or mid-sentence or maybe you notice, maybe you don't notice and you're continuing to transcribe forever and you're just wasting your time. | ask #26 |
| S54 | That's what the Claude Code app or the Claude app on my mobile and the VS Code sidebar app, they cut out the transcription so frequently it's super frustrating because I don't even remember where it cut out and then I have to try and reread what I was saying, thinking. | ask #27 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "reuse" — not in the transcript at all |
| #2 | new words | "applies", "possible" — not in the transcript at all |
| #3 | thin citation | cites S6 but shares no wording with it — the citation may not reflect what S6 actually says |
| #3 | new words | "considering", "between", "unsure", "toward", "complexity" — not in the transcript at all |
| #4 | new words | "since", "avoids" — not in the transcript at all |
| #5 | new words | "already", "reuse" — not in the transcript at all |
| #7 | strength word | uses "always", not found in the cited sentence(s) |
| #7 | new words | "allow", "always" — not in the transcript at all |
| #10 | new words | "note", "will", "large", "efficiently", "approach" — not in the transcript at all |
| #11 | new words | "source" — not in the transcript at all |
| #12 | new words | "chokidar" — not in the transcript at all |
| #14 | new words | "approach", "performs" — not in the transcript at all |
| #15 | new words | "communication", "coordination", "once", "natural", "approach" — not in the transcript at all |
| #16 | new words | "allow", "directories", "putting", "separate" — not in the transcript at all |
| #17 | thin citation | cites S35 but shares no wording with it — the citation may not reflect what S35 actually says |
| #17 | thin citation | cites S36 but shares no wording with it — the citation may not reflect what S36 actually says |
| #17 | new words | "resolve", "uncertainty", "used" — not in the transcript at all |
| #18 | new words | "flags", "state" — not in the transcript at all |
| #19 | new words | "note" — not in the transcript at all |
| #20 | new words | "clarify", "behavior", "inconsistently", "removes", "often", "leaving", "plans" — not in the transcript at all |
| #21 | new words | "through" — not in the transcript at all |
| #22 | new words | "possibly" — not in the transcript at all |
| #23 | new words | "raises", "concern" — not in the transcript at all |
| #24 | new words | "organize" — not in the transcript at all |
| #26 | new words | "navigation", "note" — not in the transcript at all |
| #27 | new words | "address", "apps" — not in the transcript at all |
