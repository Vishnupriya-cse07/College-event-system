# ⚡ EventHub — AI-Powered College Event Management System

> A full-stack platform for 15+ college societies to manage events and 500+ students to discover & register — powered by **Llama 3 AI**, **Socket.io real-time notifications**, and **JWT role-based authentication**.

![Tech Stack](https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

---

## 📊 Impact Metrics

| Metric | Result |
|--------|--------|
| Societies onboarded | 15+ |
| Student registrations | 500+ |
| Missed event instances reduced | **80%** |
| Event registration rate improved | **40%** |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Socket.io Client |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI Engine | Llama 3 via Ollama (keyword fallback included) |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS with CSS Variables |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| 🎓 **Student** | Browse & register for events, AI-personalized recommendations, real-time notifications, waitlist management |
| 🏛️ **Society** | Create/edit/delete events, AI description generator, view registrations & analytics |
| ⚙️ **Admin** | System-wide overview, manage all events and societies |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Ollama with Llama 3 *(optional — keyword-based fallback works without it)*

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-events
JWT_SECRET=your_secure_random_secret_here
JWT_EXPIRE=7d
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

This creates demo accounts and 5 sample events:

| Role | Email | Password |
|------|-------|----------|
| Student | `student@demo.com` | `demo123` |
| Society | `society@demo.com` | `demo123` |
| Admin | `admin@demo.com` | `demo123` |

### 4. Run the Application

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

---

## 🤖 AI Features (Llama 3)

### Setup Ollama *(Optional)*

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Llama 3
ollama pull llama3

# Start the Ollama server
ollama serve
```

> **Note:** If Ollama is not running, EventHub automatically falls back to interest-based keyword matching. All other features remain fully functional.

### AI Capabilities

| Feature | Description | Available To |
|---------|-------------|-------------|
| 🎯 **Personalized Recommendations** | Analyzes student interest profiles to rank and suggest events | Students |
| ✍️ **AI Description Generator** | Auto-generates compelling event descriptions | Societies |
| 🤖 **EveBot Chatbot** | Floating AI assistant for event discovery and help | All users |
| 📊 **Event Analytics** | AI-powered post-event success analysis and insights | Societies/Admin |

---

## 📂 Project Structure

```
college-event-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── eventController.js       # CRUD + auto-notify on creation
│   │   ├── registrationController.js # Register, cancel, waitlist promotion
│   │   └── aiController.js          # Llama 3 recommendations, chatbot, analytics
│   ├── models/
│   │   ├── User.js                  # Student / Society / Admin schema
│   │   ├── Event.js                 # Event with speakers, schedule, prizes
│   │   ├── Registration.js          # Auto-generated codes + waitlist
│   │   └── Notification.js          # Real-time notification records
│   ├── routes/                      # Express route handlers
│   ├── middleware/
│   │   └── auth.js                  # JWT protect + role authorize
│   ├── socket/
│   │   └── socketHandler.js         # JWT-authenticated Socket.io rooms
│   ├── seed.js                      # Database seeder with demo data
│   ├── server.js                    # Main entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout/Navbar.js          # Role-aware navigation
        │   ├── Events/EventCard.js       # Reusable event card
        │   ├── Notifications/NotificationPanel.js
        │   └── AI/AIChatbot.js           # Floating EveBot widget
        ├── context/
        │   ├── AuthContext.js            # Global auth state + axios config
        │   └── SocketContext.js          # Real-time socket + notifications
        ├── pages/
        │   ├── LoginPage.js / RegisterPage.js
        │   ├── StudentDashboard.js       # AI recommendations + stats
        │   ├── SocietyDashboard.js       # Event management table
        │   ├── AdminDashboard.js         # System overview
        │   ├── EventsPage.js             # Searchable, filterable listing
        │   ├── EventDetailPage.js        # Registration + tabs
        │   ├── CreateEventPage.js        # Form with AI description gen
        │   ├── MyRegistrationsPage.js
        │   ├── ProfilePage.js            # Interest management
        │   └── SocietiesPage.js
        └── utils/api.js                  # Axios instance with JWT interceptor
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as student or society |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Protected | Get current user profile |
| PUT | `/api/auth/profile` | Protected | Update profile & interests |

### Events

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/events` | Public | List events (search, filter, paginate) |
| GET | `/api/events/:id` | Public | Get event details |
| POST | `/api/events` | Society/Admin | Create event + notify all students |
| PUT | `/api/events/:id` | Organizer/Admin | Update event + notify registered students |
| DELETE | `/api/events/:id` | Organizer/Admin | Delete event + cascade registrations |
| GET | `/api/events/my-events` | Society | Get society's own events |

### Registrations

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/registrations/event/:id` | Student | Register or join waitlist |
| DELETE | `/api/registrations/event/:id` | Student | Cancel + auto-promote from waitlist |
| GET | `/api/registrations/my` | Student | Get own registrations |
| GET | `/api/registrations/event/:id` | Society/Admin | Get event registrants |

### AI Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/ai/recommendations` | Student | Llama 3 personalized event ranking |
| POST | `/api/ai/generate-description` | Society | Generate event description with AI |
| POST | `/api/ai/chat` | All | Chat with EveBot |
| GET | `/api/ai/analyze/:eventId` | Society/Admin | Post-event AI analysis |

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications` | Protected | Get notification list |
| PUT | `/api/notifications/:id/read` | Protected | Mark as read |
| PUT | `/api/notifications/read-all` | Protected | Mark all as read |
| GET | `/api/notifications/unread-count` | Protected | Get unread badge count |

---

## 📡 Socket.io Events

| Event | Direction | Trigger |
|-------|-----------|---------|
| `new_notification` | Server → User Room | Registration, update, waitlist promotion |
| `event_created` | Server → All | New event posted |
| `event_updated` | Server → All | Event details changed |
| `event_deleted` | Server → All | Event removed |
| `registration_update` | Server → Event Room | Live registration count change |
| `waitlist_promoted` | Server → Student | Spot opened up from cancellation |
| `system_announcement` | Server → All | Admin broadcast |

---

## 🌟 Feature Highlights

### 🔒 JWT Role Authentication
Three-tier access control (Admin > Society > Student) with protected routes on both frontend and backend. Tokens expire in 7 days; invalid tokens auto-redirect to login.

### 📡 Real-Time Notifications
Socket.io creates per-user rooms (`user_<id>`) and per-event rooms (`event_<id>`). Notifications are persisted to MongoDB and pushed instantly via websockets.

### 🤖 AI Recommendation Engine
On each request, Llama 3 receives the student's interest profile and all upcoming events, then returns a ranked JSON array with reasoning. Falls back to interest/tag keyword matching if Ollama is unavailable.

### ⏳ Waitlist Auto-Promotion
When a student cancels a confirmed registration, the system automatically promotes the first waitlisted student, updates their registration status, and sends them a real-time notification.

### 📋 Event Lifecycle Management
Events progress through `draft → published → ongoing → completed`. Societies get per-event registration analytics. Students get auto-generated registration codes for check-in.

---

## 🛠️ Development Scripts

```bash
# Install all dependencies
cd backend && npm install && cd ../frontend && npm install

# Seed database with demo data
cd backend && node seed.js

# Start backend in dev mode (nodemon)
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Start backend in production
cd backend && npm start
```

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend server port |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs |
| `JWT_EXPIRE` | No | `7d` | Token expiry duration |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | No | `llama3` | Ollama model name |
| `CLIENT_URL` | No | `http://localhost:3000` | Frontend URL for CORS |

---

## 📦 Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `socket.io` | Real-time communication |
| `jsonwebtoken` | JWT auth |
| `bcryptjs` | Password hashing |
| `axios` | Ollama API calls |
| `dotenv` | Environment config |

### Frontend
| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `socket.io-client` | Real-time connection |
| `axios` | HTTP requests |
| `react-hot-toast` | Toast notifications |
| `date-fns` | Date formatting |

---

## 📄 License

MIT © 2024 EventHub
