import requests
import os

BASE_URL = "http://localhost:8000"

def test_login():
    print(f"Testing login at {BASE_URL}/api/manage/login")
    try:
        # Try with "admin"
        payload = {"password": "admin"}
        print(f"Sending payload: {payload}")
        
        response = requests.post(f"{BASE_URL}/api/manage/login", json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("Login SUCCESS!")
        else:
            print("Login FAILED.")

    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    test_login()
