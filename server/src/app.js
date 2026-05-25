const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/movies',    require('./routes/movies'));
app.use('/api/showtimes', require('./routes/showtimes'));
app.use('/api/seats',     require('./routes/seats'));
app.use('/api/combos',    require('./routes/combos'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/cinemas',   require('./routes/cinemas'));
app.use('/api/admin',     require('./routes/admin'));

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message
  });
});

module.exports = app;