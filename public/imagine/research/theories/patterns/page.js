import { Page, md } from "/app.js";

/* Round 6, the synthesis round. The sibling `synthesis/` page argues the SUBJECT
   — what the entries say about stone, depictions, disclosure and the theories
   underneath them. This page reads the CORPUS as an object: what recurs across
   four topics that no single-topic round could see, and the one new hypothesis
   the reading produced.

   Container: a child of theories/, inside /imagine/'s columns host — the column
   is the width, so no `wide`, no breakout. Size + own layout: inherited, same as
   synthesis; the page is one md() call. Regions: one. Preview: the default card.

   Every number here is a tally over the four log.jsonl files and re-runnable;
   each has its own entry in theories/log.jsonl, so nothing rests on this page's
   word. The hypothesis in §6 is logged `theory` / `speculation`, and its
   strongest counter-entry is logged separately and named in the text — if a
   later round kills it, that entry is where it dies.

   Length is deliberate: ~950 words, about half the capstone. The five patterns
   are one screen, the hypothesis the second. Anything longer buries §6. */

export default new Page({
	meta: import.meta,
	title: "What Recurs",
	description: "Round 6 reads the corpus itself: five patterns across all four topics, and one new falsifiable hypothesis — that custody, not funding, decides which measurement ever gets made.",
	icon: "layers",

	content(){
		md(`The [synthesis](/imagine/research/theories/synthesis/) page argues the subject. This one reads the **corpus** — the 358 entries five rounds produced across four topics, by four diggers who mostly could not see each other's work. Every number below is a tally anyone can re-run over the four \`log.jsonl\` files, and each has its own entry in [\`theories/log.jsonl\`](/imagine/research/theories/log.jsonl).

---

## 1. Credence tracks grammar, not subject · *established*

All four logs land the same mapping from entry **kind** to **credence**, independently: \`finding\` is 84% established (134/159), \`source\` 86%, \`theory\` 52% fringe, \`question\` 61% speculation, \`opinion\` 67% contested. No finding and no source is ever graded speculation.

The consequence matters more than the tidiness: **almost none of the disagreement here lives at the finding layer.** Sixty-nine opinions and forty-six theories carry it — the two kinds a reader skims.

## 2. Fringe may track the speaker, not the evidence · *speculation*

Fringe-graded entries per topic: stone 14 of 111, depictions 10 of 79, theories 7 of 87, **disclosure 4 of 81**. The topic most associated in public with fringe belief holds the *least* fringe-graded material in the program.

Why is visible in the entries. Untested testimony from credentialed officials — Grusch under oath, the 34 on camera in *Age of Disclosure* — grades **contested**; unreleased measurements of much the same standing, from self-published analysts, grade **fringe**. The credence words are defined by who agrees, so this may be the vocabulary working exactly as written. But *fringe* then carries a sociological reading and *contested* an institutional one, and a reader comparing topics will take that for an evidential difference. What would settle it: strip claimant identity from a sample and have a second coder grade from the evidence alone.

## 3. Source quality inverts the expectation · *established*

The corpus cites **150 distinct domains**, and \`en.wikipedia.org\` carries 63 of them — 18% of every citation in a program about what we actually know, six times the next most-cited source.

Then round 4's audit scored the topics backwards from the naive guess. [Depictions](/imagine/research/depictions/), leaning hardest on encyclopedic and aggregator sources, scored **worst** (5 wrong-or-unreachable of 15). [Stone](/imagine/research/stone/), leaning hardest on self-published analysts — gizapower, UnchartedX, Hall of Ma'at, Metabunk — scored **best** (2 of 15). A source that names its instrument is easier to check than one that summarises.

## 4. Three claim-types, three half-lives · *contested*

- **Mechanism claims carrying a rate** went five rounds untouched: Stocks at 5.2 cm³/hour drilling, the Brooklyn drill-hole geometry, the Bayesian Tiwanaku chronology.
- **Single-instrument numbers decayed** — five reversals or retractions in eighteen months, and every one was a number: Hiawatha's date, Tall el-Hammam, the PLOS ONE shocked quartz, Qvist's radial deviations, Fomitchev-Zamilov's lathe marks.
- **Testimony did not move at all.** Nothing a round can dig touches it. Round 5's best effort added a second witness to the tape-removal story — and a rival account from inside the same witness pool.

## 5. Every correction fixed a citation · *established*

Nine entries across the four logs are titled **Correction:**. Every one re-pinned a url or an attribution; seven say so in their own text, twice verbatim: *the fact was always real, just pointed at the wrong page.*

The substantive corrections carry no such title. They are round-5 entries that *narrow an inference* — the 2012 protocol objection turning out to target a study four years earlier; Kennett's own blind split having found a spike, 1,300 years off the boundary. **Provenance error is cheap to audit and was caught in bulk; inference error is expensive, and surfaced only by chasing three leads to their primary sources.**

---

## 6. The new hypothesis: custody, not funding · *speculation*

The capstone's §2 says the decisive measurement is missing everywhere; round 4 narrowed *why* to **attempted once, disputed, never repeated**. The explanation on offer is structural — Nosek's [near-zero replication funding](https://undark.org/2017/09/11/replication-crisis-funding/). All four logs read together suggest a rival, testable on the same cases.

> **Whether a dispute's decisive measurement gets made is predicted not by cost, permits or plausibility, but by whether some named institution is already responsible for documenting that specific object** — an accession number, a catalog entry, a registered-monument listing, an evidence chain.

**What motivates it.** Every instrument study in this corpus was performed on a documented item: 19 accessioned Petrie Museum vessels; a Brooklyn Museum sarcophagus's [drill hole](https://www.penn.museum/sites/expedition/ancient-egyptian-stone-drilling/), measured at 24 cm long and tapering 4%; the 1,419 dolerite pounders Engelbach *collected* at Aswan; Hiawatha's shocked zircons; AARO's chain-of-custody metal sample; and Saqqara's **registered** pyramids in the 2026 laser survey — the survey that never turned toward [the Serapeum boxes](/imagine/research/stone/serapeum/) at the same site.

Every decades-old gap sits on a reachable object that is on nobody's inventory: those boxes (gallery contents, not catalogued objects), the [Giza coffer](/imagine/research/stone/giza-coffer/), [Barabar's](/imagine/research/stone/barabar-caves/) interiors, the private-collection [vases](/imagine/research/stone/predynastic-vases/) with no findspot, the [Princeton tapes](/imagine/research/disclosure/aatip-videos/) that may have been reused precisely because nothing listed them, and a Karahan Tepe face-pillar announced by tweet with no locus and no find number.

**What would kill it:** one published instrument study of an object central to a dispute here that carries no accession, catalog or registration number.

**The strongest counter, named.** Petrie's Core 7 is **LDUCE-UC16036** — [accessioned in the Petrie Museum](https://collections.ucl.ac.uk/Details/collect/26868) for over a century, and the single physical object behind Christopher Dunn's most falsifiable claim. The 2025 metrology study measured 19 *other* vessels and left it alone. **Custody is plainly not sufficient**; the hypothesis survives only as a necessary condition, and a reader should weigh Core 7 against it before believing any of the above.

---

## What round 7 should dig

1. **Free, internal.** Code every object named across the four logs for documentation status — accession, catalog, registered monument, evidence chain, or none — against whether a published instrument study exists. The table this page sketches, done exhaustively.
2. **The kill shot.** Do the 24 Serapeum boxes carry individual Egyptian Ministry registration numbers? If they do, and thirty years have still produced nothing, documentation is not the gate and the funding explanation stands unrivalled.
3. **Head to head.** One case where a funded team wanted to measure an undocumented object and could not, against one where the documentation existed and the funding did not.

Two older threads are custody-shaped too, and neither has been pulled: the Princeton AEGIS retention records, which no FOIA has ever asked for, and LeCompte's reply to Boslough, which round 4's own skeptic pass flagged as the side it read less closely.

The evidence: [stone](/imagine/research/stone/log.jsonl) · [depictions](/imagine/research/depictions/log.jsonl) · [disclosure](/imagine/research/disclosure/log.jsonl) · [theories](/imagine/research/theories/log.jsonl) — 368 entries now, appended in the order they were found, none rewritten.`);
	},
});
