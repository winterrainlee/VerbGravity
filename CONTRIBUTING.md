# VerbGravity 기여 가이드 (Contribution Guide)

## 1. 브랜치 전략 (Branch Strategy)
**"기능 단위 브랜치 워크플로우 (Feature Branch Workflow)"**
- **main**: 배포 가능한 안정 버전 (Production). (태그: `v1.0`, `v1.1`)
- **feature/v{버전}-{기능명}**: 실제 개발이 진행되는 브랜치.
  - 예: `feature/v1.0-init`, `feature/v1.0-ui`
- **병합 (Merge)**: 검증 후 PR 또는 `main`으로 직접 병합. 병합 후 기능 브랜치는 삭제합니다.

## 2. 문서화 표준 (Documentation Standards)
모든 문서는 `docs/` 디렉토리 내에서 버전별로 관리합니다.

| 파일명 | 용도 | 작성 시점 |
| :--- | :--- | :--- |
| `docs/spec-v{X}.{Y}.md` | 버전 명세서 | 코딩 전 |
| `docs/dev-log-v{X}.{Y}.md` | 개발 일지 (의사결정, 문제해결) | **수시로** |
| `docs/verification-v{X}.{Y}.md` | 테스트 결과 | 코딩 후 |
| `docs/release-notes-v{X}.{Y}.md` | 릴리즈 노트 | 배포 시 |

## 3. 커밋 규칙 (Commit Convention)
[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 포맷팅, 세미콜론 누락 등 (코드 동작 변경 없음)
- `refactor`: 리팩토링 (기능/버그 수정 없음)
- `chore`: 빌드 업무, 패키지 매니저 설정 등

## 4. 디렉토리 구조
```
/
├── .agent/             # 에이전트 워크플로우 및 스킬
├── docs/               # 버전별 문서
├── client/             # React 프론트엔드
├── server/             # FastAPI 백엔드
└── CONTRIBUTING.md     # 운영 정책
```
