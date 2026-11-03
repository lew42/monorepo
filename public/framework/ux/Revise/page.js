import { Page, md } from "/app.js";
import Revise from "./Revise.js";

export default new Page({
	meta: import.meta,
	title: "Revise",
	description: "Text in, revised text out, at a level — the AI step of dictation, usable for a prompt or for writing.",
	icon: "auto_fix_high",

	content(){
		md("**Revise is the AI step of dictation** — an LLM plus a prompt that cleans or curates rambling speech-to-text. Not the microphone, not the transcription: just this. It takes text and a LEVEL, and gives back better text.");

		md("**Three levels to start** — pick one below and press Revise to see it work on real rambling text. A caller can swap any of these for its own prompt, or add a new level (`Revise.LEVELS`).");

		new Revise.View();

		md("## The three levels");
		md("- **Clean** — near-raw: fixes typos, punctuation and capitalization, drops filler words (\"um\", \"uh\"). This is exactly today's `/api/tidy` behavior — every existing caller keeps working unchanged.");
		md("- **Edit** — light: tightens run-on sentences, same voice and the same informality.");
		md("- **Summary** — heavy: pulls out the real points and organizes them into short paragraphs or a list.");

		md("## Two uses, one class");
		md("The owner's own words: revision \"is not only about AI prompt kind of revision — you could write a blog post by just kind of rambling and then having the AI kind of clean it up.\" Both sample buttons above feed the SAME `Revise.run(text, level)` — a rambling prompt, and rambling notes for a blog post.");

		md("## Use");
		md("```js\nimport Revise from \"/framework/ux/Revise/Revise.js\";\nconst out = await Revise.run(rambling_text, \"edit\");\n// -> {ok: true, text: \"...\", model: \"...\", ms: 240} or {ok: false, why: \"...\"}\n```");

		md("See it wired into the real mic in [`ux/Dictate`](/framework/ux/Dictate/) and the [playground](/framework/ux/Dictate/playground/), which also shows every Whisper resend as it happens.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
