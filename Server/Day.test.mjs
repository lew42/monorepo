// node Server/Day.test.mjs — the one day rule (2026-10-18): the owner's LOCAL day, whatever the machine's zone.
import assert from "node:assert/strict";
import Day from "../public/framework/core/Session/Day.js";
import TaskDirs from "./TaskDirs.mjs";
import AIIndex from "./AIIndex.mjs";
import Session from "../public/framework/core/Session/Session.js";

const late = new Date(2026, 9, 17, 23, 30), early = new Date(2026, 9, 18, 0, 30);   // local wall-clock stamps
assert.equal(TaskDirs.day(late), "2026-10-17", "23:30 local is still 10-17, even where UTC has rolled to 10-18");
assert.equal(TaskDirs.day(early), "2026-10-18", "00:30 local is 10-18");
assert.equal(TaskDirs.ymd(late), "2026/10/17");
assert.equal(TaskDirs.ymd("2026-10-17"), "2026/10/17", "a day string passes through");
assert.equal(AIIndex.day(late.toISOString()), TaskDirs.day(late), "AIIndex.day and TaskDirs.day agree");
assert.equal(AIIndex.day(early.getTime()), TaskDirs.day(early));
assert.equal(Session.day(late.toISOString()), "2026/10/17", "the session folder is filed by the same day");
assert.equal(Day.of("nonsense"), "");
assert.equal(Session.day(null), null);
console.log("Day.test: ok");
