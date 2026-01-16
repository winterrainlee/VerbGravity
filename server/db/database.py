"""
SQLite Database Connection and Initialization
"""
import sqlite3
import os
from contextlib import contextmanager

# Database file path (anchor to server/ to avoid cwd-dependent paths)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "data", "verbgravity.db")
DB_PATH = os.environ.get("VG_DB_PATH", DEFAULT_DB_PATH)

def init_db():
    """Initialize database and create tables if not exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Enable WAL mode for better concurrency
    cursor.execute("PRAGMA journal_mode = WAL")
    
    # Create students table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            display_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            passage_text TEXT NOT NULL,
            total_sentences INTEGER,
            mode TEXT DEFAULT 'FULL'
        )
    """)
    
    # Create session_student_map table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session_student_map (
            session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
            student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (session_id, student_id)
        )
    """)
    
    # Create progress table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
            sentence_index INTEGER,
            root_answer INTEGER,
            root_correct BOOLEAN,
            subject_answer INTEGER,
            subject_correct BOOLEAN,
            completed_at DATETIME,
            UNIQUE(session_id, sentence_index)
        )
    """)
    
    # Create passages table (v1.1)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS passages (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # ---------------------------------------------------------
    # Schema Migration (Hotfix for v1.1.1)
    # ---------------------------------------------------------
    check_and_migrate_schema(cursor)
    
    conn.commit()
    conn.close()

def check_and_migrate_schema(cursor):
    """Check for missing columns and alter table if necessary."""
    try:
        # Check 'sessions' table for 'mode' column
        cursor.execute("PRAGMA table_info(sessions)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'mode' not in columns:
            print("Migrating: Adding 'mode' column to 'sessions' table...")
            cursor.execute("ALTER TABLE sessions ADD COLUMN mode TEXT DEFAULT 'FULL'")
            print("Migration successful.")
            
    except Exception as e:
        print(f"Migration warning: {e}")

@contextmanager
def get_db():
    """Get database connection context manager."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys for every session
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
