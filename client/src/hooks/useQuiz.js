import { useEffect } from 'react';
import { useQuizContext, QuizStep } from '../context/QuizContext';

export const useQuiz = ({ data, savedProgress = [], onSentenceComplete, onFinish, onRestart }) => {
    const { state, dispatch } = useQuizContext();
    const { sentenceIndex, step, selection, isChecked, feedback, results, isReviewMode } = state;

    const currentSentence = data.sentences[sentenceIndex];
    const isLastSentence = sentenceIndex === data.sentences.length - 1;
    const progress = ((sentenceIndex) / data.sentences.length) * 100;

    // 초기 결과 구조 생성
    useEffect(() => {
        if (results.length === 0 && data.sentences.length > 0) {
            const initialResults = data.sentences.map(() => ({
                rootCorrect: null,
                subjectCorrect: null,
                rootWrongTokenId: null,
                subjectWrongTokenId: null,
                isReviewed: false
            }));
            dispatch({ type: 'SET_RESULTS', payload: initialResults });
        }
    }, [data.sentences, results.length, dispatch]);

    // Scroll to active sentence (컴포넌트 사이드 이펙트지만 훅에서 관리 가능)
    useEffect(() => {
        const el = document.getElementById(`sentence-${sentenceIndex}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [sentenceIndex]);

    // 저장된 진행 상황으로 시작 위치 복원
    useEffect(() => {
        if (savedProgress.length > 0 && results.length > 0) {
            const updatedResults = results.map((r, idx) => {
                const saved = savedProgress.find(p => p.sentence_index === idx);
                if (saved) {
                    return {
                        ...r,
                        rootCorrect: saved.root_correct,
                        subjectCorrect: saved.subject_correct
                    };
                }
                return r;
            });
            dispatch({ type: 'SET_RESULTS', payload: updatedResults });
        }
    }, [savedProgress, results.length, dispatch]);

    const handleTokenClick = (tokenId) => {
        dispatch({ type: 'SELECT_TOKEN', payload: tokenId });
    };

    const handleCheck = () => {
        if (selection === null) return;

        const answerKey = currentSentence.key;
        const selectedToken = currentSentence.tokens.find(t => t.id === selection);

        if (step === QuizStep.ROOT) {
            const isCorrect = selection === answerKey.root;

            if (results[sentenceIndex]?.rootCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        rootCorrect: isCorrect,
                        rootWrongTokenId: isCorrect ? null : selection
                    }
                });
            }

            if (isCorrect) {
                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: {
                        isCorrect: true,
                        message: isReviewMode
                            ? '정확해요! 핵심 동사를 찾아냈습니다. 이제 주어도 확인해볼까요?'
                            : '정답입니다! 핵심 동사를 찾았습니다.'
                    }
                });
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
        } else if (step === QuizStep.SUBJECT) {
            const isCorrect = selection === answerKey.subject;

            let currentResult = results[sentenceIndex];
            if (currentResult?.subjectCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        subjectCorrect: isCorrect,
                        subjectWrongTokenId: isCorrect ? null : selection
                    }
                });
                currentResult = { ...currentResult, subjectCorrect: isCorrect };
            }

            if (isCorrect) {
                if (onSentenceComplete) {
                    onSentenceComplete(
                        sentenceIndex,
                        answerKey.root,
                        results[sentenceIndex].rootCorrect === true,
                        selection,
                        currentResult.subjectCorrect === true
                    );
                }

                const unreviewedCount = results.filter(r => (r.rootCorrect === false || r.subjectCorrect === false) && !r.isReviewed).length;
                const isFinalReview = isReviewMode && unreviewedCount === 1;

                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: {
                        isCorrect: true,
                        message: isFinalReview
                            ? '축하합니다! 모든 오답 복습을 성공적으로 마쳤어요! 🎉'
                            : isReviewMode
                                ? '정확해요! 주어를 찾아냈습니다. 잘했어요!'
                                : '정답입니다!'
                    }
                });

                if (isReviewMode) {
                    dispatch({ type: 'UPDATE_RESULT', payload: { isReviewed: true } });
                }
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
        const isAnswerCorrect = isChecked && feedback.type === 'correct';
        if (step === QuizStep.ROOT && isAnswerCorrect) {
            dispatch({ type: 'NEXT_STEP' });
        } else if (step === QuizStep.SUBJECT && isAnswerCorrect) {
            if (isReviewMode) {
                onFinish(results);
            } else if (isLastSentence) {
                onFinish(results);
            } else {
                dispatch({ type: 'NEXT_SENTENCE' });
            }
        }
    };

    const handlePrev = () => {
        if (sentenceIndex > 0) {
            dispatch({ type: 'PREV_SENTENCE' });
        } else {
            const confirmExit = window.confirm("퀴즈를 종료하고 처음으로 돌아가시겠습니까?");
            if (confirmExit) onFinish(results);
        }
    };

    const handleOmittedSubject = () => {
        if (step !== QuizStep.SUBJECT) return;
        const isOmitted = currentSentence.key.subject === null;

        if (isOmitted) {
            if (results[sentenceIndex]?.subjectCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        subjectCorrect: true,
                        subjectWrongTokenId: null
                    }
                });
            }
            const unreviewedCount = results.filter(r => (r.rootCorrect === false || r.subjectCorrect === false) && !r.isReviewed).length;
            const isFinalReview = isReviewMode && unreviewedCount === 1;

            dispatch({
                type: 'CHECK_ANSWER',
                payload: {
                    isCorrect: true,
                    message: isFinalReview
                        ? '축하합니다! 모든 오답 복습을 성공적으로 마쳤어요! 🎉'
                        : isReviewMode
                            ? '정확해요! 생략된 주어를 정확히 맞췄습니다. 잘했어요!'
                            : '정답입니다! (주어 생략)'
                }
            });

            if (isReviewMode) {
                dispatch({ type: 'UPDATE_RESULT', payload: { isReviewed: true } });
            }
        } else {
            if (results[sentenceIndex]?.subjectCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        subjectCorrect: false,
                        subjectWrongTokenId: -1
                    }
                });
            }
            dispatch({
                type: 'CHECK_ANSWER',
                payload: { isCorrect: false, message: '이 문장에는 명시적인 주어가 있습니다.' }
            });
        }
    };

    const jumpToSentence = (index, isReview = false) => {
        dispatch({ type: 'JUMP_TO_SENTENCE', payload: { index, isReview } });
    };

    return {
        state,
        currentSentence,
        isLastSentence,
        progress,
        isCorrect: isChecked && feedback.type === 'correct',
        handleTokenClick,
        handleCheck,
        handleNext,
        handlePrev,
        handleOmittedSubject,
        jumpToSentence,
        onRestart
    };
};
