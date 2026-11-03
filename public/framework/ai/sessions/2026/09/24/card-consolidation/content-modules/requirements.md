# Content modules — the kinds of card a page is built from

Task mastermind: `task-mastermind-content-modules`. Worktree `C:\Code\lew42\worktrees\page-cards`
(branch `worktree/page-cards`, dev server port 4817), shared with `task-mastermind-page-jsonl`
(core/Page, the page.jsonl format) and `task-mastermind-card-folders` (card storage, the ai2 card view).

## The owner's words (verbatim, lightly cleaned — the acceptance test)

> "I want to think about content modules. All these cards and the different types of cards, whether
> they're questions or tasks or whatever. Pretty much any box on any page is like a content card,
> whether it's got a background and padding or not. So we need to be more careful about what kind of
> cards we have, whether we're using the right one in the right place, and what it looks like, what it
> does and how it behaves. Basically any UI widget or card could be like a page or a template. I
> haven't really figured this out yet. We have a lot of demos and UI sections and style libraries, and
> there's stuff all over the website trying to document everything we have and how it works. We're
> still breaking things frequently, like the wrong spacing in the wrong places. The designs aren't
> perfect. We've done screenshots and a bunch of things. Anyway, I want to work on question cards and
> decision cards. A decision would have options, and when you click on an option, maybe it accepts
> that, or it's just some feedback. All of these cards in the dashboard could have any number of
> interactive widgets rendered on them as content. As our minions create pages (there's current work
> on page.jsonl), we need to think about how the AI, or anyone, creates pages with arbitrary content
> and widgets."

> (continued) "I'm eventually going to be using the transcription via the website. Every prompt that I
> make is very tangible. It's a quotation; you could put a timestamp on it. It should be logged in the
> page or the task or wherever. We want to do a very good job of record keeping. First log everything
> properly so that the data structures are solid. Then we can work on rendering it, and create
> different templates or variations to visualize that data."

## Deliverables

1. **The census** — one catalog page: every card / box / widget kind the site has, each named once,
   shown live, where it is used, duplicates marked, and the spacing rule it follows (padding, bleed).
2. **Question and decision cards** as content modules placeable on any page, including inside an ai2 card.
   - question: shows the question, takes an answer (the answer is appended to the card's log).
   - decision: options, each with a caveat; a click appends a line to the card's log; the card shows
     it chosen, the others still visible; it can be changed. Existing `decision` lines in task.jsonl
     render as this same card.
3. **Quotation** — one owner prompt: the words, the time, a link to where it was spoken (record
   shape from card-folders).
4. **A module is a page** — each module placed by one line in a page.jsonl; one page built only from lines.

Data shape first, then looks, for every module.

## Home and fence

- Modules: `public/framework/ux/Content/**` (prefix `ux-content-`): `page.js` the catalog,
  `Question/`, `Decision/`, `Quotation/`, `built/page.jsonl` (the page made only of lines).
- One line each in `ux/page.js` children and `css-scopes.txt`.
- The decision renderer inside `ext/AITask` only if the Decision module can replace it without touching other verbs.
- Never: `core/Page/**`, `core/Router/**`, `public/framework/ai/**`, `ai2/**`, `Server/**`, `Servex/**`.
