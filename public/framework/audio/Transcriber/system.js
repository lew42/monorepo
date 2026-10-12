import ReadmeSystem from "../../ext/System/ReadmeSystem.js";

// Transcription looks after its own module: its readme stays a short index and its links resolve.
export default new ReadmeSystem({ name: "Transcription", icon: "mic", root: "public/framework/audio/Transcriber", readme: "public/framework/audio/Transcriber/readme.md" });
