# Pace — judge questions

## What is the core contribution?

A working flow combines learner-controlled reading, source-visible explanations and answer-dependent practice. The strongest demonstration is an incorrect evaporation answer producing smaller steps, a why explanation and a different follow-up, with the option to continue manually.

## Where is the AI/ML?

Python uses scikit-learn TF-IDF and cosine similarity to select representative sentences for custom lessons. A Bayesian Knowledge Tracing update guides practice recommendations. The default path does not use a pretrained language model. Prepared examples are original authored lessons, labelled as prepared.

## Does adaptation actually change after answers?

Yes. An incorrect answer requests scaffolding, which displays smaller steps and offers another question. A correct answer can request reinforcement or advancement. From the initial prior, two correct observations produce estimates 0.5526 and 0.8439; the latter exceeds the 0.80 advance threshold. These are model estimates, not validated mastery scores. A learner can override the suggested pace.

## What is personalized?

The learner selects text size, spacing, contrast, focus and narration speed. Practice responds to the answer sequence within each concept. The app does not infer a disability or use reading speed as a proxy for ability.

## Why not just a chatbot?

The prototype offers a repeatable lesson → source → practice → follow-up journey. It makes the practice recommendation inspectable, keeps the source available and does not require conversational prompting to control reading settings. We have not established superiority over existing tools.

## Which disabilities does it support?

The project targets particular reading and interaction barriers through adjustable presentation, keyboard operation and optional narration. We have scoped browser evidence for these behaviors. We cannot claim comprehensive support for dyslexia, blindness or motor disabilities, and screen-reader behavior still needs dedicated testing.

## Have real students used it?

No intended-user study is documented. Asha is a fictional demo persona. The next step is consent-based testing with learners and accessibility specialists.

## What does the evaluation prove?

Passing tests and exercised browser flows establish scoped functional behavior. The earlier 13/13 quotes and 31/31 restored questions are grounding checks that hold by construction. The four-passage diagnostic audit flags answer leakage in 3/39 prompts, distractor/source co-occurrence in 30/39 questions, and a crude POS/length mismatch in 9/117 distractors. Co-occurrence is not proof of multiple correct answers, and the heuristic is not a contextual POS tagger. None establishes comprehension improvement, readability gains, general quiz quality or clinical validity. Measured generator timings are local in-process timings.

## Where is student data stored?

When enabled, preferences, source text and answers are saved in localStorage in that browser. The app has no lesson database. Custom generation sends input to the app server; optional cloud mode sends it to the configured provider only when selected. Browser narration may use remote voice services. Export produces JSON; it is not an importable backup.

## Does it work offline?

No full offline/PWA capability is implemented. The default path avoids an external model service, but still requires the Python app server and the initial dependencies. No-key operation should not be described as browser-only offline operation.

## How is hallucination handled?

Local summaries are extracted from source sentences, and original quotes are visible. This does not establish that the source itself is correct. Optional cloud mode checks structure and quote grounding, which cannot guarantee every generated claim is correct. That mode was not live-tested.

## What is the biggest limitation?

The model parameters are illustrative, and source-word recall is weaker than well-designed conceptual assessment. The prototype needs better questions, intended-user evidence and model calibration before educational claims.

## What was built and reused?

Project code, original prepared samples, UI SVG/CSS and integration were created with Codex assistance during the documented implementation period. Open-source frameworks and libraries were reused. Dated advance notes remain distinguishable from implementation. The README discloses assistance.

## Why are pause/resume or simpler-language rewriting missing?

The prototype focuses on adjustable presentation, small-step delivery and explainable practice. Narration has start/stop and speed control. The local pipeline is extractive; pause/resume, sentence rewriting and interactive definitions are future work.

## What comes next?

Validate the interaction with intended learners, improve question quality, calibrate the adaptive policy and complete assistive-technology testing. Expansion to languages, teacher tools or accounts should follow evidence about the core experience.
