# 개발 일지 (Development Log) - v1.1

## 상태 (Status)
- [x] 기능 범위 정의 (Feature Scope)
- [x] 프론트엔드 구현 (Frontend Implementation)
- [x] 백엔드 구현 (Backend Implementation)
- [x] 통합 및 테스트 (Integration & Testing)
- [ ] 배포 (Deployment)

## 일지 항목 (Log Entries)

### 2026-01-16 - 기능 3: 문법 가이드 및 UX 개선 (v1.1.3)
- **Grammar Guide**:
  - `GrammarGuideModal`: 7가지 문법 유형(단문, 수동태, 중문 등) 예시를 표 형태로 제공하는 팝업 구현.
  - `GrammarGuideModal`: 예시 보강 (조동사, 유도부사, 가주어 추가 및 분사 구문 예시 구체화).
  - `QuizScreen`: 오답 피드백 발생 시에만 "문법 안내" 버튼이 조건부로 노출되도록 로직 적용 (스스로 학습 유도).
- **UX Refinement**:
  - `QuizScreen`: 헤더에 현재 채점 모드(기초/심화) 표시 배지 추가.
  - `QuizScreen`: 심화 모드(FULL)의 난이도를 고려하여 정답 개수 힌트(예: "2개") 제거.
  - `useQuiz`: 심화 모드 오답 시 구체적인 단어 수 힌트 대신 "주어구 전체를 선택하세요" 메시지 제공.
  - `QuizScreen`: 모드 배지 클릭 시 상세 설명 토스트(Toast) 팝업 제공 (`react-hot-toast` 적용).
- **Grading Mode Persistence (기능 4)**:
  - `Database`: `sessions` 테이블에 `mode` 컬럼 추가 (Default: 'FULL').
  - `API`: 세션 생성(`POST /api/sessions`) 시 모드 값 저장, 조회(`GET`) 시 반환.
  - `TeacherDashboard`: 학생 목록 및 세션 목록에 기초/심화 모드 배지(Badge) 표시.
  - `TeacherDashboard`: 날짜/시간 표시 시 UTC('Z') 처리를 명시하여 한국 시간(KST) 등 로컬 시간대로 올바르게 변환되도록 수정.

### 2026-01-16 - 디자인 개선 및 관리 편의성 강화 (v1.1)
- **Design Improvements**:
  - `TeacherDashboard`: 반응형 레이아웃 적용 (모바일 대응), 테이블 스크롤 및 버튼 텍스트 축약(배정) 처리.
  - `QuizScreen`: "지문 초기화" 버튼과 "(you 생략)" 버튼 위치 교체. "지문 초기화"는 우측 끝으로, "(you 생략)"은 중앙 액션 그룹으로 이동하여 사용성 개선.
  - `TeacherDashboard`: CSS 유틸리티 클래스 및 새로운 버튼 스타일(text-red) 추가.
- **Session Management**:
  - 백엔드: 세션 개별 삭제 및 전체 삭제 API (`DELETE /api/admin/sessions/{id}`, `DELETE /api/admin/sessions`) 추가.
  - 프론트엔드: 대시보드에서 세션 삭제(개별/전체) 기능 연동 및 UI 구현.

### 2026-01-16 - 기능 3: 채점 모드 설정 기능 추가 (v1.1.2)
- **배경**: 지적 수준에 따른 차별화된 학습 경험 제공 (기초: 핵심 단어 위주 / 심화: 주어구 전체)
- **수정**:
  - `TeacherDashboard.jsx`: 채점 모드 설정 UI 추가 (핵심 단어만 / 주어구 전체)
  - `useQuiz.js`: `localStorage`의 `vg_grading_mode`에 따라 정답 판정 및 힌트 개수 로직 분기
  - `QuizScreen.jsx`: 기초 모드에서만 핵심 단어 밑줄 표시, 심화 모드에서는 힌트(밑줄) 제거
- **테스트**:
  - 기초(CORE): "win" 아래에만 밑줄 표시 + "win"만 선택해도 정답 ✓
  - 심화(FULL): 밑줄 없음 + "To win the match" 전체 선택해야 정답 ✓

