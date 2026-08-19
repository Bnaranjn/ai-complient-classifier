# ComplaintLens — merged frontend + backend

This version keeps your friend's Next.js backend/API/Prisma/Gemini code and replaces the default Next.js page with the ComplaintLens frontend.

## What is now connected

- Dashboard calls `GET /api/complaints/stats`
- Complaints table calls `GET /api/complaints`
- Analyze page calls `POST /api/complaints`
- The POST endpoint runs your friend's Gemini analysis and saves the result in SQLite through Prisma
- The frontend displays category, sentiment, severity, priority score, AI summary, and suggested action

## Run it

1. Extract the project.
2. Open the project folder in VS Code.
3. Make sure your `.env` contains the same variables your backend requires, especially `GEMINI_API_KEY` and `DATABASE_URL` if your friend's setup uses them.
4. Install dependencies:

```bash
npm install
```

5. Start the app:

```bash
npm run dev
```

6. Open the localhost URL shown by Next.js (normally `http://localhost:3000`).

## Important

The frontend now uses relative URLs such as `/api/complaints`, so you do NOT need to run a separate frontend server. The Next.js app serves both the UI and API.

If the backend's Gemini model or API key has an issue, the Analyze button will show the backend error instead of pretending the AI worked.
