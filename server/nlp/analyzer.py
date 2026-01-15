import spacy
from typing import List
from . import analyzer  # This seems recursive or wrong if I am IN analyzer.py. 
# Wait, I am WRITING analyzer.py. I should import models here.
import sys
import os

# Add parent directory to path to import models if needed, or use relative imports properly in package
# Simplified for single file usage initially or cleaner structure
# Let's assume standard package structure: server.nlp.analyzer

# To make imports work easily without complex package setup for now:
# We will just write the logic.

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

def analyze_passage(text: str) -> dict:
    load_model()
    doc = nlp_model(text)
    
    sentences_data = []
    
    for sent_idx, sent in enumerate(doc.sents):
        # 1. Tokenization with mapping
        sent_tokens_data = []
        token_map = {} # global_idx -> local_idx
        
        for local_idx, token in enumerate(sent):
            # token.i is global index in Doc
            token_map[token.i] = local_idx
            
            sent_tokens_data.append({
                "id": local_idx,
                "text": token.text,
                "start": token.idx, # char offset in doc (optional, maybe sent-relative is better?)
                # Plan says: start/end char indices. Let's keep original offsets for now or just text.
                # Actually for highlighting, we might need simple text reconstruction. 
                # Let's stick to the plan: start/end are usually char offsets.
                # But for the UI, I just need the token stream. 
                # "start": 0, "end": 3 (length) logic is also fine.
                # Let's use char offset relative to SENTENCE for safety if needed, 
                # but the UI renders tokens array, so just text is enough usually.
                # API spec said start/end. Let's provide char offset in sentence.
                "start": token.idx - sent.start_char,
                "end": token.idx - sent.start_char + len(token.text),
                "pos": token.pos_,
                "tag": token.tag_,
                "dep": token.dep_
            })
            
        # 2. Find Root
        # Heuristic: The root of the sentence span
        # Usually sent.root works well for simple sentences.
        root_token = sent.root
        
        # 3. Find Subject
        # Look for nsubj, nsubjpass, csubj, csubjpass dependent on the root
        subject_token = None
        for child in root_token.children:
            if child.dep_ in ["nsubj", "nsubj:pass", "csubj", "csubj:pass"]:
                subject_token = child
                break
                
        # 4. Subject Span
        # The subtree of the subject token
        subject_span_indices = []
        if subject_token:
            # Flatten subtree and get indices relative to sentence
            subject_span_indices = [token_map[t.i] for t in subject_token.subtree if t.i in token_map]
            subject_span_indices.sort()
            
        # Map global tokens to local indices for Key
        root_local_idx = token_map.get(root_token.i)
        subj_local_idx = token_map.get(subject_token.i) if subject_token else None
        
        # Create Key object
        key_data = {
            "root": root_local_idx,
            "subject": subj_local_idx,
            "subjectSpan": subject_span_indices
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
