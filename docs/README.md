# Pace documentation and evidence

Start with the [project README](../README.md). For a quick review, open the [demo script](DEMO_SCRIPT.md), [QA evidence](POLISH_REPORT.md) or [hosted verification](DELIVERY_STATUS.md).

## Guides and project records

| File | Purpose |
| --- | --- |
| [README.md](README.md) | This complete documentation index |
| [START_HERE.md](START_HERE.md) | Current reviewer/submission guide |
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | Consolidated 2½-minute fictional Asha story, preparation and fallback |
| [demo-input.txt](demo-input.txt) | Original gravity passage for live input |
| [JUDGE_QA.md](JUDGE_QA.md) | Technical, impact, privacy and limitation answers |
| [PITCH_OUTLINE.md](PITCH_OUTLINE.md) | Optional six-part spoken/slide outline |
| [SUBMISSION.md](SUBMISSION.md) | Saved project identity, delivery links and rubric mapping |
| [FORM_ANSWERS.md](FORM_ANSWERS.md) | Prepared form descriptions, results and honest limits |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Reproduction configuration for the Python service and optional Docker path |
| [DELIVERY_STATUS.md](DELIVERY_STATUS.md) | Public-source comparison, actual hosted checks and saved-submission evidence |
| [POLISH_REPORT.md](POLISH_REPORT.md) | Detailed functional, responsive and accessibility QA with limits |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Scoped accessibility methods and unverified assistive-technology behavior |
| [evaluation.json](evaluation.json) | Historical generation timings, grounding checks that hold by construction, and BKT sequences |
| [evaluation_questions.json](evaluation_questions.json) | Four-passage question-level leakage, source co-occurrence and distractor diagnostics, with definitions and full details |
| [../scripts/evaluate_questions.py](../scripts/evaluate_questions.py) | Measurement-only script; run with `python -m scripts.evaluate_questions` |
| [../.github/workflows/ci.yml](../.github/workflows/ci.yml) | Python 3.12 and Node 24 test jobs; the static local-test badge is independent of CI |
| [BUILD_LOG.md](BUILD_LOG.md) | Development provenance, historical 28-test results and former header material |
| [NEURAL_STORM_BRIEF.md](NEURAL_STORM_BRIEF.md) | Original screenshot rules plus verified 72-hour organizer update |

## Archived records

These files were moved, not deleted. They retain dated observations and former instructions/statuses for historical context; they are not current operating instructions or evidence of a new verification run. Relative links were repaired after the move. BUILD_LOG.md remains unchanged.

| File | Purpose |
| --- | --- |
| [archive/AGENTS.md](archive/AGENTS.md) | Historical agent context and attribution |
| [archive/DOCS_REVIEW.md](archive/DOCS_REVIEW.md) | November 4 documentation-review methods and scope |
| [archive/READINESS.md](archive/READINESS.md) | November 4 keyboard/persistence checks and historical delivery gates |

## Screenshots and visual assets

Captures are real local prototype views. They illustrate QA, not a study with learners. [Capture notes](screenshots/README.md) explain their use.

| File | Purpose |
| --- | --- |
| [screenshots/README.md](screenshots/README.md) | Full screenshot inventory and capture boundaries |
| [screenshots/library.jpg](screenshots/library.jpg) | 1280 × 720 library view used in the README hero |
| [screenshots/polished-library.jpg](screenshots/polished-library.jpg) | Later full library capture |
| [screenshots/preferences.jpg](screenshots/preferences.jpg) | Original preferences capture |
| [screenshots/preferences-large-contrast.jpg](screenshots/preferences-large-contrast.jpg) | New local capture showing 28 px text and contrast enabled |
| [screenshots/polished-reader.jpg](screenshots/polished-reader.jpg) | Smaller steps and expanded why recommendation after an incorrect answer |
| [screenshots/adaptive-reader.jpg](screenshots/adaptive-reader.jpg) | Earlier adaptive-reader evidence retained |
| [screenshots/source-passage.jpg](screenshots/source-passage.jpg) | Expanded original source passage |
| [screenshots/keyboard-journey.jpg](screenshots/keyboard-journey.jpg) | Four concepts, five attempts and four correct answers in keyboard QA |
| [screenshots/mobile.jpg](screenshots/mobile.jpg) | 390 × 844 emulated mobile library |
| [screenshots/narrow-reader.jpg](screenshots/narrow-reader.jpg) | 360 px emulated reader capture |
| [badges/license.svg](badges/license.svg) | Local MIT-license badge |
| [badges/python.svg](badges/python.svg) | Local Python 3.12 badge |
| [badges/tests.svg](badges/tests.svg) | Static badge for the November 5 local 43 Python + 21 JavaScript results; not CI status |

## Technical and design references

- [scikit-learn text feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html)
- [FastAPI static files](https://fastapi.tiangolo.com/tutorial/static-files/)
- [MDN speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [W3C accessibility principles](https://www.w3.org/WAI/fundamentals/accessibility-principles/)
- [W3C guidance on clear content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)

Reference guidance is not a conformance certification. Local account-free NLP runs on the app server; it is not an offline browser-only implementation.
