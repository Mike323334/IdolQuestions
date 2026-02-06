#!/usr/bin/env python3
"""
Test script for IdolQuestions security alerts system
"""

import requests
import time
import json

# Your backend URL (change to your Render URL when deployed)
BACKEND_URL = "http://localhost:8000"  # Local testing
# For production: BACKEND_URL = "https://tu-backend-url.onrender.com"

def test_failed_payment_alerts():
    """Test multiple failed payment attempts to trigger alert"""
    print("Testing failed payment alerts...")
    
    # Simulate 5 failed payment attempts
    for i in range(5):
        try:
            # This will fail because we're not sending proper data
            response = requests.post(
                f"{BACKEND_URL}/api/create-payment-intent",
                json={
                    "quiz_id": "test_quiz_123",
                    "amount": 500  # $5.00
                },
                timeout=10
            )
            print(f"   Attempt {i+1}: Status {response.status_code}")
            time.sleep(1)  # Wait 1 second between attempts
            
        except Exception as e:
            print(f"   Attempt {i+1}: Failed as expected - {str(e)[:50]}...")
    
    print("DONE: Failed payment test completed. Check your email for alerts!")

def test_webhook_failure():
    """Test webhook failure alert"""
    print("Testing webhook failure alerts...")
    
    try:
        # Send invalid webhook data
        response = requests.post(
            f"{BACKEND_URL}/api/stripe/webhook",
            data="invalid_webhook_data",
            headers={"stripe-signature": "invalid_signature"},
            timeout=10
        )
        print(f"   Webhook test: Status {response.status_code}")
        
    except Exception as e:
        print(f"   Webhook test: Failed as expected - {str(e)[:50]}...")
    
    print("DONE: Webhook failure test completed. Check your email for alerts!")

def test_backend_connection():
    """Test if backend is responding"""
    print("Testing backend connection...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/test", timeout=10)
        if response.status_code == 200:
            print("SUCCESS: Backend is responding correctly!")
            return True
        else:
            print(f"WARNING: Backend responded with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"ERROR: Backend connection failed: {e}")
        return False

if __name__ == "__main__":
    print("ALERT TEST: IdolQuestions Security Alerts Test")
    print("=" * 50)
    
    # Update this with your actual backend URL
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    # Test backend connection first
    if test_backend_connection():
        print()
        
        # Run alert tests
        test_failed_payment_alerts()
        print()
        
        test_webhook_failure()
        print()
        
        print("SUCCESS: All tests completed!")
        print("EMAIL: Check your email (miguelmike323334@gmail.com) for security alerts")
        print("TIME: Alerts may take 1-2 minutes to arrive")
        
    else:
        print("ERROR: Cannot run tests - backend not accessible")
        print("TIP: Make sure your backend is deployed and running")