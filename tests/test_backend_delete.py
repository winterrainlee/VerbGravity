import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_delete():
    print("1. Creating dummy session...")
    try:
        res = requests.post(f"{BASE_URL}/api/sessions", json={
            "passage_text": "Delete test passage",
            "total_sentences": 1
        })
        if res.status_code != 200:
            print(f"Failed to create session: {res.text}")
            return
        
        session_id = res.json()["id"]
        print(f"Session created: {session_id}")
        
        print(f"2. Deleting session {session_id}...")
        res = requests.delete(f"{BASE_URL}/api/admin/sessions/{session_id}")
        
        if res.status_code == 200:
            print("Session deleted successfully!")
        else:
            print(f"Failed to delete session. Status: {res.status_code}, Response: {res.text}")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_delete()
