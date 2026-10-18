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

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) which send no Origin header,
    // explicitly configured origins, and any slg-rooms Vercel deployment domain.
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/slg-rooms.*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roomRoutes = require('./routes/roomRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const requireAuth = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);

app.use('/api/bookings', requireAuth, bookingRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/rooms', requireAuth, roomRoutes);
app.use('/api/revenue', requireAuth, revenueRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.message?.startsWith('Origin ')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;
