---
name: coding-style-guide
description: VerbGravity 프로젝트의 코딩 스타일 및 컨벤션 가이드. 코드 작성, 리뷰, 리팩토링 시 자동으로 참조됩니다. Python(FastAPI), JavaScript(React/Vite) 코드에 적용됩니다.
version: "1.0.0"
---

# 코딩 스타일 가이드 (Coding Style Guide)

VerbGravity 프로젝트의 코드 작성 표준을 정의합니다.

## 적용 시점

다음 상황에서 이 가이드를 참조하세요:
- 새로운 코드 작성 시
- 기존 코드 리뷰/리팩토링 시
- PR 제출 전 코드 점검 시

---

## 1. 프로젝트 구조

```
VerbGravity/
├── client/                   # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   ├── context/          # React Context
│   │   ├── services/         # API 호출
│   │   └── assets/           # 정적 리소스
│   └── public/
├── server/                   # 백엔드 (FastAPI)
│   ├── nlp/                  # NLP 분석 로직
│   ├── db/                   # 데이터베이스
│   ├── auth/                 # 인증/미들웨어
│   ├── models.py             # Pydantic 모델
│   └── main.py               # 엔트리포인트
├── tests/                    # 테스트
└── docs/                     # 문서
```

---

## 2. 백엔드 (Python/FastAPI)

### 2.1 파일 네이밍

| 유형 | 패턴 | 예시 |
|------|------|------|
| 모듈 | `snake_case.py` | `database.py`, `analyzer.py` |
| 테스트 | `test_*.py` | `test_nlp_cases.py` |

### 2.2 함수/변수 네이밍

```python
# ✅ 올바른 예
def create_session(body: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    return {"id": session_id}

# ❌ 잘못된 예
def CreateSession(body):  # PascalCase 사용 금지
    sessionId = str(uuid.uuid4())  # camelCase 사용 금지
```

### 2.3 API 엔드포인트 패턴

```python
from fastapi import FastAPI, HTTPException, Request
from models import CreateSessionRequest, SessionResponse

@app.post("/api/sessions")
@limiter.limit("30/minute")  # Rate limit 필수
def create_session(request: Request, body: CreateSessionRequest):
    """Create a new session and return its UUID."""  # docstring 필수
    
    # 1. 입력 검증
    if len(body.passage_text) > 2000:
        raise HTTPException(status_code=400, detail="Passage is too long")
    
    # 2. 비즈니스 로직
    session_id = str(uuid.uuid4())
    
    # 3. DB 작업 (with 문 사용)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sessions ...", (session_id, ...))
        conn.commit()
    
    # 4. 응답 반환
    return {"id": session_id}
```

### 2.4 데이터베이스 작업

```python
# ✅ 올바른 예 - Context Manager 사용
with get_db() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    result = cursor.fetchone()

# ❌ 잘못된 예 - 수동 연결 관리
conn = get_db()
cursor = conn.cursor()
cursor.execute(...)  # 예외 발생 시 연결 유출
conn.close()
```

### 2.5 Pydantic 모델

```python
from pydantic import BaseModel
from typing import Optional, List

class CreateSessionRequest(BaseModel):
    passage_text: str
    total_sentences: int
    mode: str = "FULL"  # 기본값 제공

class SessionResponse(BaseModel):
    id: str
    created_at: str
    passage_text: str
    total_sentences: int
    mode: str
    progress: List[ProgressItem]
```

---

## 3. 프론트엔드 (React/JavaScript)

### 3.1 파일 네이밍

| 유형 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 | `PascalCase.jsx` | `QuizScreen.jsx`, `AppHeader.jsx` |
| 훅 | `use*.js` | `useQuiz.js` |
| 서비스 | `camelCase.js` | `api.js` |
| 스타일 | `ComponentName.css` | `QuizScreen.css` |

### 3.2 컴포넌트 구조

