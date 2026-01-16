---
description: 안전한 코드 수정을 위한 feature 브랜치 생성
---

1. 현재 변경사항이 있는지 확인합니다.
   // turbo
   git status

2. (변경사항이 있다면) 사용자에게 stash 또는 commit을 요청합니다.
   - 변경사항이 없다면 다음 단계로 진행합니다.

3. master 브랜치로 전환하고 최신 코드를 가져옵니다.
   // turbo
   git checkout master
   // turbo
   git pull origin master

4. 사용자에게 생성할 브랜치의 버전명(예: v1.4.0)을 확인합니다.

5. 새로운 feature 브랜치를 생성하고 전환합니다.
   git checkout -b feature/{버전명}

6. 브랜치 생성을 완료하고 사용자에게 알립니다.
