"""Measure generated cloze-question flags without changing generation or lessons.

Run from the repository root: python -m scripts.evaluate_questions
The JSON includes every question and distractor so the heuristics can be audited.
"""

import argparse
import hashlib
import json
import platform
import re
from datetime import datetime, timezone
from pathlib import Path

from app.nlp import create_local_lesson
from app.samples import SAMPLES


ROOT = Path(__file__).resolve().parent.parent
COMMON_VERBS = {
    "absorb", "allow", "become", "break", "change", "collect", "contain",
    "control", "describe", "enter", "fall", "flow", "gain", "gather", "grow",
    "help", "include", "make", "move", "need", "oppose", "produce", "provide",
    "pull", "release", "resist", "return", "soak", "stop", "store", "support",
    "supply", "take", "turn", "use",
}


def contains_word(text: str, word: str) -> bool:
    """Case-insensitive whole-token match, including words beside punctuation."""
    return bool(re.search(r"(?<!\w)" + re.escape(word) + r"(?!\w)", text, re.I))


def coarse_pos(word: str) -> str:
    """Crude word-form guess, not a contextual part-of-speech annotation."""
    word = word.casefold()
    if word.endswith("ly"):
        return "adverb-like"
    if word.endswith(("tion", "sion", "ment", "ness", "ity", "ance", "ence")):
        return "noun-like"
    verb_forms = {word, word[:-1] if word.endswith("s") else word,
                  word[:-2] if word.endswith("es") else word,
                  word[:-3] + "y" if word.endswith("ies") else word}
    if verb_forms & COMMON_VERBS or word.endswith(("ing", "ed", "ize", "ise")):
        return "verb-like"
    if word.endswith(("ous", "ful", "less", "able", "ible", "ive", "al", "ic")):
        return "adjective-like"
    return "noun-like"


def rate(flagged: int, total: int) -> dict:
    return {"flagged": flagged, "total": total,
            "rate": round(flagged / total, 6) if total else None,
            "percent": round(100 * flagged / total, 2) if total else None}


def summarize(questions: list[dict]) -> dict:
    distractors = [item for question in questions for item in question["distractors"]]
    return {
        "question_count": len(questions),
        "distractor_count": len(distractors),
        "answer_leak": rate(sum(q["answer_leak"] for q in questions), len(questions)),
        "ambiguity_proxy": rate(sum(q["ambiguity_proxy"] for q in questions), len(questions)),
        "distractor_source_overlap": rate(sum(d["in_source_quote"] for d in distractors), len(distractors)),
        "no_pos_or_length_match": rate(sum(d["no_pos_or_length_match"] for d in distractors), len(distractors)),
        "pos_mismatch": rate(sum(not d["pos_match"] for d in distractors), len(distractors)),
        "length_mismatch": rate(sum(not d["length_match"] for d in distractors), len(distractors)),
        "questions_with_mismatched_distractor": rate(
            sum(any(d["no_pos_or_length_match"] for d in q["distractors"]) for q in questions), len(questions)),
    }


def evaluate_question(question, source_quote: str, concept_id: str, index: int) -> dict:
    answer = question.options[question.answer]
    answer_pos = coarse_pos(answer)
    distractors = []
    for option_index, option in enumerate(question.options):
        if option_index == question.answer:
            continue
        pos = coarse_pos(option)
        pos_match = pos == answer_pos
        length_match = abs(len(option) - len(answer)) <= 2
        distractors.append({
            "option_index": option_index, "text": option,
            "in_source_quote": contains_word(source_quote, option),
            "pos_guess": pos, "length_characters": len(option),
            "pos_match": pos_match, "length_match": length_match,
            "no_pos_or_length_match": not pos_match and not length_match,
        })
    return {
        "concept_id": concept_id, "question_index": index,
        "prompt": question.prompt, "source_quote": source_quote,
        "answer_index": question.answer, "answer": answer,
        "answer_pos_guess": answer_pos, "answer_length_characters": len(answer),
        "answer_leak": contains_word(question.prompt, answer),
        "ambiguity_proxy": any(d["in_source_quote"] for d in distractors),
        "distractors": distractors,
    }


def evaluate() -> dict:
    passages = [(sample.id, sample.title, sample.source, "app.samples.SAMPLES")
                for sample in SAMPLES.values()]
    passages.append(("demo-gravity", "Demo gravity passage",
                     (ROOT / "docs/demo-input.txt").read_text(encoding="utf-8"), "docs/demo-input.txt"))
    cases = []
    all_questions = []
    for case_id, title, source, origin in passages:
        generated = create_local_lesson(source, title)
        questions = [evaluate_question(question, concept.source_quote, concept.id, index)
                     for concept in generated.concepts
                     for index, question in enumerate(concept.questions)]
        cases.append({"id": case_id, "title": title, "input": origin,
                      "source_sha256": hashlib.sha256(source.encode("utf-8")).hexdigest(),
                      "concept_count": len(generated.concepts),
                      "summary": summarize(questions), "questions": questions})
        all_questions.extend(questions)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "environment": {"python": platform.python_version(), "platform": platform.system(),
                        "machine": platform.machine()},
        "measurement_script_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "scope": "All locally generated questions from the three complete sample passages and docs/demo-input.txt; prepared sample questions are not scored.",
        "definitions": {
            "answer_leak": "Question-level: the correct blank word still appears as a case-insensitive whole token anywhere in the complete prompt, including its instruction line.",
            "ambiguity_proxy": "Question-level: at least one distractor appears as a case-insensitive whole token in the same concept's source quote. This is source co-occurrence, not proof of multiple semantically correct answers.",
            "no_pos_or_length_match": "Distractor-level: both its coarse word-class guess differs from the answer's and its character length differs by more than two. Either matching dimension prevents this flag.",
            "pos_heuristic": "A small declared verb list and ordered suffix rules, with a noun-like fallback. No contextual POS tagger, model download, or new dependency. Categories can be wrong, particularly for words with multiple grammatical uses.",
            "length_heuristic": "Length matches when the absolute character-count difference is at most two; this cutoff is an unvalidated descriptive heuristic.",
        },
        "limitations": [
            "Four development passages are not an independent or representative benchmark.",
            "Flags are reproducible diagnostics, not model accuracy, teaching quality, or learning-outcome measurements.",
            "Source co-occurrence can flag a distractor even when it cannot grammatically or semantically fill the blank.",
            "The POS/length heuristic can miss poor distractors or flag acceptable ones; inspect the included question-level details.",
            "The earlier 13/13 quote and 31/31 question results are grounding checks that hold by construction, not evidence of question quality.",
        ],
        "summary": summarize(all_questions), "cases": cases,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "docs/evaluation_questions.json")
    args = parser.parse_args()
    result = evaluate()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "summary": result["summary"],
                      "cases": [{"id": case["id"], **case["summary"]} for case in result["cases"]]}, indent=2))


if __name__ == "__main__":
    main()
