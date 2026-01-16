# 개발 일지 (Development Log) - v1.0

## 상태 (Status)

> [!NOTE]
> v1.0.0 정식 릴리즈 및 서비스 배포 완료. CI/CD 파이프라인 가동 중.

### 핵심 기능 (학생 모드) ✅
- [x] 초기화 (Initialization)
- [x] 프론트엔드 구현 (Frontend Implementation)
    - [x] StartScreen - 지문 입력 및 시작
    - [x] QuizScreen - Root/Subject 찾기 퀴즈, SubjectSpan 밑줄 힌트
    - [x] SummaryScreen - 결과 요약 표시
    - [x] AppHeader - 교사 로그인 링크 UI (기능은 미구현)
- [x] 백엔드 구현 (Backend Implementation)
    - [x] FastAPI + spaCy 분석 API
    - [x] SQLite 세션/진행상황 저장
- [x] 통합 및 테스트 (Integration & Testing)
    - [x] 프론트-백엔드 연동
    - [x] 세션 복원 (localStorage)

### 미구현 항목 ❌
- [x] **보안 기능** ✅
    - [x] IP Rate Limit (30/분) - `slowapi` 라이브러리
    - [x] API Key 인증 의존성 함수 준비 (`auth/middleware.py`)
- [x] **프론트엔드 구조 개선** ✅
    - [x] QuizContext (전역 상태 관리 분리)
    - [x] SummaryScreen 오답 문장 클릭 → 해당 문장 점프
    - [x] useQuiz 훅 분리 (비즈니스 로직 캡슐화 완료)
- [x] **교사 모드 (Teacher Mode) 구현** ✅
    - [x] 학생 관리 및 통계 대시보드 구축
    - [x] 학생 데이터 삭제 기능 (Cascade 연동)
    - [x] 관리자 인증 시스템 (bcrypt)
- [x] **배포** (Fly.io 자동 배포 설정 완료) ✅
    - [x] Fly.io Docker 빌드 및 배포 자동화 (GitHub Actions)
    - [x] SQLite 데이터 영구 보존용 볼륨(Volume) 설정

### 2026-01-16 - 교사 모드 구현 및 배포 자동화
- **교사 모드 (Teacher Mode)**:
    - **대시보드 구축**: 학생별 정답률(Root/Subject), 완료 문장 수, 최근 학습 일시 집계 쿼리 및 UI 구현.
    - **데이터 관리**: 미지정 세션을 학생 이름으로 배정하거나, 학생 및 관련 모든 데이터(Cascade 삭제)를 삭제하는 기능 추가.
    - **인증**: `bcrypt` 기반 관리자 비밀번호 인증 시스템 및 전용 로그인 화면 구축.
- **프로젝트 정식화 및 문서화**:
    - **README & License**: 프로젝트 소개, 기능, 설치 가이드 작성이 담긴 `README.md`와 `MIT License` 적용.
    - **버전 관리**: 원격 저장소(`GitHub`) 연동 및 첫 정식 버전 `v1.0.0` 태그 발행.
- **Fly.io 배포 및 CI/CD 구축**:
    - **Docker 통합 빌드**: React 빌드 파일을 FastAPI 서버(`static` 폴더)에 포함하여 서빙하는 멀티 스테이지 Dockerfile 작성.
    - **자동 배포**: GitHub Actions를 통해 `master` 브랜치 푸시 시 Fly.io로 자동 배포되는 파이프라인 구축.
    - **데이터 보존**: SQLite DB 파일 기록을 위한 Fly.io 볼륨(`vg_data`) 마운트 및 연동.
- **트러블슈팅 (Troubleshooting)**:
    - **인증 토큰(Macaroons) 오류**: Fly.io GitHub SSO 계정의 경우 로컬에서 생성된 일반 토큰이 CI/CD 환경에서 거부되는 문제 발생. -> `fly tokens create org`를 통해 조직 수준의 배포 전용 토큰을 발급하여 해결.
    - **라우팅 충돌**: 서버 루트 경로(`/`)에 기본 API 응답이 설정되어 있어 정적 파일(`index.html`) 서빙이 차단되는 문제. -> 루트 API 엔드포인트 제거 후 `StaticFiles`가 우선적으로 처리하도록 수정.
    - **통계 집계 오류**: SQL JOIN 시 중복 행 발생으로 총 문장 수가 배수로 계산되는 문제. -> 서브쿼리를 사용하여 정확한 통계 산출 방식으로 쿼리 개선.

