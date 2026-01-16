# PR: 채점 모드 저장 및 교사 대시보드 개선 (Grading Mode Persistence)

## 1. 주요 변경 사항
- [x] **지문 관리 및 NLP 고도화 (Passage DB & Advanced NLP)**
    - **지문 DB**: `passages` 테이블 생성 및 mock data 제거, 지문 저장/조회/삭제 API(`CRUD`) 및 UI 구현
    - **복합문 처리**: `conj`(등위접속사), `ccomp`(보문절) 의존성 분석을 통해 문장 내 다중 동사/주어 식별 로직 구현
    - **주어구 인식**: `subj.subtree`를 활용하여 수식어를 포함한 전체 주어구(Subject Span) 식별 (심화 모드용)
    - **특수 구문**: 유도부사(`There is...`), 가주어(`It`), 명령문 등 다양한 문장 패턴 처리 로직 강화
- [x] **채점 모드 저장 (Grading Mode Persistence)**
    - DB 스키마 변경: `sessions` 테이블에 `mode` 컬럼 추가 (Default: 'FULL')
    - 백엔드 API: 세션 생성 시 모드 저장 및 조회 시 반환 로직 구현
    - 프론트엔드: `StartScreen`에서 선택된 모드 값을 API로 전송, 세션 복원 시 로컬 스토리지 동기화
- [x] **교사 대시보드 개선 (Teacher Dashboard)**
    - 학생 목록 및 세션 목록에 '기초(CORE)' / '심화(FULL)' 모드 배지 표시
    - 날짜/시간 표시 버그 수정: UTC('Z') 처리를 명시하여 한국 시간(KST)으로 올바르게 변환되도록 개선
- [x] **UI/UX 개선**
    - `TeacherDashboard`: 모드 배지 디자인 추가 (`pink`/`blue`)
    - `StartScreen`: 패딩 조정 (`40px` -> `36px`)
    - `index.css`: 기본 줄 간격 조정 (`1.5` -> `1.3`)

## 2. 검증 결과
- [x] `npm run dev` 및 백엔드 서버 실행 확인
- [x] 세션 생성 시 모드 값(CORE/FULL)이 DB에 정상 저장됨 확인 (`test_mode_persistence.py` 검증 시도 및 수동 확인)
- [x] 교사 대시보드에서 학생별 모드 배지가 올바르게 표시됨 확인
- [x] 교사 대시보드에서 '최근 학습' 시간이 한국 시간으로 정확히 표시됨 확인

## 3. Review Point
- `TeacherDashboard.jsx`의 날짜 변환 로직 (`.includes('Z')` 체크 부분)이 적절한지
- DB 스키마 변경(`mode` 컬럼 추가)에 따른 기존 데이터 호환성 (개발 단계라 DB 초기화로 처리함)
