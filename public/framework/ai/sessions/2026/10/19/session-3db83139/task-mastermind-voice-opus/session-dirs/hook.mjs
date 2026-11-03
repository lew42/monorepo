// Resolve bare packages from the MAIN tree's node_modules (read-only; no link), since the worktree has none.
import { register } from "node:module";
register("./resolver.mjs", import.meta.url);
