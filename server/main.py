from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from models import (
    PassageRequest, AnalysisResponse,
    CreateSessionRequest, SessionResponse, ProgressRequest, ProgressItem,
    AdminLoginRequest, AdminSessionsResponse, StudentSummary, AssignStudentRequest
)
from nlp.analyzer import analyze_passage
from db.database import init_db, get_db
from auth.middleware import limiter
import uvicorn
import uuid
import os
import bcrypt
from datetime import datetime

app = FastAPI(title="VerbGravity API")

# Rate Limiter Setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
@limiter.limit("30/minute")
def analyze_passage_endpoint(request: Request, body: PassageRequest):
    if len(body.passage) > 2000:
        raise HTTPException(status_code=400, detail="Passage is too long (max 2000 chars).")
    
    try:
        result = analyze_passage(body.passage)
        return result
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Session APIs
@app.post("/api/sessions")
@limiter.limit("30/minute")
def create_session(request: Request, body: CreateSessionRequest):
    """Create a new session and return its UUID."""
    session_id = str(uuid.uuid4())
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (id, passage_text, total_sentences) VALUES (?, ?, ?)",
            (session_id, body.passage_text, body.total_sentences)
        )
        conn.commit()
    
    return {"id": session_id}

@app.get("/api/sessions/{session_id}", response_model=SessionResponse)
@limiter.limit("30/minute")
def get_session(request: Request, session_id: str):
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
@limiter.limit("60/minute")
def save_progress(request: Request, session_id: str, body: ProgressRequest):
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
            body.sentence_index,
            body.root_answer,
            body.root_correct,
            body.subject_answer,
            body.subject_correct,
            datetime.utcnow().isoformat()
        ))
        conn.commit()
    
    return {"status": "ok"}

# Admin APIs
@app.post("/api/admin/login")
@limiter.limit("5/minute")
def admin_login(request: Request, body: AdminLoginRequest):
    """Admin login using password from environment variable."""
    admin_pw_hash = os.environ.get("VG_ADMIN_PW")
    
    if not admin_pw_hash:
        # Development fallback: allow "admin" if no environment variable is set
        if body.password == "admin":
            return {"status": "ok", "token": "dev-token"}
        raise HTTPException(status_code=500, detail="Admin password not configured")
    
    # Check password against hash
    try:
        if bcrypt.checkpw(body.password.encode('utf-8'), admin_pw_hash.encode('utf-8')):
            return {"status": "ok", "token": "admin-token"} # In real app, use JWT
    except Exception:
        # If hash is not valid bcrypt, try direct comparison (only for dev/misconfiguration)
        if body.password == admin_pw_hash:
            return {"status": "ok", "token": "admin-token"}
            
    raise HTTPException(status_code=401, detail="Invalid password")

@app.get("/api/admin/sessions")
def get_admin_sessions(request: Request):
    """Get all students and sessions for dashboard."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Get student summaries
        cursor.execute("""
            SELECT 
                s.id as studentId,
                s.display_name as displayName,
                (SELECT COALESCE(SUM(sess2.total_sentences), 0) 
                 FROM session_student_map m2 
                 JOIN sessions sess2 ON m2.session_id = sess2.id 
                 WHERE m2.student_id = s.id) as totalSentences,
                COUNT(p.id) as completedSentences,
                COALESCE(SUM(CASE WHEN p.root_correct = 1 THEN 1 ELSE 0 END), 0) as rootCorrect,
                COALESCE(SUM(CASE WHEN p.subject_correct = 1 THEN 1 ELSE 0 END), 0) as subjectCorrect,
                MAX(p.completed_at) as lastCompletedAt
            FROM students s
            LEFT JOIN session_student_map m ON s.id = m.student_id
            LEFT JOIN sessions sess ON m.session_id = sess.id
            LEFT JOIN progress p ON sess.id = p.session_id
            GROUP BY s.id
        """)
        student_rows = cursor.fetchall()
        
        students = [
            StudentSummary(
                studentId=row["studentId"],
                displayName=row["displayName"],
                totalSentences=row["totalSentences"],
                completedSentences=row["completedSentences"],
                rootCorrect=row["rootCorrect"],
                subjectCorrect=row["subjectCorrect"],
                lastCompletedAt=row["lastCompletedAt"]
            )
            for row in student_rows
        ]
        
        # 2. Get all sessions with their matched student
        cursor.execute("""
            SELECT 
                sess.id, 
                sess.created_at, 
                sess.passage_text, 
                sess.total_sentences,
                s.id as student_id,
                s.display_name as student_name
            FROM sessions sess
            LEFT JOIN session_student_map m ON sess.id = m.session_id
            LEFT JOIN students s ON m.student_id = s.id
            ORDER BY sess.created_at DESC
        """)
        session_rows = cursor.fetchall()
        
        sessions = [
            {
                "id": row["id"],
                "created_at": row["created_at"],
                "passage_text": row["passage_text"][:50] + "...",
                "total_sentences": row["total_sentences"],
                "student_id": row["student_id"],
                "student_name": row["student_name"] or "미지정"
            }
            for row in session_rows
        ]
        
        return {"students": students, "sessions": sessions}

@app.put("/api/admin/sessions/{session_id}/assign-student")
def assign_student(session_id: str, body: AssignStudentRequest):
    """Assign a session to a student (creates student if not exists)."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Find or create student
        cursor.execute("SELECT id FROM students WHERE display_name = ?", (body.student_name,))
        student = cursor.fetchone()
        
        if student:
            student_id = student["id"]
        else:
            student_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO students (id, display_name) VALUES (?, ?)", (student_id, body.student_name))
            
        # Update mapping
        cursor.execute("DELETE FROM session_student_map WHERE session_id = ?", (session_id,))
        cursor.execute("INSERT INTO session_student_map (session_id, student_id) VALUES (?, ?)", (session_id, student_id))
        
        conn.commit()
    
    return {"status": "ok", "student_id": student_id}

@app.delete("/api/admin/students/{student_id}")
def delete_student(student_id: str):
    """Delete a student and all their related data (mappings and progress)."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Cascade delete is enabled via PRAGMA, but session_student_map only cascades its own entry.
        # If we want to delete sessions too, we should do it explicitly if they are only for this student.
        # For now, let's keep sessions but delete mappings and progress (via mappings).
        # Actually, progress is linked to session_id, not student_id.
        # If we delete a student, the map is gone. The progress remains on the session.
        # To delete EVERYTHING, we should probably delete the sessions associated with this student.
        
        cursor.execute("SELECT session_id FROM session_student_map WHERE student_id = ?", (student_id,))
        sessions = cursor.fetchall()
        
        for row in sessions:
            cursor.execute("DELETE FROM sessions WHERE id = ?", (row["session_id"],)) # This will cascade to progress and map
            
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        
        conn.commit()
        
    return {"status": "ok"}
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

