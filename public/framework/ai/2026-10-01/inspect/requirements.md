# inspect(): every object and class as a card, and Dictate as a live system diagram: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). A big task, in two parts. Part 1 first.

## Part 1: `inspect()`, the house pattern for seeing any object
- **Build on what exists, don't duplicate (law 6):** /framework/ux/Content/Object:
  - `object()` gives one card: the class name, `name = value` per property, and the method names;
  - `view()` / `DefaultView.js` gives a lazy tree of ui/item rows;
  - a class can override it with `Thing.View`.
- **`static icon = "…"`** on a class: the name of its icon (the icon system). An instance shows its class's icon.
- **`instance.inspect()` and `Class.inspect()`:** a render method kept SEPARATE from `render()`. `render()` stays free for the object's real template; `inspect()` is the debug and inspector view, available on every object even without a render method. It captures markup like any factory.
  - **An instance card:** icon, instance name, class name, the key properties (configurable), and arrays as nested cards. It works recursively: a property's value inspects itself.
  - **A class card:** the SAME icon in a more substantial frame (bigger, "a class definition"), listing properties and methods with the core API first, each as a nested card. It's the visual form of the readme's `## Architecture` block.
  - Variants: `minimal` (icon + names, like an Inbox context card), `card` (the default), `full`. Name them well; the owner expects some sculpting.
- **One view or many:** keep one default (`Thing.View`). Multiple live views are possible, but note the update cost (you have to loop the views). Recommend, and record the alternative.
- **Document it in the code system** (/framework/code/patterns: "render vs inspect"; parts as statics; `static icon`). A class's doc page opens with its class card.

## Part 2: the /framework/ux/Dictate/ playground as a full-bleed, live system diagram (3440-friendly)
- The playground tab goes **full bleed**, using a 2D layout (columns and rows) that fills a widescreen.
- **Every object a dictation session creates is a real object with an icon,** shown with `inspect()` and updating live as you talk:
  1. the audio source (mic, levels);
  2. the segments;
  3. the RAW transcriptions;
  4. the CLEAN ones;
  5. the prompt analysis (investigation and planning, a coming phase);
  6. the chat messages, replies and reactions;
  7. the session and its files (what's written where: the JSONL lines as they land).

  If something is a plain string or blob today and should be an object, make it one.
- **Like a log: immutable.** Nothing is overwritten. A raw transcription stays visible after its clean version arrives. No jumping: new things append, and the view never reorders under you.
- **Layout:** source → raw → clean → analysis → chat as columns (or a table) on desktop, with the session's objects as a structure panel. On mobile, a stack with tabs is fine (the existing tabs).

## Rules
- Coordinate with @task-mastermind-one-dictation, which owns the dictation widget and is fixing its core bugs. Part 2 builds the **diagram** around their widget, not a second widget.
- A Sonnet task mastermind with at most 2 Sonnet minions, in a pool worktree, through merge.mjs. Screenshots at 1920 and 3440 (it's a layout), plus 400 for the inspect cards.
- Land Part 1 first, then Part 2.
