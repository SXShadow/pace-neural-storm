import json
import platform
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path

from app.adaptation import update_knowledge
from app.nlp import create_local_lesson, normalized
from app.samples import SAMPLES


def evaluate():
    cases = []
    for sample in SAMPLES.values():
        durations = []
        for repeat in range(5):
            started = time.perf_counter()
            lesson = create_local_lesson(sample.source, sample.title)
            durations.append((time.perf_counter() - started) * 1000)
        quotes = 0
        summaries = 0
        grounded_questions = 0
        question_count = 0
        for concept in lesson.concepts:
            quotes += normalized(concept.source_quote) in normalized(sample.source)
            summaries += normalized(concept.summary) in normalized(concept.source_quote)
            for question in concept.questions:
                question_count += 1
                completed = question.prompt.split("\n", 1)[1].replace("_____", question.options[question.answer])
                grounded_questions += normalized(completed).lower() in normalized(concept.source_quote).lower()
        cases.append({
            "lesson": sample.title,
            "concept_count": len(lesson.concepts),
            "source_quotes_found": quotes,
            "extractive_summaries_found": summaries,
            "question_count": question_count,
            "source_word_questions_grounded": grounded_questions,
            "median_generation_ms": round(statistics.median(durations), 2),
        })
    sequences = {}
    for name, answers in {"two_correct":[True,True], "incorrect_then_correct":[False,True], "three_incorrect":[False,False,False]}.items():
        prior = 0.2
        steps = []
        for index, correct in enumerate(answers):
            result = update_knowledge(prior, correct, index)
            steps.append({"correct":correct, **result.model_dump()})
            prior = result.probability
        sequences[name] = steps
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "environment": {"python":platform.python_version(), "platform":platform.system(), "machine":platform.machine()},
        "scope": "Three original sample passages, five local generation runs each. Functional source-fidelity checks, not an external educational benchmark.",
        "limitations": "Extractive source fidelity does not measure learning effectiveness, readability improvement, semantic quiz quality, or clinical validity. Bayesian parameters are hand-selected and uncalibrated. No live cloud inference was evaluated.",
        "local_nlp_cases": cases,
        "adaptation_sequences": sequences,
    }


if __name__ == "__main__":
    result = evaluate()
    destination = Path(__file__).resolve().parent.parent / "docs" / "evaluation.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
