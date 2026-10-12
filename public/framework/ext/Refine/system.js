import ReadmeSystem from "../System/ReadmeSystem.js";

// Prompt refinement looks after its own module: its readme stays a short index and its links resolve.
export default new ReadmeSystem({ name: "Prompt refinement", icon: "auto_fix_high", root: "public/framework/ext/Refine", readme: "public/framework/ext/Refine/readme.md" });
