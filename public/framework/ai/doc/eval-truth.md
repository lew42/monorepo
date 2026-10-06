# Ground Truth & Evaluation in AI Systems

The dilemma of evaluating model correctness: what is "truth", how to avoid circular grading, and how to verify answers objectively.

## 1. The Core Dilemma: What is "Truth"?

When evaluating AI performance, deciding whether an answer is "correct" quickly runs into epistemological traps:
1. **The "Smart Model as Oracle" Fallacy:**
   - Generating a "correct" answer with an expensive model (e.g. Claude Opus or GPT-4o) and grading other models against it assumes the oracle was truthful. Oracles hallucinate, prefer verbose phrasing, and can be subtly incorrect on domain-specific framework code.
2. **LLM-as-a-Judge Noise:**
   - Asking a second model to grade Model B against Model A introduces double variance:
     - Did the student answer correctly?
     - Did the judge accurately understand both the rubric and the student's reasoning?
   - Two different judges often disagree on identical outputs, especially on non-binary questions (CSS layout, architecture design, API aesthetics).
3. **Subjective Truth vs. Deterministic Truth:**
   - Style, naming, and architectural hierarchy have no single mathematical truth.
   - Code execution, syntax parsing, and AST shape DO have absolute truth.

---

## 2. The Three Tiers of Verifiable Truth

To make evaluations robust rather than subjective, test suites in this framework should prioritize deterministic proofs over semantic similarity:

| Tier | Evaluation Type | How Truth is Determined | Reliability |
| :--- | :--- | :--- | :--- |
| **Tier 1: Mechanical Proof** | **Code Execution & Tests** | Unit tests pass/fail, exit code `0`, JSON parsers, smoke tests, headless browser DOM assertions. | **100% Deterministic** |
| **Tier 2: Structural Verification** | **Coverage & Accounting** | AST linting, sentence ID accounting (`S1..Sn` placed once with no omissions), word overlap against raw text. | **High (Code-Enforced)** |
| **Tier 3: Semantic Judgment** | **LLM Grading / Rubric** | A model grades whether an explanation is "clear" or an answer "faithful". | **Subjective (Caveated)** |

---

## 3. Practical Guidance for Framework AI

1. **Prefer Running Code Over Asking a Model:**
   - Never ask an AI: *"Does this component render properly?"*
   - Take a screenshot with headless Chromium (`shot`) or query the computed DOM box with `eval`. Pixels and bounding boxes are truth; an LLM's guess is speculation.
2. **Do Not Rely on Unanimous Agreement:**
   - Even if three models all agree on an answer, they may simply share common training biases. Agreement is not truth.
3. **Capture Options with Tradeoffs:**
   - When an agent investigates open questions or architectural debates, it should never declare an arbitrary winner. It must record the specific options, their constraints, and their consequences into a `doc/*.md` file.
