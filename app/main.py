import asyncio
import os
from collections import deque
from pathlib import Path
from time import monotonic

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

from app.adaptation import update_knowledge
from app.models import Lesson, LessonRequest, PracticeRequest, PracticeResult
from app.nlp import create_local_lesson
from app.provider import create_remote_lesson, provider_ready
from app.samples import SAMPLES


ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
app = FastAPI(title="Pace", version="1.0.0", description="Accessible, source-grounded learning with explainable practice adaptation.")
generation_slots = asyncio.Semaphore(2)
remote_requests = deque()


@app.middleware("http")
async def security_headers(request: Request, call_next):
    try:
        content_length = int(request.headers.get("content-length", "0"))
    except ValueError:
        return JSONResponse({"detail": "Invalid request size."}, status_code=400)
    if content_length > 100000:
        return JSONResponse({"detail": "This request is too large. Use a shorter lesson."}, status_code=413)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    elif request.url.path == "/" or request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-cache"
    return response


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0", "remote_ai": provider_ready(), "default_mode": "local_nlp"}


@app.get("/api/lessons")
def list_lessons():
    return [{"id": lesson.id, "title": lesson.title, "subtitle": lesson.subtitle, "category": lesson.category, "icon": lesson.icon, "color": lesson.color, "concept_count": len(lesson.concepts), "word_count": lesson.word_count} for lesson in SAMPLES.values()]


@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
def get_lesson(lesson_id: str):
    if lesson_id not in SAMPLES:
        raise HTTPException(404, "This lesson wasn't found. Choose one from your learning space.")
    return SAMPLES[lesson_id]


@app.post("/api/lessons", response_model=Lesson)
async def generate_lesson(payload: LessonRequest):
    if payload.mode == "remote" and not provider_ready():
        raise HTTPException(503, "Cloud explanations aren't configured. Choose local processing.")
    if payload.mode == "remote":
        now = monotonic()
        while remote_requests and remote_requests[0] < now - 3600:
            remote_requests.popleft()
        if len(remote_requests) >= int(os.getenv("PACE_AI_HOURLY_LIMIT", "12")):
            raise HTTPException(429, "The cloud generation limit has been reached. Local processing is still available.")
        remote_requests.append(now)
    try:
        async with generation_slots:
            if payload.mode == "remote":
                return await create_remote_lesson(payload.source, payload.title)
            return await run_in_threadpool(create_local_lesson, payload.source, payload.title)
    except (ValueError, ValidationError) as error:
        if isinstance(error, ValidationError):
            raise HTTPException(422, "The generated lesson didn't pass validation. Try local processing or a different passage.") from error
        raise HTTPException(422, str(error)) from error
    except (httpx.HTTPError, KeyError, TypeError) as error:
        raise HTTPException(502, "The AI service couldn't complete the lesson. Your text is still here; retry or use local processing.") from error


@app.post("/api/practice", response_model=PracticeResult)
def practice(payload: PracticeRequest):
    return update_knowledge(payload.prior, payload.correct, payload.attempts)


@app.get("/")
def home():
    return FileResponse(ROOT / "static" / "index.html")


app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")
