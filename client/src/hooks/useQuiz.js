import { useEffect } from 'react';
import { useQuizContext, QuizStep } from '../context/QuizContext';

// 배열 비교 헬퍼 함수 (순서 무관, 집합 비교)
const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort((a, b) => a - b);
    const sorted2 = [...arr2].sort((a, b) => a - b);
    return sorted1.every((val, idx) => val === sorted2[idx]);
};

export const useQuiz = ({ data, savedProgress = [], onSentenceComplete, onFinish, onRestart }) => {
    const { state, dispatch } = useQuizContext();
    const { sentenceIndex, step, selections, isChecked, feedback, results, isReviewMode } = state;

    const currentSentence = data.sentences[sentenceIndex];
    const isLastSentence = sentenceIndex === data.sentences.length - 1;
    const progress = ((sentenceIndex) / data.sentences.length) * 100;

    // 현재 문장의 정답 개수 (v1.1)
    // 현재 문장의 정답 개수 (v1.1)
    const answerKey = currentSentence.key;
    const gradingMode = localStorage.getItem('vg_grading_mode') || 'FULL';

    const expectedRootCount = answerKey.roots?.length || 1;
    // v1.1.1: 채점 모드에 따른 주어 개수 설정
    const expectedSubjectTokens = gradingMode === 'CORE'
        ? (answerKey.subjects || [answerKey.subject]).filter(s => s !== null)
        : (answerKey.subjectSpans || [[answerKey.subject]]).flat().filter(s => s !== null);
    const expectedSubjectCount = expectedSubjectTokens.length;

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

    // Scroll to active sentence
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
        if (selections.length === 0) return;

        if (step === QuizStep.ROOT) {
            // v1.1: 복수 root 비교
            const expectedRoots = answerKey.roots || [answerKey.root];
            const isCorrect = arraysEqual(selections, expectedRoots);

            if (results[sentenceIndex]?.rootCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        rootCorrect: isCorrect,
                        rootWrongTokenId: isCorrect ? null : selections[0]
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
                            : expectedRoots.length > 1
                                ? `정답입니다! ${expectedRoots.length}개의 핵심 동사를 모두 찾았습니다.`
                                : '정답입니다! 핵심 동사를 찾았습니다.'
                    }
                });
                setTimeout(() => {
                    dispatch({ type: 'NEXT_STEP' });
                }, 1000);
            } else {
                let hint = "다시 찾아보세요.";
                if (selections.length < expectedRoots.length) {
                    hint = `동사가 ${expectedRoots.length}개 있습니다. 더 찾아보세요.`;
                } else if (selections.length > expectedRoots.length) {
                    hint = `동사가 ${expectedRoots.length}개입니다. 선택을 줄여보세요.`;
                } else {
                    const selectedToken = currentSentence.tokens.find(t => t.id === selections[0]);
                    if (selectedToken) {
                        if (selectedToken.pos === 'NOUN') hint = "명사(Noun)는 동사가 될 수 없습니다.";
                        else if (selectedToken.pos === 'ADJ') hint = "형용사(Adjective)는 동사가 아닙니다.";
                        else if (selectedToken.dep === 'aux') hint = "조동사보다는 의미를 가진 본동사를 찾아보세요.";
                    }
                }
                dispatch({
                    type: 'CHECK_ANSWER',
                    payload: { isCorrect: false, message: `오답입니다. ${hint}` }
                });
            }
        } else if (step === QuizStep.SUBJECT) {
            // v1.1.2: 채점 모드에 따른 주어 비교
            const isCorrect = arraysEqual(selections, expectedSubjectTokens);

            let currentResult = results[sentenceIndex];
            if (currentResult?.subjectCorrect === null) {
                dispatch({
                    type: 'UPDATE_RESULT',
                    payload: {
                        subjectCorrect: isCorrect,
                        subjectWrongTokenId: isCorrect ? null : selections[0]
                    }
                });
                currentResult = { ...currentResult, subjectCorrect: isCorrect };
            }

            if (isCorrect) {
                if (onSentenceComplete) {
                    onSentenceComplete(
                        sentenceIndex,
                        answerKey.roots?.[0] || answerKey.root,
                        results[sentenceIndex].rootCorrect === true,
                        selections[0],
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
                                : expectedSubjectTokens.length > 1
                                    ? `정답입니다! ${expectedSubjectTokens.length}개의 정답 요소를 모두 찾았습니다.`
                                    : '정답입니다!'
                    }
                });

                if (isReviewMode) {
                    dispatch({ type: 'UPDATE_RESULT', payload: { isReviewed: true } });
                }
            } else {
                let hint = "";
                if (gradingMode === 'FULL') {
                    if (selections.length < expectedSubjectTokens.length) {
                        hint = "주어구의 일부만 선택되었습니다. 전체를 선택하세요.";
                    } else {
                        hint = "주어구 전체를 정확히 선택했는지 확인하세요.";
                    }
                } else {
                    // CORE Mode: Specific hints
                    if (selections.length < expectedSubjectTokens.length) {
                        hint = `정답이 ${expectedSubjectTokens.length}개 단어입니다. 더 선택하세요.`;
                    } else if (selections.length > expectedSubjectTokens.length) {
                        hint = `정답이 ${expectedSubjectTokens.length}개 단어입니다. 선택을 줄이세요.`;
                    } else {
                        hint = "동작의 주체를 찾아보세요.";
                    }
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
        // v1.1: 모든 subject가 null이면 생략
        const expectedSubjects = (answerKey.subjects || [answerKey.subject]).filter(s => s !== null);
        const isOmitted = expectedSubjects.length === 0;

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
        expectedRootCount,
        expectedSubjectCount,
        handleTokenClick,
        handleCheck,
        handleNext,
        handlePrev,
        handleOmittedSubject,
        jumpToSentence,
        onRestart
    };
};
