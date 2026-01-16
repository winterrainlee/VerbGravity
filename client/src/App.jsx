import { useState, useEffect, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import SummaryScreen from './components/SummaryScreen';
import { useQuizContext } from './context/QuizContext';
import {
  analyzePassage,
  createSession,
  getSession,
  saveProgress,
  getStoredSessionId,
  storeSessionId,
  clearStoredSession
} from './services/api';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('START'); // START | QUIZ | SUMMARY
  const [passageData, setPassageData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [savedProgress, setSavedProgress] = useState([]); // 저장된 진행 상황
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useQuizContext();

  // 페이지 로드 시 저장된 세션 복원 시도
  useEffect(() => {
    const restoreSession = async () => {
      const storedId = getStoredSessionId();
      if (!storedId) return;

      setIsLoading(true);
      try {
        const session = await getSession(storedId);
        if (session) {
          // 세션 복원: 분석 데이터 다시 가져오기
          const data = await analyzePassage(session.passage_text);
          setPassageData(data);
          setSessionId(storedId);
          setSavedProgress(session.progress || []);
          setCurrentScreen('QUIZ');
        } else {
          // 세션 없으면 로컬 스토리지 정리
          clearStoredSession();
        }
      } catch (err) {
        console.error('세션 복원 실패:', err);
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleStart = async (text) => {
    setIsLoading(true);

    try {
      // 1. 지문 분석
      const data = await analyzePassage(text);

      // 2. 세션 생성
      const { id } = await createSession(text, data.sentences.length);

      // 3. 세션 ID 저장
      storeSessionId(id);
      setSessionId(id);
      setSavedProgress([]);

      setPassageData(data);
      setCurrentScreen('QUIZ');
    } catch (err) {
      console.error(err);
      alert(`오류: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 문장 완료 시 진행 상황 저장
  const handleSentenceComplete = useCallback(async (sentenceIndex, rootAnswer, rootCorrect, subjectAnswer, subjectCorrect) => {
    if (!sessionId) return;

    try {
      await saveProgress(sessionId, {
        sentence_index: sentenceIndex,
        root_answer: rootAnswer,
        root_correct: rootCorrect,
        subject_answer: subjectAnswer,
        subject_correct: subjectCorrect
      });
    } catch (err) {
      console.error('진행 상황 저장 실패:', err);
    }
  }, [sessionId]);

  const handleQuizFinish = () => {
    setCurrentScreen('SUMMARY');
  };

  const handleJumpToSentence = (index) => {
    dispatch({ type: 'JUMP_TO_SENTENCE', payload: { index, isReview: true } });
    setCurrentScreen('QUIZ');
  };

  const handleRestart = () => {
    clearStoredSession();
    setSessionId(null);
    setSavedProgress([]);
    setCurrentScreen('START');
    setPassageData(null);
    dispatch({ type: 'RESET_QUIZ' });
  };

  const handleLogin = () => {
    alert('교사 로그인 기능은 준비 중입니다.');
  };

  return (
    <>
      <AppHeader onLoginClick={handleLogin} onLogoClick={handleRestart} />
      <main className="app-shell">
        {currentScreen === 'START' && (
          <StartScreen onStart={handleStart} isLoading={isLoading} />
        )}
        {currentScreen === 'QUIZ' && passageData && (
          <QuizScreen
            data={passageData}
            savedProgress={savedProgress}
            onSentenceComplete={handleSentenceComplete}
            onFinish={handleQuizFinish}
            onRestart={handleRestart}
          />
        )}
        {currentScreen === 'SUMMARY' && passageData && (
          <SummaryScreen
            sentences={passageData.sentences}
            onRestart={handleRestart}
            onJumpToSentence={handleJumpToSentence}
          />
        )}
      </main>
    </>
  );
}

export default App;
