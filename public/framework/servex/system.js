import ReadmeSystem from "../ext/System/ReadmeSystem.js";

// Servex looks after its own module: its readme stays a short index and its links resolve.
export default new ReadmeSystem({ name: "Servex", icon: "dns", root: "public/framework/servex", readme: "public/framework/servex/readme.md" });
