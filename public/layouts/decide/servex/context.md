You are choosing the page layout for one real page on this site, /framework/servex/. I will ask you five questions, one at a time. Answer only the question asked, in a few plain sentences a new coder can follow, and name the answer you pick.

The site: a no-build web framework's documentation site. Pages are read on screens from a phone (400px) up to a 3440px ultrawide monitor. The site nav is a left sidebar, about 270px wide, always present on a desktop and collapsed on a phone. A single narrow column on an empty 3440 screen is the failure the owner most wants to avoid.

The page as it is today (a "Doc" page, which has Overview and Notes tabs at the top):
- Title: Servex. Description: "The always-on process that runs the agents and the dev servers."
- One bold sentence: Servex is the one process on this machine that stays up (port 80). It runs the Claude agents, starts and watches the dev servers, and owns every log file. It is not the dev server.
- A heading "Its parts" over five one-line bullets: Agents & roles (links to a doc page), Cards (each card gets an assistant and a manager), Dev servers & proxy (fixed ports, <name>.localhost), Restart (node Servex/sustain.mjs), MCP tools (the door every Claude session uses).
- One line pointing at Servex/readme.md for detail.
- One Notes tab: "roles".

There is no written outline beyond this. Each of the five parts could have its own child page, but only "roles" does today.

The approved layouts: Standard (one column), Split (two columns, any proportion), Columns (three or more), Tile wall (cards of the same shape), Rail + content, Docs three-region (article with its own table of contents).
