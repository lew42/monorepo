import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/PushToTalk/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "PushToTalk (moved)",
	description: "PushToTalk moved to audio v1.",
	content(){ md("PushToTalk moved to [audio v1 → PushToTalk](/framework/audio/v1/PushToTalk/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
