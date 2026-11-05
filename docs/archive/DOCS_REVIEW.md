# Local README and documentation review

Prepared November 4, 2026. This report describes the local review pass completed before publication. That pass made no push, publication, deployment or live-site change; publication follows separate participant approval.

## Scope and rollback

Before editing, backed up all 53 project files with SHA-256 hashes in backups/docs-restructure-20261104-173751/snapshot. The adjacent SNAPSHOT.json records real provenance. The workspace originally had no local Git metadata because publication used GitHub's web interface. A separate local audit Git directory inside that backup records the baseline, supports git mv and git status, and has no remote. Its baseline is an audit artifact, not competition implementation history.

All 25 baseline files outside README/docs and the two permitted moved documents are protected by hash comparison. This includes app, static, tests, scripts, Dockerfile, render.yaml, dependency files, pyproject.toml, license and root configuration.

## Changes by file

| File | Change |
| --- | --- |
| [../README.md](../../README.md) | Reordered the pitch; added badges, contents, barrier mapping, deliberate no-key design, concise latest validation, collapsible BKT math, file tree, gallery and future work |
| [README.md](../README.md) | Added a complete index of documents, screenshots, badges and references |
| [AGENTS.md](AGENTS.md) | Moved from root with git mv; repaired references and distinguished historical/current attribution |
| [NEURAL_STORM_BRIEF.md](../NEURAL_STORM_BRIEF.md) | Moved from root with git mv; retained rule dates and noted current attribution/location |
| [DEMO_SCRIPT.md](../DEMO_SCRIPT.md) | Merged Asha timing with original preparation/input/fallback guidance; removed duplicate ASHA_DEMO.md |
| [START_HERE.md](../START_HERE.md) | Replaced contradictory pending gates with current review guidance and one recording TODO |
| [SUBMISSION.md](../SUBMISSION.md) | Consolidated identity, saved links, form guidance and rubric mapping |
| [BUILD_LOG.md](../BUILD_LOG.md) | Retained former README delivery/polish/provenance material and the historical November 3 results |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Corrected hosted-status contradiction; kept Docker unrun and hosted load testing unverified |
| [DELIVERY_STATUS.md](../DELIVERY_STATUS.md) | Linked the confirmed rule extension; removed irrelevant commit-suggestion wording |
| [ACCESSIBILITY.md](../ACCESSIBILITY.md) | Linked later hosting and keyboard evidence while preserving dated checks |
| [READINESS.md](READINESS.md) | Repointed the merged demo reference |
| [PITCH_OUTLINE.md](../PITCH_OUTLINE.md) | Fixed the participant spelling and demo reference |
| [screenshots/README.md](../screenshots/README.md) | Listed every real capture, dimensions and evidence limits |
| [preferences screenshot](../screenshots/preferences-large-contrast.jpg) | Added a real local capture with 28 px text and contrast enabled; no screenshot editing |
| [Local badges](../README.md#screenshots-and-visual-assets) | Added three SVG badges containing existing verified license/version/test facts |
| DOCS_REVIEW.md | This local handoff and verification record |

## Verification

- Ran 38 Python tests and seven JavaScript tests before rewriting and after each coherent documentation batch; all passed. One upstream Starlette/httpx deprecation warning remains.
- Recomputed BKT with app/adaptation.py: two correct observations give 0.5526 then 0.8439. The implementation uses round(..., 4), not truncation.
- Checked barrier claims against static/index.html and static/app.js: adjustable text/spacing/contrast, smaller steps, outline/revisit, native controls, labelled groups, skip link, live feedback and optional narration are present.
- Reused existing why, summary and 390 px screenshots after visual inspection. Captured only the missing large-text/contrast view in the local app, then restored its preferences. No live-site settings were touched.
- Checked 149 internal Markdown/HTML image, link and heading-anchor references across 18 Markdown documents: zero broken targets. Every file below docs is listed in the index. Replaced merged-demo targets and repaired references affected by moving root documents.
- Git status against the audit baseline and hash comparisons establish the change scope: all 25 protected files match the backup. Markdown hard breaks use explicit HTML breaks so git diff --check is clean. No external-link availability audit or new live-hosting test is claimed in this pass; delivery facts are drawn from the existing dated evidence.

## What remains unverified

Docker not run. Cloud provider only mocked. Real screen-reader output, actual 200% zoom, physical phones, narration audibility across devices, independent browser runs, hosted load behavior and learning outcomes remain unverified. The new screenshot does not change those boundaries.

## Manual actions

Review the local [README](../../README.md) before approving any publication. Rehearse the consolidated script, and record it if desired; the only recording-link placeholder is in START_HERE.md. Warm the free-hosted demo before presenting. No uptime pinger, hosting change, new account feature or deployment was configured in this pass.

## Post-deadline edits

The recorded rules allow resubmission before November 5, 2026 at 8:00 PM IST. They do not explicitly authorize or prohibit public repository edits after that deadline. Do not assume permission; obtain organizer clarification before any post-deadline publication. This local pass occurred before the extended deadline.
