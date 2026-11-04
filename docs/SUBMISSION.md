# Submission preparation

**Final delivery:** the public [repository](https://github.com/SXShadow/pace-neural-storm) and tested [demo](https://pace-neural-storm.onrender.com) have been saved in the event submission. See [delivery verification](DELIVERY_STATUS.md). Earlier checklist states below are retained for provenance. Registered participant/team: Swayam Bangad (solo).

**Use for the final form:** [FORM_ANSWERS.md](FORM_ANSWERS.md) contains current copy-ready answers and scoped results. [START_HERE.md](START_HERE.md) maps every supplied requirement to evidence and the remaining external actions. The earlier 28-test paragraph below is historical.

**November 4 readiness update:** 38 Python tests and seven JavaScript tests pass. All three prepared lessons were completed during QA; the water-cycle flow was additionally completed using only the keyboard. The 28-test evidence below is the earlier November 3 record. See [current readiness and pending delivery gates](READINESS.md) before copying final submission text. Public repository, hosted demo and event submission are still pending.

**Project:** Pace — A little progress, at your own pace  
**Track/problem:** Human Impact · HI-03  
**Team:** Pace Lab  
**Participant:** Swayam Banagd (solo)

## Short description

Pace is an adaptive learning companion for students who need more control over how they read and practise. It combines adjustable reading, optional narration, source-visible lessons, and Python Bayesian practice adaptation. Learners can study prepared examples or paste their own English passage; the default NLP pipeline works without an API key.

## Problem and solution

Fixed-format lessons can create barriers for students with reading, attention, visual or motor access needs. Pace lets a learner choose text size, spacing, contrast and focus settings without sharing a diagnosis. After an incorrect answer, it offers smaller steps and a new question, explains why, and preserves access to the original source. Progress records describe practice rather than assigning an ability label.

## Technical implementation

Python FastAPI serves a semantic HTML/CSS/JavaScript interface. scikit-learn TF-IDF ranks source sentences and builds extractive lesson segments and source-word recall questions. Bayesian Knowledge Tracing updates per-concept estimates and recommends scaffolding, reinforcement or progression. Browser-local storage keeps preferences and practice; JSON export gives learners access to their record. An optional cloud adapter is explicit opt-in and validates structured output and source quotes.

## Evidence and limitations

28 automated tests passed. Manual browser checks covered generated lessons, adaptive practice, preferences, persistence, source inspection, summary and JSON export. At 390 px, the tested library and reader had no page-level horizontal overflow after a grid fix. Local generation evaluation found all 13 quotes and 31 source-word questions grounded across three development passages. This is functional evidence, not a learning-outcome study. The prototype is English-only, uncalibrated, and not certified for accessibility compliance.

## Before final submission

- [x] Complete local implementation with Python AI/NLP components.
- [x] README with team, problem, approach, setup, screenshots, results and AI disclosure.
- [x] Automated tests and an actual evaluation report.
- [x] Rehearsable demonstration script.
- [ ] Review participant spelling against the registration: supplied spelling is “Swayam Banagd.”
- [ ] Publish and verify a public GitHub repository containing complete code.
- [ ] Deploy and test the public HTTPS demo.
- [ ] Record the demonstration or prepare the live presentation.
- [ ] Replace delivery-status notes in README with verified repository/demo links.
- [ ] Submit through the event dashboard's Submit tab before **November 4, 2026, 8:00 PM IST**.
- [ ] Save the submission confirmation and verify submitted links from a signed-out browser.

Public repository URL: pending publication.  
Hosted demo URL: pending deployment.  
Video URL: pending recording.

These pending fields are status notes, not links to paste into the event form. Do not submit localhost as the hosted demo. The deadline and requirements above come from the user's supplied screenshots; check any subsequent organizer announcements before submission.

## Rubric mapping

| Criterion | Evidence |
| --- | --- |
| Technical, 35% | Python NLP, explainable Bayesian update, validation and tests |
| Impact, 25% | Specific access barriers, learner choice, source-visible feedback, honest scope |
| Documentation, 20% | Reproducible README, architecture, evaluation, accessibility notes |
| Demonstration, 20% | Working learner flow, responsive UI, screenshots, demo script; hosted demo still pending |

