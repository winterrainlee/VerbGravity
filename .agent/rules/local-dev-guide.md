# VerbGravity 로컬 개발 환경 가이드

## Python 환경

| 항목 | 값 |
|------|---|
| Python 버전 | **3.11** (spaCy 호환성) |
| venv 위치 | `server/venv` |
| 실행 방법 | `& "서버경로\server\venv\Scripts\python.exe" -m uvicorn main:app --reload` |

> ⚠️ Python 3.14는 spaCy와 호환되지 않음. 반드시 3.11 사용.

## 백엔드 서버 실행 (PowerShell)

```powershell
# 올바른 실행 방법 (& 연산자 사용)
& "C:\Users\winte\OneDrive\Documents\Antigravity\VerbGravity\server\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 의존성 설치
& "C:\...\server\venv\Scripts\pip.exe" install -r requirements.txt
```

> **주의**: PowerShell에서 경로에 공백이 있으면 `& "경로"` 형식으로 실행해야 함.

## 프론트엔드 서버 실행

```powershell
cd client
npm.cmd run dev
```

## 자주 발생하는 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `No module named 'spacy'` | Python 버전 불일치 | `server/venv` (Python 3.11) 사용 |
| `No module named 'bcrypt'` | 의존성 누락 | `pip install bcrypt` |
| `token '&&' is not valid` | PowerShell 문법 | `&&` 대신 `;` 또는 별도 명령 실행 |
| `UnexpectedToken '-m'` | 경로 따옴표 문제 | `& "경로"` 형식 사용 |
