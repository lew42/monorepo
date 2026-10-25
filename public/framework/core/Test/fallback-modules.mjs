// Loaded with `node --import` by TestRunner in a worktree: a bare package this tree lacks (Servex/node_modules is not in a worktree) resolves from the main checkout.
import { register } from "node:module";
register("./fallback-resolve.mjs", import.meta.url, { data: { from: process.env.TEST_FALLBACK_FROM } });
