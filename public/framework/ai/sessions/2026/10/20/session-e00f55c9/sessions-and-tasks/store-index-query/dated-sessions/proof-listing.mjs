// prints census + Session.scan listing as JSON (proof for slice 2)
import TaskDirs from "../../../../../../../../../../../Server/TaskDirs.mjs";
import Session from "../../../../../../../../../../../public/framework/core/Session/Session.js";
const c = TaskDirs.census(); await Session.scan();
console.log(JSON.stringify({ census: c, days: [...Session.days].sort(), slugs: [...Session.slugs].sort(), list: TaskDirs.list(3650).map(t => t.key) }, null, 1));
