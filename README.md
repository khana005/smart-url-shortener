# 🔗 Smart URL Shortener

A production-ready, full-stack URL shortening SaaS platform built with the **MERN stack** (MongoDB, Express, React, Node.js).

> Shorten, share, protect, and track your links with powerful real-time analytics, QR codes, password protection, and link expiration.

---

## ✨ Features

- **URL Shortening** — Custom aliases, auto-generated codes, duplicate detection
- **QR Code Generation** — Auto-generated QR for every link, downloadable as PNG
- **Password Protection** — bcrypt-hashed passwords on any link
- **Link Expiration** — Set exact expiry datetime; expired links redirect to a clean page
- **Real-Time Analytics** — Clicks, unique visitors, devices, browsers, OS, countries, referrers
- **Interactive Dashboard** — Area charts, pie charts, bar charts powered by Recharts
- **Authentication** — JWT-based auth with secure bcrypt password hashing
- **Link Management** — Search, sort, filter, paginate, edit, delete
- **Social Sharing** — One-click copy, Twitter/Facebook/LinkedIn/Email share
- **Rate Limiting** — Multiple limiters for API, auth, URL creation, and redirects
- **Security** — Helmet headers, CORS, input validation, hashed IP analytics

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Charts | Recharts |
| Icons | React Icons |
| Toast | React Hot Toast |
| HTTP | Axios |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| QR Code | qrcode |
| UA Parsing | ua-parser-js |
| Security | Helmet + express-rate-limit |
| Validation | express-validator |

---

## 📁 Project Structure

```
url_shortener/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, rate limiting, error handling
│   ├── models/         # Mongoose schemas (User, Url, Analytics)
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic (analytics, QR, URL)
│   ├── utils/          # Helpers, validators
│   ├── server.js       # App entry point
│   └── .env.example    # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios service functions
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Page components
│   │   └── index.css   # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone https://github.com/khana005/smart-url-shortener.git
cd smart-url-shortener

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Frontend
cd ../frontend
cp .env.example .env
# Optionally set VITE_API_URL for production
```

### 3. Run development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `FRONTEND_URL` | Frontend origin URL | `http://localhost:5173` |
| `BASE_URL` | Backend/short link base URL | `http://localhost:5000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `URL_CREATE_LIMIT` | Max URL creations per window | `30` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (blank = uses Vite proxy) |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/update-profile` | Yes | Update profile |
| PUT | `/api/auth/change-password` | Yes | Change password |

### URLs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/urls` | Yes | Create short URL |
| GET | `/api/urls` | Yes | List user's URLs (paginated) |
| GET | `/api/urls/:id` | Yes | Get single URL |
| PUT | `/api/urls/:id` | Yes | Update URL |
| DELETE | `/api/urls/:id` | Yes | Delete URL |
| GET | `/api/urls/:id/qr` | Yes | Get QR code |
| POST | `/api/urls/:shortCode/verify-password` | Yes | Verify link password |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Yes | Dashboard stats |
| GET | `/api/analytics/:urlId` | Yes | Per-URL analytics |

### Redirect
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/:shortCode` | No | Redirect short URL |

---

## 🚀 Deployment

### Backend — Render.com

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `.env.example`

### Frontend — Vercel

1. Import your GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Set **Framework** to Vite
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add your IP to the allowlist (or allow `0.0.0.0/0` for Render)
3. Create a database user
4. Copy the connection string to `MONGO_URI`

---

## 📸 Screenshots

> _Add screenshots of Landing, Dashboard, Analytics, and QR modal here_

---

## 🔮 Future Improvements

- [ ] Redis caching for frequently accessed short codes
- [ ] Custom domains
- [ ] Bulk URL import/export (CSV)
- [ ] Link retargeting / UTM parameter builder
- [ ] Team workspaces
- [ ] API keys for programmatic access
- [ ] Webhook notifications on click thresholds
- [ ] Email reports

---

## 📄 License

MIT — free to use, modify, and distribute.
