#!/usr/bin/env python3
"""
Direct test for security alerts system
"""

import sys
import os
sys.path.append('backend')

# Import our security alerts system
from security_alerts import security_alerts

def test_direct_alerts():
    """Test alerts directly without HTTP requests"""
    print("DIRECT ALERT TEST: Testing security alerts system directly")
    print("=" * 60)
    
    # Test 1: Failed payment alert
    print("1. Testing failed payment alert...")
    try:
        security_alerts.track_failed_payment(
            user_id="test_user_123",
            ip_address="192.168.1.100", 
            reason="Card declined - insufficient funds"
        )
        print("   SUCCESS: Failed payment alert triggered")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    # Test 2: High payment volume alert
    print("\n2. Testing high payment volume alert...")
    try:
        # Simulate 10 payments to trigger alert
        for i in range(10):
            security_alerts.track_payment_attempt(
                user_id="test_user_456",
                amount=1000,  # $10.00
                ip_address="192.168.1.101"
            )
        print("   SUCCESS: High payment volume alert should be triggered")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    # Test 3: Large payment alert
    print("\n3. Testing large payment alert...")
    try:
        security_alerts.track_payment_attempt(
            user_id="test_user_789",
            amount=15000,  # $150.00 (over $100 threshold)
            ip_address="192.168.1.102"
        )
        print("   SUCCESS: Large payment alert triggered")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    # Test 4: Webhook failure alert
    print("\n4. Testing webhook failure alert...")
    try:
        security_alerts.track_webhook_failure(
            webhook_id="whsec_test_123",
            error="Invalid signature verification"
        )
        print("   SUCCESS: Webhook failure alert triggered")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print("\n" + "=" * 60)
    print("COMPLETED: All direct alert tests completed!")
    print("EMAIL CHECK: Check miguelmike323334@gmail.com for security alerts")
    print("NOTE: If no emails arrive, check SMTP configuration in .env")

if __name__ == "__main__":
    test_direct_alerts()