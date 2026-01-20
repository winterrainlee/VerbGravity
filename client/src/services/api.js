/**
 * VerbGravity API Service
 * Centralized API calls for session management
 */

// Get API base URL based on environment
const getApiUrl = () => {
    // In production (Fly.io), API is served from the same origin
    // In development (localhost or LAN IP), if on port 5173, backend is on 8000
    if (window.location.port === '5173') {
        return `http://${window.location.hostname}:8000`;
    }

    // Explicit localhost check just in case
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
export async function createSession(passageText, totalSentences, mode = 'FULL') {
    const response = await fetch(`${getApiUrl()}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage_text: passageText, total_sentences: totalSentences, mode }),
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
const GRADING_MODE_KEY = 'vg_grading_mode';

export function getStoredSessionId() {
    return localStorage.getItem(SESSION_KEY);
}

export function storeSessionId(sessionId) {
    localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearStoredSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Grading Mode helpers with in-memory cache
let gradingModeCache = null;

/**
 * Get grading mode from cache or localStorage
 * @returns {'CORE' | 'FULL'} The current grading mode
 */
export function getGradingMode() {
    if (gradingModeCache === null) {
        gradingModeCache = localStorage.getItem(GRADING_MODE_KEY) || 'FULL';
    }
    return gradingModeCache;
}

/**
 * Set grading mode and update cache
 * @param {'CORE' | 'FULL'} mode - The grading mode to set
 */
export function setGradingMode(mode) {
    gradingModeCache = mode;
    localStorage.setItem(GRADING_MODE_KEY, mode);
}

/**
 * Admin: Login
 */
export async function adminLogin(password) {
    const response = await fetch(`${getApiUrl()}/api/manage/login`, {
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
    const response = await fetch(`${getApiUrl()}/api/manage/sessions`);

    if (!response.ok) {
        throw new Error('데이터 조회 실패');
    }

    return response.json();
}

/**
 * Admin: Assign session to student
 */
export async function assignStudent(sessionId, studentName) {
    const response = await fetch(`${getApiUrl()}/api/manage/sessions/${sessionId}/assign-student`, {
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
    const response = await fetch(`${getApiUrl()}/api/manage/students/${studentId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('학생 삭제 실패');
    }

    return response.json();
}

/**
 * Get all saved passages
 */
export async function getPassages() {
    const response = await fetch(`${getApiUrl()}/api/passages`);

    if (!response.ok) {
        throw new Error('지문 목록 조회 실패');
    }

    return response.json();
}

/**
 * Create a new passage
 */
export async function createPassage(title, content) {
    const response = await fetch(`${getApiUrl()}/api/passages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
        throw new Error('지문 저장 실패');
    }

    return response.json();
}

/**
 * Delete a passage
 */
export async function deletePassage(passageId) {
    const response = await fetch(`${getApiUrl()}/api/passages/${passageId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('지문 삭제 실패');
    }

    return response.json();
}

/**
 * Admin: Delete session
 */
export async function deleteSession(sessionId) {
    const response = await fetch(`${getApiUrl()}/api/manage/sessions/${sessionId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('세션 삭제 실패');
    }

    return response.json();
}

/**
 * Admin: Clear all sessions
 */
export async function clearAllSessions() {
    const response = await fetch(`${getApiUrl()}/api/manage/sessions`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('세션 전체 삭제 실패');
    }

    return response.json();
}
