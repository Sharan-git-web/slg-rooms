const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
// Restrict cross-origin requests to known frontend origins. Defaults cover
// local Vite dev; set FRONTEND_URL (comma-separated for multiple) once the
// frontend has a real deployed domain.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Route for testing
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roomRoutes = require('./routes/roomRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const requireAuth = require('./middleware/authMiddleware');

app.use(['/auth', '/api/auth'], authRoutes);
app.use(['/bookings', '/api/bookings'], requireAuth, bookingRoutes);
app.use(['/dashboard', '/api/dashboard'], requireAuth, dashboardRoutes);
app.use(['/rooms', '/api/rooms'], requireAuth, roomRoutes);
app.use(['/revenue', '/api/revenue'], requireAuth, revenueRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.message?.startsWith('Origin ')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;
