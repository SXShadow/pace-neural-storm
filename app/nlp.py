import hashlib
import math
import re
from datetime import datetime, timezone

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import Concept, Lesson, Question


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_passage(source: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+|\n\s*\n", source.strip())
    sentences = [normalized(sentence) for sentence in sentences if len(sentence.split()) >= 4]
    if len(sentences) < 2:
        words = normalized(source).split()
        sentences = [" ".join(words[index:index + 35]) for index in range(0, len(words), 35)]
    return [sentence for sentence in sentences if len(sentence.split()) >= 4]


def term_root(term: str) -> str:
    return term[:-1] if len(term) > 4 and term.endswith("s") else term


def concept_title(sentence: str, fallback: str) -> str:
    match = re.match(r"^(.{3,60}?)\s+(?:is|are|was|were|has|have|also has|can|occurs|means|refers|opposes|increases|produces|provides|contains|describes)\b", sentence, re.I)
    return match.group(1).strip().capitalize() if match else fallback.capitalize()


def create_local_lesson(source: str, title: str) -> Lesson:
    sentences = split_passage(source)
    if len(sentences) < 2 or len(source.split()) < 35:
        raise ValueError("Add at least 35 words of English lesson text, with two or more sentences.")
    source_text = normalized(source)
    spans = []
    cursor = 0
    for sentence in sentences:
        start = source_text.index(sentence, cursor)
        cursor = start + len(sentence)
        spans.append((start, cursor))
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z-]{2,}\b", max_features=1800)
    try:
        matrix = vectorizer.fit_transform(sentences)
    except ValueError as error:
        raise ValueError("We couldn't identify enough English content words. Try a longer teaching passage.") from error
    features = vectorizer.get_feature_names_out()
    centroid = np.asarray(matrix.mean(axis=0))
    relevance = cosine_similarity(matrix, centroid).ravel()
    overall = np.asarray(matrix.sum(axis=0)).ravel()
    ordered_terms = [str(features[index]) for index in overall.argsort()[::-1] if " " not in features[index]]
    if len(ordered_terms) < 4:
        raise ValueError("Add more varied lesson text so we can create meaningful practice choices.")
    chunk_size = max(1, math.ceil(len(sentences) / 5))
    concepts = []
    for offset in range(0, len(sentences), chunk_size):
        indexes = list(range(offset, min(offset + chunk_size, len(sentences))))
        selected = sorted(indexes, key=lambda index: relevance[index], reverse=True)
        chunk_sentences = [sentences[index] for index in indexes]
        chunk_source = source_text[spans[indexes[0]][0]:spans[indexes[-1]][1]]
        scores = np.asarray(matrix[indexes].sum(axis=0)).ravel()
        terms = [str(features[index]) for index in scores.argsort()[::-1] if scores[index] > 0]
        key_terms = [term for term in terms if " " not in term][:6]
        questions = []
        used_terms = set()
        for sentence_index in selected:
            sentence = sentences[sentence_index]
            for term in key_terms:
                if term in used_terms or not re.search(r"\b" + re.escape(term) + r"\b", sentence, re.I):
                    continue
                distractors = [candidate for candidate in ordered_terms if term_root(candidate) != term_root(term) and not re.search(r"\b" + re.escape(candidate) + r"\b", sentence, re.I)][:3]
                if len(distractors) < 2:
                    distractors = [candidate for candidate in ordered_terms if term_root(candidate) != term_root(term)][:3]
                if len(distractors) < 1:
                    continue
                options = [term] + distractors
                options.sort(key=lambda option: hashlib.sha256((sentence + option).encode()).hexdigest())
                missing = re.sub(r"\b" + re.escape(term) + r"\b", "_____", sentence, count=1, flags=re.I)
                questions.append(Question(prompt="Which word completes this line from your source?\n" + missing, options=options, answer=options.index(term), explanation=f'The original passage says: “{sentence}”'))
                used_terms.add(term)
                break
            if len(questions) >= 3:
                break
        if not questions:
            continue
        summary = sentences[selected[0]]
        steps = chunk_sentences[:6]
        concepts.append(Concept(
            id=f"concept-{len(concepts) + 1}", title=concept_title(chunk_sentences[0], key_terms[0]), summary=summary,
            steps=steps, example=chunk_sentences[-1], source_quote=chunk_source,
            source_index=len(concepts), keywords=key_terms[:4], questions=questions,
        ))
    if not concepts:
        raise ValueError("We couldn't create practice questions from this passage. Try clearer, complete sentences.")
    return Lesson(
        id="custom-" + hashlib.sha256((source + title).encode()).hexdigest()[:12],
        title=title.strip(), subtitle="Your material. A more comfortable way through it.",
        category="YOUR LESSON", icon="book", color="purple", source=source,
        source_label="Your supplied passage", concepts=concepts, mode="local_nlp",
        method="TF-IDF keyphrases and centroid sentence ranking; extractive summaries and source-word practice. No generative model used.",
        word_count=len(source.split()), created_at=datetime.now(timezone.utc).isoformat(),
    )
