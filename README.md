# FileShare - Secure File Sharing Platform

<div align="center">

A modern, full-stack file sharing application with content deduplication, storage quotas, async email delivery, and advanced security features including password protection, expiry dates, and QR code sharing.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Features

### For Registered Users
- **User Authentication** — Secure register, login, and logout with JWT (HTTP-only cookies) and a `/me` session-check endpoint
- **File Upload** — Upload up to 10 files (max 50MB each)
- **Content Deduplication** — SHA-256 hashing skips re-uploading files you've already sent to Cloudinary
- **Storage Quotas** — Per-user storage limit (500MB free tier), enforced atomically on every upload/delete
- **File Management** — View, search, filter, and paginate your files
- **Password Protection** — Secure files with bcrypt-hashed passwords
- **Expiry Dates** — Set or clear custom expiration dates for files
- **Share via Link** — Unique, collision-checked short slugs (`nanoid`) for easy sharing
- **Share via QR Code** — Generate QR codes for mobile sharing
- **Share via Email** — Email delivery is queued through BullMQ + Redis and sent asynchronously in the background, with automatic retry on failure
- **Download Analytics** — Track download counts for your files
- **Profile Dashboard** — View storage usage, plan tier, and account details

### For Guest Users
- **No Account Required** — Upload files without registration
- **Quick Sharing** — Get shareable links instantly
- **Rate Limited** — 3 uploads per 24 hours per IP address
- **Automatic 24-hour Expiry** — Guest files auto-delete via a MongoDB TTL index — no cleanup job needed

| Feature | Guest | Registered |
|---------|:-----:|:----------:|
| File Upload | ✅ | ✅ |
| Max Files per Upload | 3 | 10 |
| File Size Limit | 25MB | 50MB |
| Upload Rate Limit | 3 / 24h per IP | None (quota-based) |
| File Expiry | 24 hours (fixed) | Customizable |
| Content Deduplication | ✅ | ✅ |
| Password Protection | ❌ | ✅ |
| Email Sharing | ❌ | ✅ |
| QR Code Generation | ✅ | ✅ |
| Download Analytics | ❌ | ✅ |
| File Management | ❌ | ✅ |

---

## Screenshots

### Landing Page
![Landing Page](client/assets/landing.png)
![Landing Page 2](client/assets/landing1.png)
![Landing Page 2](client/assets/landing2.png)
![Landing Page 2](client/assets/landing3.png)

### Register Page
![Register](client/assets/register.png)

### Dashboard
![Dashboard](client/assets/dashboard.png)

### Upload Page
![Upload](client/assets/upload.png)

### My Files
![My Files](client/assets/myfiles.png)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **Axios** | HTTP Client |
| **Tailwind CSS** | Styling |
| **Vite** | Build Tool |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **Redis** | Job queue store |
| **BullMQ** | Async background job processing (email delivery) |
| **JWT** | Authentication |
| **Bcrypt.js** | Password hashing |
| **Cloudinary** | File storage |
| **Multer** | File upload handling |
| **Nodemailer** | Email delivery (run inside the BullMQ worker) |
| **QRCode** | QR generation |
| **nanoid** | Short, URL-safe slug generation |
| **express-rate-limit** | IP-based and attempt-based rate limiting |
| **Helmet** | HTTP security headers |

---

## Project Structure

```
File-Sharing/
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js           # Auth API functions
│   │   │   ├── axios.js             # Axios instance
│   │   │   └── fileApi.js           # File API functions
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── files/
│   │   │   │   ├── FileCard.jsx
│   │   │   │   ├── FileDetailsModal.jsx
│   │   │   │   └── ShareModal.jsx
│   │   │   ├── shared/
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   └── Input.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state + session check via /me
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GuestUpload.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyFiles.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SharedFile.jsx
│   │   │   └── Upload.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Backend (Node.js)
│   ├── config/
│   │   ├── cloudinary.js            # Cloudinary config
│   │   ├── db.js                    # MongoDB connection
│   │   └── redis.js                 # Redis connection (BullMQ)
│   ├── controllers/
│   │   ├── file_controller.js       # File operations + dedup + quota
│   │   └── user_controller.js       # User operations + getMe
│   ├── middleware/
│   │   ├── auth_middleware.js       # JWT verification (cookie + Bearer)
│   │   ├── authorize.js             # Role-based guard (admin-only routes)
│   │   ├── authorizeUser.js         # Self-or-admin guard
│   │   └── multer.js                # File upload config (+ guest variant)
│   ├── models/
│   │   ├── file.js                  # File schema (slug, hash, quota fields)
│   │   ├── guestFile.js             # Guest file schema (TTL index)
│   │   └── user.js                  # User schema (storage quota, plan)
│   ├── queues/
│   │   └── emailQueue.js            # BullMQ queue definition
│   ├── workers/
│   │   └── emailWorker.js           # BullMQ worker — sends queued emails
│   ├── routes/
│   │   ├── file_routes.js           # File endpoints
│   │   └── user_routes.js           # User endpoints
│   ├── app.js                       # Entry point (helmet, CORS, rate limit)
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Redis** (local or a hosted instance — required for email queueing)
- **Cloudinary Account** (for file storage)
- **Gmail Account** (for email sharing feature)

### Environment Variables

#### Server (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fileshare
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000

# Redis (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Client (`client/.env`)

```env
VITE_BACKEND_URI=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gaurav77Kumar/file-sharing.git
   cd file-sharing
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   - Create `.env` file in `server/` folder
   - Create `.env` file in `client/` folder
   - Fill in the required values as shown above

