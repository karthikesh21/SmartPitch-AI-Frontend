# 🚀 SmartPitch AI

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-success?style=for-the-badge&logo=vercel)](https://smart-pitch-ai-frontend-wlr7.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Groq AI](https://img.shields.io/badge/AI_Engine-Groq_LLaMA_3.3-orange?style=for-the-badge)](https://groq.com/)

**SmartPitch AI** is an AI-powered B2B sales pitch generator that creates high-converting cold emails, LinkedIn messages, cold call scripts, and ad copy in seconds.

---

## 🌟 Key Features

- **⚡ Multi-Format Pitch Generation**: Generate Cold Mail, LinkedIn DMs, Phone Scripts, and Advertising Copy tailored to any role.
- **🔐 Global Cloud Authentication**: Real-time cross-device user authentication (Laptop, PC, Mobile Phone).
- **🔑 6-Digit OTP Password Reset**: Automated 6-digit OTP verification system with live email dispatch.
- **📜 Pitch History Storage**: Review, copy, and manage your previously generated pitches.
- **🎨 3D Interactive Robot**: Dynamic Three.js interactive 3D robot header with smooth cursor tracking.
- **📱 Fully Responsive**: Tailored mobile UI optimized for all smartphone screens.

---

## 📁 Repository Structure

```
SmartPitch-AI/
├── api/                   # Vercel Serverless Function API handlers
│   ├── auth/              # Auth routes: signup, login, forgot-password, verify-otp, reset-password
│   ├── pitch/             # Pitch routes: generate, cold-mail
│   ├── index.js           # Serverless Express app handler
│   └── health.js          # Health check endpoint
├── server/                # Core Backend Services & Data Store
│   ├── data/              # Initial seed users store (users.json)
│   └── services/          # userStore.js (Cloud DB), aiService.js (Groq), emailService.js
├── src/                   # React 18 Frontend
│   ├── components/        # Interactive Robot 3D, Navbar, BrandLogo, Layout
│   ├── context/           # AuthContext (local & cloud fallback state)
│   ├── pages/             # HomePage, GeneratorPage, LoginPage, SignUpPage, ForgotPasswordPage, HistoryPage
│   └── services/          # Axios API client
├── public/                # Static public assets & HTML template
├── package.json           # Dependencies & build scripts
└── vercel.json            # Vercel deployment configuration
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Three.js, FontAwesome
- **Backend**: Node.js, Express, Vercel Serverless Functions
- **AI Engine**: Groq SDK (`llama-3.3-70b-versatile`)
- **Database & Persistence**: Global Cloud JSON Store + Local Storage Fallback
- **Mail Service**: Nodemailer (SMTP / Gmail App Password)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/karthikesh21/SmartPitch-AI-Frontend.git
cd SmartPitch-AI-Frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# AI Engine Key
GROQ_API_KEY=your_groq_api_key

# Live Email SMTP Credentials (Optional for real email delivery)
SMTP_GMAIL_USER=your_email@gmail.com
SMTP_GMAIL_PASS=your_gmail_app_password
```

### 3. Run Locally

```bash
npm start
```

The app will launch at `http://localhost:3000`.

---

## 📡 API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & start session |
| `POST` | `/api/auth/forgot-password` | Generate & dispatch 6-digit OTP code |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code |
| `POST` | `/api/auth/reset-password` | Update password using verified OTP |
| `POST` | `/api/pitch/generate` | Generate full sales pitch |
| `POST` | `/api/pitch/cold-mail` | Generate 4 sales outreach formats |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
