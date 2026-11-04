# Neural Storm 2026: rules and project brief

Recorded on October 31, 2026, from four rules screenshots supplied by the user. These are advance planning notes, not project implementation. Reconcile any later official updates with these notes and flag material changes to the user.

## Sources and precedence

The supplied screenshots cover eligibility, hackathon rules, submission requirements, and scoring. They are the source of the event requirements below. Our proposed implementation and verification practices are separately identified.

- `codex-clipboard-9af2394e-e69f-4ec5-97e8-eb13190daa8e.png`: eligibility and team rules.
- `codex-clipboard-a210029e-6f5f-4674-a1bf-87a7c73b7dc1.png`: hackathon rules.
- `codex-clipboard-af4729ea-2635-4f74-9345-0b353a493ec7.png`: submission and README requirements.
- `codex-clipboard-b529b163-6c75-496e-ac5a-447c0496adea.png`: judging weights and tiebreakers.

These screenshots supersede earlier assumptions in this conversation about submission through Unstop and the absence of published judging weights. Use the event dashboard's Submit tab unless an official update changes the instruction. The organizer site is https://neuralstorm.dev/.

## Selected direction and status

- Event: Neural Storm 2026.
- Track: Human Impact.
- Problem: HI-03, Adaptive Learning for Students with Disabilities.
- Participation intent: solo.
- Registration completion: confirmed by the user on October 31, 2026.
- Current college enrollment: confirmed by the user on October 31, 2026.
- Project title as of these advance notes: undecided. November 3 implementation update: **Pace**, team **Pace Lab**, participant **Swayam Banagd**.

The problem asks for a personalized learning platform using AI to tailor content delivery, pacing, and format to individual cognitive and physical needs.

Proposed scope: a learner pastes one lesson, chooses accessibility preferences, studies short explanations with optional narration, and answers a short quiz. Answers guide follow-up explanations and practice. Provide adjustable text and spacing, keyboard operation, and screen-reader-compatible structure. These are proposed features, not organizer-mandated implementations or verified capabilities.

## Eligibility and registration

- Open to currently enrolled college students across India; the supplied rules list no additional restriction beyond college enrollment.
- Teams have 1–3 members; solo participation is permitted.
- Only the team leader registers. Registration is free.
- List all members in the registration's Team Members field; certificates are issued to listed members.
- Each participant can belong to only one team.
- Complete registration before November 2, 2026 at 8:00 PM IST.

## Build rules and timing

- The stated build period is November 2–4, 2026, lasting 48 hours.
- The submission window is November 2, 2026 at 8:00 PM IST to November 4, 2026 at 8:00 PM IST. Use those boundaries for our implementation window.
- Projects should be built during the hackathon. Reuse of large prebuilt projects is discouraged; the rules recommend starting fresh.
- Python must be the primary language for AI/ML components.
- Open-source libraries, including TensorFlow, PyTorch, and scikit-learn, are allowed and encouraged.
- AI assistants are allowed and encouraged; disclose tools used in the README.
- Work within one of the three official tracks. Teams define the specific problem within their track.
- Do not copy another team's project. Identical-looking submissions may be reviewed and disqualified.
- Treat other participants, organizers, and judges respectfully.

The supplied rules do not explicitly define the boundary for advance research, wireframes, datasets, scaffolding, or other preparation. Do not describe such work as expressly permitted. Keep current activity to understanding requirements and discussing the concept. Seek organizer clarification before relying on permission for advance project deliverables.

## Submission checklist

- Submit while logged in through the Submit tab in the event dashboard.
- Submit before November 4, 2026 at 8:00 PM IST. Late submissions are not accepted.
- Provide a public GitHub repository containing the complete project code.
- A deployment link is optional but strongly recommended. Our intended deliverable includes a working hosted demo.
- One submission per team; updates by resubmission are permitted before the deadline.

README requirements:

- Project title and problem statement number.
- Team name and member names.
- Problem description and approach.
- Technology stack and libraries.
- Setup and installation instructions.
- Local execution instructions.
- Screenshots or a demo GIF of the working project.
- Model accuracy or performance metrics where applicable.
- Disclosure of AI tools used, including Codex and any others actually used.

## Judging and our response

Each criterion is scored out of 10 and weighted as follows:

| Criterion | Weight | Proposed evidence |
| --- | --- | --- |
| Technical implementation | 35% | Working Python AI pipeline, meaningful adaptive decisions, focused tests, reproducible evaluations and measured response times. |
| Impact and usefulness | 25% | Clearly defined learner needs, demonstrated accessibility behavior, user feedback if available, and honest scope limitations. |
| README and documentation | 20% | Complete required sections, reproducible setup, architecture explanation, actual results, and screenshots. |
| Demo and presentation | 20% | Reliable deployed flow and a concise demonstration showing preferences and quiz answers changing the learning experience. |

Tie resolution: higher technical implementation score first, then earlier submission timestamp. The screenshots do not specify how resubmission affects the timestamp used for this comparison.

Aim to submit a valid, complete working entry well before the deadline, then improve it if needed. Do not assume an empty placeholder submission earns tiebreak priority. Documentation and demonstration together account for 40% of the total score; reserve build-window time for both.

## Implementation update, November 3, 2026

The pre-start restrictions above describe advance activity. Implementation began during the build window after the user's instruction to start. The local Pace application, tests, screenshots and documentation are now present. README.md and docs/BUILD_LOG.md describe current evidence and pending publication, deployment and submission. Preserve the original provenance of the advance notes.

## Development timeline evidence

The screenshots do not publish a monitoring or audit procedure. Do not claim the organizers definitely inspect a particular source.

Possible supporting evidence includes incremental repository history, hosting activity, build or deployment logs, and a dated development log. These are suggested records, not published event requirements, and do not conclusively prove when all code was originally written. A newly created repository or a first commit after the start is not proof by itself.

Our approach is to start implementation during the official window, retain an accurate record of progress, disclose reused libraries and AI assistance, and distinguish advance planning from implementation. Do not alter dates or conceal the origin of work. Git commits and remote publishing still require user authorization; no repository or commits have been created as part of these planning notes.

## Competitive objective

The user wants a winning entry. Optimize for the actual rubric through a focused working prototype, technical substance, tested accessibility, clear documentation, and a reliable demonstration. Winning cannot be guaranteed, and there is no evidence that HI-03 has the fewest competitors or the highest win rate.
