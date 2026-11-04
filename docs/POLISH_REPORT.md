# Pace polish and verification — November 4, 2026

Follow-up: [the final readiness check](READINESS.md) verifies the previously pending duplicate-lesson, remembering-off, exact-scroll and full water-cycle keyboard checks. Other limitations below remain as recorded.

Status: small fixes applied locally; 38 Python tests and 7 JavaScript tests pass. No deployment, publishing, Git initialization or competition submission performed. This report records the completed checks and the remaining manual checks; it is not an accessibility certification.

## Rollback snapshot

Before editing, copied and hash-verified 36 files to:
backups/pace-before-polish-20261103-204237/

SNAPSHOT.json contains the actual timestamp and file hashes. The snapshot excludes the virtual environment, caches, Git metadata and recursive backups. It includes original source, assets, documentation, dependency lock and previous project archive. To roll back source changes, copy the corresponding files from this snapshot over their current counterparts, then rerun tests. Do not backdate any later commits.

## Bugs fixed

- Unsubmitted radio answers disappeared when smaller-step preferences rebuilt the reader. Draft choices now persist by concept and question.
- An open source passage collapsed when the reader rerendered. Its open state now persists.
- Preference rerenders could disconnect the original focus target. Closing the dialog now finds the corresponding visible control and restores focus.
- Recreating the same custom lesson replaced its saved session. Existing sessions are now retained.
- Stale narration callbacks could affect a later narration session. Stop detaches callbacks before cancellation.
- Browser network/non-JSON failures could expose technical errors. The client now shows a short retry message.
- Blank lesson names now fail validation, including direct API calls.
- Browser caching retained old styles during review. Static assets now revalidate, and asset URLs have an explicit revision.
- The header and reader overflowed at 320 px. Minimum grid widths and compact header spacing now keep the page within the viewport.
- Clearing a session now tolerates unavailable browser storage.

Reader scroll position is also saved on page exit and restored on initial reload. This needs final manual confirmation on Swayam's browser; do not assume identical pixel restoration after changing viewport size.

## Polish

Kept the original palette, font families, page structure, lesson content, controls, assets and adaptive policy. Darkened faint secondary labels within the existing green palette. Increased measured interactive targets to at least 44 px, including card arrows and preference controls. Added visible “Correct answer” and “Your answer” labels through CSS so feedback does not depend on colour. Made the existing “Why this next step?” disclosure more prominent. Preserved all original screenshots and documents.

## Functional evidence

| Test | Result / method |
| --- | --- |
| Fresh session | Used localhost origin separately from the original 127.0.0.1 preview |
| Three sample lessons | Completed all ten concepts, opened their source passages and reached all three summaries |
| Repeated incorrect answers | Two incorrect evaporation answers produced distinct follow-ups; the third question could be answered and the learner could continue |
| Correct answers | Two correct plant-ingredient answers produced the advance recommendation |
| Exhausted questions | Clear message appeared; Continue learning remained usable |
| Saved progress | Reload retained current concept, follow-up, draft choice, source state and preferences |
| Preferences | Tested 16/20/28 px, all three spacing values across sessions, contrast and focus on/off, smaller steps, narration speed selection |
| Export | Downloaded the QA record: three lessons, ten concepts, thirteen answers |
| Reset | Tested Keep my data, then confirmed reset of the disposable localhost QA session; reload showed empty progress |
| Empty input | Browser required-field message appeared |
| Whitespace/short passage | Friendly 35-word guidance appeared in the form |
| Non-English passage | Hindi input produced an English-content error in the form |
| Long/emoji/odd-line-break inputs | API regression tests reject oversized/emoji-only input; valid English plus special characters and odd line breaks returns grounded source quotes |
| Missing speech API | JavaScript unit test checks the unsupported-browser text fallback |
| Network and invalid response | JavaScript unit tests verify friendly messages and cancellation handling |
| Console/server logs | Inspected browser logs were empty; inspected server requests succeeded without tracebacks |
| Installation | Installed the locked runtime plus dev dependencies into a new Python 3.12 environment; tests and pip dependency check passed |

