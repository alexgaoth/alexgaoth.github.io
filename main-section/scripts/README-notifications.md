# Thought Notification System

This system automatically sends email notifications to your subscribers when you publish a new thought article.

## How It Works

1. **Commit a new thought**: Add a new `.md` file to `main-section/src/data/thoughts/`
2. **GitHub Actions triggers**: The workflow detects changes in the thoughts directory
3. **Index generation**: Runs `generate-thoughts-index.js` to update the index
4. **Email sent**: Runs `send-thought-notification.py` to notify subscribers via Buttondown

## Setup Instructions

### 1. Get Your Buttondown API Key

1. Sign up at [Buttondown](https://buttondown.email/)
2. Go to Settings → API Keys
3. Copy your API key

### 2. Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `BUTTONDOWN_API_KEY`
5. Value: Paste your Buttondown API key
6. Click "Add secret"

### 3. Update Website URL

Edit `send-thought-notification.py` and update the `WEBSITE_URL` variable:

```python
WEBSITE_URL = "https://yourdomain.com"  # Your actual website URL
```

### 4. Test Locally (Optional)

You can test the notification script locally:

```bash
# Set your API key
export BUTTONDOWN_API_KEY="your-api-key-here"

# Run the script
python main-section/scripts/send-thought-notification.py
```

## Files

- **`send-thought-notification.py`**: Python script that sends emails via Buttondown API
- **`.github/workflows/notify-new-thought.yml`**: GitHub Actions workflow for automation
- **`generate-thoughts-index.js`**: Existing script that indexes thought articles

## Workflow Trigger

The GitHub Action triggers when:
- You push to the `master` branch
- Changes are detected in `main-section/src/data/thoughts/*.md`

## Email Format

Subscribers will receive an email with:
- Subject: "New Thought: [Article Title]"
- Article title
- Excerpt
- Link to read the full article
- Publication date and read time

## Troubleshooting

### Email not sending?

1. Check GitHub Actions logs in the "Actions" tab
2. Verify `BUTTONDOWN_API_KEY` secret is set correctly
3. Ensure your Buttondown account is active
4. Check that `thoughtsIndex.js` was generated successfully

### Wrong article sent?

The script always sends the **latest** article (sorted by date). Make sure your new article has the most recent date in its frontmatter.

### Manual trigger

To manually send a notification without committing a new article:

```bash
cd main-section
npm run generate-thoughts
export BUTTONDOWN_API_KEY="your-key"
python scripts/send-thought-notification.py
```
