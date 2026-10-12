# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S36 | In terms of the per page AI, I'm thinking maybe the mobile rail at the bottom should be a global assistant. | ask #1 |
| S37 | That can listen through page transitions so that as I'm talking about something and I'm navigating around trying to find what I'm looking for, I don't deactivate the mic. | ask #1 |
| S38 | The mobile rail should probably default to a global assistant. | ask #1 |
| S39 | And then as I navigate around, the system could notify the assistant when I navigate to a new page. | ask #2 |
| S40 | Any browser session should probably have some sort of page navigation event. | ask #2 |
| S41 | Whenever a link is clicked, we fire off a log event in the site's log. | ask #2 |
| S42 | And then I don't know if the assistant would probably then tail that. | ask #2 |
| S43 | Maybe it's an MCP tool that can pipe things back into the session in real time. | ask #2 |
| S44 | But it would be helpful if, as I'm navigating around, the assistant sees. | ask #2 |
| S45 | It would be both. | ask #3 |
| S46 | This would be like an echo pattern where both an assistant and a mastermind would be simultaneously managing the voice session. | ask #3 |
| S47 | I think what we need is a mastermind that's different from a session mastermind. | ask #4 |
| S48 | They're kind of a similar idea. | ask #4 |
| S49 | They might have a lot of similar skills. | ask #4 |
| S50 | The idea is that when we have a voice session, we need the fast assistant, but we also want a smart assistant. | ask #5 |
| S51 | And maybe that's the way to say it: fast assistant and smart assistant. | ask #5 |
| S52 | Well, frankly, even the smart assistant should probably try and stay relatively hands-free and help just refine and curate prompts and interpret, like it's almost their job to just interpret the will of the person speaking the prompt and make sure that things are not dropped by the wayside. | ask #6 |
| S53 | And then it would be the master assistant whose job is to actually spawn the correct mastermind. | ask #7 |
| S54 | If it's architecting some grand new scheme, it would probably be a higher level minion. | ask #7 |
| S55 | Also depending on usage, we should build into the system that usage token usage should be used intelligently. | ask #8 |
| S56 | If we're nearing the end of the week and we have a lot of usage left, we want to lean into that and try and use higher level models and get better results. | ask #8 |
| S57 | If we're nearing our pace line midway through the week, or even early in the week especially, then we might lay off a bit and use lower level models. | ask #8 |
| S58 | It's really the smart assistant that is sort of like the first level mastermind and can spawn additional masterminds. | ask #9 |
| S59 | Those sub masterminds should be like unique sessions that could be accessed by any session. | ask #9 |
| S60 | Any future sessions. | ask #9 |
| S61 | The way I see it is a new session is a new context, and it wouldn't necessarily have to have a fast assistant if we weren't using voice. | ask #10 |
| S62 | But I think once the voice turns on, then you'd probably want to enable the fast assistant to be able to listen to incoming text and to refine it or to make quick corrections. | ask #10 |
| S63 | The smart assistant could make corrections as well. | ask #10 |
| S64 | Maybe if the fast assistant and smart assistant are collaborating on the same kind of user interface, like the page.jsonl for example, maybe they should both tail that file. | ask #11 |
| S65 | And I don't know. | ask #11 |
| S66 | So answer me here right now. | ask #12 |
| S67 | Can any agent, an assistant or mastermind or whatever, tail one of the JSONL files accurately to get like a streaming log? | ask #12 |
| S68 | If they're currently in process, wouldn't it just queue that up and deliver them any number of new tail messages once they're free to receive new messages? | ask #12 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "being", "while" — not in the transcript at all |
| #2 | new words | "fires", "piping" — not in the transcript at all |
| #4 | new words | "though", "share" — not in the transcript at all |
| #6 | strength word | uses "only", not found in the cited sentence(s) |
| #6 | new words | "nothing" — not in the transcript at all |
| #9 | new words | "including" — not in the transcript at all |
| #11 | new words | "though", "says" — not in the transcript at all |
| #12 | new words | "question" — not in the transcript at all |
