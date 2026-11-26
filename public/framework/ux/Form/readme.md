# Form: a form from a list, twenty native answer types, one plain object out

A form is a list of questions. Each question holds one **answer**, a real HTML control (radio, checkbox, range, select, input, textarea) that stores one plain JSON value. `form.values()` hands you `{ id: value }` and nothing else.

## Use

```js
import Form from "/framework/ux/Form/Form.js";

const form = Form.from({
	title: "Check-in",
	questions: [
		{ id: "intro", type: "T09", label: "How was the intro?", required: true },
		{ id: "how", type: "chooseone", label: "How?", options: [["a", "A"], ["b", "B"]] },
	],
});
form.values();                        // { intro: null, how: null }
form.load({ intro: 2 });              // set answers by id; unknown ids are ignored
form.on("change", v => save(v));      // any answer changed
form.on("submit", v => send(v));      // Submit pressed, no required question empty
```

- `type` is a type id (`"T09"`) or an answer class name (`"Scale7"`, `"scale7"`, `"ShortText"`). `options` is `[[value, label], …]`; any extra `config` key goes to the answer (`config: { markers: "faces" }`).
- A single answer works alone: `new Scale7({ markers: "faces", input: "slider", step: 0.5 })`, then `answer.value`, `answer.on("change", v => …)`, `answer.empty()`.
- **Scale7 (−3 … +3) is swappable.** `markers: "numbers" | "faces" | "icons" | "bars"`, `input: "buttons" | "slider"`, `step: 0.5` for a slider, `skip: false` to drop the Skip button. Three distinct states: `null` (not answered), `0` (the middle, an answer) and `"skip"`.
- Live page, every type as a card with its stored value: [/framework/ux/Form/](/framework/ux/Form/).

## The twenty types

| id | class | stores |
|---|---|---|
| T01 | `YesNo` | `true` / `false` / `null` |
| T02 | `Toggle` | `true` / `false` (never `null`) |
| T03 | `ChooseOne` | the option value / `null` |
| T04 | `Dropdown` | the option value / `null` |
| T05 | `ChooseMany` | array of option values, option order (`[]` when none) |
| T06 | `Chips` | as T05, drawn as chips |
| T07 | `Frequency` | 0 … 4 / `null` |
| T08 | `Agreement` | −2 … 2 / `null` |
| T09 | `Scale7` | −3 … 3, `"skip"`, `null` |
| T10 | `Slider7` | −3 … 3 (halves with `step: 0.5`) / `null` |
| T11 | `Slider100` | 0 … 100 / `null` |
| T12 | `Likelihood` | 0 … 10 / `null` |
| T13 | `Stars` | 1 … 5 / `null` |
| T14 | `NumberAnswer` | a number / `null` |
| T15 | `DateAnswer` | `"YYYY-MM-DD"` / `null` |
| T16 | `TimeAnswer` | `"HH:MM"`, or `"YYYY-MM-DDTHH:MM"` with `mode: "datetime"` |
| T17 | `ShortText` | string / `null` |
| T18 | `LongText` | string / `null` |
| T19 | `RankTop3` | `[first, second, third]`, each an option value or `null` |
| T20 | `Emoji` | the emoji string / `null` |

## Watch out

- **`null` means not answered; `0` is an answer.** Required checks use `answer.empty()`, which is true only for `null`, an empty string, or a list with nothing in it.
- **Class fields in a subclass start after `render()`.** Defaults live in statics and getters (`static initial`, `get choices`), and options arrive through the constructor arguments. A field written `x = 1` would be undefined while the control is built.
- **Selected state is `--prime`; its ink is `#1a1a1a`**, the same ink the framework's own `button.prim` uses. There are no new colours and no scheme here.
- **Inputs are 16 px or more** (a smaller one makes iOS zoom the page) and every tap target is 44 px or more.
- **A slider reads `null` until you touch it**, drawn faint with a dash. It commits on `input`, `change` and `pointerup`.
- **`LongText` stores a plain string.** AI tags and summaries will sit beside the string, never inside it.

## Architecture

- `Answer extends View`: `value` (get and set), `on("change")`, `empty()`, `static type/title/shape/native/use/example`, and the shared builders `one_of`, `many_of`, `field_of`, `range_of`.
- `answers/<Name>.js`: one class per type, each `extends Answer` (`Chips extends ChooseMany`, `Slider7 extends Scale7`).
- `Answers`: the registry, `Answers.list`, `.find(key)`, `.make(key, opts)`.
- `Question extends View`: a `<fieldset>` with a legend, a hint, one answer, and the required flag.
- `Form extends View`: the questions, `values()`, `load()`, `missing()`, `submit()`, and the `change` and `submit` events.
- `AnswerCard`, `ScaleLab`: the docs page's live demos only.

## On disk

```
ux/Form/
  Answer.js  Answers.js  Question.js  Form.js  Form.css     the kit (all rules in @layer site)
  answers/*.js                                                the twenty types
  AnswerCard.js  ScaleLab.js  page.js                         the docs page
  Answer.test.mjs  Form.test.mjs  Scale7.test.mjs  fake-dom.mjs   node tests (node <file>)
```

Nothing is saved to disk by the kit: `values()` is yours to keep.

## More

- The control grammar the answers wear: [/framework/ui/](/framework/ui/).
- The wizard engine a stepper layout will reuse: [ux/Wizard](/framework/ux/Wizard/).
- Tests: `node public/framework/ux/Form/Form.test.mjs` (and `Answer`, `Scale7`).
