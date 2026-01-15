---
description: VerbGravity 프로젝트 구조 초기화 (React + FastAPI)
---

# 프로젝트 초기화 워크플로우

1. **디렉토리 구조 생성**
   - `client` 및 `server` 디렉토리 생성.
   - `docs` 디렉토리 확인 (이미 존재).

2. **프론트엔드 초기화 (Vite + React)**
   - `npx -y create-vite@latest client --template react` 실행
   - 의존성 설치: `cd client && npm install`
   - 필수 라이브러리 설치: `npm install lucide-react` (아이콘)

3. **백엔드 초기화 (FastAPI)**
   - `server` 디렉토리 생성.
   - 가상환경 생성: `python -m venv venv`
   - `requirements.txt` 생성:
     ```
     fastapi
     uvicorn[standard]
     spacy
     pydantic
     ```

4. **Git 초기화**
   - `git init` 실행
   - `.gitignore` 생성:
     ```
     node_modules/
     venv/
     __pycache__/
     .env
     .DS_Store
     dist/
     ```

5. **첫 커밋**
   - 모든 파일 스테이징.
   - 커밋: `chore: initialize project structure`
