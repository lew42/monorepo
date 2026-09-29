/* node public/layouts/decide/gen-questions.mjs — writes questions.md (one question per line,
   the input Server/ask-each.mjs reads) from questions.js, so the two never drift apart. */
import fs from "node:fs";
import { QUESTIONS } from "./questions.js";
const out = QUESTIONS.map((q, i) => `${i + 1}. ${q.ask} ${q.why} Usual answers: ${q.answers.join("; ")}. Answer for this page only, in a few plain sentences, and name the answer you pick.`).join("\n");
fs.writeFileSync(new URL("./questions.md", import.meta.url), out + "\n");
console.log("wrote questions.md");
