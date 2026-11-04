# Submission readiness — November 4, 2026

**Later delivery update:** [DELIVERY_STATUS.md](DELIVERY_STATUS.md) confirms public publication, the hosted demo and saved event submission. Pending external steps below describe the earlier audit state and are retained as historical records.

Verdict: the local prototype is ready for participant acceptance testing and preparation for publication. The hackathon submission is **not complete**. No claim of perfection, accessibility certification, proven learning outcomes, or guaranteed prizes is made.

This follow-up supplements POLISH_REPORT.md. Earlier observations remain historical records; the checks below resolve some items previously marked unverified. No application code changed during this readiness pass.

## Newly verified

- Completed a fresh water-cycle journey from the library primary action to the summary using Tab, arrow keys, Space and Enter, without mouse clicks or direct locator focus during that journey. Included an incorrect answer, the why disclosure, a correct follow-up and the other three concepts. The summary showed four concepts, five questions and four correct answers. Screenshot: screenshots/keyboard-journey.jpg.
- Created a new local NLP lesson from an original gravity passage, answered its question, then created the identical lesson again. The saved correct answer remained.
- Turned remembering off in the disposable localhost QA session and reloaded. The custom lesson was no longer saved; its stale URL showed a friendly lesson-not-found message with a working return link. The separate 127.0.0.1 user session was not cleared.
- Opened a source passage, reloaded, and observed the same evaporation concept, open passage and scroll position (469.5 CSS pixels before and after) at the same viewport size.
- Reran all 38 Python tests, all seven JavaScript tests, JavaScript syntax validation and Python dependency checks: passed. One upstream Starlette/httpx deprecation warning remains.
- Checked the home page, static assets, health, lesson catalog and all three prepared-lesson API routes with FastAPI TestClient: all returned 200. Real browser generation and practice also worked. A separate shell HTTP smoke probe was blocked by the sandbox's network restriction; this is not an application failure.
- Inspected browser warnings/errors after the keyboard journey: none recorded.
- Checked local Markdown links in README and docs: no missing local targets. Confirmed the license, blank .env.example, requirements, lockfile and demo script are present. This check does not verify external reference sites.

## Delivery gates

| Item | Current status |
| --- | --- |
| Local learner flow and Python NLP/adaptation | Verified within the documented test scope |
| README, screenshots, evaluation, AI disclosure, license, demo script | Present |
| Fresh dependency installation | Passed during the preceding polish pass |
| Participant name | Uses the user's supplied “Swayam Banagd”; confirm against registration |
| User acceptance on own browser/phone | Pending |
| Required public GitHub repository | Pending; no local Git repository initialized |
| Hosted HTTPS demonstration | Pending; optional under supplied rules, strongly recommended |
| Demo recording or rehearsed live presentation | Script ready; recording/rehearsal pending |
| Verified public links in README/submission | Pending publication and deployment |
| Event dashboard submission and confirmation | Pending; mandatory to enter |

The deadline in the user's supplied rules is **November 4, 2026 at 8:00 PM IST**. The local preview is not accessible to judges as a hosted demo. Publishing, deployment and submission remain paused under the user's explicit instruction to review locally first.

## Known limits, not hidden failures

VoiceOver/NVDA output, physical-phone behavior, actual 200% browser zoom, audible narration, independent Chrome/Firefox/Safari runs, all loading/failure states and hosted performance remain unverified. The completed keyboard journey is evidence for that specific flow, not every possible interaction. Axe/Lighthouse were unavailable.

Pause/resume narration, automatic simpler-sentence rewrites and interactive term explanations are not implemented controls. Local NLP is extractive source-word practice, not generative simplification. Prepared distractors include some weak choices; sample content was preserved as requested. The adaptive model is illustrative and uncalibrated. None of these should be presented as completed or scientifically validated capabilities.

## Next steps, in order

1. Swayam checks the water-cycle wrong-answer flow, preferences/reload, audio, phone and 200% zoom, and confirms participant spelling.
2. After explicit authorization, publish the reviewed code to a public GitHub repository and verify access while signed out.
3. Deploy the default no-key app if authorized, test the public URL, and add verified links to the documentation.
4. Rehearse or record docs/ASHA_DEMO.md with actual working behavior.
5. Submit through the event dashboard before the deadline, inspect the submitted links, and retain confirmation.
