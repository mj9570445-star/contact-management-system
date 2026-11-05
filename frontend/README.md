# ContactHub

## Run locally

The app needs both the Express API and the Vite frontend running. Make sure
`backend/.env` contains a working MongoDB connection:

```env
MONGO_URI=your_mongodb_connection_string
```

In one terminal:

```powershell
cd backend
npm install
npm run dev
```

Wait for `MongoDB Connected Successfully!` and `Server running on port 5000`.
In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. Its development server forwards `/api`
requests to the backend on port 5000.

Contact phone numbers must be valid 10-digit Indian mobile numbers.
