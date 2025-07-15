# CollabBoard - Real-time Collaborative Whiteboard

A modern, real-time collaborative whiteboard application built with React, TypeScript, Socket.IO, and Express.js.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can draw simultaneously with live updates
- **User Authentication**: Secure sign up/sign in with bcryptjs password hashing
- **Room Management**: Create public or private rooms with shareable links
- **Drawing Tools**: Pen, shapes (rectangle, circle, line, triangle, arrow, star), emojis
- **Beautiful UI**: Modern design with gradients, animations, and responsive layout
- **Live Cursors**: See other users' cursor positions in real-time
- **Canvas Controls**: Undo/redo, clear canvas, color picker, line width adjustment
- **Connection Status**: Real-time connection and user count indicators

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Socket.IO Client** for real-time communication
- **Vite** for development and building

### Backend
- **Express.js** with TypeScript
- **Socket.IO** for real-time collaboration
- **Passport.js** with Local Strategy for authentication
- **bcryptjs** for password hashing
- **Drizzle ORM** with PostgreSQL
- **Express Session** for session management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collabboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/collabboard
   SESSION_SECRET=your-secret-key-here
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:3000` (Express server)

## 🎯 Usage

1. **Create an Account**: Sign up with your name, email, and password
2. **Sign In**: Log in with your credentials
3. **Create a Room**: Choose between public or private room types
4. **Share the Link**: Copy and share the room link with collaborators
5. **Start Drawing**: Use the drawing tools to create and collaborate in real-time

## 🏗️ Project Structure

```
collabboard/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Landing.tsx     # Landing page with auth
│   │   └── Whiteboard.tsx  # Main whiteboard interface
│   ├── hooks/              # Custom React hooks
│   │   ├── use-auth.ts     # Authentication hook
│   │   └── use-socket.ts   # Socket.IO hook
│   ├── schema/             # Database schema and types
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── server/
│   └── index.ts            # Express server with Socket.IO
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.ts          # Vite configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## 🌟 Key Features Explained

### Real-time Collaboration
- Uses Socket.IO for bidirectional communication
- Live canvas updates across all connected users
- Real-time cursor tracking
- Instant user join/leave notifications

### Authentication System
- Secure password hashing with bcryptjs
- Session-based authentication with Passport.js
- Protected routes and user state management
- Persistent login sessions

### Drawing Tools
- **Pen Tool**: Free-hand drawing with customizable colors and line width
- **Shape Tools**: Rectangle, circle, line, triangle, arrow, and star
- **Emoji Tool**: Add emojis to the canvas
- **Canvas Controls**: Undo/redo functionality and clear canvas

### Room Management
- Generate unique room IDs
- Public and private room types
- Shareable room links
- Real-time user count display

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-secure-session-secret
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by collaborative tools like Figma and Miro
- Uses beautiful icons from Lucide React
- Styled with Tailwind CSS for a modern look