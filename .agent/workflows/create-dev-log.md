---
description: 현재 버전을 위한 새로운 개발 일지 생성
---

# 개발 일지 생성 워크플로우

1. **버전 확인**
   - 현재 목표 버전을 확인합니다 (예: v1.0).

2. **파일 생성**
   - 경로: `docs/dev-log-v{버전}.md`

3. **템플릿 내용**
   ```markdown
   # 개발 일지 (Development Log) - v{버전}

   ## 상태 (Status)
   - [ ] 초기화 (Initialization)
   - [ ] 프론트엔드 구현 (Frontend Implementation)
   - [ ] 백엔드 구현 (Backend Implementation)
   - [ ] 통합 및 테스트 (Integration & Testing)

   ## 일지 항목 (Log Entries)
   
   ### {날짜} - 프로젝트 시작
   - 프로젝트 구조 생성.
   - 운영 규칙 정의.
   ```
