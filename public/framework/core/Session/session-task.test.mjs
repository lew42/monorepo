// A Session is a Task (session-is-a-task, 2026-10-24): its tasks list takes a string or an object, a referenced session record replays as
// a Session, and its numbers are computed from its children on read. Fast and DOM-free. `node public/framework/core/Session/session-task.test.mjs`
import Test from "../Test/Test.js";
import Task from "../Task/Task.js";
import Session from "./Session.js";

const t = new Test("Session: a Session is a Task; tasks.add takes a string or an object; totals from the children");
const at = (h, m) => `2026-10-24T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`;

t.ok(new Session("s1") instanceof Task, "Session extends Task");

const s = Session.replay([
	{ session: { id: "s1", kind: "vscode-tab", at: at(10, 0) } },
	{ tasks: { add: { type: "Task", id: "fix-the-tab-bar", title: "Fix the tab bar" } }, ts: at(10, 1) },
	{ tasks: { add: { type: "Project", id: "sessions-page", title: "Sessions page" } }, ts: at(10, 2) },
	{ tasks: { "fix-the-tab-bar": { complete: { outcome: "fixed", evidence: ["a shot"] } } }, ts: at(10, 3) },
]);
t.eq(s.tasks.length, 2, "two tasks from the record");
t.eq(s.tasks.find("sessions-page")?.constructor.name, "Project", "a typed add replays as its class");
t.eq(s.tasks.find("fix-the-tab-bar")?.created_at, at(10, 1), "a task knows the time of the line that added it");
t.eq(JSON.stringify(s.progress()), JSON.stringify({ done: 1, total: 2, stopped: 0 }), "progress is counted from the tasks on read");
t.eq(s.completion, 0.5, "completion is computed from the tasks");

s.tasks.add("Name the module");
t.eq(s.tasks.find("name-the-module")?.get_one("title"), "Name the module", "tasks.add(\"a string\") makes a Task titled by it");
t.eq(s.completion, 1 / 3, "a new task changes the totals at once");

// A child session referenced by path ({"task": "<folder>"}) replays as a Session, not a plain Task.
const was = Task.resolver;
Task.resolver = ref => ref === "/x/child/" ? [{ session: { id: "child-1", kind: "servex" } }, { tasks: { add: { type: "Task", id: "a", title: "A" } } }] : null;
try {
	const p = Session.replay([{ session: { id: "p" } }, { task: "/x/child/", ts: at(11, 0) }]);
	const kid = p.tasks.find("child-1");   // a session is named by its session id
	t.ok(kid instanceof Session && kid.tasks.length === 1, "a referenced session record is a child Session with its own tasks");
} finally { Task.resolver = was; }

t.done();
