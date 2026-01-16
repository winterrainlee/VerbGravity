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
    # v1.1: 복수 root/subject 지원
    roots: List[Optional[int]]
    subjects: List[Optional[int]]
    subjectSpans: List[List[int]] = []

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
    mode: str = 'FULL'

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
    mode: str = 'FULL'
    progress: List[ProgressItem] = []

# Admin models
class AdminLoginRequest(BaseModel):
    password: str

class StudentSummary(BaseModel):
    studentId: str
    displayName: str
    totalSentences: int
    completedSentences: int
    rootCorrect: int
    subjectCorrect: int
    mode: str = 'FULL'
    lastCompletedAt: Optional[str] = None

class AdminSessionsResponse(BaseModel):
    students: List[StudentSummary]
    sessions: List[dict] # Detailed session mapping info

class AssignStudentRequest(BaseModel):
    student_name: str # In MVP, we might just use display name to find/create student

# Passage models (v1.1)
class PassageCreateRequest(BaseModel):
    title: str
    content: str

class PassageItem(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str

class PassageListResponse(BaseModel):
    passages: List[PassageItem]
