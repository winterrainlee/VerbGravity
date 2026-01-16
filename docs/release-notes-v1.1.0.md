# VerbGravity v1.1.0 Release Notes

**Release Date:** 2026-01-16

## 🚀 Highlights (What's New)

이번 **v1.1.0** 업데이트는 선생님들을 위한 관리 기능과 심화 학습을 위한 NLP 고도화에 중점을 두었습니다.
이제 선생님은 저장된 지문을 자유롭게 활용할 수 있으며, 학생들의 학습 모드(기초/심화)에 따른 성취도를 정확하게 파악할 수 있습니다.

### 1. 지문 관리 데이터베이스 (Passage DB)
*   **지문 저장소(Repository) 구축**: 이제 지문이 파일 기반이 아닌 SQLite 데이터베이스에 안전하게 저장됩니다.
*   **관리 기능 추가**: 교사 대시보드에서 새로운 지문을 직접 추가, 조회, 삭제할 수 있습니다.
*   **편의성**: 학생들이 "지문 불러오기" 버튼을 통해 선생님이 등록해둔 지문을 손쉽게 선택하여 학습할 수 있습니다.

### 2. 채점 모드 저장 및 관리 (Grading Mode Persistence)
*   **모드별 성적 추적**: 학생들이 **기초(Core)** 모드와 **심화(Full)** 모드 중 어떤 것으로 학습했는지 DB에 저장됩니다.
*   **교사 대시보드 개선**: 학생 목록과 최근 세션 목록에 **[기초] / [심화] 배지**가 표시되어, 어떤 난이도로 학습했는지 한눈에 구별할 수 있습니다.
*   **데이터 신뢰성**: 세밀한 성적 분석을 위한 기반 데이터가 마련되었습니다.

### 3. NLP & 학습 로직 고도화 (Advanced NLP)
*   **복합문(Compound Sentence) 지원**: `and`, `but`, `or` 등으로 연결된 문장에서 다중 동사와 주어를 정확히 찾아냅니다.
*   **주어구(Subject Span) 인식 강화**: 수식어를 포함한 긴 주어구 전체를 정답으로 인정하는 로직이 정교해졌습니다.
*   **특수 구문 처리**:
    *   **유도부사(Expletive, There is...)**: 가주어 `There` 대신 진주어(Logical Subject)를 찾도록 유도합니다.
    *   **가주어(Dummy It)**: 문법적 주어로서의 `It`을 정답으로 인정합니다.
    *   **문법 가이드**: 학습 중 헷갈리는 문법(분사, 동명사 등)에 대한 예시 가이드를 제공합니다.

### 4. UI/UX Improvements
*   **시간대 자동 변환**: 교사 대시보드의 모든 시간이 한국 시간(KST) 등 사용자 로컬 시간대에 맞게 표시됩니다.
*   **Visual Feedback**: 모드별 배지 디자인(Pink/Blue)을 적용하여 시인성을 높였습니다.
*   **Toast Notification**: 학습 중 중요한 알림을 더 직관적인 상단 토스트 메시지로 제공합니다.

---

## 🔧 Technical Details
*   **Frontend**: `StartScreen` padding adjustment, `react-hot-toast` integration.
*   **Backend**: `sessions` table schema update (added `mode` column), `passages` table added.
*   **Database**: Migrated to SQLite with foreign key constraints enabled.

---

## Special Thanks
피드백을 주신 선생님들과 사용자분들께 감사드립니다! 🎓
