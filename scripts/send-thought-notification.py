#!/usr/bin/env python3
"""
Send a Buttondown email when a new thought article is posted.
Reads frontmatter straight from astro/src/data/thoughts/*.md — no build step.
"""

import math
import os
import sys
from pathlib import Path

import requests
import yaml

BUTTONDOWN_API_KEY = os.environ.get('BUTTONDOWN_API_KEY')
BUTTONDOWN_API_URL = "https://api.buttondown.com/v1/emails"
THOUGHTS_DIR = Path(__file__).parent.parent / 'astro' / 'src' / 'data' / 'thoughts'
WEBSITE_URL = "https://alexgaoth.com"


def parse_thought(path):
    text = path.read_text(encoding='utf-8')
    if not text.startswith('---'):
        return None
    _, frontmatter, body = text.split('---', 2)
    data = yaml.safe_load(frontmatter)
    words = len(body.split())
    data['readTime'] = f"{math.ceil(words / 225)} min read"
    return data


def latest_thought():
    thoughts = [t for t in map(parse_thought, THOUGHTS_DIR.glob('*.md')) if t]
    if not thoughts:
        print(f"❌ Error: no thoughts found in {THOUGHTS_DIR}")
        sys.exit(1)
    return max(thoughts, key=lambda t: str(t['date']))


def format_email_body(thought):
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
    if not BUTTONDOWN_API_KEY:
        print("❌ Error: BUTTONDOWN_API_KEY environment variable not set")
        sys.exit(1)

    headers = {
        "Authorization": f"Token {BUTTONDOWN_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "subject": f"New Thought: {thought['title']}",
        "body": format_email_body(thought),
    }

    try:
        print(f"📧 Sending notification for: {thought['title']}")
        response = requests.post(BUTTONDOWN_API_URL, headers=headers, json=data)
        response.raise_for_status()
        print("✅ Email notification sent successfully!")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending email: {e}")
        if getattr(e, 'response', None) is not None:
            print(f"   Response: {e.response.text}")
        sys.exit(1)


if __name__ == "__main__":
    print("🚀 Starting thought notification process...")
    send_notification(latest_thought())
