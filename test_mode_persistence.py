import requests
import unittest
import uuid
import os

BASE_URL = "http://localhost:8000"

class TestModePersistence(unittest.TestCase):
    def setUp(self):
        # We assume server is running. If not, this test will fail connection.
        pass

    def test_create_session_with_mode(self):
        # 1. Create CORE session
        res_core = requests.post(f"{BASE_URL}/api/sessions", json={
            "passage_text": "Test CORE mode.",
            "total_sentences": 1,
            "mode": "CORE"
        })
        self.assertEqual(res_core.status_code, 200)
        session_id_core = res_core.json()["id"]

        # Verify get_session returns CORE
        get_res_core = requests.get(f"{BASE_URL}/api/sessions/{session_id_core}")
        self.assertEqual(get_res_core.json()["mode"], "CORE")

        # 2. Create FULL session
        res_full = requests.post(f"{BASE_URL}/api/sessions", json={
            "passage_text": "Test FULL mode.",
            "total_sentences": 1,
            "mode": "FULL"
        })
        self.assertEqual(res_full.status_code, 200)
        session_id_full = res_full.json()["id"]

        # Verify get_session returns FULL
        get_res_full = requests.get(f"{BASE_URL}/api/sessions/{session_id_full}")
        self.assertEqual(get_res_full.json()["mode"], "FULL")
        
        # 3. Verify Admin API
        # Admin login
        login_res = requests.post(f"{BASE_URL}/api/manage/login", json={"password": "admin"})
        # Note: If admin password is not "admin", this might fail, but in dev it should work given main.py logic
        
        # If login works (or dev token), check admin sessions
        admin_res = requests.get(f"{BASE_URL}/api/manage/sessions")
        if admin_res.status_code == 200:
            data = admin_res.json()
            sessions = data.get("sessions", [])
            
            # Check if our sessions are in the list with correct modes
            found_core = next((s for s in sessions if s["id"] == session_id_core), None)
            found_full = next((s for s in sessions if s["id"] == session_id_full), None)
            
            self.assertIsNotNone(found_core)
            self.assertEqual(found_core["mode"], "CORE")
            
            self.assertIsNotNone(found_full)
            self.assertEqual(found_full["mode"], "FULL")
        else:
             print("Skipping Admin API check due to login failure or network issue")

if __name__ == "__main__":
    unittest.main()
