import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/MicPicker/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "MicPicker (moved)",
	description: "MicPicker moved to audio v1.",
	content(){ md("MicPicker moved to [audio v1 → MicPicker](/framework/audio/v1/MicPicker/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
