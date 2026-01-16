import { Check, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { QuizStep } from '../context/QuizContext';
import { useQuiz } from '../hooks/useQuiz';
import './QuizScreen.css';

const QuizScreen = (props) => {
    const { data } = props;
    const {
        state,
        currentSentence,
        isLastSentence,
        progress,
        isCorrect,
        handleTokenClick,
        handleCheck,
        handleNext,
        handlePrev,
        handleOmittedSubject,
        jumpToSentence,
        onRestart
    } = useQuiz(props);

    const { sentenceIndex, step, selection, isChecked, feedback, isReviewMode } = state;

    return (
        <div className="quiz-screen">
            {/* 1. Header */}
            <div className="quiz-header">
                <div className="header-top-row">
                    <div className="stage-indicator">
                        <span className={`stage-badge ${step.toLowerCase()}`}>
                            {step === QuizStep.ROOT ? '동사(ROOT)' : '주어(SUBJECT)'}
                        </span>
                        {isReviewMode && (
                            <span className="review-badge">복습 중</span>
                        )}
                    </div>
                    <div className="sentence-counter">
                        {sentenceIndex + 1} / {data.sentences.length}
                    </div>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* 2. Instruction / Feedback Panel (Exam Style) */}
            <div className={`instruction-panel ${feedback.type}`}>
                {feedback.type === 'correct' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span className="feedback-msg">{feedback.message}</span>
            </div>

            {/* 3. Passage Pane */}
            <div className="passage-pane">
                {data.sentences.map((sent, sIdx) => {
                    const isActive = sIdx === sentenceIndex;
                    return (
                        <div
                            key={sent.id}
                            id={`sentence-${sIdx}`}
                            className={`sentence-block ${isActive ? 'active' : 'inactive'}`}
                        >
                            {isActive ? (
                                <div className={`tokens-wrapper step-${step.toLowerCase()}`}>
                                    {sent.tokens.map((token) => {
                                        const isSelected = selection === token.id;
                                        let tokenClass = 'token';
                                        if (isSelected) tokenClass += ' selected';

                                        if (step === QuizStep.SUBJECT && sent.key.root === token.id) {
                                            tokenClass += ' solved-root';
                                        }

                                        if (step === QuizStep.SUBJECT && sent.key.subjectSpan.includes(token.id)) {
                                            tokenClass += ' hint-underline';
                                        }

                                        if (isSelected && isChecked) {
                                            tokenClass += feedback.type === 'correct' ? ' correct' : ' incorrect';
                                        }

                                        return (
                                            <span
                                                key={token.id}
                                                className={tokenClass}
                                                onClick={() => handleTokenClick(token.id)}
                                            >
                                                {token.text}{' '}
                                            </span>
                                        )
                                    })}
                                </div>
                            ) : (
                                <span className="sentence-text" onClick={() => {
                                    jumpToSentence(sIdx, false);
                                }}>{sent.text}</span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* 4. Controls (Sticky Bottom) */}
            <div className="controls-section">
                <button className="btn btn-secondary nav-btn" onClick={handlePrev}>
                    <ArrowLeft size={18} /> 이전 문장
                </button>

                <div className="action-btns">
                    {!isCorrect ? (
                        <button
                            className="btn btn-primary check-btn"
                            onClick={handleCheck}
                            disabled={selection === null && step !== QuizStep.SUBJECT}
                        >
                            확인
                        </button>
                    ) : (
                        <button className="btn btn-primary next-btn" onClick={handleNext}>
                            {isLastSentence && step === QuizStep.SUBJECT ? '결과 보기' : '다음'} <ArrowRight size={18} />
                        </button>
                    )}
                    <button className="btn btn-text restart-quiz-btn" onClick={onRestart} title="새로운 지문으로 시작">
                        <RefreshCw size={18} /> <span>지문 초기화</span>
                    </button>
                </div>

                {step === QuizStep.SUBJECT && !isCorrect && (
                    <button
                        className="btn btn-secondary omitted-btn"
                        onClick={handleOmittedSubject}
                    >
                        (you 생략)
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizScreen;
