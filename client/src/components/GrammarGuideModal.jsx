import React from 'react';
import { X, BookOpen } from 'lucide-react';
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
                        VerbGravity는 문장의 <strong>동사(Root)</strong>와 <strong>주어(Subject)</strong>를 찾는 훈련입니다.<br />
                        아래 예시를 통해 다양한 문장 구조에서 정답을 찾는 방법을 확인하세요.
                    </p>

                    <div className="table-container">
                        <table className="grammar-table">
                            <thead>
                                <tr>
                                    <th>유형 (Type)</th>
                                    <th>문장 (Sentence)</th>
                                    <th>Root (동사)</th>
                                    <th>Subject (주어)</th>
                                    <th>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="type-cell">단문<br /><span className="sub-text">(Simple)</span></td>
                                    <td>"The black <strong>cat</strong> sleeps."</td>
                                    <td><span className="badge root">sleeps</span></td>
                                    <td><span className="badge subject">cat</span></td>
                                    <td>가장 기본적인 구조</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">수동태<br /><span className="sub-text">(Passive)</span></td>
                                    <td>"The ball <strong>was thrown</strong>."</td>
                                    <td><span className="badge root">thrown</span></td>
                                    <td><span className="badge subject">ball</span></td>
                                    <td>동작을 당하는 대상이 주어</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">중문<br /><span className="sub-text">(Compound)</span></td>
                                    <td>"I <strong>eat</strong> and <strong>read</strong>."</td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge root">eat</span>
                                            <span className="badge root">read</span>
                                        </div>
                                    </td>
                                    <td><span className="badge subject">I</span></td>
                                    <td>접속사(and)로 연결된<br />두 동사 모두 정답</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">복문<br /><span className="sub-text">(Complex)</span></td>
                                    <td>"She <strong>left</strong> because it <strong>rained</strong>."</td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge root">left</span>
                                            <span className="badge root">rained</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="multi-badge">
                                            <span className="badge subject">She</span>
                                            <span className="badge subject">it</span>
                                        </div>
                                    </td>
                                    <td>종속절(because)의 동사도<br />Root로 취급</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">부정사구<br /><span className="sub-text">(Phrasal)</span></td>
                                    <td>"To <strong>win</strong> is hard."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td><span className="badge subject">win</span></td>
                                    <td>To+동사가 주어 역할<br />(심화: 주어구 전체 선택)</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">동명사구<br /><span className="sub-text">(Gerund)</span></td>
                                    <td>"<strong>Swimming</strong> is fun."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td><span className="badge subject">Swimming</span></td>
                                    <td>동사+ing가 주어 역할</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">분사 수식<br /><span className="sub-text">(Participle)</span></td>
                                    <td>"The car <strong>made</strong> in Korea <strong>is</strong> good."</td>
                                    <td><span className="badge root">is</span> (본동사)</td>
                                    <td><span className="badge subject">car</span></td>
                                    <td>분사(made)는 수식어,<br />본동사(is)가 Root</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">조동사<br /><span className="sub-text">(Auxiliary)</span></td>
                                    <td>"You <strong>can do</strong> it."</td>
                                    <td><span className="badge root">do</span></td>
                                    <td><span className="badge subject">You</span></td>
                                    <td>조동사(can)는 본동사(do)를 도움.<br />본동사가 Root</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">유도부사<br /><span className="sub-text">(Expletive)</span></td>
                                    <td>"There <strong>is</strong> a <strong>dog</strong>."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td><span className="badge subject">dog</span></td>
                                    <td>Here/There 구문은<br />동사 뒤에 주어가 위치</td>
                                </tr>
                                <tr>
                                    <td className="type-cell">가주어<br /><span className="sub-text">(Dummy It)</span></td>
                                    <td>"It <strong>is</strong> hard <strong>to study</strong>."</td>
                                    <td><span className="badge root">is</span></td>
                                    <td><span className="badge subject">It</span></td>
                                    <td>형식상 주어 It을 선택<br />(진주어는 뒤에 있음)</td>
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
