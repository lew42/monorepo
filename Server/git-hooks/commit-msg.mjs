// commit-msg.mjs: adds "Session: <uuid>" to the commit message (usage: node commit-msg.mjs <message file>). Never fails a commit.
import CommitLog from "./CommitLog.mjs";

const timer = setTimeout(() => process.exit(0), CommitLog.LIMIT); timer.unref?.();
try { await CommitLog.trailer(process.argv[2]); } catch (e) { console.error("commit-msg.mjs: " + String(e.message || e).split("\n")[0]); }
process.exit(0);
