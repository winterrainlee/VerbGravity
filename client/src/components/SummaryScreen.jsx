import Trophy from 'lucide-react/dist/esm/icons/trophy';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Target from 'lucide-react/dist/esm/icons/target';
import { useQuizContext } from '../context/QuizContext';
import './SummaryScreen.css';

const SummaryScreen = ({ sentences, onRestart, onJumpToSentence }) => {
    const { state } = useQuizContext();
    const { results } = state;

    // Calculate statistics
    const totalSentences = sentences.length;

    // results가 아직 초기화되지 않았을 경우를 대비
    const currentResults = results.length > 0 ? results : sentences.map(() => ({}));

    const rootCorrect = currentResults.filter(r => r.rootCorrect).length;
    const subjectCorrect = currentResults.filter(r => r.subjectCorrect).length;

    const rootAccuracy = totalSentences > 0 ? Math.round((rootCorrect / totalSentences) * 100) : 0;
    const subjectAccuracy = totalSentences > 0 ? Math.round((subjectCorrect / totalSentences) * 100) : 0;
    const overallAccuracy = totalSentences > 0
        ? Math.round(((rootCorrect + subjectCorrect) / (totalSentences * 2)) * 100)
        : 0;

    // Get incorrect sentences
    const incorrectSentences = currentResults
        .map((r, idx) => ({ ...r, index: idx, sentence: sentences[idx] }))
        .filter(r => !r.rootCorrect || !r.subjectCorrect);

    // Determine grade
    const getGrade = (accuracy) => {
        if (accuracy >= 90) return { emoji: '🏆', text: '완벽해요!', class: 'excellent' };
        if (accuracy >= 70) return { emoji: '👏', text: '잘했어요!', class: 'good' };
        if (accuracy >= 50) return { emoji: '💪', text: '조금만 더!', class: 'fair' };
        return { emoji: '📚', text: '다시 도전!', class: 'needs-work' };
    };

    const grade = getGrade(overallAccuracy);

    return (
        <div className="summary-screen">
            {/* Header */}
            <div className="summary-header">
                <div className="grade-badge">
                    <span className="grade-emoji">{grade.emoji}</span>
                    <span className="grade-text">{grade.text}</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="overall-score">
                <div className="score-circle">
                    <span className="score-value">{overallAccuracy}</span>
                    <span className="score-unit">%</span>
                </div>
                <p className="score-label">전체 정확도</p>
            </div>

            {/* Detailed Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <Target size={24} className="stat-icon root" />
                    <div className="stat-content">
                        <span className="stat-label">동사 (Root)</span>
                        <span className="stat-value">{rootCorrect} / {totalSentences}</span>
                        <span className="stat-percent">{rootAccuracy}%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Target size={24} className="stat-icon subject" />
                    <div className="stat-content">
                        <span className="stat-label">주어 (Subject)</span>
                        <span className="stat-value">{subjectCorrect} / {totalSentences}</span>
                        <span className="stat-percent">{subjectAccuracy}%</span>
                    </div>
                </div>
            </div>

            {/* Incorrect Sentences */}
            {incorrectSentences.length > 0 && (
                <div className="incorrect-section">
                    <h3 className="section-title">
                        <XCircle size={18} /> 틀린 문장 ({incorrectSentences.length}개)
                    </h3>
                    <div className="incorrect-list">
                        {incorrectSentences.map((item) => {
                            const correctRootId = item.sentence.key.root;
                            const correctSubjectId = item.sentence.key.subject;

                            const getTokenText = (id) => {
                                if (id === -1) return '(you 생략)';
                                return item.sentence.tokens.find(t => t.id === id)?.text || '???';
                            };

                            return (
                                <div
                                    key={item.index}
                                    className="incorrect-item-container clickable"
                                    onClick={() => onJumpToSentence && onJumpToSentence(item.index)}
                                    title="클릭하여 해당 문장으로 이동"
                                >
                                    <div className="incorrect-item">
                                        <span className="sentence-num">#{item.index + 1}</span>
                                        <p className="sentence-preview">
                                            {item.sentence?.text}
                                        </p>
                                        <div className="error-badges">
                                            {item.isReviewed && (
                                                <span className="error-badge review-fixed">
                                                    <CheckCircle size={14} /> 복습 완료
                                                </span>
                                            )}
                                            {item.rootCorrect === false && <span className="error-badge root">동사</span>}
                                            {item.subjectCorrect === false && <span className="error-badge subject">주어</span>}
                                        </div>
                                    </div>
                                    <div className="error-details">
                                        {item.rootCorrect === false && (
                                            <div className="detail-row">
                                                <span className="detail-label">동사 오답:</span>
                                                <span className="wrong">❌ {getTokenText(item.rootWrongTokenId)}</span>
                                                <span className="arrow">→</span>
                                                <span className="right">✅ {getTokenText(correctRootId)}</span>
                                            </div>
                                        )}
                                        {item.subjectCorrect === false && (
                                            <div className="detail-row">
                                                <span className="detail-label">주어 오답:</span>
                                                <span className="wrong">❌ {getTokenText(item.subjectWrongTokenId)}</span>
                                                <span className="arrow">→</span>
                                                <span className="right">✅ {correctSubjectId === null ? '(you 생략)' : getTokenText(correctSubjectId)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Correct Message */}
            {incorrectSentences.length === 0 && (
                <div className="all-correct">
                    <CheckCircle size={32} />
                    <p>모든 문장을 정확하게 풀었습니다!</p>
                </div>
            )}

            {/* Restart Button */}
            <div className="action-section">
                <button className="btn btn-primary restart-btn" onClick={onRestart}>
                    <RotateCcw size={20} />
                    <span>새로운 지문으로 시작하기</span>
                </button>
            </div>
        </div>
    );
};

export default SummaryScreen;
