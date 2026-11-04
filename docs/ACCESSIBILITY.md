# Accessibility and browser verification

November 4 update: see [POLISH_REPORT.md](POLISH_REPORT.md) for the newer checks, corrections, 320–1600 px measurements, and remaining manual checks. The original November 3 record below is preserved.

Recorded November 3, 2026. This is a scoped engineering check, not a WCAG conformance audit or a study with disabled learners.

## Intended support

- Learners can enlarge lesson content, increase line spacing and request stronger contrast.
- Smaller steps and focus mode reduce the amount of surrounding material.
- Browser speech synthesis provides optional audio; visible text remains the primary fallback.
- Keyboard controls, labelled radio questions, native dialogs and semantic landmarks support non-pointer interaction.
- Practice is untimed and does not use reading speed, camera data or disability inference.
- The learner can override smaller-step presentation and move between concepts.

## Verified in the browser

| Check | Observation |
| --- | --- |
| Library and reader at 390 px | No page-level horizontal overflow after correcting grid minimum widths |
| Desktop reader | Source disclosure, concept navigation and controls rendered |
| Text and spacing | 24 px text and 2.2 line height produced 52.8 px computed line height |
| Preferences dialog | Keyboard range adjustment worked; Escape closed the dialog and focus returned to the invoking Preferences button |
| Focus and contrast controls | Focus mode hid sidebar and concept outline; preference controls remained reachable to leave that mode |
| Skip link | Enter focused main content without navigating away from the reader |
| Feedback | Wrong answer produced smaller-step guidance; follow-up was a distinct question |
| Answer persistence | Correct/incorrect answers and preferences survived reload |
| Complete journey | Four water-cycle concepts appeared in summary; six attempts and four correct answers matched the exercised flow |
| Data export | Actual JSON downloaded and contained the expected practice records |
| Mobile data controls | About/data action added to mobile navigation rather than hiding the only access |
| Custom lesson | A gravity passage produced a separate local NLP learning path |
| Narration controls | Start changed the button to Stop reading; Stop returned it to Read aloud without a console error; audio itself was not independently verified |

The accessibility tree exposed headings, labelled controls, radio groups and feedback. That is not equivalent to verifying spoken output in a screen reader.

## Not yet verified

- VoiceOver/NVDA screen-reader announcements and navigation in a real assistive-technology session.
- Actual narration audibility, voice quality and pronunciation across devices.
- Full contrast measurement, WCAG audit, 200–400% browser zoom, switch access and browser matrix.
- Usability with intended learners and improvement in comprehension or retention.
- Mobile hardware testing: 390 px testing used browser viewport emulation.
- Live cloud output quality and hosted deployment.

## Known scope limitations and next work

The interface includes small secondary labels; lesson text controls enlarge learning content, not all application text. Browser zoom remains available. Colour contrast should receive a full audit before broad use. Local NLP retains original vocabulary and can generate weak distractors. The sample lessons cover basic science only. No OCR, scanned PDFs, sign-language translation, offline service worker, multilingual instruction or teacher dashboard is implemented.

Prioritize a teacher review of questions, testing with keyboard and screen-reader users, and a small consent-based learner study before claiming accessibility conformance or educational effectiveness.

