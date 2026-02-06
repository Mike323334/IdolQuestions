"""
Console-only Security Alerts System for testing
"""

import os
from datetime import datetime, timedelta
from collections import defaultdict

# In-memory storage for tracking
failed_attempts = defaultdict(list)
payment_attempts = defaultdict(list)

class ConsoleSecurityAlerts:
    def __init__(self):
        self.admin_email = "miguelmike323334@gmail.com"
        
    def send_alert_console(self, subject: str, message: str):
        """Print security alert to console instead of email"""
        print("\n" + "="*60)
        print("SECURITY ALERT")
        print("="*60)
        print(f"TO: {self.admin_email}")
        print(f"SUBJECT: {subject}")
        print(f"TIME: {datetime.now().isoformat()}")
        print("-"*60)
        print(message)
        print("="*60)
    
    def track_failed_payment(self, user_id: str, ip_address: str, reason: str):
        """Track failed payment attempts"""
        now = datetime.now()
        failed_attempts[ip_address].append({
            'user_id': user_id,
            'timestamp': now,
            'reason': reason
        })
        
        # Clean old attempts (older than 1 hour)
        cutoff = now - timedelta(hours=1)
        failed_attempts[ip_address] = [
            attempt for attempt in failed_attempts[ip_address]
            if attempt['timestamp'] > cutoff
        ]
        
        # Check for suspicious activity
        recent_failures = len(failed_attempts[ip_address])
        
        if recent_failures >= 5:
            self.send_alert_console(
                "Multiple Failed Payments",
                f"IP {ip_address} has {recent_failures} failed payment attempts in the last hour.\n"
                f"Latest user: {user_id}\n"
                f"Reason: {reason}\n\n"
                f"Please investigate this activity immediately."
            )
    
    def track_payment_attempt(self, user_id: str, amount: int, ip_address: str):
        """Track payment attempts for unusual patterns"""
        now = datetime.now()
        payment_attempts[user_id].append({
            'amount': amount,
            'timestamp': now,
            'ip_address': ip_address
        })
        
        # Clean old attempts (older than 24 hours)
        cutoff = now - timedelta(hours=24)
        payment_attempts[user_id] = [
            attempt for attempt in payment_attempts[user_id]
            if attempt['timestamp'] > cutoff
        ]
        
        # Check for suspicious patterns
        recent_attempts = payment_attempts[user_id]
        
        # Alert if more than 10 payments in 24 hours
        if len(recent_attempts) >= 10:
            total_amount = sum(attempt['amount'] for attempt in recent_attempts)
            self.send_alert_console(
                "High Payment Volume",
                f"User {user_id} has made {len(recent_attempts)} payments in 24 hours.\n"
                f"Total amount: ${total_amount/100:.2f}\n"
                f"IP: {ip_address}\n\n"
                f"Please investigate this unusual activity."
            )
        
        # Alert if large payment amount
        if amount >= 10000:  # $100+
            self.send_alert_console(
                "Large Payment Amount",
                f"User {user_id} attempted payment of ${amount/100:.2f}\n"
                f"IP: {ip_address}\n\n"
                f"Please verify this transaction is legitimate."
            )
    
    def track_webhook_failure(self, webhook_id: str, error: str):
        """Track webhook failures"""
        self.send_alert_console(
            "Webhook Failure",
            f"Webhook {webhook_id} failed with error: {error}\n\n"
            f"This may indicate a security issue or system problem.\n"
            f"Please check webhook configuration and logs."
        )

# Global instance for console testing
console_alerts = ConsoleSecurityAlerts()