```jsx
// 1. Imports (외부 → 내부 순서)
import { useState, useEffect } from 'react';              // React
import Check from 'lucide-react/dist/esm/icons/check';    // 외부 라이브러리 (직접 import!)
import { useQuizContext } from '../context/QuizContext';  // 내부 모듈
import { getGradingMode } from '../services/api';         // 서비스
import './QuizScreen.css';                                // 스타일

// 2. 컴포넌트 정의
const QuizScreen = ({ data, onFinish }) => {
    // 2.1 Hooks (순서: state → context → custom hooks)
    const [isLoading, setIsLoading] = useState(false);
    const { state, dispatch } = useQuizContext();
    const gradingMode = getGradingMode();
    
    // 2.2 Derived values
    const isValid = data && data.sentences.length > 0;
    
    // 2.3 Effects
    useEffect(() => {
        // Effect logic
    }, [dependencies]);
    
    // 2.4 Event handlers
    const handleClick = () => {
        // Handler logic
    };
    
    // 2.5 Render
    return (
        <div className="quiz-screen">
            {/* JSX */}
        </div>
    );
};

export default QuizScreen;
```

### 3.3 Import 최적화 (lucide-react)

```jsx
// ✅ 올바른 예 - 직접 import (번들 최적화)
import Check from 'lucide-react/dist/esm/icons/check';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

// ❌ 잘못된 예 - Barrel import (번들 크기 증가)
import { Check, ArrowRight } from 'lucide-react';
```

### 3.4 localStorage 접근 (캐싱 사용)

```jsx
// ✅ 올바른 예 - 캐싱된 함수 사용
import { getGradingMode, setGradingMode } from '../services/api';

const mode = getGradingMode();  // 캐시에서 읽음
setGradingMode('CORE');         // 캐시 + localStorage 동시 업데이트

// ❌ 잘못된 예 - 직접 접근 (반복 호출 시 성능 저하)
const mode = localStorage.getItem('vg_grading_mode') || 'FULL';
localStorage.setItem('vg_grading_mode', 'CORE');
```

### 3.5 조건부 렌더링

```jsx
// ✅ 권장 - Ternary (명시적)
{isLoading ? <Spinner /> : <Content />}

// ✅ 허용 - && 연산자 (boolean 조건에만)
{isVisible && <Modal />}
{items.length > 0 && <List items={items} />}

// ❌ 주의 - 숫자 조건에서 && 사용 금지
{count && <Text />}  // count가 0일 때 "0" 렌더링됨!
```

### 3.6 이벤트 핸들러 네이밍

```jsx
// ✅ 올바른 예
const handleClick = () => { ... };
const handleSubmit = (e) => { ... };
const handleInputChange = (e) => { ... };

// Props로 전달 시
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />
```

---

## 4. CSS 스타일

### 4.1 클래스 네이밍 (BEM-like)

```css
/* Block */
.quiz-screen { ... }

/* Block__Element */
.quiz-screen .header-top-row { ... }
.quiz-screen .stage-badge { ... }

/* Element--Modifier */
.stage-badge.root { ... }
.stage-badge.subject { ... }
```

### 4.2 CSS 변수 활용

```css
:root {
    --color-primary: #3b82f6;
    --color-success: #22c55e;
    --color-error: #ef4444;
    --spacing-sm: 8px;
    --spacing-md: 16px;
}

.button {
    background: var(--color-primary);
    padding: var(--spacing-sm) var(--spacing-md);
}
```

---

## 5. 코드 품질 체크리스트

### 새 코드 작성 시

- [ ] 함수/변수명이 의미를 명확히 전달하는가?
- [ ] 주석이 필요한 복잡한 로직에 설명이 있는가?
- [ ] 에러 처리가 적절히 되어 있는가?
- [ ] 하드코딩된 값 대신 상수/설정을 사용했는가?

### PR 제출 전

- [ ] ESLint 경고/에러가 없는가?
- [ ] 불필요한 console.log가 제거되었는가?
- [ ] 주석 처리된 코드가 제거되었는가?
- [ ] Import 정리가 되어 있는가?

---

## 6. 빠른 참조

### ESLint 실행

```bash
cd client
npm run lint
```

### 포맷팅 (권장)

```bash
# Prettier 사용 시
npx prettier --write "src/**/*.{js,jsx,css}"
```

### 타입 체크 (TypeScript 미사용, JSDoc 권장)

```javascript
/**
 * @param {string} sessionId - 세션 ID
 * @returns {Promise<Object>} 세션 데이터
 */
async function getSession(sessionId) {
    // ...
}
```
