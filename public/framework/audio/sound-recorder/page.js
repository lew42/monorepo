import { Page, md } from "/app.js";

// An alias: this page moved to ../v1/sound-recorder/ (2026-09-30). The old URL keeps working.
export default new Page({
	meta: import.meta,
	title: "sound-recorder (moved)",
	description: "sound-recorder moved to audio v1.",
	content(){ md("sound-recorder moved to [audio v1 → sound-recorder](/framework/audio/v1/sound-recorder/). The current tools are [MicStream, Recorder and Transcriber](/framework/audio/)."); },
});
