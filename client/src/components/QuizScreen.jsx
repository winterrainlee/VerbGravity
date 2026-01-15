import { useState, useReducer, useEffect, useMemo } from 'react';
import { Check, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import './QuizScreen.css';

// --- Constants & Helper Functions ---

const QuizStep = {
    ROOT: 'ROOT',
    SUBJECT: 'SUBJECT',
};

// --- Reducer for Quiz Logic ---
const initialState = {
    sentenceIndex: 0,
    step: QuizStep.ROOT,
    selection: null,
    isChecked: false,
    feedback: { type: 'info', message: '버튼을 눌러 핵심 동사(Root)를 찾아보세요.' },
    completedSentences: [],
};

function quizReducer(state, action) {
    switch (action.type) {
        case 'SELECT_TOKEN':
            if (state.isChecked && state.feedback.type === 'correct') return state;
            return {
                ...state,
                selection: action.payload,
                isChecked: false,
                feedback: { type: 'info', message: '선택 후 확인 버튼을 눌러주세요.' }
            };

        case 'CHECK_ANSWER':
            return {
                ...state,
                isChecked: true,
                feedback: {
                    type: action.payload.isCorrect ? 'correct' : 'incorrect',
                    message: action.payload.message
                },
            };

        case 'NEXT_STEP':
            return {
                ...state,
                step: QuizStep.SUBJECT,
                selection: null,
                isChecked: false,
                feedback: { type: 'info', message: '이제 이 동사의 주어(Subject)를 찾아보세요.' }
            };

        case 'NEXT_SENTENCE':
            return {
                ...state,
                sentenceIndex: state.sentenceIndex + 1,
                step: QuizStep.ROOT,
                selection: null,
                isChecked: false,
                feedback: { type: 'info', message: '다음 문장의 핵심 동사를 찾아보세요.' }
            };

        case 'PREV_SENTENCE':
            return {
                ...state,
                sentenceIndex: Math.max(0, state.sentenceIndex - 1),
                step: QuizStep.ROOT,
                selection: null,
                isChecked: false,
                feedback: { type: 'info', message: '이전 문장으로 돌아왔습니다.' }
            };

        default:
            return state;
    }
}

const QuizScreen = ({ data, savedProgress = [], onSentenceComplete, onFinish }) => {
    const [state, dispatch] = useReducer(quizReducer, initialState);

    // 결과 수집을 위한 상태 (문장별 Root/Subject 정답 여부)
    const [results, setResults] = useState(
        () => data.sentences.map(() => ({ rootCorrect: false, subjectCorrect: false }))
    );

    const currentSentence = data.sentences[state.sentenceIndex];
    const isLastSentence = state.sentenceIndex === data.sentences.length - 1;
    const progress = ((state.sentenceIndex) / data.sentences.length) * 100;

    // Scroll to active sentence
    useEffect(() => {
        const el = document.getElementById(`sentence-${state.sentenceIndex}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [state.sentenceIndex]);

    // 저장된 진행 상황으로 시작 위치 복원
    useEffect(() => {
        if (savedProgress.length > 0) {
            // 이미 완료된 문장 결과 복원
            setResults(prev => {
                const updated = prev.map((r, idx) => {
                    const saved = savedProgress.find(p => p.sentence_index === idx);
                    if (saved) {
                        return {
                            rootCorrect: saved.root_correct,
                            subjectCorrect: saved.subject_correct
                        };
                    }
                    return r;
                });
                return updated;
            });
        }
    }, [savedProgress]);

    const handleTokenClick = (tokenId) => {
        dispatch({ type: 'SELECT_TOKEN', payload: tokenId });
    };

    const handleCheck = () => {
        if (state.selection === null) return;

        const answerKey = currentSentence.key;
        const selectedToken = currentSentence.tokens.find(t => t.id === state.selection);

        // --- Step 1: ROOT Check ---
        if (state.step === QuizStep.ROOT) {
            if (state.selection === answerKey.root) {
                // 결과 기록: ROOT 정답
                setResults(prev => {
                    const updated = [...prev];
                    updated[state.sentenceIndex] = { ...updated[state.sentenceIndex], rootCorrect: true };
                    return updated;
                });
                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: { isCorrect: true, message: '정답입니다! 핵심 동사를 찾았습니다.' }
                });
                // 1초 후 자동으로 Subject 단계로 전환
                setTimeout(() => {
                    dispatch({ type: 'NEXT_STEP' });
                }, 1000);
            } else {
                let hint = "다시 찾아보세요.";
                if (selectedToken) {
                    if (selectedToken.pos === 'NOUN') hint = "명사(Noun)는 동사가 될 수 없습니다.";
                    else if (selectedToken.pos === 'ADJ') hint = "형용사(Adjective)는 동사가 아닙니다.";
                    else if (selectedToken.pos === 'ADP') hint = "전치사(Preposition)는 동사가 아닙니다.";
                    else if (selectedToken.dep === 'aux') hint = "조동사보다는 의미를 가진 본동사를 찾아보세요.";
                }
                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: { isCorrect: false, message: `오답입니다. ${hint}` }
                });
            }
        }
        // --- Step 2: SUBJECT Check ---
        else if (state.step === QuizStep.SUBJECT) {
            if (state.selection === answerKey.subject) {
                // 결과 기록: SUBJECT 정답
                const newResults = [...results];
                newResults[state.sentenceIndex] = { ...newResults[state.sentenceIndex], subjectCorrect: true };
                setResults(newResults);

                // 문장 완료: API에 저장
                if (onSentenceComplete) {
                    onSentenceComplete(
                        state.sentenceIndex,
                        newResults[state.sentenceIndex].rootCorrect ? answerKey.root : state.selection,
                        newResults[state.sentenceIndex].rootCorrect,
                        state.selection,
                        true
                    );
                }

                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: { isCorrect: true, message: '정답입니다!' }
                });
            } else {
                let hint = "주어는 동작을 행하는 주체입니다.";
                if (selectedToken) {
                    if (selectedToken.pos === 'VERB') hint = "동사는 주어가 될 수 없습니다.";
                }
                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: { isCorrect: false, message: `오답입니다. ${hint}` }
                });
            }
        }
    };

    const handleNext = () => {
        if (state.step === QuizStep.ROOT && state.isChecked && state.feedback.type === 'correct') {
            dispatch({ type: 'NEXT_STEP' });
        } else if (state.step === QuizStep.SUBJECT && state.isChecked && state.feedback.type === 'correct') {
            if (isLastSentence) {
                // 결과와 함께 onFinish 호출
                onFinish(results);
            } else {
                dispatch({ type: 'NEXT_SENTENCE' });
            }
        }
    };

    const handlePrev = () => {
        if (state.sentenceIndex > 0) {
            dispatch({ type: 'PREV_SENTENCE' });
        } else {
            const confirmExit = window.confirm("퀴즈를 종료하고 처음으로 돌아가시겠습니까?");
            if (confirmExit) onFinish(results); // 현재까지의 결과 전달
        }
    };

    const handleOmittedSubject = () => {
        if (state.step !== QuizStep.SUBJECT) return;
        const isOmitted = currentSentence.key.subject === null;

        if (isOmitted) {
            // 결과 기록: SUBJECT 정답 (생략)
            setResults(prev => {
                const updated = [...prev];
                updated[state.sentenceIndex] = { ...updated[state.sentenceIndex], subjectCorrect: true };
                return updated;
            });
            dispatch({
                type: 'CHECK_ANSWER',
                payload: { isCorrect: true, message: '정답입니다! (주어 생략)' }
            });
        } else {
            dispatch({
                type: 'CHECK_ANSWER',
                payload: { isCorrect: false, message: '이 문장에는 명시적인 주어가 있습니다.' }
            });
        }
    };

    const isCorrect = state.isChecked && state.feedback.type === 'correct';

    return (
        <div className="quiz-screen">
            {/* 1. Header */}
            <div className="quiz-header">
                <div className="header-top-row">
                    <div className="stage-indicator">
                        <span className={`stage-badge ${state.step.toLowerCase()}`}>
                            {state.step === QuizStep.ROOT ? '동사(ROOT)' : '주어(SUBJECT)'}
                        </span>
                    </div>
                    <div className="sentence-counter">
                        {state.sentenceIndex + 1} / {data.sentences.length}
                    </div>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* 2. Instruction / Feedback Panel (Exam Style) */}
            <div className={`instruction-panel ${state.feedback.type}`}>
                {state.feedback.type === 'correct' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span className="feedback-msg">{state.feedback.message}</span>
            </div>

            {/* 3. Passage Pane */}
            <div className="passage-pane">
                {data.sentences.map((sent, sIdx) => {
                    const isActive = sIdx === state.sentenceIndex;
                    return (
                        <div
                            key={sent.id}
                            id={`sentence-${sIdx}`}
                            className={`sentence-block ${isActive ? 'active' : 'inactive'}`}
                        >
                            {isActive ? (
                                <div className="tokens-wrapper">
                                    {sent.tokens.map((token) => {
                                        const isSelected = state.selection === token.id;
                                        let tokenClass = 'token';
                                        if (isSelected) tokenClass += ' selected';

                                        if (state.step === QuizStep.SUBJECT && sent.key.root === token.id) {
                                            tokenClass += ' solved-root';
                                        }

                                        if (state.step === QuizStep.SUBJECT && sent.key.subjectSpan.includes(token.id)) {
                                            tokenClass += ' hint-underline';
                                        }

                                        if (isSelected && state.isChecked) {
                                            tokenClass += state.feedback.type === 'correct' ? ' correct' : ' incorrect';
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
                                <span className="sentence-text">{sent.text}</span>
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

                {!isCorrect ? (
                    <button
                        className="btn btn-primary check-btn"
                        onClick={handleCheck}
                        disabled={state.selection === null && state.step !== QuizStep.SUBJECT}
                    >
                        확인
                    </button>
                ) : (
                    <button className="btn btn-primary next-btn" onClick={handleNext}>
                        {isLastSentence && state.step === QuizStep.SUBJECT ? '결과 보기' : '다음'} <ArrowRight size={18} />
                    </button>
                )}

                {state.step === QuizStep.SUBJECT && !isCorrect && (
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
