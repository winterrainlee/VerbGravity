import { useState } from 'react';
import { Lock, LogIn, ChevronLeft } from 'lucide-react';
import { adminLogin } from '../services/api';
import './TeacherLogin.css';

const TeacherLogin = ({ onLoginSuccess, onBack }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await adminLogin(password);
            onLoginSuccess(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="teacher-login-container">
            <button className="back-btn" onClick={onBack}>
                <ChevronLeft size={20} /> 학생 모드로 돌아가기
            </button>

            <div className="login-card">
                <div className="login-header">
                    <div className="icon-wrapper">
                        <Lock size={32} />
                    </div>
                    <h1>교사 전용 로그인</h1>
                    <p>학생들을 관리하고 통계를 확인하세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="password">관리자 비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            autoFocus
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-submit" disabled={isLoading}>
                        {isLoading ? '확인 중...' : (
                            <>
                                <LogIn size={20} /> 로그인
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TeacherLogin;
