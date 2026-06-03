# 🌐 SocialApp — Mini Social Post Application

A full-stack social feed app built with **React.js + Node.js + Express + MongoDB**.
Inspired by the TaskPlanet Social Page UI.

---

## 📁 Project Structure

```
social-app/
├── backend/               ← Node.js + Express API
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/              ← React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── RightPanel.jsx
    │   │   ├── post/
    │   │   │   ├── CreatePost.jsx
    │   │   │   └── PostCard.jsx
    │   │   └── ui/
    │   │       └── Avatar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Feed.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── auth.css
    │   │   ├── layout.css
    │   │   └── posts.css
    │   ├── App.jsx
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## ⚙️ Local Setup

### Step 1 — Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/social-app.git
cd social-app
```

### Step 2 — Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (MongoDB URI, JWT secret, Cloudinary keys)
npm run dev
# Backend runs on http://localhost:5000
```

### Step 3 — Frontend setup
```bash
# Open a new terminal tab
cd frontend
npm install
# No .env needed for local dev — proxy in package.json handles it
npm start
# Frontend runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/social-app
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` (production only)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🚀 Deployment

### Backend → Render
1. Push code to GitHub
2. Render → New Web Service → connect repo → select `backend/` folder
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env variables from `.env`

### Frontend → Vercel
1. Vercel → New Project → connect repo → select `frontend/` folder
2. Framework preset: **Create React App**
3. Add env variable: `REACT_APP_API_URL` = your Render backend URL
4. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add database user + whitelist `0.0.0.0/0`
3. Copy connection string into backend `.env`

---

## ✨ Features
- ✅ Signup & Login with JWT auth
- ✅ Create posts with text, image, or both
- ✅ Public feed with pagination
- ✅ Like / unlike posts (toggle)
- ✅ Add & delete comments
- ✅ Filter: All Posts, For You, Most Liked, Most Commented
- ✅ Search posts by text or username
- ✅ Image upload via Cloudinary
- ✅ Image lightbox viewer
- ✅ Profile page with stats
- ✅ Responsive layout
- ✅ Toast notifications