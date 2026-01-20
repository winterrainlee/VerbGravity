import spacy
from typing import List, Dict, Any, Optional

nlp_model = None

def load_model():
    global nlp_model
    if nlp_model is None:
        print("Loading spaCy model...")
        try:
            nlp_model = spacy.load("en_core_web_sm")
        except OSError:
            print("Model not found. Downloading...")
            from spacy.cli import download
            download("en_core_web_sm")
            nlp_model = spacy.load("en_core_web_sm")


def find_all_roots(sent) -> List:
    """문장에서 모든 핵심 동사를 찾는다.
    
    패턴:
    - sent.root: 문장의 기본 root
    - conj: 등위접속사(and, but, or)로 연결된 병렬 동사
    - ccomp: 종속절의 동사 (so, because 절)
    """
    roots = [sent.root]
    
    # 1. conj: 병렬 동사 (and/or/but로 연결)
    for child in sent.root.children:
        if child.dep_ == "conj" and child.pos_ == "VERB":
            roots.append(child)
    
    # 2. ccomp & advcl: 종속절/부사절 동사 (so/because/if/when 절)
    # v1.1.2: Include advcl for better coverage of complex sentences
    for child in sent.root.children:
        if child.dep_ in ["ccomp", "advcl"] and child.pos_ == "VERB":
            # Finite verbs (VBD, VBP, VBZ) are always clauses -> Keep
            # Non-finite (VB, VBG, VBN) need 'aux' to be a full clause (e.g. "will go")
            is_finite = child.tag_ in ["VBD", "VBP", "VBZ"]
            has_aux = any(c.dep_ in ["aux", "aux:pass"] for c in child.children)
            
            if is_finite or has_aux:
                if child not in roots:
                    roots.append(child)
    
    # 문장 순서대로 정렬
    return sorted(list(set(roots)), key=lambda t: t.i)


def find_subjects_for_roots(roots: List, token_map: Dict[int, int]) -> tuple:
    """각 root에 대한 subject를 찾는다."""
    subjects = []
    subject_spans = []
    
    for root in roots:
        subj = None
        for child in root.children:
            # 1. Check for expletive (there)
            if child.dep_ == "expl":
                # If 'there' exists, the real subject is usually 'attr'
                for sibling in root.children:
                    if sibling.dep_ == "attr":
                        subj = sibling
                        break
                if subj: break

            # 2. Check for normal subjects
            if child.dep_ in ["nsubj", "nsubjpass", "nsubj:pass", "csubj", "csubjpass", "csubj:pass"]:
                subj = child
                break
        
        if subj and subj.i in token_map:
            subjects.append(token_map[subj.i])
            # v1.1.2: 관계절(relcl) 토큰을 주어구에서 제외
            # "The man who lives next door" → "The man"만 주어구로 인식
            
            # 먼저 주어에 직접 붙은 relcl 동사들을 찾음
            relcl_tokens = set()
            for child in subj.children:
                if child.dep_ == "relcl":
                    # relcl 동사와 그 모든 하위 토큰을 수집
                    for descendant in child.subtree:
                        relcl_tokens.add(descendant.i)
            
            span = []
            for t in subj.subtree:
                if t.i not in token_map:
                    continue
                # relcl 계열 토큰은 제외
                if t.i in relcl_tokens:
                    continue
                span.append(token_map[t.i])
            subject_spans.append(sorted(span))
        else:
            subjects.append(None)
            subject_spans.append([])
    
    return subjects, subject_spans


def analyze_passage(text: str, mode: str = 'FULL') -> dict:
    load_model()
    doc = nlp_model(text)
    
    sentences_data = []
    
    for sent_idx, sent in enumerate(doc.sents):
        # 1. Tokenization with mapping
        sent_tokens_data = []
        token_map = {}  # global_idx -> local_idx
        
        for local_idx, token in enumerate(sent):
            token_map[token.i] = local_idx
            
            sent_tokens_data.append({
                "id": local_idx,
                "text": token.text,
                "start": token.idx - sent.start_char,
                "end": token.idx - sent.start_char + len(token.text),
                "pos": token.pos_,
                "tag": token.tag_,
                "dep": token.dep_
            })
        
        # 2. Find all roots
        root_tokens = find_all_roots(sent)
        
        # v1.1.2 원칙 적용: 기초 모드(CORE)인 경우 메인 ROOT 1개만 남김
        if mode == 'CORE' and len(root_tokens) > 1:
            # find_all_roots는 이미 정렬되어 있으므로, 
            # 실제 sent.root에 해당하는 토큰을 찾거나 첫 번째 것을 선택
            main_root = next((t for t in root_tokens if t == sent.root), root_tokens[0])
            root_tokens = [main_root]
            
        roots = [token_map.get(t.i) for t in root_tokens]
        
        # 3. Find subjects for each root
        subjects, subject_spans = find_subjects_for_roots(root_tokens, token_map)
        
        # Create Key object
        key_data = {
            "roots": roots,
            "subjects": subjects,
            "subjectSpans": subject_spans
        }
        
        sentences_data.append({
            "id": sent_idx,
            "text": sent.text,
            "tokens": sent_tokens_data,
            "key": key_data
        })
    
    return {
        "sentences": sentences_data,
        "meta": {
            "totalSentences": len(sentences_data),
            "nlp_model": "en_core_web_sm"
        }
    }
