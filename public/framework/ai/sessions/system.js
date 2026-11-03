import ReadmeSystem from "../../ext/System/ReadmeSystem.js";

// Sessions looks after its own module: its readme stays a short index and its links resolve.
export default new ReadmeSystem({ name: "Sessions", icon: "forum", root: "public/framework/ai/sessions", readme: "public/framework/ai/sessions/readme.md" });