The special-character and oversized cases were not all replayed in the browser form. API tests do not establish every browser's native validation presentation. The Remember my progress off/reload behaviour and duplicate-custom-lesson preservation still need a final manual replay.

## Accessibility and responsive evidence

- Used Enter and Space to activate lesson navigation, answers, submission and follow-ups.
- Verified the skip link moves focus into main content while preserving the route.
- Used Tab to reach the library primary action and reader preferences; Escape closes preferences and returns focus. Native dialog focus was contained during the inspected sequence.
- Inspected semantic headings, labelled controls, radio groups, live status feedback and source disclosures.
- Measured library and reader at 320, 360, 768, 1280 and 1600 px: page width equalled viewport width at each size; measured interactive targets were at least 44 px.
- Read-only DOM contrast calculations identified faint text. Corrected the measured labels in library, reader and preferences. Normal and high-contrast modes were inspected. The decorative logo dot retains its original colour; it is not instructional text.
- Reduced-motion CSS remains present and unchanged. OS reduced-motion behaviour was not directly exercised.
- Touch-target measurements count the enclosing clickable label for radio/checkbox controls.
- Narrow screenshots used viewport emulation, not physical phones.

Not verified: VoiceOver/NVDA output, a complete Tab-only journey without any direct locator focus, every contrast pair/state, actual 200% browser zoom, mobile hardware, separate Chrome/Firefox/Safari runs, narration audibility or pronunciation, every loading/error state under deliberate server outage, or hosted performance. The in-app browser ignored the zoom shortcut, so 200% is explicitly unverified. Axe-core and Lighthouse were not installed; no score is claimed.

## Content accuracy

Reviewed all 22 prepared questions and their answer keys against the ten original source passages. Each has one supported keyed answer. The lesson and adaptation source files are preserved unchanged from the backup.

Some distractors are clearly wrong but weak rather than plausible: “Release rain,” “The battery grows,” “Water and rocks,” and “Helium.” These are suggestions for a future content revision; the user's instruction to preserve lesson content took precedence. Local generated word-recall questions are not assessed as equivalent to teacher-written conceptual questions.

## Suggested but NOT done

- Pause/resume narration, shorter-sentence rewriting and interactive term explanations: these are not existing controls.
- A Student A / Student B comparison screen, teacher dashboard, new accessibility presets, or revised adaptive model.
- Improving the weakest sample distractors or replacing broad background reference links with specific explanatory pages.
- Removing repeated entry points such as Add a lesson / Bring a lesson or sidebar / header preferences. They may be useful access points; none were removed.
- Removing icons or assets based on a superficial unused-code check. No deletion was performed.
- Production accessibility or learning-effectiveness claims.

## Six recommended screenshots

1. Learning library with the primary start action and three sample cards.
2. Preferences showing enlarged text and line spacing.
3. Wrong-answer smaller-step banner with “Why this next step?” expanded.
4. Source passage alongside its explanation.
5. Journey summary showing actual practice counts.
6. Reader at 320/360 px showing readable text and reachable controls.

Existing screenshots remain in docs/screenshots. polished-reader.jpg captures the updated feedback; polished-library.jpg captures the final library.

## Swayam's final manual checklist

1. In your normal browser, open a private window and start The water cycle using only Tab, arrows, Space and Enter. Check focus throughout.
2. Choose an answer without submitting; change preferences; reload. Confirm the same answer, concept and source view remain.
3. Try read aloud, stop, switching concepts during narration, and each speed. Pause/resume is not implemented.
4. At 200% browser zoom and on your phone, check the library, reader, preferences, summary and custom form for cutoffs.
5. Paste your own notes, try a very long passage, then create the identical lesson again and confirm progress remains. Turn remembering off, reload, and check the new-session behaviour.
6. Export progress, open the JSON, and test reset only in the private QA window.
7. Rehearse the Asha demo, check participant spelling against registration, and review the public-file package before authorizing deployment.

The event deadline is November 4, 2026 at 8:00 PM IST, per the supplied rules. The local preview is not a submission or public hosted demo.

