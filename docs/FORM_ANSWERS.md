# Pace — current form answers

**Verified delivery links:** public repository https://github.com/SXShadow/pace-neural-storm · live demo https://pace-neural-storm.onrender.com. Both are saved in the confirmed event entry; no video link exists. The hypothetical field guidance below was prepared before publication.

Copy only the answer beneath the matching field. These are prepared answers, not a claim that every field appears on the dashboard. Respect the actual form's character limits. Repository/demo/video link fields must use real verified public URLs; those links are currently pending.

## Project title

Pace — Adaptive Learning at Your Own Pace

## Team, participant and problem

Team: Swayam Bangad (solo; verified in event dashboard)  
Participant: Swayam Bangad  
Track: Human Impact  
Problem: HI-03 — Adaptive Learning for Students with Disabilities

## Tagline

Comfortable reading, visible sources and practice that responds to each answer.

## Short description

Pace combines adjustable reading, optional narration and explainable practice adaptation. Students explore prepared lessons or paste English notes; Python TF-IDF builds source-based practice without an API key.

## Project description

Pace addresses a specific barrier: fixed-format written lessons give students limited control over how they access content or what happens when they need another explanation. For Human Impact HI-03, the prototype combines learner-selected reading settings with practice that changes after an answer.

Students can adjust lesson text size, spacing, contrast and focus mode, use keyboard controls and optional browser narration, and study at their own pace. No diagnosis, reading-speed score or account is required. Three prepared science lessons make the initial experience available immediately. Students can also paste an English teaching passage to create a personal learning path.

The default Python pipeline groups source sentences, ranks representative sentences with scikit-learn TF-IDF and cosine similarity, and creates source-word recall questions. Each concept retains an original source passage. The interface distinguishes prepared lessons from local text analysis. Local processing works without an external AI account or API key; on a hosted version it runs on the app server.

Practice uses an illustrative Bayesian Knowledge Tracing model. An incorrect answer produces smaller steps and a different follow-up question. Correct answers lead to reinforcement or a recommendation to advance. The learner can inspect “Why this next step?”, revisit the source, or continue manually. Preferences, lessons and practice can be remembered in the browser; progress can be exported as JSON.

Verification includes 38 passing Python tests, seven passing JavaScript tests, completed browser walkthroughs of all three prepared lessons, and a keyboard-only water-cycle journey. A small local evaluation on three development passages found all 13 generated quotes and 31 source-word questions grounded in their source. These checks measure functional behavior and source fidelity, not learning improvement or general model accuracy.

Pace is an English-only prototype. Its Bayesian parameters are hand-selected, local questions can have weak distractors, and accessibility still needs testing with intended learners and specialists. The next step is a consent-based usability study and stronger pedagogical evaluation. The implementation and AI assistance are documented for reviewers.

## What makes it distinctive?

The core demonstration joins three visible behaviors: a learner controls the reading format, an answer changes the next practice step, and the learner can inspect the original source and recommendation. Prepared lessons, local extraction and optional cloud generation are labelled separately. The default path is reproducible without a paid model service.

## Technology stack

Python 3.12, FastAPI, Pydantic, scikit-learn, NumPy, SciPy, Uvicorn, HTML, CSS, vanilla JavaScript, browser localStorage and speech synthesis. Tests use pytest, httpx/TestClient and Node's built-in test runner. No frontend build step or account database is required.

## Implementation challenges and decisions

The implementation needed to keep reading preferences, question drafts, source views and practice state stable across rerenders and reloads. QA found and fixed lost answer selections, source-state resets, focus restoration and narrow-screen overflow. Extractive NLP was selected for a reproducible no-key default; its limitation is that source-word recall does not provide the richer explanations or question quality of a reviewed teaching system. Cloud generation remains optional and was not live-tested.

## Results / metrics

38 Python tests and seven JavaScript tests pass. All three prepared lessons were completed during browser QA. Library and reader layouts were measured at 320, 360, 768, 1280 and 1600 pixels without page-level horizontal overflow. A keyboard-only water-cycle run reached the summary. On three original development passages, the local generator returned 13/13 source quotes, 13/13 extractive summaries and 31/31 source-word questions grounded in their input. Recorded median in-process generation times were 1.57–1.83 ms on the development Mac; these are not hosted latency or educational-effectiveness metrics.

## Impact and intended users

Pace is intended for students who need adjustable written content and control over the pace of practice, including students with reading, attention, visual or motor access needs. The implemented controls address specific access barriers without collecting a diagnosis. Actual benefits and suitability for particular disabilities remain to be established through testing with intended users.

## Limitations

English teaching passages only. No validated learning-outcome or accessibility-conformance study. Hand-selected, uncalibrated Bayesian parameters. Some sample and generated distractors are weak. Browser/device narration varies. No narration pause/resume, automatic sentence rewriting, interactive term definitions or account synchronization. Separate screen-reader and cross-browser testing remains pending. Optional cloud output has mocked contract tests but no live-provider verification.

## Future work

Test with intended learners and accessibility specialists; improve question distractors and conceptual assessment; calibrate the adaptive model on consented data; verify screen-reader and mobile behavior; and evaluate readability and comprehension before making learning-benefit claims. Multilingual lessons and teacher workflows are future directions, not current features.

## AI tools and reuse disclosure

Codex assisted with code, original educational samples, interface SVG/CSS illustrations, debugging, tests, evaluation and documentation. Swayam Bangad is the sole human participant. The default runtime uses TF-IDF and Bayesian inference, not an external generative AI service. Open-source libraries are listed in the README and dependency files. The optional cloud adapter was not live-tested. Advance rule/planning notes are dated separately from implementation; no commit timestamps were manufactured.

## If asked for “model accuracy”

No educational prediction-accuracy benchmark has been established. Report the scoped functional and source-fidelity results above. Do not label 13/13 quotes, 31/31 word-recall questions or passing tests as 100% learning accuracy.

## Required and optional links

Required public repository: supply the actual GitHub repository URL after publication and signed-out access verification.  
Optional demo: supply the tested HTTPS app URL after deployment.  
Optional video: supply an accessible recording URL after recording and playback verification.  
Do not paste these instructions or the word “pending” into URL fields.
