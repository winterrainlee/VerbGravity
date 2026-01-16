# 🌱 VerbGravity

> **문장의 핵심을 찾아서, VerbGravity**

![Version](https://img.shields.io/badge/version-v1.1.0-green)
![Last Updated](https://img.shields.io/badge/last%20updated-2026--01--16-blue)

VerbGravity는 영어 문장의 핵심 요소인 **Root(동사)** 와 **Subject(주어)** 를 스스로 찾아내며 문장 구조를 체득하는 **능동형 문법 훈련 웹앱**입니다. 단순히 분석 결과를 보여주는 것을 넘어, 학습자가 직접 탐색하고 즉각적인 피드백을 통해 교정하는 과정을 제공합니다.

---

## ✨ 핵심 기능

### 1. 지능형 영어 분석 (NLP Analysis)
- **FastAPI + spaCy** 연동으로 입력된 영문 지문을 실시간 분석합니다.
- 문장별 Root 동사와 Subject 헤드를 정확히 추출하여 학습용 퀴즈 데이터를 생성합니다.

### 2. 단계별 퀴즈 시스템 (Step-by-Step Quiz)
- **Step 1: Root 찾기**: 문장의 중심이 되는 의미 동사를 선택합니다.
- **Step 2: Subject 찾기**: 해당 동사의 주체가 되는 주어 핵심어를 선택합니다.
- **즉각 피드백**: 선택 즉시 정오답 여부와 함께 시각적 피드백을 제공합니다.

### 3. 오답 복습 모드 (Review Mode)
- 틀린 문장만 모아서 다시 풀어볼 수 있는 복습 기능을 제공합니다.
- 복습 성공 시 성취감을 주는 격려 메시지와 함께 학습 완료 상태를 추적합니다.

### 4. 세션 유지 및 복구 (Persistence)
- **SQLite** 백엔드 연동으로 페이지를 새로고침하거나 나중에 다시 접속해도 이전 학습 진행 상황을 그대로 이어갈 수 있습니다.

### 5. 교사용 관리 대시보드 (Teacher Mode)
- **로그인**: 관리자 비밀번호를 통해 교사용 화면에 접속합니다.
- **학생 관리**: 생성된 세션을 특정 학생 이름으로 배정하거나 삭제할 수 있습니다.
- **학습 통계**: 학생별 정답률(동사/주어), 완료 문장 수, 최근 학습 일시를 한눈에 파악합니다.

---

## 🛠 기술 스택

### Frontend
- **Framework**: Vite + React 18
- **State Management**: React Context API + useReducer (useQuiz 커스텀 훅)
- **Styling**: Vanilla CSS (CSS Variables 기반 디자인 시스템)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **NLP Library**: spaCy (`en_core_web_sm`)
- **Database**: SQLite (SQLAlchemy 없이 경량 쿼리 사용)
- **Security**: slowapi (Rate Limiting), bcrypt (Admin Auth)

---

## 📂 프로젝트 구조

```text
VerbGravity/
├── client/              # Vite + React 프론트엔드
│   ├── src/
│   │   ├── components/  # 기능별 UI 컴포넌트
│   │   ├── context/     # 전역 상태 관리 (QuizContext)
│   │   ├── hooks/       # 비즈니스 로직 (useQuiz)
│   │   └── services/    # API 통신 모듈
├── server/              # FastAPI 백엔드
│   ├── db/              # SQLite DB 연동 및 초기화
│   ├── nlp/             # spaCy 분석 로직
│   ├── auth/            # 보안 및 인증 미들웨어
│   └── main.py          # 서버 엔트리 포인트
└── docs/                # 프로젝트 명세서 및 개발 로그
```

---

## 🚀 시작하기

### 1. 백엔드 설정
```bash
cd server
python -m venv venv
source venv/bin/scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

### 2. 프론트엔드 설정
```bash
cd client
npm install
npm run dev
```

### 3. 일괄 실행 (Windows)
루트 디렉토리의 `VerbGravity-start.bat` 파일을 실행하여 백엔드와 프론트엔드를 동시에 켤 수 있습니다.

---

## 🎨 디자인 시스템
- **Theme**: 파스텔 그린 & 민트 (Primary #22c55e)
- **Typography**: Inter (Google Fonts)
- **Adaptive**: iPad Pro 가로 모드 및 iOS Safari 최적화

---

## ⚖️ License
This project is licensed under the **MIT License**. 
개인적인 학습 용도 및 교육 현장에서 자유롭게 수정 및 배포가 가능합니다. details can be found in the [LICENSE](LICENSE) file.
