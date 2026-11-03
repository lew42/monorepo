import fs from "fs";
const { default: AISession } = await import("../../../AISession/AISession.js");
const id = "87bec773-d6dd-421c-92cc-fdd8a9eb5103", s = new AISession(id);
s.apply_text(fs.readFileSync(`C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/${id}.jsonl`, "utf8"));
console.log("most-run:", s.model_effort().label, "| current:", s.current_model().label, "| title:", s.s.title);
