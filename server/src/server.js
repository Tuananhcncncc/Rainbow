const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const { getPool } = require('./config/db');

require('dotenv').config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

require('./sockets/seatSocket')(io);

const PORT = process.env.PORT || 5000;

(async () => {

  try {

    await getPool();

    server.listen(PORT, () => {
      console.log(`Server chay tai: http://localhost:${PORT}`);
    });

  } catch (e) {

    console.error('Loi:', e.message);

    process.exit(1);
  }

})();