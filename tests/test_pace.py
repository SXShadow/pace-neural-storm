import asyncio
import json
import math

import httpx
import pytest
from fastapi.testclient import TestClient

from app.adaptation import update_knowledge
from app.main import app, remote_requests
from app.models import Question
from app.nlp import create_local_lesson, normalized
from app.provider import create_remote_lesson, provider_ready
from app.samples import SAMPLES


client = TestClient(app)
SOURCE = (
    "Gravity is a force of attraction between objects that have mass. "
    "Earth's gravity pulls objects toward its centre. The Moon also has gravity, but its surface gravity is weaker than Earth's. "
    "Mass is the amount of matter in an object and does not change just because its location changes. "
    "Weight is the force of gravity acting on an object's mass. An astronaut has the same mass on the Moon but weighs less there. "
    "Air resistance is a force that opposes movement through air. A parachute increases air resistance and helps slow a falling person."
)


def test_home_and_assets_are_served():
    response = client.get("/")
    assert response.status_code == 200
    assert "Skip to main content" in response.text
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/static/styles.css").status_code == 200
    assert client.get("/static/favicon.svg").status_code == 200


def test_security_headers_and_no_cache():
    response = client.get("/api/health")
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["cache-control"] == "no-store"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
    assert client.get("/static/styles.css").headers["cache-control"] == "no-cache"
    assert client.get("/").headers["cache-control"] == "no-cache"


def test_sample_catalog_and_full_lesson():
    catalog = client.get("/api/lessons").json()
    assert len(catalog) == 3
    for item in catalog:
        response = client.get("/api/lessons/" + item["id"])
        assert response.status_code == 200
        assert len(response.json()["concepts"]) == item["concept_count"]


def test_unknown_lesson_is_not_silently_replaced():
    assert client.get("/api/lessons/missing").status_code == 404


@pytest.mark.parametrize("lesson", list(SAMPLES.values()), ids=list(SAMPLES))
def test_sample_questions_have_distinct_valid_answers_and_source(lesson):
    assert lesson.mode == "sample"
    for concept in lesson.concepts:
        assert concept.source_quote in lesson.source
        assert concept.questions
        for question in concept.questions:
            assert len(set(question.options)) == len(question.options)
            assert 0 <= question.answer < len(question.options)
            assert len(question.explanation) > 10


@pytest.mark.parametrize("prompt, answer_index, correct_option, evidence", [
    ("Which gas do plants use to make sugars?", 1, "Carbon dioxide", "make sugars from water and carbon dioxide"),
    ("What is chlorophyll's role?", 0, "Absorb light", "chlorophyll, a pigment that absorbs light energy"),
    ("Which pair is produced by photosynthesis?", 2, "Sugars and oxygen", "Photosynthesis produces sugars and releases oxygen"),
    ("What happens when a wire disconnects in a simple circuit?", 1, "The current stops", "A gap in the path stops current"),
    ("What does a simple circuit need for current to flow?", 0, "A complete conducting path", "a complete conducting path and a potential difference"),
])
def test_polished_sample_distractors_preserve_the_source_supported_answer(prompt, answer_index, correct_option, evidence):
    matches = [(concept, question) for lesson in SAMPLES.values() for concept in lesson.concepts
               for question in concept.questions if question.prompt == prompt]
    assert len(matches) == 1
    concept, question = matches[0]
    assert question.answer == answer_index
    assert question.options[question.answer] == correct_option
    assert question.options.count(correct_option) == 1
    assert len(set(question.options)) == len(question.options)
    assert evidence in concept.source_quote


def test_local_nlp_uses_actual_input_and_preserves_evidence():
    lesson = create_local_lesson(SOURCE, "Gravity notes")
    assert lesson.mode == "local_nlp"
    assert lesson.title == "Gravity notes"
    assert 2 <= len(lesson.concepts) <= 5
    assert "TF-IDF" in lesson.method
    for concept in lesson.concepts:
        assert normalized(concept.source_quote) in normalized(SOURCE)
        assert normalized(concept.summary) in normalized(concept.source_quote)
        for question in concept.questions:
            answer = question.options[question.answer]
            completed = question.prompt.split("\n", 1)[1].replace("_____", answer)
            assert normalized(completed).lower() in normalized(concept.source_quote).lower()


def test_source_quotes_preserve_short_intervening_sentences():
    source = SOURCE.replace("objects that have mass. ", "objects that have mass. Look closely. ")
    lesson = create_local_lesson(source, "Gravity with a short aside")
    assert any("Look closely." in concept.source_quote for concept in lesson.concepts)
    for concept in lesson.concepts:
        assert concept.source_quote in normalized(source)


def test_generation_is_deterministic_and_input_sensitive():
    first = create_local_lesson(SOURCE, "Gravity")
    again = create_local_lesson(SOURCE, "Gravity")
    other = create_local_lesson(SAMPLES["plant-energy"].source, "Plants")
    assert first.id == again.id
    assert first.concepts == again.concepts
    assert first.id != other.id
    assert first.concepts != other.concepts


def test_custom_lesson_endpoint():
    response = client.post("/api/lessons", json={"title":"Gravity", "source":SOURCE})
    assert response.status_code == 200
    assert response.json()["mode"] == "local_nlp"


