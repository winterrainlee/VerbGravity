import spacy

def analyze_expletives():
    print("Loading spaCy model...")
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        print("Model not found. Please install en_core_web_sm.")
        return

    sentences = [
        "There is a cat on the mat.",
        "It is hard to study English.",
        "It seems that he is honest."
    ]

    print("\n--- Syntax Analysis ---")
    for text in sentences:
        doc = nlp(text)
        print(f"\nSentence: '{text}'")
        for token in doc:
            # dep_가 nsubj, expl, attr, csubj 등인지 확인
            print(f"  [{token.text}] -> dep: {token.dep_}, head: {token.head.text}, pos: {token.pos_}")

        # 실제 analyzer 로직 호출
        from server.nlp.analyzer import find_all_roots, find_subjects_for_roots
        
        # 1. Token Map 생성 (Mocking)
        # sent 단위로 처리해야 하므로 첫 문장을 가져옴
        sent = next(doc.sents)
        token_map = {t.i: t.i for t in sent}
        
        # 2. Find Roots
        root_tokens = find_all_roots(sent)
        
        # 3. Find Subjects
        subjects, spans = find_subjects_for_roots(root_tokens, token_map)
        
        # 결과 매핑 (index -> text)
        detected_texts = []
        for subj_idx in subjects:
            if subj_idx is not None:
                detected_texts.append(doc[subj_idx].text)
            else:
                detected_texts.append(None)
        
        print(f"  => Detected Subject (Analyzer Logic): {detected_texts}")

    print(f"  => Detected Subject (Analyzer Logic): {detected_texts}")

def analyze_objective_complements():
    print("\n\n=== Analyze Objective Complements (O.C.) ===")
    print("Goal: Exclude bare infinitive/participle in ccomp unless it has aux.")
    
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        return

    sentences = [
        "This mental training helps them stay calm.",   # Should NOT find 'stay'
        "I saw him running.",                         # Should NOT find 'running'
        "I think he will come tomorrow."              # Should find 'come'
    ]
    
    from server.nlp.analyzer import find_all_roots
    
    for text in sentences:
        doc = nlp(text)
        sent = next(doc.sents)
        roots = find_all_roots(sent)
        root_texts = [r.text for r in roots]
        print(f"Sentence: '{text}' -> Roots found: {root_texts}")

if __name__ == "__main__":
    analyze_expletives()
    analyze_objective_complements()