### 2026-01-16 - 프론트엔드 구조 개선 및 점프 기능
- **QuizContext 도입**:
    - `useReducer` 로직을 Context로 이동하여 앱 전역에서 퀴즈 상태 공유 가능.
    - `main.jsx`에서 `QuizProvider` 적용.
- **오답 문장 점프 구현**:
    - SummaryScreen의 오답 항목 클릭 시 해당 문장으로 즉시 이동 기능 추가.
    - `initialState` 초기화 및 `JUMP_TO_SENTENCE` 액션 구현.
- **UI/UX 개선**:
    - SummaryScreen 오답 항목에 호버 효과 및 클릭 가능 안내 추가.
    - QuizScreen에서 비활성 문장 클릭 시에도 해당 문장으로 이동 가능하게 확장.

### 2026-01-16 - 보안 기능 추가
- **Rate Limiting 구현**:
    - `slowapi` 패키지 설치 및 `auth/middleware.py` 모듈 생성.
    - 주요 API 엔드포인트에 IP당 30회/분 제한 적용.
    - `/api/sessions/{id}/progress`는 빈번한 저장을 고려해 60회/분으로 설정.
- **API Key 인증 준비**:
    - 환경변수 `VG_API_KEY` 기반 의존성 함수 구현.
    - 교사 모드 구현 시 `/api/admin/*` 엔드포인트에 적용 예정.

### 2026-01-16 - 핵심 기능 구현 및 트러블슈팅
- **백엔드 구축 (Python/FastAPI)**
    - Python 3.14 호환성 문제로 3.11로 다운그레이드 및 환경 재설정.
    - `spaCy` 모델(`en_core_web_sm`) 다운로드 및 NLP 분석 로직 구현.
    - API 엔드포인트 `/api/analyze-passage` 구현 (CORS 설정 포함).

- **프론트엔드 구현 (React/Vite)**
    - **QuizScreen 구현**:
        - 문장별 Root/Subject 찾기 단계별 로직 구현.
        - 토큰 클릭 인터랙션 및 정답/오답 피드백(품사 기반 힌트) 시스템 구축.
        - UI 개선: 문장 카운터(Current/Total) 추가, 태블릿 대응 스크롤 뷰포트 최적화.
    - **UI/UX 개선 (2차)**:
        - 지시문 상단 배치 (시험 문제 스타일).
        - 버튼 스타일 개선 (둥근 사각형, '이전 문장' 텍스트 변경).
        - 모든 블록 수평 정렬 통일 (좌/우 경계 일치).
        - 지시문/본문 블록 패딩 통일.
        - ROOT 정답 시 자동으로 SUBJECT 단계 전환 (1초 딜레이).
    - **SummaryScreen 구현**:
        - 전체/Root/Subject 정확도 표시 (원형 스코어 UI).
        - 등급 표시 (이모지 + 메시지: 🏆완벽해요, 👏잘했어요, 💪조금만 더, 📚다시 도전).
        - 틀린 문장 목록 (동사/주어 오답 뱃지).
        - "새로운 지문으로 시작하기" 버튼.
    - **트러블슈팅**:
        - `App.jsx` 내 `StartScreen` import 누락으로 인한 빈 화면 오류 수정.
        - `QuizScreen`의 복잡한 상태 관리 로직 안정화.

- **세션 및 DB 구현**
    - **백엔드 DB 구축**:
        - SQLite 스키마 생성 (`db/database.py`): `sessions`, `progress` 테이블.
        - 세션 API 엔드포인트 (`main.py`): `POST /api/sessions`, `GET /api/sessions/{id}`, `PUT /api/sessions/{id}/progress`.
    - **프론트엔드 세션 관리**:
        - `services/api.js`: API 호출 모듈화 및 localStorage 헬퍼 함수.
        - `App.jsx`: 세션 저장/복원 로직 (useEffect로 세션 복원, 문장 완료 시 API 저장).
        - `QuizScreen.jsx`: savedProgress props 연동으로 저장된 진행 상황 반영.

### 2026-01-15 - 프로젝트 착수 및 설계
- **기획 및 설계**
    - `VerbGravity` 프로젝트 핵심 가치("능동적 탐색과 즉각적 교정") 정립.
    - UI/UX 와이어프레임 및 아이패드용 디자인 목업 검증.
    - 기술 스택 확정 (Vite + React, FastAPI + spaCy).
- **프로젝트 초기화**
    - Git 저장소 초기화 및 디렉토리 구조(`client`, `server`, `docs`) 생성.
    - Vite 프로젝트 생성 및 공통 디자인 시스템(`index.css`) 적용.
    - 문서화 체계 수립 (`CONTRIBUTING.md`, 워크플로우).
