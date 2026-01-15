import { useState } from 'react';
import { Play } from 'lucide-react';
import './StartScreen.css';

const MAX_CHARS = 2000;

const StartScreen = ({ onStart, isLoading }) => {
    const [passage, setPassage] = useState('');
    const charCount = passage.length;
    const isOverLimit = charCount > MAX_CHARS;
    const isValid = charCount > 0 && !isOverLimit;

    const handleSubmit = () => {
        if (isValid && !isLoading) {
            onStart(passage);
        }
    };

    return (
        <div className="start-screen">
            <div className="intro-section">
                <h1 className="title">영어 문장 구조 훈련</h1>
                <p className="subtitle">
                    지문을 입력하면 문장별로 <span className="highlight">동사(Root)</span>와 <span className="highlight">주어(Subject)</span>를 찾는 훈련을 시작합니다.
                </p>
            </div>

            <div className="input-section">
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
