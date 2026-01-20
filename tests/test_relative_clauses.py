"""
v1.1.2 관계절 처리 테스트

관계절(who/which/that)에서 주어와 동사가 올바르게 인식되는지 테스트합니다.
"""
import pytest
import sys
import os

# 프로젝트 루트를 path에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from server.nlp.analyzer import analyze_passage


class TestRelativeClause:
    """관계절 처리 테스트"""
    
    def test_who_clause(self):
        """who 관계절: 'The man who lives next door is friendly.'"""
        result = analyze_passage("The man who lives next door is friendly.")
        sent = result["sentences"][0]
        key = sent["key"]
        
        # 토큰 매핑
        tokens = {t["id"]: t["text"] for t in sent["tokens"]}
        
        # root = "is" (인덱스 7)
        assert key["roots"] is not None
        root_text = tokens.get(key["roots"][0])
        assert root_text == "is", f"Expected 'is', got '{root_text}'"
        
        # subject = "man" (인덱스 1)
        subj_text = tokens.get(key["subjects"][0])
        assert subj_text == "man", f"Expected 'man', got '{subj_text}'"
        
        # subjectSpan에서 관계절 제외: ["The", "man"]만 포함
        span_texts = [tokens[idx] for idx in key["subjectSpans"][0]]
        assert "who" not in span_texts, f"'who' should not be in span: {span_texts}"
        assert "lives" not in span_texts, f"'lives' should not be in span: {span_texts}"
    
    def test_which_clause(self):
        """which 관계절: 'The book which I bought yesterday is interesting.'"""
        result = analyze_passage("The book which I bought yesterday is interesting.")
        sent = result["sentences"][0]
        key = sent["key"]
        tokens = {t["id"]: t["text"] for t in sent["tokens"]}
        
        root_text = tokens.get(key["roots"][0])
        assert root_text == "is", f"Expected 'is', got '{root_text}'"
        
        subj_text = tokens.get(key["subjects"][0])
        assert subj_text == "book", f"Expected 'book', got '{subj_text}'"
        
        span_texts = [tokens[idx] for idx in key["subjectSpans"][0]]
        assert "which" not in span_texts, f"'which' should not be in span: {span_texts}"
        assert "bought" not in span_texts, f"'bought' should not be in span: {span_texts}"
    
    def test_that_clause(self):
        """that 관계절: 'The cake that she baked was delicious.'"""
        result = analyze_passage("The cake that she baked was delicious.")
        sent = result["sentences"][0]
        key = sent["key"]
        tokens = {t["id"]: t["text"] for t in sent["tokens"]}
        
        root_text = tokens.get(key["roots"][0])
        assert root_text == "was", f"Expected 'was', got '{root_text}'"
        
        subj_text = tokens.get(key["subjects"][0])
        assert subj_text == "cake", f"Expected 'cake', got '{subj_text}'"
        
        span_texts = [tokens[idx] for idx in key["subjectSpans"][0]]
        assert "that" not in span_texts, f"'that' should not be in span: {span_texts}"
        assert "baked" not in span_texts, f"'baked' should not be in span: {span_texts}"

    def test_advcl_because_full_mode(self):
        """부사절(because) FULL 모드: 뿌리동사 다수 허용"""
        result = analyze_passage("Some fans dislike it because it stops the game.", mode="FULL")
        sent = result["sentences"][0]
        key = sent["key"]
        tokens = {t["id"]: t["text"] for t in sent["tokens"]}
        
        # roots = ["dislike", "stops"] 모두 포함되어야 함
        root_texts = [tokens[idx] for idx in key["roots"]]
        assert "dislike" in root_texts
        assert "stops" in root_texts
        assert len(key["roots"]) == 2
        
    def test_advcl_because_core_mode(self):
        """부사절(because) CORE 모드: 뿌리동사 1개만 허용"""
        result = analyze_passage("Some fans dislike it because it stops the game.", mode="CORE")
        sent = result["sentences"][0]
        key = sent["key"]
        tokens = {t["id"]: t["text"] for t in sent["tokens"]}
        
        # root = ["dislike"] (메인 ROOT 1개만 포함)
        root_texts = [tokens[idx] for idx in key["roots"]]
        assert "dislike" in root_texts
        assert "stops" not in root_texts
        assert len(key["roots"]) == 1
        
        # subjects = ["fans"] (it은 제거되어야 함)
        subj_texts = [tokens[idx] for idx in key["subjects"]]
        assert "fans" in subj_texts
        assert "it" not in subj_texts
        assert len(key["subjects"]) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