### 2026-01-16 - 주어구 전체 선택 필수 기능 추가 (v1.1.1)
- **배경**: 주어가 구(phrase)인 경우 핵심 단어만 선택해도 정답 처리되던 문제
- **수정**:
  - `useQuiz.js`: subjects 대신 subjectSpans 전체 비교 로직으로 변경
  - 힌트 메시지 개선 ("주어구가 4개 단어입니다")
- **테스트**: "To win the match is not everything." 문장으로 테스트 성공
  - "win"만 선택 → 오답 ✓
  - "To win the match" 4개 전체 선택 → 정답 ✓

### 2026-01-16 - 기능 2: 복합문 처리 구현 완료
- **백엔드**:
  - `analyzer.py`: `find_all_roots()`, `find_subjects_for_roots()` 함수 추가
  - `conj`(and/or/but 병렬) 및 `ccomp`(so/because 종속절) 패턴 탐지
  - `models.py`: AnswerKey를 `roots`/`subjects` 배열로 변경
- **프론트엔드**:
  - `QuizContext.jsx`: `selections` 배열로 복수 선택 지원
  - `useQuiz.js`: 배열 비교 로직 및 복수 정답 힌트 메시지
  - `QuizScreen.jsx`: 복수 선택 UI 및 "2개" 힌트 표시
  - `QuizScreen.css`: multi-hint 스타일 추가
- **테스트**: "Then we listened to each other and made a plan." 문장으로 테스트 성공
  - 2개 동사(listened, made) 복수 선택 ✓
  - 공통 주어(we) 정답 처리 ✓

### 2026-01-16 - 기능 1: 지문 DB 구현 완료
- **백엔드**:
  - `database.py`: passages 테이블 추가
  - `models.py`: PassageCreateRequest, PassageItem 모델 추가
  - `main.py`: GET/POST/DELETE /api/passages 엔드포인트 추가
- **프론트엔드**:
  - `api.js`: getPassages, createPassage, deletePassage 함수 추가
  - `StartScreen.jsx`: 저장된 지문 불러오기 UI 추가
  - `TeacherDashboard.jsx`: 지문 관리 섹션 (추가/삭제) 추가
  - CSS 스타일 추가
- **테스트**: 브라우저에서 지문 추가/불러오기 기능 정상 작동 확인

## 트러블슈팅 (Troubleshooting)

| 문제 | 원인 | 해결 |
|------|------|------|
| Python 3.14/spacy 호환성 오류 | venv 버전 혼동 | server/venv (Python 3.11) 사용 |
| bcrypt 모듈 누락 | 의존성 미설치 | pip install bcrypt |
| 수동태 주어 인식 불가 | `nsubjpass` 누락 | analyzer.py에 `nsubjpass` 패턴 추가 |
| Failed to fetch (서버 연결 불가) | 백엔드 프로세스 포트(8000) 점유 문제 | `taskkill`로 프로세스 강제 종료 후 재시작 |
| 브라우저 자동 테스트 실패 | CDP 연결 오류 | 수동 테스트 권장 및 서버 상태 우선 점검 |
| Failed to fetch (Admin API) | AdBlock 등이 URL의 `admin` 키워드 차단 | API 경로를 `/api/admin`에서 `/api/manage`로 변경 |
| 세션 삭제 500 오류 | 구 DB 스키마(FK ON DELETE 미적용) + DB 경로 혼선 | DB 재생성/마이그레이션 후 DB 경로 고정 |

## 교훈 (Lessons Learned)
- spaCy의 의존 관계 태그 명명 규칙(`nsubj:pass` vs `nsubjpass`)은 버전에 따라 다를 수 있으므로 폭넓게 대응(Wildcard/List)하는 것이 안전함.
- `localStorage`를 활용한 전역 설정은 서버 변경 없이도 강력한 사용자 맞춤형 기능을 제공할 수 있음.
- API 엔드포인트 설계 시 `admin`, `ad`, `analytics` 등 차단 필터에 걸릴 수 있는 키워드는 피하는 것이 좋음. (`api/manage` 권장)
- SQLite 스키마(특히 FK/ON DELETE) 변경은 기존 DB에 자동 반영되지 않으므로 마이그레이션/재생성 절차와 DB 경로 기준을 함께 관리해야 함.
