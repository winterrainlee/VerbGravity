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
    
    # 2. ccomp: 보문절 동사 (so/because 절)
    # v1.1.2 Hotfix: exclude non-finite verbs (e.g. O.C. like "help them stay")
    for child in sent.root.children:
        if child.dep_ == "ccomp" and child.pos_ == "VERB":
            # Finite verbs (VBD, VBP, VBZ) are always clauses -> Keep
            # Non-finite (VB, VBG, VBN) need 'aux' to be a full clause (e.g. "will go")
            is_finite = child.tag_ in ["VBD", "VBP", "VBZ"]
            has_aux = any(c.dep_ in ["aux", "aux:pass"] for c in child.children)
            
            if is_finite or has_aux:
                roots.append(child)
    
    # 문장 순서대로 정렬
    return sorted(roots, key=lambda t: t.i)


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
            span = [token_map[t.i] for t in subj.subtree if t.i in token_map]
            subject_spans.append(sorted(span))
        else:
            subjects.append(None)
            subject_spans.append([])
    
    return subjects, subject_spans


def analyze_passage(text: str) -> dict:
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
        
        # 2. Find all roots (v1.1: 복수 root 지원)
        root_tokens = find_all_roots(sent)
        roots = [token_map.get(t.i) for t in root_tokens]
        
        # 3. Find subjects for each root (v1.1: 복수 subject 지원)
        subjects, subject_spans = find_subjects_for_roots(root_tokens, token_map)
        
        # Create Key object (v1.1: 배열 형태)
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
            "model": "en_core_web_sm"
        }
    }
