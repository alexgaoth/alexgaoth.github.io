#!/usr/bin/env python3
"""
Send email notification when a new thought article is posted.
Uses Buttondown API to notify subscribers about new content.
"""

import os
import sys
import json
import requests
from pathlib import Path

# Configuration
BUTTONDOWN_API_KEY = os.environ.get('BUTTONDOWN_API_KEY')
BUTTONDOWN_API_URL = "https://api.buttondown.com/v1/emails"
THOUGHTS_MANIFEST_PATH = Path(__file__).parent.parent / 'src' / 'data' / 'thoughtsManifest.json'
WEBSITE_URL = "https://app.alexgaoth.com"  # Update with your actual website URL

def extract_latest_thought():
    """Extract the latest thought from the generated thoughts manifest."""
    if not THOUGHTS_MANIFEST_PATH.exists():
        print(f"❌ Error: thoughtsManifest.json not found at {THOUGHTS_MANIFEST_PATH}")
        sys.exit(1)

    with open(THOUGHTS_MANIFEST_PATH, 'r', encoding='utf-8') as f:
        thoughts = json.load(f)

    if not thoughts:
        print("❌ Error: thoughtsManifest.json is empty")
        sys.exit(1)

    return thoughts[0]

def format_email_body(thought):
    """Format the email body with thought details"""
    thought_url = f"{WEBSITE_URL}/thoughts/{thought['slug']}"

    return f"""Hi there!

A new thought has just been published on the blog:

**{thought['title']}**

{thought['excerpt']}

Read the full article here: {thought_url}

---

Published: {thought['date']} · {thought['readTime']}

Thanks for reading!
"""

def send_notification(thought):
    """Send email notification via Buttondown API"""
    if not BUTTONDOWN_API_KEY:
        print("❌ Error: BUTTONDOWN_API_KEY environment variable not set")
        sys.exit(1)

    headers = {
        "Authorization": f"Token {BUTTONDOWN_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "subject": f"New Thought: {thought['title']}",
        "body": format_email_body(thought)
    }

    try:
        print(f"📧 Sending notification for: {thought['title']}")
        response = requests.post(BUTTONDOWN_API_URL, headers=headers, json=data)
        response.raise_for_status()

        print("✅ Email notification sent successfully!")
        print(f"   Title: {thought['title']}")
        print(f"   Date: {thought['date']}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending email: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        sys.exit(1)

def main():
    print("🚀 Starting thought notification process...")

    # Extract latest thought
    latest_thought = extract_latest_thought()

    if not latest_thought['title']:
        print("❌ Error: Could not extract thought information")
        sys.exit(1)

    # Send notification
    send_notification(latest_thought)

if __name__ == "__main__":
    main()
