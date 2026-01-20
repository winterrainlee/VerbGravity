import Check from 'lucide-react/dist/esm/icons/check';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import { QuizStep } from '../context/QuizContext';
import { useQuiz } from '../hooks/useQuiz';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import { getGradingMode } from '../services/api';
import toast from 'react-hot-toast';
import GrammarGuideModal from './GrammarGuideModal';
import { useState } from 'react';
import './QuizScreen.css';

const QuizScreen = (props) => {
    const { data } = props;
    const {
        state,
        currentSentence,
        isLastSentence,
        progress,
        isCorrect,
        expectedRootCount,
        expectedSubjectCount,
        handleTokenClick,
        handleCheck,
        handleNext,
        handlePrev,
        handleOmittedSubject,
        jumpToSentence,
        onRestart
    } = useQuiz(props);

    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const { sentenceIndex, step, selections, isChecked, feedback, isReviewMode } = state;

    // v1.1: 정답 배열 가져오기 (하위 호환성)
    const getRoots = (sent) => sent.key.roots || [sent.key.root];
    const getSubjects = (sent) => (sent.key.subjects || [sent.key.subject]).filter(s => s !== null);
    const getSubjectSpans = (sent) => {
        if (sent.key.subjectSpans) {
            return sent.key.subjectSpans.flat();
        }
        return sent.key.subjectSpan || [];
    };

    // v1.1.2: 채점 모드 가져오기 (캐싱된 값 사용)
    const gradingMode = getGradingMode();

    const handleModeClick = () => {
        if (gradingMode === 'CORE') {
            toast('🌱 [기초 모드] \n뿌리 동사(Root Verb)와 주어가 문장에 하나씩만 존재합니다.', {
                icon: '🟢',
                style: { borderRadius: '10px', background: '#f0fdf4', color: '#15803d' },
            });
        } else {
            toast('🌳 [심화 모드] \n뿌리 동사(Root Verb)와 주어가 문장에 여러 개 있을 수 있으며, 주어도 주어구 전체를 정확하게 선택해야 합니다.', {
                icon: '🟠',
                style: { borderRadius: '10px', background: '#fefce8', color: '#a16207' },
            });
        }
    };

    return (
        <div className="quiz-screen">
            {/* 1. Header */}
            <div className="quiz-header">
                <div className="header-top-row">
                    <div className="stage-indicator">
                        <span className={`stage-badge ${step.toLowerCase()}`}>
                            {step === QuizStep.ROOT ? '뿌리 동사(ROOT)' : '주어(SUBJECT)'}
                        </span>
                        {isReviewMode && (
                            <span className="review-badge">복습 중</span>
                        )}
                        {feedback.type === 'incorrect' && (
                            <button
                                className="grammar-guide-btn"
                                onClick={() => setIsGuideOpen(true)}
                                title="문법 가이드 보기"
                            >
                                <BookOpen size={14} />
                                <span>문법 안내</span>
                            </button>
                        )}
                    </div>

                    <div className="header-right-group">
                        <span
                            className={`mode-label ${gradingMode.toLowerCase()}`}
                            onClick={handleModeClick}
                            title="모드 설명 보기"
                        >
                            {gradingMode === 'CORE' ? '기초' : '심화'}
                        </span>
                        <div className="sentence-counter">
                            {sentenceIndex + 1} / {data.sentences.length}
                        </div>
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
                    const roots = getRoots(sent);
                    const subjects = getSubjects(sent);
                    const subjectSpanTokens = getSubjectSpans(sent);

                    return (
                        <div
                            key={sent.id}
                            id={`sentence-${sIdx}`}
                            className={`sentence-block ${isActive ? 'active' : 'inactive'}`}
                        >
                            {isActive ? (
                                <div className={`tokens-wrapper step-${step.toLowerCase()}`}>
                                    {sent.tokens.map((token) => {
                                        const isSelected = selections.includes(token.id);
                                        let tokenClass = 'token';
                                        if (isSelected) tokenClass += ' selected';

                                        // v1.1: 복수 root 지원
                                        if (step === QuizStep.SUBJECT && roots.includes(token.id)) {
                                            tokenClass += ' solved-root';
                                        }

                                        // v1.1.2: 채점 모드에 따른 힌트(밑줄) 표시
                                        // 기초(CORE) 모드에서 주어구 전체에 밑줄 표시, 심화(FULL) 모드에서는 힌트 제거
                                        const isHintVisible = gradingMode === 'CORE' && subjectSpanTokens.includes(token.id);

                                        if (step === QuizStep.SUBJECT && isHintVisible) {
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
                        <div className="check-group">
                            <button
                                className="btn btn-primary check-btn"
                                onClick={handleCheck}
                                disabled={selections.length === 0 && step !== QuizStep.SUBJECT}
                            >
                                확인 {selections.length > 0 && `(${selections.length})`}
                            </button>
                            {step === QuizStep.SUBJECT && (
                                <button
                                    className="btn btn-secondary omitted-btn"
                                    onClick={handleOmittedSubject}
                                >
                                    (you 생략)
                                </button>
                            )}
                        </div>
                    ) : (
                        <button className="btn btn-primary next-btn" onClick={handleNext}>
                            {isLastSentence && step === QuizStep.SUBJECT ? '결과 보기' : '다음'} <ArrowRight size={18} />
                        </button>
                    )}
                </div>

                <button className="btn btn-text restart-quiz-btn" onClick={onRestart} title="새로운 지문으로 시작">
                    <RefreshCw size={18} /> <span>지문 초기화</span>
                </button>
            </div>

            <GrammarGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </div>
    );
};

export default QuizScreen;
