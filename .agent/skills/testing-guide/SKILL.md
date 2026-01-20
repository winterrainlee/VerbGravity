---
name: testing-guide
description: 테스트 작성 가이드라인. 백엔드(Python/FastAPI) 및 프론트엔드(React/Vite) 테스트 작성 시 참조하는 패턴과 규칙을 정의합니다. 테스트 작성, 리뷰, 리팩토링 작업 시 자동으로 참조됩니다.
version: "1.0.0"
---

# 테스트 작성 가이드 (Testing Guide)

VerbGravity 프로젝트의 테스트 작성 표준을 정의합니다.

## 적용 시점

다음 상황에서 이 가이드를 참조하세요:
- 새로운 API 엔드포인트 추가 시
- 버그 수정 후 회귀 테스트 작성 시
- 기존 코드 리팩토링 시
- 복잡한 비즈니스 로직 구현 시

---

## 프로젝트 테스트 구조

```
VerbGravity/
├── tests/                    # 백엔드 테스트
│   ├── test_backend_*.py     # API 통합 테스트
│   ├── test_nlp_*.py         # NLP 로직 단위 테스트
│   └── test_*.py             # 기타 테스트
├── client/                   # 프론트엔드
│   └── (테스트 프레임워크 미설치)
└── server/                   # 백엔드 소스
```

---

## 1. 백엔드 테스트 (Python)

### 1.1 테스트 유형

| 유형 | 파일명 패턴 | 용도 |
|------|------------|------|
| API 통합 테스트 | `test_backend_*.py` | HTTP 엔드포인트 검증 |
| 단위 테스트 | `test_*.py` | 개별 함수/모듈 검증 |
| NLP 로직 테스트 | `test_nlp_*.py` | spaCy 분석 결과 검증 |

### 1.2 API 통합 테스트 패턴

```python
import requests
import unittest

BASE_URL = "http://localhost:8000"

class TestSessionAPI(unittest.TestCase):
    def setUp(self):
        """테스트 전 준비 (서버 실행 필요)"""
        pass
    
    def tearDown(self):
        """테스트 후 정리 (생성된 데이터 삭제)"""
        pass
    
    def test_create_session(self):
        """세션 생성 API 테스트"""
        # Given
        payload = {
            "passage_text": "Test passage.",
            "total_sentences": 1,
            "mode": "FULL"
        }
        
        # When
        response = requests.post(f"{BASE_URL}/api/sessions", json=payload)
        
        # Then
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIsNotNone(data["id"])

if __name__ == "__main__":
    unittest.main()
```

### 1.3 NLP 단위 테스트 패턴

```python
import spacy
from server.nlp.analyzer import find_all_roots, find_subjects_for_roots

def test_find_roots():
    """동사(Root) 탐지 테스트"""
    nlp = spacy.load("en_core_web_sm")
    
    test_cases = [
        ("The cat sleeps.", ["sleeps"]),
        ("I eat and read.", ["eat", "read"]),
    ]
    
    for sentence, expected in test_cases:
        doc = nlp(sentence)
        sent = next(doc.sents)
        roots = find_all_roots(sent)
        root_texts = [r.text for r in roots]
        
        assert root_texts == expected, f"Failed: {sentence}"
        print(f"✓ '{sentence}' -> {root_texts}")
```

### 1.4 테스트 실행

```bash
# 단일 테스트 파일 실행
python tests/test_mode_persistence.py

# unittest discover (모든 테스트)
python -m unittest discover -s tests -p "test_*.py"

# 특정 테스트 클래스/메서드
python -m unittest tests.test_mode_persistence.TestModePersistence.test_create_session_with_mode
```

---

## 2. 프론트엔드 테스트 (React)

> ⚠️ **현재 상태**: 테스트 프레임워크 미설치

### 2.1 권장 테스트 스택

| 도구 | 용도 |
|------|------|
| Vitest | 단위/통합 테스트 (Vite 네이티브) |
| React Testing Library | 컴포넌트 테스트 |
| MSW | API 모킹 |

### 2.2 설치 (필요 시)

