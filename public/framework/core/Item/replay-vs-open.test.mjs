// FAILS today, on purpose: a real bug the replay lab found, written down and not fixed (fixes are not approved yet).
//   node public/framework/core/Item/replay-vs-open.test.mjs
// Item.js says replay is "ONE path for every Item, in node (replay(lines)) and in the browser" (above `static replay_new`).
// For a plain Item whose file starts with its fields, the two paths build different objects:
//   Item.open(url)      -> Item.root_from(): line 1 IS the constructor's fields, the rest replay. id "layer", data {visible, x, y}.
//   Item.replay(lines)  -> replay_new() is `new this()`, then ALL lines replay, line 1 as a set(): a fresh random id, and the
//                          line's own "id" key lands in data.
// A Task or Session does not show it (their replay_new reads line 1 itself), so every test today passes; any plain Item with its
// own file, replayed in node, would read back a different id and a stray data.id.
import Test from "../Test/Test.js";
import LabTape from "./replay/LabTape.js";
import LabLayer from "./replay/LabLayer.js";

const t = new Test("core/Item: Item.replay and Item.open build the same plain Item from one file");
const tape = new LabTape({ first: { id: "layer", visible: true, x: 24, y: 40 } });
const you = await tape.open(LabLayer, { tab: "you", write: true });
you.act("hide");
await LabTape.tick();

const opened = await tape.open(LabLayer);
const replayed = LabLayer.replay(tape.json());

t.eq(replayed.id, opened.id, "the replayed item keeps the file's id (opened: " + opened.id + ")");
t.ok(!("id" in replayed.data), "the file's id key is not left behind as a data field");
t.eq(JSON.parse(JSON.stringify(replayed)), JSON.parse(JSON.stringify(opened)), "the two objects serialize the same");
t.done();
