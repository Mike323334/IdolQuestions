#!/usr/bin/env python3
"""
Test console-based security alerts
"""

import sys
import os
sys.path.append('backend')

# Import console alerts system
from security_alerts_console import console_alerts

def test_console_alerts():
    """Test console-based alerts"""
    print("CONSOLE ALERT TEST: Testing security alerts (console output)")
    print("=" * 70)
    
    # Test 1: Failed payment alert
    print("\n1. Simulating 5 failed payment attempts...")
    for i in range(5):
        console_alerts.track_failed_payment(
            user_id=f"user_{i+1}",
            ip_address="192.168.1.100", 
            reason="Card declined - insufficient funds"
        )
    
    # Test 2: High payment volume alert
    print("\n2. Simulating 10 payments in 24 hours...")
    for i in range(10):
        console_alerts.track_payment_attempt(
            user_id="high_volume_user",
            amount=500,  # $5.00
            ip_address="192.168.1.101"
        )
    
    # Test 3: Large payment alert
    print("\n3. Simulating large payment ($150)...")
    console_alerts.track_payment_attempt(
        user_id="big_spender",
        amount=15000,  # $150.00
        ip_address="192.168.1.102"
    )
    
    # Test 4: Webhook failure alert
    print("\n4. Simulating webhook failure...")
    console_alerts.track_webhook_failure(
        webhook_id="whsec_test_123",
        error="Invalid signature verification"
    )
    
    print("\n" + "=" * 70)
    print("SUCCESS: All console alert tests completed!")
    print("NOTE: In production, these would be sent as emails to your admin account.")

if __name__ == "__main__":
    test_console_alerts()