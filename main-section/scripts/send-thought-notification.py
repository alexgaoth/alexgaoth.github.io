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
from datetime import datetime

# Configuration
BUTTONDOWN_API_KEY = os.environ.get('BUTTONDOWN_API_KEY')
BUTTONDOWN_API_URL = "https://api.buttondown.com/v1/emails"
THOUGHTS_INDEX_PATH = Path(__file__).parent.parent / 'src' / 'data' / 'thoughtsIndex.js'
WEBSITE_URL = "https://app.alexgaoth.com"  # Update with your actual website URL

def extract_latest_thought():
    """Extract the latest thought from thoughtsIndex.js"""
    if not THOUGHTS_INDEX_PATH.exists():
        print(f"❌ Error: thoughtsIndex.js not found at {THOUGHTS_INDEX_PATH}")
        sys.exit(1)

    with open(THOUGHTS_INDEX_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the first article object (latest due to date sorting)
    # This is a simple parser - assumes the format from generate-thoughts-index.js
    start_idx = content.find('export const thoughtsIndex = [')
    if start_idx == -1:
        print("❌ Error: Could not parse thoughtsIndex.js")
        sys.exit(1)

    # Find the first article object
    first_obj_start = content.find('{', start_idx)
    bracket_count = 0
    first_obj_end = first_obj_start

    for i in range(first_obj_start, len(content)):
        if content[i] == '{':
            bracket_count += 1
        elif content[i] == '}':
            bracket_count -= 1
            if bracket_count == 0:
                first_obj_end = i + 1
                break

    # Extract fields using simple string parsing
    obj_str = content[first_obj_start:first_obj_end]

    def extract_field(field_name, obj_text):
        pattern = f'{field_name}: "'
        start = obj_text.find(pattern)
        if start == -1:
            return None
        start += len(pattern)
        end = obj_text.find('"', start)
        return obj_text[start:end]

    return {
        'title': extract_field('title', obj_str),
        'date': extract_field('date', obj_str),
        'excerpt': extract_field('excerpt', obj_str),
        'slug': extract_field('slug', obj_str),
        'readTime': extract_field('readTime', obj_str)
    }

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
