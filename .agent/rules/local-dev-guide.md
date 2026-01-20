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

---

## 🛠️ 작업 및 커밋 규칙

### 1. 코드 수정과 Git 작업 분리
- **코드 수정**: 사용자가 구현 계획을 승인하면 **코드 수정(Write/Edit)까지만** 진행합니다.
- **중간 확인**: 코드 수정이 완료되면 사용자에게 변경 사항을 보고하고, **커밋 및 푸시 여부를 별도로 확인**받습니다.
- **커밋/푸시**: 사용자가 승인한 경우에만 `git commit` 및 `git push` 명령을 실행합니다.

> [!IMPORTANT]
> 코드 수정 직후 자동으로 커밋하지 마세요. 반드시 사용자의 최종 승인 단계를 거쳐야 합니다.
