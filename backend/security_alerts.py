"""
Security Alerts System for IdolQuestions
Monitors suspicious activities and sends alerts
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from collections import defaultdict
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# In-memory storage for tracking (in production, use Redis or database)
failed_attempts = defaultdict(list)
payment_attempts = defaultdict(list)

class SecurityAlerts:
    def __init__(self):
        self.admin_email = os.getenv("ADMIN_EMAIL", "admin@idolquestions.com")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        
    def send_alert_email(self, subject: str, message: str):
        """Send security alert email to admin"""
        try:
            if not self.smtp_user or not self.smtp_password:
                print(f"[ALERT] Email not configured. Alert: {subject} - {message}")
                return
                
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = self.admin_email
            msg['Subject'] = f"🚨 IdolQuestions Security Alert: {subject}"
            
            body = f"""
            Security Alert Details:
            
            Time: {datetime.now().isoformat()}
            Alert: {subject}
            Details: {message}
            
            Please investigate this activity immediately.
            
            ---
            IdolQuestions Security System
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.smtp_user, self.admin_email, text)
            server.quit()
            
            print(f"[ALERT SENT] {subject}")
            
        except Exception as e:
            print(f"[ALERT ERROR] Failed to send email: {str(e)}")
    
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
            self.send_alert_email(
                "Multiple Failed Payments",
                f"IP {ip_address} has {recent_failures} failed payment attempts in the last hour. "
                f"Latest user: {user_id}, Reason: {reason}"
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
            self.send_alert_email(
                "High Payment Volume",
                f"User {user_id} has made {len(recent_attempts)} payments in 24 hours. "
                f"Total amount: ${total_amount/100:.2f}"
            )
        
        # Alert if large payment amount
        if amount >= 10000:  # $100+
            self.send_alert_email(
                "Large Payment Amount",
                f"User {user_id} attempted payment of ${amount/100:.2f} from IP {ip_address}"
            )
    
    def track_webhook_failure(self, webhook_id: str, error: str):
        """Track webhook failures"""
        self.send_alert_email(
            "Webhook Failure",
            f"Webhook {webhook_id} failed with error: {error}. "
            f"This may indicate a security issue or system problem."
        )
    
    def track_suspicious_login(self, user_id: str, ip_address: str, user_agent: str):
        """Track suspicious login attempts"""
        # This could be expanded with IP geolocation, device fingerprinting, etc.
        print(f"[SECURITY LOG] Login - User: {user_id}, IP: {ip_address}, Agent: {user_agent}")

# Global instance
security_alerts = SecurityAlerts()