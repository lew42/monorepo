import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/mic-to-text/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "mic-to-text (moved)",
	description: "mic-to-text moved to audio v1.",
	content(){ md("mic-to-text moved to [audio v1 → mic-to-text](/framework/audio/v1/mic-to-text/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