@pytest.mark.parametrize("source", ["", " " * 120, "Gravity pulls objects down.", "Water moves through a cycle. " * 1200, "पानी सूरज की गर्मी से भाप बनता है। बादल से पानी बारिश के रूप में नीचे आता है। " * 10, "🌱 " * 100])
def test_custom_input_edge_cases_do_not_crash(source):
    response = client.post("/api/lessons", json={"title":"Audit input", "source":source})
    assert response.status_code == 422
    assert response.json()["detail"]


@pytest.mark.parametrize("source", [SOURCE + ' 🌱 <script>alert(1)</script> & "notes"', SOURCE.replace('. ', '.\n\n\t')])
def test_custom_special_characters_and_line_breaks(source):
    response = client.post("/api/lessons", json={"title":"Safe source", "source":source})
    assert response.status_code == 200
    for concept in response.json()["concepts"]:
        assert normalized(concept["source_quote"]) in normalized(source)


@pytest.mark.parametrize("title", ["   ", "\n\t"])
def test_blank_lesson_names_are_rejected(title):
    assert client.post("/api/lessons", json={"title":title,"source":SOURCE}).status_code == 422


@pytest.mark.parametrize("source", ["too short", " " * 200, "the and of " * 50])
def test_unusable_input_is_rejected(source):
    assert client.post("/api/lessons", json={"title":"Test", "source":source}).status_code == 422


def test_request_size_is_bounded():
    response = client.post("/api/lessons", content=json.dumps({"source":"word " * 25000,"title":"Too long"}), headers={"content-type":"application/json"})
    assert response.status_code == 413


@pytest.mark.parametrize("prior", [0, 0.01, 0.2, 0.5, 0.99, 1])
def test_bayesian_model_is_bounded_and_correctness_sensitive(prior):
    right = update_knowledge(prior, True)
    wrong = update_knowledge(prior, False)
    assert 0 <= wrong.probability <= right.probability <= 1
    assert wrong.action == "scaffold"
    assert math.isfinite(right.probability)


def test_repeated_success_unlocks_advance_and_error_requests_scaffold():
    first = update_knowledge(0.2, True)
    second = update_knowledge(first.probability, True, 1)
    assert first.action == "reinforce"
    assert second.action == "advance"
    assert second.attempts == 2
    incorrect = update_knowledge(second.probability, False, 2)
    assert incorrect.action == "scaffold"
    assert incorrect.probability < second.probability


def test_practice_contract_and_validation():
    response = client.post("/api/practice", json={"prior":0.2,"correct":False,"attempts":0})
    assert response.status_code == 200
    assert response.json()["action"] == "scaffold"
    assert client.post("/api/practice", json={"prior":2,"correct":True}).status_code == 422


def test_question_schema_rejects_bad_answers():
    with pytest.raises(ValueError):
        Question(prompt="Which one?", options=["one","two"], answer=3, explanation="A sufficiently long explanation.")


def test_remote_mode_never_silently_fakes_generation(monkeypatch):
    monkeypatch.setenv("PACE_ALLOW_REMOTE_AI", "false")
    assert not provider_ready()
    response = client.post("/api/lessons", json={"title":"Gravity","source":SOURCE,"mode":"remote"})
    assert response.status_code == 503


def configure_remote(monkeypatch):
    monkeypatch.setenv("PACE_ALLOW_REMOTE_AI", "true")
    monkeypatch.setenv("PACE_AI_BASE_URL", "https://provider.example/v1")
    monkeypatch.setenv("PACE_AI_MODEL", "test-model")
    monkeypatch.setenv("PACE_AI_API_KEY", "test-only-key")


def test_remote_validated_response_with_mock_transport(monkeypatch):
    configure_remote(monkeypatch)
    generated = create_local_lesson(SOURCE, "Gravity")
    content = {"concepts":[concept.model_dump() for concept in generated.concepts]}
    async def fake_post(self, url, **kwargs):
        assert url == "https://provider.example/v1/chat/completions"
        assert kwargs["headers"]["Authorization"] == "Bearer test-only-key"
        assert "Gravity" in kwargs["json"]["messages"][1]["content"]
        return httpx.Response(200, json={"choices":[{"message":{"content":json.dumps(content)}}]}, request=httpx.Request("POST",url))
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    result = asyncio.run(create_remote_lesson(SOURCE, "Gravity"))
    assert result.mode == "remote_ai"
    assert len(result.concepts) >= 2


def test_remote_invented_source_is_rejected(monkeypatch):
    configure_remote(monkeypatch)
    generated = create_local_lesson(SOURCE, "Gravity")
    content = {"concepts":[concept.model_dump() for concept in generated.concepts]}
    content["concepts"][0]["source_quote"] = "This passage does not appear in the student's source."
    async def fake_post(self, url, **kwargs):
        return httpx.Response(200, json={"choices":[{"message":{"content":json.dumps(content)}}]}, request=httpx.Request("POST",url))
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    with pytest.raises(ValueError, match="couldn't find"):
        asyncio.run(create_remote_lesson(SOURCE, "Gravity"))


def test_remote_budget_limit(monkeypatch):
    configure_remote(monkeypatch)
    monkeypatch.setenv("PACE_AI_HOURLY_LIMIT", "0")
    remote_requests.clear()
    response = client.post("/api/lessons", json={"title":"Gravity","source":SOURCE,"mode":"remote"})
    assert response.status_code == 429
