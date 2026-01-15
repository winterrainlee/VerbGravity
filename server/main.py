from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    PassageRequest, AnalysisResponse,
    CreateSessionRequest, SessionResponse, ProgressRequest, ProgressItem
)
from nlp.analyzer import analyze_passage
from db.database import init_db, get_db
import uvicorn
import uuid
from datetime import datetime

app = FastAPI(title="VerbGravity API")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# CORS Setup (Allow frontend to connect from any origin for LAN access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for LAN development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VerbGravity API is running"}

@app.post("/api/analyze-passage", response_model=AnalysisResponse)
def analyze_passage_endpoint(request: PassageRequest):
    if len(request.passage) > 2000:
        raise HTTPException(status_code=400, detail="Passage is too long (max 2000 chars).")
    
    try:
        result = analyze_passage(request.passage)
        return result
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Session APIs
@app.post("/api/sessions")
def create_session(request: CreateSessionRequest):
    """Create a new session and return its UUID."""
    session_id = str(uuid.uuid4())
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (id, passage_text, total_sentences) VALUES (?, ?, ?)",
            (session_id, request.passage_text, request.total_sentences)
        )
        conn.commit()
    
    return {"id": session_id}

@app.get("/api/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str):
    """Get session info with progress."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get session
        cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        session = cursor.fetchone()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get progress
        cursor.execute(
            "SELECT sentence_index, root_answer, root_correct, subject_answer, subject_correct FROM progress WHERE session_id = ? ORDER BY sentence_index",
            (session_id,)
        )
        progress_rows = cursor.fetchall()
        
        progress = [
            ProgressItem(
                sentence_index=row["sentence_index"],
                root_answer=row["root_answer"],
                root_correct=bool(row["root_correct"]),
                subject_answer=row["subject_answer"],
                subject_correct=bool(row["subject_correct"])
            )
            for row in progress_rows
        ]
        
        return SessionResponse(
            id=session["id"],
            created_at=session["created_at"],
            passage_text=session["passage_text"],
            total_sentences=session["total_sentences"],
            progress=progress
        )

@app.put("/api/sessions/{session_id}/progress")
def save_progress(session_id: str, request: ProgressRequest):
    """Save progress for a sentence."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check session exists
        cursor.execute("SELECT id FROM sessions WHERE id = ?", (session_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Upsert progress (INSERT OR REPLACE)
        cursor.execute("""
            INSERT OR REPLACE INTO progress 
            (session_id, sentence_index, root_answer, root_correct, subject_answer, subject_correct, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            request.sentence_index,
            request.root_answer,
            request.root_correct,
            request.subject_answer,
            request.subject_correct,
            datetime.utcnow().isoformat()
        ))
        conn.commit()
    
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

