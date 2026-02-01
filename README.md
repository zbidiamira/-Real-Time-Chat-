# 💬 Real-Time Chat Application

A full-featured real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io for instant messaging.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4+-black?style=flat-square&logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 🚀 Features

- **Real-time Messaging** - Instant message delivery using Socket.io
- **Private Chats** - One-on-one conversations
- **Group Chats** - Create and manage group conversations
- **User Authentication** - Secure JWT-based authentication
- **User Search** - Find and connect with other users
- **Typing Indicators** - See when others are typing
- **Online Status** - Know who's online in real-time
- **Media Sharing** - Share images and files
- **Message Notifications** - Unread message indicators
- **Dark/Light Theme** - Customizable appearance
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Vite** - Build tool & dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket library
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # CSS styles
│   │   ├── config/        # Configuration
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── socket/        # Socket.io handlers
│   │   ├── utils/         # Utilities
│   │   └── app.js         # Express app
│   ├── server.js          # Entry point
│   └── package.json
│
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (v6.0 or higher) - local or Atlas
- **Git**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Set up environment variables

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### Production Mode

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

## 📜 Available Scripts

### Server
| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot-reload |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

### Client
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

## 🔌 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

### Authentication (Coming in PR #3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Users (Coming in PR #4)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/search` | Search users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |

### Chats (Coming in PR #5)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chats` | Create/access chat |
| GET | `/api/chats` | Get user chats |
| POST | `/api/chats/group` | Create group chat |

### Messages (Coming in PR #6)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:chatId` | Get chat messages |

## 🔒 Environment Variables

### Server

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Client

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

## 🧪 Testing

```bash
# Run backend tests (Coming in PR #16)
cd server
npm test

# Run with coverage
npm run test:coverage
```

## 🚢 Deployment

### Using Docker (Coming in PR #17)

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the client: `cd client && npm run build`
2. Set production environment variables
3. Start the server: `cd server && npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) for real-time capabilities
- [MongoDB](https://www.mongodb.com/) for the database
- [React](https://reactjs.org/) for the UI framework

---

Made with ❤️ by Your Name
