from typing import List, Optional
from pydantic import BaseModel

class TokenItem(BaseModel):
    id: int
    text: str
    start: int
    end: int
    pos: str      # UPOS (e.g., "VERB", "NOUN")
    tag: str      # Detailed POS (e.g., "VBZ")
    dep: str      # Dependency (e.g., "ROOT", "nsubj")

class AnswerKey(BaseModel):
    root: int
    subject: Optional[int]
    subjectSpan: List[int] = []

class SentenceItem(BaseModel):
    id: int
    text: str
    tokens: List[TokenItem]
    key: AnswerKey

class AnalysisMeta(BaseModel):
    totalSentences: int
    model: str

class PassageRequest(BaseModel):
    passage: str

class AnalysisResponse(BaseModel):
    sentences: List[SentenceItem]
    meta: AnalysisMeta

# Session models
class CreateSessionRequest(BaseModel):
    passage_text: str
    total_sentences: int

class ProgressItem(BaseModel):
    sentence_index: int
    root_answer: Optional[int] = None
    root_correct: bool
    subject_answer: Optional[int] = None
    subject_correct: bool

class ProgressRequest(BaseModel):
    sentence_index: int
    root_answer: Optional[int] = None
    root_correct: bool
    subject_answer: Optional[int] = None
    subject_correct: bool

class SessionResponse(BaseModel):
    id: str
    created_at: str
    passage_text: str
    total_sentences: int
    progress: List[ProgressItem] = []
