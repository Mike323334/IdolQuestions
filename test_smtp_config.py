#!/usr/bin/env python3
"""
Test SMTP configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

def test_smtp_config():
    """Test if SMTP configuration is loaded correctly"""
    print("SMTP CONFIGURATION TEST")
    print("=" * 40)
    
    # Check each SMTP variable
    smtp_vars = {
        'ADMIN_EMAIL': os.getenv('ADMIN_EMAIL'),
        'SMTP_SERVER': os.getenv('SMTP_SERVER'), 
        'SMTP_PORT': os.getenv('SMTP_PORT'),
        'SMTP_USER': os.getenv('SMTP_USER'),
        'SMTP_PASSWORD': os.getenv('SMTP_PASSWORD')
    }
    
    for var_name, var_value in smtp_vars.items():
        if var_value:
            if var_name == 'SMTP_PASSWORD':
                # Hide password for security
                print(f"OK {var_name}: ***{var_value[-4:]} (last 4 chars)")
            else:
                print(f"OK {var_name}: {var_value}")
        else:
            print(f"NO {var_name}: NOT SET")
    
    print("\n" + "=" * 40)
    
    # Check if all required variables are set
    missing_vars = [name for name, value in smtp_vars.items() if not value]
    
    if missing_vars:
        print(f"ERROR: Missing variables: {', '.join(missing_vars)}")
        return False
    else:
        print("SUCCESS: All SMTP variables are configured!")
        return True

if __name__ == "__main__":
    test_smtp_config()