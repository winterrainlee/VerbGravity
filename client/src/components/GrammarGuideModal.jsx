import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import './GrammarGuideModal.css';

const GrammarGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="grammar-modal-overlay" onClick={onClose}>
            <div className="grammar-modal-content" onClick={e => e.stopPropagation()}>
                <div className="grammar-modal-header">
                    <div className="header-title">
                        <BookOpen size={24} className="header-icon" />
                        <h2>문법 가이드 (Grammar Guide)</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="grammar-modal-body">
                    <p className="guide-intro">
                        VerbGravity는 문장의 <strong>뿌리 동사(Root Verb)</strong>와 <strong>주어(Subject)</strong>를 찾는 훈련입니다.<br />
                        아래 예시를 통해 다양한 문장 구조에서 정답을 찾는 방법을 확인하세요.
                    </p>

                    <div className="table-container">
                        <table className="grammar-table">
                            <thead>
                                <tr>
                                    <th>유형 (Type)</th>
                                    <th>문장 (Sentence)</th>
                                    <th>뿌리 동사 (Root Verb)</th>
                                    <th>Subject (주어)</th>
                                    <th>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="type-cell">단문<br /><span className="sub-text">(Simple)</span></td>
                                    <td>"The black <strong>cat</strong> sleeps."</td>
                                    <td><span className="badge root">sleeps</span></td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject highlight">The black</span>
                                            <span className="badge subject">cat</span>
                                        </div>
                                    </td>
                                    <td>심화: 주어구 전체 확장</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">중문 (병렬)<br /><span className="sub-text">(Compound)</span></td>
                                    <td>"I <strong>eat</strong> and <strong>read</strong>."</td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge root">eat</span>
                                            <span className="badge root highlight">read</span>
                                        </div>
                                    </td>
                                    <td><span className="badge subject">I</span></td>
                                    <td>심화: 병렬 연관 동사 추가</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">부사절<br /><span className="sub-text">(Complex)</span></td>
                                    <td>"She <strong>left</strong> because it <strong>rained</strong>."</td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge root">left</span>
                                            <span className="badge root highlight">rained</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject">She</span>
                                            <span className="badge subject highlight">it</span>
                                        </div>
                                    </td>
                                    <td>심화: 부사절 내부 성분 추가</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">관계절<br /><span className="sub-text">(Relative)</span></td>
                                    <td>"The <strong>man</strong> who lives here <strong>is</strong> kind."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject highlight">The</span>
                                            <span className="badge subject">man</span>
                                        </div>
                                    </td>
                                    <td><strong style={{ color: '#e17055' }}>관계절(lives...) 제외</strong>: 수식어이므로 뼈대에서 분리</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">준동사구<br /><span className="sub-text">(Phrasal)</span></td>
                                    <td>"To <strong>win</strong> is hard."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject highlight">To</span>
                                            <span className="badge subject">win</span>
                                        </div>
                                    </td>
                                    <td>심화: 구 전체(Span) 확장</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">유도부사<br /><span className="sub-text">(Expletive)</span></td>
                                    <td>"There <strong>is</strong> a <strong>dog</strong>."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject highlight">a</span>
                                            <span className="badge subject">dog</span>
                                        </div>
                                    </td>
                                    <td>Here/There 구문은<br />동사 뒤에 주어가 위치</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">가주어<br /><span className="sub-text">(Dummy It)</span></td>
                                    <td>"It <strong>is</strong> hard <strong>to study</strong>."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td><span className="badge subject">It</span></td>
                                    <td>형식상 주어 It을 선택</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrammarGuideModal;
