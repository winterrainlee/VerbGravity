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
    RefreshCw
} from 'lucide-react';
import { getAdminData, assignStudent, deleteStudent } from '../services/api';
import './TeacherDashboard.css';

const TeacherDashboard = ({ onLogout }) => {
    const [data, setData] = useState({ students: [], sessions: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const result = await getAdminData();
            setData(result);
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
                                            {student.lastCompletedAt ? new Date(student.lastCompletedAt).toLocaleString('ko-KR', {
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

                {/* 2. Session List */}
                <section className="dashboard-section mt-40">
                    <div className="section-header">
                        <h2><History size={20} /> 최근 세션 목록</h2>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>생성 시각</th>
                                    <th>지문 요약</th>
                                    <th>배정된 학생</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sessions.length > 0 ? data.sessions.map(session => (
                                    <tr key={session.id}>
                                        <td className="text-gray subtitle">
                                            {new Date(session.created_at).toLocaleString('ko-KR', {
                                                month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="passage-cell">{session.passage_text}</td>
                                        <td>
                                            <span className={`student-badge ${session.student_name === '미지정' ? 'unassigned' : ''}`}>
                                                {session.student_name}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-text-icon"
                                                onClick={() => handleAssign(session.id, session.student_name)}
                                            >
                                                <UserPlus size={16} /> 학생 배정
                                            </button>
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
