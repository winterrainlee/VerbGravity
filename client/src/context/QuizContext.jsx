import { createContext, useContext, useReducer, useCallback } from 'react';

const QuizContext = createContext();

export const QuizStep = {
    ROOT: 'ROOT',
    SUBJECT: 'SUBJECT',
};

const initialState = {
    sentenceIndex: 0,
    step: QuizStep.ROOT,
    selections: [], // v1.1: 복수 선택 지원 (배열)
    isChecked: false,
    feedback: { type: 'info', message: '버튼을 눌러 핵심 동사(Root)를 찾아보세요.' },
    isReviewMode: false,
    results: [],
};

function quizReducer(state, action) {
    switch (action.type) {
        case 'SELECT_TOKEN':
            // v1.1: 복수 선택 토글 로직
            if (state.isChecked && state.feedback.type === 'correct') return state;
            const tokenId = action.payload;
            const isSelected = state.selections.includes(tokenId);
            const newSelections = isSelected
                ? state.selections.filter(id => id !== tokenId)
                : [...state.selections, tokenId];
            return {
                ...state,
                selections: newSelections,
                isChecked: false,
                feedback: {
                    type: 'info',
                    message: newSelections.length > 0
                        ? `${newSelections.length}개 선택됨. 확인 버튼을 눌러주세요.`
                        : '토큰을 선택해주세요.'
                }
            };

        case 'SET_RESULTS':
            return {
                ...state,
                results: action.payload
            };

        case 'UPDATE_RESULT':
            const newResults = [...state.results];
            newResults[state.sentenceIndex] = {
                ...newResults[state.sentenceIndex],
                ...action.payload
            };
            return {
                ...state,
                results: newResults
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
                selections: [], // 배열 초기화
                isChecked: false,
                feedback: { type: 'info', message: '이제 이 동사의 주어(Subject)를 찾아보세요.' }
            };

        case 'NEXT_SENTENCE':
            return {
                ...state,
                sentenceIndex: state.sentenceIndex + 1,
                step: QuizStep.ROOT,
                selections: [], // 배열 초기화
                isChecked: false,
                feedback: { type: 'info', message: '다음 문장의 핵심 동사를 찾아보세요.' }
            };

        case 'PREV_SENTENCE':
            return {
                ...state,
                sentenceIndex: Math.max(0, state.sentenceIndex - 1),
                step: QuizStep.ROOT,
                selections: [], // 배열 초기화
                isChecked: false,
                feedback: { type: 'info', message: '이전 문장으로 돌아왔습니다.' }
            };

        case 'JUMP_TO_SENTENCE':
            return {
                ...state,
                sentenceIndex: action.payload.index,
                step: QuizStep.ROOT,
                selections: [], // 배열 초기화
                isChecked: false,
                isReviewMode: action.payload.isReview || false,
                feedback: {
                    type: 'info',
                    message: action.payload.isReview ? '복습 모드입니다. 틀린 문장을 다시 풀어보세요.' : '문장으로 이동했습니다. 핵심 동사를 확인해보세요.'
                }
            };

        case 'RESET_QUIZ':
            return initialState;

        default:
            return state;
    }
}

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, initialState);

    return (
        <QuizContext.Provider value={{ state, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
}

export function useQuizContext() {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuizContext must be used within a QuizProvider');
    }
    return context;
}
