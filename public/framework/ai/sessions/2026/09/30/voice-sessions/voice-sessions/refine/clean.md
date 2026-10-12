S36. In terms of the per page AI, I'm thinking maybe the mobile rail at the bottom should be a global assistant.
S37. That can listen through page transitions so that as I'm talking about something and I'm navigating around trying to find what I'm looking for, I don't deactivate the mic.
S38. The mobile rail should probably default to a global assistant.
S39. And then as I navigate around, the system could notify the assistant when I navigate to a new page.
S40. Any browser session should probably have some sort of page navigation event.
S41. Whenever a link is clicked, we fire off a log event in the site's log.
S42. And then I don't know if the assistant would probably then tail that.
S43. Maybe it's an MCP tool that can pipe things back into the session in real time.
S44. But it would be helpful if, as I'm navigating around, the assistant sees.
S45. It would be both.
S46. This would be like an echo pattern where both an assistant and a mastermind would be simultaneously managing the voice session.
S47. I think what we need is a mastermind that's different from a session mastermind.
S48. They're kind of a similar idea.
S49. They might have a lot of similar skills.
S50. The idea is that when we have a voice session, we need the fast assistant, but we also want a smart assistant.
S51. And maybe that's the way to say it: fast assistant and smart assistant.
S52. Well, frankly, even the smart assistant should probably try and stay relatively hands-free and help just refine and curate prompts and interpret, like it's almost their job to just interpret the will of the person speaking the prompt and make sure that things are not dropped by the wayside.
S53. And then it would be the master assistant whose job is to actually spawn the correct mastermind.
S54. If it's architecting some grand new scheme, it would probably be a higher level minion.
S55. Also depending on usage, we should build into the system that usage token usage should be used intelligently.
S56. If we're nearing the end of the week and we have a lot of usage left, we want to lean into that and try and use higher level models and get better results.
S57. If we're nearing our pace line midway through the week, or even early in the week especially, then we might lay off a bit and use lower level models.
S58. It's really the smart assistant that is sort of like the first level mastermind and can spawn additional masterminds.
S59. Those sub masterminds should be like unique sessions that could be accessed by any session.
S60. Any future sessions.
S61. The way I see it is a new session is a new context, and it wouldn't necessarily have to have a fast assistant if we weren't using voice.
S62. But I think once the voice turns on, then you'd probably want to enable the fast assistant to be able to listen to incoming text and to refine it or to make quick corrections.
S63. The smart assistant could make corrections as well.
S64. Maybe if the fast assistant and smart assistant are collaborating on the same kind of user interface, like the page.jsonl for example, maybe they should both tail that file.
S65. And I don't know.
S66. So answer me here right now.
S67. Can any agent, an assistant or mastermind or whatever, tail one of the JSONL files accurately to get like a streaming log?
S68. If they're currently in process, wouldn't it just queue that up and deliver them any number of new tail messages once they're free to receive new messages?
