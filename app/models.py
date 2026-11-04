from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class Question(BaseModel):
    prompt: str = Field(min_length=5, max_length=1000)
    options: list[str] = Field(min_length=2, max_length=5)
    answer: int = Field(ge=0, le=4)
    explanation: str = Field(min_length=5, max_length=1500)

    @model_validator(mode="after")
    def validate_options(self):
        if self.answer >= len(self.options) or len(set(self.options)) != len(self.options):
            raise ValueError("Question options must be distinct and include the answer.")
        return self


class Concept(BaseModel):
    id: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=1, max_length=100)
    summary: str = Field(min_length=10, max_length=2500)
    steps: list[str] = Field(min_length=1, max_length=8)
    example: str = Field(max_length=1500)
    source_quote: str = Field(min_length=10, max_length=5000)
    source_index: int = Field(ge=0)
    keywords: list[str] = Field(default_factory=list, max_length=8)
    questions: list[Question] = Field(min_length=1, max_length=4)


class Lesson(BaseModel):
    id: str
    title: str
    subtitle: str
    category: str
    icon: str
    color: str
    source: str
    source_label: str
    source_url: str = ""
    concepts: list[Concept]
    mode: Literal["sample", "local_nlp", "remote_ai"]
    method: str
    word_count: int
    created_at: str


class LessonRequest(BaseModel):
    title: str = Field(default="My lesson", min_length=1, max_length=100)
    source: str = Field(min_length=100, max_length=24000)
    mode: Literal["local", "remote"] = "local"

    @field_validator("title", "source", mode="before")
    @classmethod
    def trim_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class PracticeRequest(BaseModel):
    prior: float = Field(default=0.2, ge=0, le=1)
    correct: bool
    attempts: int = Field(default=0, ge=0, le=10000)


class PracticeResult(BaseModel):
    probability: float
    action: Literal["scaffold", "reinforce", "advance"]
    label: str
    reason: str
    attempts: int
