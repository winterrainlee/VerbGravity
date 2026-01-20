---
description: 작업 완료(PR) 자동화 (테스트, PR 초안, 교훈 기록)
---

# PR (Pull Request) 워크플로우

하나의 기능 구현 작업이 끝났을 때 수행하는 워크플로우입니다.

## 1단계: 기본 검증
1. `npm run dev` 명령어로 서버가 정상 실행되는지 확인(Health Check)하라고 사용자에게 제안합니다.
2. **NLP 로직 변경 확인**: 만약 `server/nlp/analyzer.py` 등 NLP 로직이 수정되었다면, `README.md`의 파싱 예시와 앱 내 `GrammarGuideModal.jsx`의 가이드 내용도 최신화되었는지 확인합니다.

## 2단계: PR 초안 파일 생성
1. 현재 날짜와 기능명을 포함한 파일명으로 PR 초안을 생성합니다.
   - 경로: `docs/logs/pr/pr-vX.Y-{기능명}.md`
   - **PR 템플릿**:
     ```markdown
     # PR: [기능명] 구현

     ## 1. 주요 변경 사항
     - [ ] (A 기능 구현)
     - [ ] (B 버그 수정)

     ## 2. 검증 결과
     - [x] npm run dev 실행 확인
     - [ ] NLP 로직 변경에 따른 가이드(README, GrammarGuide) 업데이트 여부
     - [ ] (추가 검증 내용)

     ## 3. Review Point
     - (사용자가 중점적으로 봐줬으면 하는 부분)
     ```
2. 생성된 PR 파일을 에디터로 엽니다.

## 3단계: 마무리
- "PR 초안 작성이 완료되었습니다! 내용을 채우고 사용자 리뷰를 요청하세요."라고 알립니다.