5. **Start Redis** (required for email queueing)
   ```bash
   redis-server
   ```

### Running the App

#### Development Mode

**Terminal 1 — Start Redis** (if not already running):
```bash
redis-server
```

**Terminal 2 — Start the server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000` and also starts the BullMQ email worker.

**Terminal 3 — Start the client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

#### Production Mode

**Build the client:**
```bash
cd client
npm run build
```

**Start the server:**
```bash
cd server
npm start
```

---

## API Reference

### Authentication Endpoints — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login user, sets HTTP-only cookie | No |
| `POST` | `/auth/logout` | Logout user | Yes |
| `GET` | `/auth/me` | Get current logged-in user (session check) | Yes |
| `GET` | `/auth/users` | Get all users | Admin |
| `GET` | `/auth/users/:userId` | Get user by ID | Yes |
| `PATCH` | `/auth/users/:userId` | Update username, fullname, bio | Self/Admin |
| `DELETE` | `/auth/users/:userId` | Delete user — cascades to their files | Self/Admin |

### File Endpoints (Authenticated) — `/api/files`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | Upload files (max 10, 50MB each) — hash-deduplicated, quota-checked |
| `GET` | `/files/my-files` | Get files, paginated and sortable |
| `GET` | `/files/search` | Search files by name, type, or status |
| `GET` | `/files/details/:fileId` | Get full file details (owner populated) |
| `GET` | `/files/download-info/:fileId` | Get lightweight download metadata |
| `GET` | `/files/download/:fileId` | Download a file (checks expiry/password) |
| `GET` | `/files/download-count/:fileId` | Get a file's download count |
| `DELETE` | `/files/delete/:fileId` | Soft-delete a file, frees storage quota |
| `PATCH` | `/files/status/:fileId` | Set file status to active/inactive |
| `PATCH` | `/files/expiry/:fileId` | Set or clear a file's expiry date |
| `PATCH` | `/files/password/:fileId` | Set or remove password protection |
| `PATCH` | `/files/expiry-all` | Bulk-update expiry across all your files |
| `GET` | `/files/share-link/:fileId` | Get the share link for a file |
| `POST` | `/files/send-email/:fileId` | Queue an email share (sent async via BullMQ) |
| `GET` | `/files/qr/:fileId` | Generate a QR code for the share link |

### Public/Guest Endpoints — `/api/files`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/files/share/:slug` | Access a shared file by its slug |
| `POST` | `/files/verify-password/:fileId` | Verify a file's password (rate-limited, 10/15min) |
| `POST` | `/files/guest/upload` | Guest upload (max 3 files, 25MB each, 3/24h per IP) |
| `GET` | `/files/guest/download-info/:slug` | Get a guest file's info by slug |
| `POST` | `/files/guest/verify-password/:slug` | Verify a guest file's password |

---

## Architecture Highlights

- **Content deduplication** — every upload is SHA-256 hashed before hitting Cloudinary; identical files reuse the existing asset instead of re-uploading
- **Storage quotas** — `storageUsed`/`storageLimit` enforced atomically with MongoDB `$inc`, freed on delete
- **Async email queue** — `sendLinkEmail` adds a job to BullMQ and returns immediately; a separate worker process sends the email with automatic retry and exponential backoff on failure
- **Rate limiting** — IP-based for guest uploads (3/24h), attempt-based for password verification (10/15min)
- **TTL auto-cleanup** — guest files use a MongoDB TTL index, so expired uploads are deleted automatically with zero cron jobs
- **Soft delete** — files are marked `deletedAt` rather than hard-deleted, with Cloudinary cleanup handled via the stored `cloudinaryPublicId`

---