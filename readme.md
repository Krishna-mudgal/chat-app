# Real-Time Chat Application  
(Node.js, Express, MongoDB, Socket.io, React)

A full-stack real-time chat platform supporting public and private channels, real-time messaging, online user tracking, and secure authentication using JWT stored in HTTP-only cookies.

---

## Features

### Authentication
- JWT-based login and signup  
- Token stored in HTTP-only cookies  
- `/me` route to auto-fetch logged-in user  
- Secure password hashing using bcrypt  

### Channel System
- Create public or private channels  
- Private channels support password protection  
- Only channel admins can view the full member list for private channels  
- Public channels allow everyone to see members  

### Real-Time Chat (Socket.io)
- Real-time messages  
- Typing indicators  
- Online/offline user status updating  
- Auto-join channels upon navigating to chat  
- Message saving in MongoDB  

### Messages
- Paginated fetching  
- MongoDB persistence  
- Sender automatically populated with username  

---

## Tech Stack

### Frontend
- React.js  
- Vite  
- Axios  
- Socket.io-client  
- TailwindCSS (optional)  

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Socket.io  
- JSON Web Tokens  
- CORS + cookie-parser  

---

## Project Structure
```text
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── socket.js
```
## Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```
### 2. Create a .env file
- MONGO_URL=your_mongodb_connection_url
- SECRET_KEY=your_jwt_secret
- FRONTEND_URL=your_frontend_url

### 3. Start the backend
```bash
npm start
```

## Frontend Setup
### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Create a .env file
```ini
VITE_BACKEND_API_URL=your_backend_url/api
VITE_BACKEND_SOCKET_URL=your_backend_url
```

### 3. Start the frontend
```bash
npm run dev
```

## API Endpoints
### Authentication
```bash
POST /api/signup
POST /api/login
GET  /api/me
POST /api/logout
```

### Channels
```bash
POST /api/channels/create
POST /api/channels/join
GET  /api/channels/:id
```

### Messages
```bash
POST /api/messages
GET  /api/messages/:channelId?page=1&limit=20
```

## Socket.io Events
### Client to Server

- joinChannel
- sendMessage
- typing
- stopTyping

### Server to Client

- newMessage
- onlineUsers
- typing
- stopTyping

## Deployment Guide

### Backend: Render
- Create a new Web Service
- Set build command: npm install
- Set start command: node server.js
- Add environment variables from .env
- Enable CORS with your frontend domain
- Add CLIENT_URL properly

### Frontend: Vercel
- Import the frontend folder
- Add environment variables
- Deploy

## Live Demo

- Frontend: https://chat-app-gilt-tau-39.vercel.app
- Backend API: https://chat-app-6ind.onrender.com