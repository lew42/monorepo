import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/LevelMeter/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "LevelMeter (moved)",
	description: "LevelMeter moved to audio v1.",
	content(){ md("LevelMeter moved to [audio v1 → LevelMeter](/framework/audio/v1/LevelMeter/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
