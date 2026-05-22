# DeepSeek API Setup

## Getting Started

To enable AI-powered question generation in "Climb the Mountain Quiz", you need to set up the DeepSeek API.

### Step 1: Get API Key

1. Go to https://platform.deepseek.com/
2. Sign up or Log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Step 2: Local Development

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your API key:
```
DEEPSEEK_API_KEY=sk-your-key-here
```

**IMPORTANT:** 
- Do NOT use `VITE_` prefix - this is a backend-only variable
- Do NOT commit `.env.local` to GitHub
- The API key will NOT be exposed to the frontend

### Step 3: Vercel Deployment

1. Go to your Vercel project
2. Navigate to Project Settings → Environment Variables
3. Add a new variable:
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-your-key-here`
4. Redeploy the project

### Testing the API

In "Climb the Mountain Quiz":
1. Select "AI Topic" tab
2. Enter a topic (e.g., "HSK2 天气")
3. Select HSK level
4. Select question count
5. Click "Generate Questions"

If successful:
- The button will show "Generating..." during API call
- Questions will be added to the list
- You can review them before starting the game

If unsuccessful:
- Check the Vercel function logs for errors
- Make sure the API key is correctly configured

## Security Notes

- The API key is stored ONLY in environment variables
- It's accessed only in the serverless function (`/api/deepseek-generate-quiz`)
- It's NEVER exposed to the frontend or client-side JavaScript
- It's NEVER committed to GitHub

## Troubleshooting

### "AI API is not configured"
- The API key is missing or incorrect
- Check the Vercel environment variables

### "AI generation failed"
- Check Vercel function logs for detailed errors
- The API might be rate-limited or have quota issues

### Questions not appearing
- Make sure at least one question type is selected (Multiple Choice or True/False)
- Check the console for JavaScript errors