"""
SQLite Database Connection and Initialization
"""
import sqlite3
import os
from contextlib import contextmanager

# Database file path
DB_PATH = os.environ.get("VG_DB_PATH", "./data/verbgravity.db")

def init_db():
    """Initialize database and create tables if not exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            passage_text TEXT NOT NULL,
            total_sentences INTEGER
        )
    """)
    
    # Create progress table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT REFERENCES sessions(id),
            sentence_index INTEGER,
            root_answer INTEGER,
            root_correct BOOLEAN,
            subject_answer INTEGER,
            subject_correct BOOLEAN,
            completed_at DATETIME,
            UNIQUE(session_id, sentence_index)
        )
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    """Get database connection context manager."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
