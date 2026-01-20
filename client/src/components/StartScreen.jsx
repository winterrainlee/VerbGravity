import { useState, useEffect } from 'react';
import Play from 'lucide-react/dist/esm/icons/play';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import { getPassages, getGradingMode } from '../services/api';
import './StartScreen.css';

const MAX_CHARS = 2000;

const StartScreen = ({ onStart, isLoading }) => {
    const [passage, setPassage] = useState('');
    const [savedPassages, setSavedPassages] = useState([]);
    const [showPassageList, setShowPassageList] = useState(false);
    const charCount = passage.length;
    const isOverLimit = charCount > MAX_CHARS;
    const isValid = charCount > 0 && !isOverLimit;

    useEffect(() => {
        loadPassages();
    }, []);

    const loadPassages = async () => {
        try {
            const data = await getPassages();
            setSavedPassages(data.passages || []);
        } catch (error) {
            console.error('Failed to load passages:', error);
        }
    };

    const handleLoadPassage = (content) => {
        setPassage(content);
        setShowPassageList(false);
    };

    const handleSubmit = () => {
        if (isValid && !isLoading) {
            const mode = getGradingMode();
            onStart(passage, mode);
        }
    };

    return (
        <div className="start-screen">
            <div className="intro-section">
                <h1 className="title">영어 문장 구조 훈련</h1>
                <p className="subtitle">
                    지문을 입력하면 문장별로 <span className="highlight">뿌리 동사(Root Verb)</span>와 <span className="highlight">주어(Subject)</span>를 찾는 훈련을 시작합니다.
                </p>
                <div className="mode-indicator">
                    <span className={`mode-badge ${getGradingMode().toLowerCase()}`}>
                        {getGradingMode() === 'CORE' ? '🟢 기초 모드' : '🟠 심화 모드'}
                    </span>
                </div>
            </div>

            <div className="input-section">
                {savedPassages.length > 0 && (
                    <div className="passage-loader">
                        <button
                            className="btn btn-secondary load-btn"
                            onClick={() => setShowPassageList(!showPassageList)}
                        >
                            <BookOpen size={18} />
                            <span>저장된 지문 불러오기</span>
                        </button>

                        {showPassageList && (
                            <div className="passage-list">
                                {savedPassages.map((p) => (
                                    <button
                                        key={p.id}
                                        className="passage-item"
                                        onClick={() => handleLoadPassage(p.content)}
                                    >
                                        <span className="passage-title">{p.title}</span>
                                        <span className="passage-preview">
                                            {p.content.substring(0, 50)}...
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="textarea-wrapper">
                    <textarea
                        className="passage-input"
                        placeholder="여기에 영어 지문을 붙여넣으세요..."
                        value={passage}
                        onChange={(e) => setPassage(e.target.value)}
                        spellCheck="false"
                    />
                    <div className={`char-counter ${isOverLimit ? 'error' : ''}`}>
                        {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </div>
                </div>

                {isOverLimit && (
                    <p className="error-message">
                        지문이 너무 깁니다. 2,000자 이내로 줄여주세요.
                    </p>
                )}
            </div>

            <div className="action-section">
                <button
                    className="btn btn-primary start-btn"
                    disabled={!isValid || isLoading}
                    onClick={handleSubmit}
                >
                    <span>{isLoading ? '분석 중...' : '분석 시작하기'}</span>
                    {!isLoading && <Play size={20} fill="currentColor" />}
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
