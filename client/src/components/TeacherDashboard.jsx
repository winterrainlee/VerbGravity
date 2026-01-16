import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    History,
    UserPlus,
    Trash2,
    MoreVertical,
    Clock,
    Target,
    LogOut,
    RefreshCw,
    Plus,
    FileText,
    Settings,
    UserCircle,
    CheckCircle2
} from 'lucide-react';
import { getAdminData, assignStudent, deleteStudent, getPassages, createPassage, deletePassage, deleteSession, clearAllSessions } from '../services/api';
import './TeacherDashboard.css';

const TeacherDashboard = ({ onLogout }) => {
    const [data, setData] = useState({ students: [], sessions: [] });
    const [passages, setPassages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAddPassage, setShowAddPassage] = useState(false);
    const [newPassageTitle, setNewPassageTitle] = useState('');
    const [newPassageContent, setNewPassageContent] = useState('');
    const [gradingMode, setGradingMode] = useState(localStorage.getItem('vg_grading_mode') || 'FULL'); // CORE | FULL

    const fetchData = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const [adminResult, passageResult] = await Promise.all([
                getAdminData(),
                getPassages()
            ]);
            setData(adminResult);
            setPassages(passageResult.passages || []);
        } catch (err) {
            setError('데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (sessionId, currentName) => {
        const studentName = window.prompt('학생 이름을 입력하세요:', currentName === '미지정' ? '' : currentName);
        if (studentName === null) return;

        try {
            await assignStudent(sessionId, studentName || '익명');
            fetchData(false);
        } catch (err) {
            alert('배정 실패: ' + err.message);
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`학생 '${studentName}'의 모든 학습 데이터(진행 상황 포함)를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            await deleteStudent(studentId);
            fetchData(false);
        } catch (err) {
            alert('삭제 실패: ' + err.message);
        }
    };

    const handleAddPassage = async () => {
        if (!newPassageTitle.trim() || !newPassageContent.trim()) {
            alert('제목과 내용을 모두 입력하세요.');
            return;
        }

        try {
            await createPassage(newPassageTitle.trim(), newPassageContent.trim());
            setNewPassageTitle('');
            setNewPassageContent('');
            setShowAddPassage(false);
            fetchData(false);
        } catch (err) {
            alert('지문 저장 실패: ' + err.message);
        }
    };

    const handleDeletePassage = async (passageId, title) => {
        if (!window.confirm(`지문 '${title}'를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deletePassage(passageId);
            fetchData(false);
        } catch (err) {
            alert('삭제 실패: ' + err.message);
        }
    };

    const handleGradingModeChange = (mode) => {
        setGradingMode(mode);
        localStorage.setItem('vg_grading_mode', mode);
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('이 세션을 삭제하시겠습니까? 관련 학습 기록이 모두 제거됩니다.')) return;

        try {
            await deleteSession(sessionId);
            fetchData(false);
        } catch (err) {
            alert('삭제 실패: ' + err.message);
        }
    };

    const handleClearSessions = async () => {
        if (!window.confirm('모든 세션 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            await clearAllSessions();
            fetchData(false);
        } catch (err) {
            alert('전체 삭제 실패: ' + err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <RefreshCw className="spinner" />
                <p>데이터를 집계 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="teacher-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>교사 대시보드</h1>
                    <p>학생들의 학습 현황을 한눈에 파악하세요.</p>
                </div>
                <div className="header-actions">
                    <button className="refresh-btn" onClick={() => fetchData(false)} disabled={isRefreshing}>
                        <RefreshCw size={20} className={isRefreshing ? 'spinning' : ''} />
                    </button>
                    <button className="logout-btn" onClick={onLogout}>
                        <LogOut size={20} /> 로그아웃
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {/* 0. App Settings (v1.1.2) */}
                <section className="dashboard-section settings-section">
                    <div className="section-header">
                        <h2><Settings size={20} /> 학습 및 채점 환경 설정</h2>
                    </div>
                    <div className="settings-grid">
                        <div className="setting-card">
                            <div className="setting-info">
                                <div className="setting-title">
                                    <Target size={18} /> 주어 채점 방식
                                </div>
                                <p className="setting-desc">
                                    학생들이 주어를 찾을 때 핵심 단어만 찾게 할지, 주어구 전체를 찾게 할지 결정합니다.
                                </p>
                            </div>
                            <div className="setting-control">
                                <button
                                    className={`mode-toggle-btn ${gradingMode === 'CORE' ? 'active pink' : ''}`}
                                    onClick={() => handleGradingModeChange('CORE')}
                                >
                                    <UserCircle size={16} /> 핵심 단어만 (기초)
                                </button>
                                <button
                                    className={`mode-toggle-btn ${gradingMode === 'FULL' ? 'active blue' : ''}`}
                                    onClick={() => handleGradingModeChange('FULL')}
                                >
                                    <CheckCircle2 size={16} /> 주어구 전체 (심화)
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 1. Student Summary Table */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2><Users size={20} /> 학생별 현황</h2>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>학생 이름</th>
                                    <th>모드</th>
                                    <th>풀이한 문장</th>
                                    <th>동사 정답률</th>
                                    <th>주어 정답률</th>
                                    <th>최근 학습</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.students.length > 0 ? data.students.map(student => (
                                    <tr key={student.studentId}>
                                        <td className="font-bold">{student.displayName}</td>
                                        <td>
                                            <span className={`mode-badge ${student.mode === 'CORE' ? 'pink' : 'blue'}`}>
                                                {student.mode === 'CORE' ? '기초' : '심화'}
                                            </span>
                                        </td>
                                        <td>{student.completedSentences} / {student.totalSentences}</td>
                                        <td>
                                            <span className="accuracy-badge root">
                                                {Math.round((student.rootCorrect / (student.completedSentences || 1)) * 100)}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className="accuracy-badge subject">
                                                {Math.round((student.subjectCorrect / (student.completedSentences || 1)) * 100)}%
                                            </span>
                                        </td>
                                        <td className="text-gray subtitle">
                                            {student.lastCompletedAt ? new Date(student.lastCompletedAt + (student.lastCompletedAt.includes('Z') ? '' : 'Z')).toLocaleString('ko-KR', {
                                                month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => handleDeleteStudent(student.studentId, student.displayName)}
                                                title="학생 삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="empty-row">활성화된 학생 데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 2. Passage Management (v1.1) */}
                <section className="dashboard-section mt-40">
                    <div className="section-header">
                        <h2><FileText size={20} /> 저장된 지문</h2>
                        <button className="btn btn-small btn-primary" onClick={() => setShowAddPassage(!showAddPassage)}>
                            <Plus size={16} /> 지문 추가
                        </button>
                    </div>

                    {showAddPassage && (
                        <div className="add-passage-form">
                            <input
                                type="text"
                                className="passage-title-input"
                                placeholder="지문 제목"
                                value={newPassageTitle}
                                onChange={(e) => setNewPassageTitle(e.target.value)}
                            />
                            <textarea
                                className="passage-content-input"
                                placeholder="지문 내용을 입력하세요..."
                                value={newPassageContent}
                                onChange={(e) => setNewPassageContent(e.target.value)}
                                rows={5}
                            />
                            <div className="form-actions">
                                <button className="btn btn-secondary" onClick={() => setShowAddPassage(false)}>취소</button>
                                <button className="btn btn-primary" onClick={handleAddPassage}>저장</button>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>제목</th>
                                    <th>내용 미리보기</th>
                                    <th>생성일</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passages.length > 0 ? passages.map(passage => (
                                    <tr key={passage.id}>
                                        <td className="font-bold">{passage.title}</td>
                                        <td className="passage-cell">{passage.content.substring(0, 80)}...</td>
                                        <td className="text-gray subtitle">
                                            {new Date(passage.created_at + (passage.created_at.includes('Z') ? '' : 'Z')).toLocaleString('ko-KR', {
                                                month: 'numeric', day: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn delete-btn"
                                                onClick={() => handleDeletePassage(passage.id, passage.title)}
                                                title="지문 삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="empty-row">저장된 지문이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 3. Session List */}
                <section className="dashboard-section mt-40">
                    <div className="section-header">
                        <h2><History size={20} /> 최근 세션 목록</h2>
                        {data.sessions.length > 0 && (
                            <button className="btn btn-small btn-secondary text-red" onClick={handleClearSessions}>
                                <Trash2 size={16} /> 전체 삭제
                            </button>
                        )}
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>생성 시각</th>
                                    <th>모드</th>
                                    <th>지문 요약</th>
                                    <th>배정된 학생</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sessions.length > 0 ? data.sessions.map(session => (
                                    <tr key={session.id}>
                                        <td className="text-gray subtitle">
                                            {new Date(session.created_at + (session.created_at.includes('Z') ? '' : 'Z')).toLocaleString('ko-KR', {
                                                month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td>
                                            <span className={`mode-badge ${session.mode === 'CORE' ? 'pink' : 'blue'}`}>
                                                {session.mode === 'CORE' ? '기초' : '심화'}
                                            </span>
                                        </td>
                                        <td className="passage-cell">{session.passage_text}</td>
                                        <td>
                                            <span className={`student-badge ${session.student_name === '미지정' ? 'unassigned' : ''}`}>
                                                {session.student_name}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="flex-row gap-8">
                                                <button
                                                    className="btn-text-icon"
                                                    onClick={() => handleAssign(session.id, session.student_name)}
                                                    title="학생 배정"
                                                >
                                                    <UserPlus size={16} /> <span className="hide-mobile">배정</span>
                                                </button>
                                                <button
                                                    className="icon-btn delete-btn"
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    title="세션 삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="empty-row">생성된 세션이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default TeacherDashboard;
