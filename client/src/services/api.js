/**
 * VerbGravity API Service
 * Centralized API calls for session management
 */

// Get API base URL based on environment
const getApiUrl = () => {
    // In production (Fly.io), API is served from the same origin
    // In development (localhost), API is on port 8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    return ''; // Same origin in production
};

/**
 * Analyze passage using NLP
 */
export async function analyzePassage(passage) {
    const response = await fetch(`${getApiUrl()}/api/analyze-passage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage }),
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || '분석 중 오류가 발생했습니다.');
    }

    return response.json();
}

/**
 * Create a new session
 */
export async function createSession(passageText, totalSentences) {
    const response = await fetch(`${getApiUrl()}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage_text: passageText, total_sentences: totalSentences }),
    });

    if (!response.ok) {
        throw new Error('세션 생성 실패');
    }

    return response.json();
}

/**
 * Get session by ID
 */
export async function getSession(sessionId) {
    const response = await fetch(`${getApiUrl()}/api/sessions/${sessionId}`);

    if (response.status === 404) {
        return null; // Session not found
    }

    if (!response.ok) {
        throw new Error('세션 조회 실패');
    }

    return response.json();
}

/**
 * Save progress for a sentence
 */
export async function saveProgress(sessionId, progress) {
    const response = await fetch(`${getApiUrl()}/api/sessions/${sessionId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
    });

    if (!response.ok) {
        throw new Error('진행 상황 저장 실패');
    }

    return response.json();
}

// LocalStorage helpers
const SESSION_KEY = 'verbgravity_session_id';

export function getStoredSessionId() {
    return localStorage.getItem(SESSION_KEY);
}

export function storeSessionId(sessionId) {
    localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearStoredSession() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Admin: Login
 */
export async function adminLogin(password) {
    const response = await fetch(`${getApiUrl()}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        throw new Error('로그인 실패. 비밀번호를 확인하세요.');
    }

    return response.json();
}

/**
 * Admin: Get all data
 */
export async function getAdminData() {
    const response = await fetch(`${getApiUrl()}/api/admin/sessions`);

    if (!response.ok) {
        throw new Error('데이터 조회 실패');
    }

    return response.json();
}

/**
 * Admin: Assign session to student
 */
export async function assignStudent(sessionId, studentName) {
    const response = await fetch(`${getApiUrl()}/api/admin/sessions/${sessionId}/assign-student`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName }),
    });

    if (!response.ok) {
        throw new Error('학생 배정 실패');
    }

    return response.json();
}

/**
 * Admin: Delete student
 */
export async function deleteStudent(studentId) {
    const response = await fetch(`${getApiUrl()}/api/admin/students/${studentId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('학생 삭제 실패');
    }

    return response.json();
}
