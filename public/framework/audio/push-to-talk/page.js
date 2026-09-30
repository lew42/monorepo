import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/push-to-talk/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "push-to-talk (moved)",
	description: "push-to-talk moved to audio v1.",
	content(){ md("push-to-talk moved to [audio v1 → push-to-talk](/framework/audio/v1/push-to-talk/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
