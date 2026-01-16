# Owais Optics

Premium eyewear services website for NUST hostels in Islamabad.

## Project Structure

```
Owais Optics/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── netlify.toml   # Netlify deployment config
├── backend/           # FastAPI Python backend
│   ├── routes/
│   ├── models/
│   └── render.yaml    # Render deployment config
└── README.md
```

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Frontend (Netlify)
1. Connect GitHub repo to Netlify
2. Set base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`

### Backend (Render)
1. Connect GitHub repo to Render
2. Set root directory: `backend`
3. Add environment variables:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (your Netlify URL)

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```