```bash
cd client
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 2.3 컴포넌트 테스트 패턴 (권장)

```javascript
// src/components/__tests__/StartScreen.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StartScreen from '../StartScreen';

describe('StartScreen', () => {
    it('renders passage input', () => {
        render(<StartScreen onStart={vi.fn()} isLoading={false} />);
        expect(screen.getByPlaceholderText(/지문을 붙여넣으세요/i)).toBeInTheDocument();
    });
    
    it('disables button when passage is empty', () => {
        render(<StartScreen onStart={vi.fn()} isLoading={false} />);
        const button = screen.getByRole('button', { name: /분석 시작/i });
        expect(button).toBeDisabled();
    });
    
    it('calls onStart with passage text', async () => {
        const onStart = vi.fn();
        render(<StartScreen onStart={onStart} isLoading={false} />);
        
        // Given
        const textarea = screen.getByPlaceholderText(/지문을 붙여넣으세요/i);
        const button = screen.getByRole('button', { name: /분석 시작/i });
        
        // When
        fireEvent.change(textarea, { target: { value: 'Test passage.' } });
        fireEvent.click(button);
        
        // Then
        expect(onStart).toHaveBeenCalledWith('Test passage.', expect.any(String));
    });
});
```

### 2.4 Hook 테스트 패턴

```javascript
// src/hooks/__tests__/useQuiz.test.jsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQuiz } from '../useQuiz';
import { QuizProvider } from '../../context/QuizContext';

describe('useQuiz', () => {
    const mockData = {
        sentences: [
            { id: 0, text: 'Test.', tokens: [], key: { root: 0, subject: 1 } }
        ]
    };
    
    const wrapper = ({ children }) => (
        <QuizProvider>{children}</QuizProvider>
    );
    
    it('initializes with first sentence', () => {
        const { result } = renderHook(
            () => useQuiz({ data: mockData, onFinish: vi.fn() }),
            { wrapper }
        );
        
        expect(result.current.state.sentenceIndex).toBe(0);
    });
});
```

---

## 3. 테스트 작성 원칙

### 3.1 AAA 패턴 (Arrange-Act-Assert)

```python
def test_example():
    # Arrange (Given) - 테스트 데이터 준비
    user_data = {"name": "Test User"}
    
    # Act (When) - 테스트 대상 실행
    result = create_user(user_data)
    
    # Assert (Then) - 결과 검증
    assert result["id"] is not None
```

### 3.2 네이밍 컨벤션

```python
# 함수명: test_<대상>_<조건>_<예상결과>
def test_create_session_with_valid_data_returns_session_id():
    ...

def test_create_session_with_empty_passage_raises_error():
    ...
```

### 3.3 테스트 독립성

```python
class TestExample(unittest.TestCase):
    def setUp(self):
        """각 테스트 전 실행 - 깨끗한 상태 보장"""
        self.test_session_id = None
    
    def tearDown(self):
        """각 테스트 후 실행 - 생성된 데이터 정리"""
        if self.test_session_id:
            requests.delete(f"{BASE_URL}/api/sessions/{self.test_session_id}")
```

---

## 4. 테스트 체크리스트

### 새 기능 추가 시

- [ ] Happy path 테스트 작성
- [ ] Edge case 테스트 작성 (빈 값, 경계값)
- [ ] 에러 케이스 테스트 작성

### 버그 수정 시

- [ ] 버그를 재현하는 테스트 먼저 작성
- [ ] 수정 후 테스트 통과 확인
- [ ] 관련 기능 회귀 테스트 확인

### PR 전 확인

- [ ] 모든 테스트 통과
- [ ] 새 기능에 대한 테스트 추가됨
- [ ] 테스트 커버리지 유지/증가

---

## 5. 빠른 참조

### 백엔드 테스트 명령어

```bash
# 서버 실행 (테스트 전 필수)
cd server && python main.py

# 테스트 실행 (다른 터미널)
python tests/test_mode_persistence.py
python -m unittest discover -s tests
```

### 프론트엔드 테스트 명령어 (설치 후)

```bash
cd client
npm run test          # 감시 모드
npm run test:run      # 단일 실행
npm run coverage      # 커버리지 리포트
```
