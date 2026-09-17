# new-page — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- 2026-09-06 (doodles): the file skeleton shows `p("Body.")` and it reads as "a factory
  is a View". It is not — `img`/`div`/`p` are FUNCTIONS, so `img.attr("src", u)` throws
  `img.attr is not a function` and the whole page renders nothing. The two forms that
  work are `img()` and `img.c("cls")`. One line in the skeleton comment would have
  saved a render.
