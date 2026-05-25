const locked = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('join_showtime', (sid) => {
      socket.join(`st_${sid}`);

      socket.showtimeId = sid;

      const room = locked.get(sid) || {};

      socket.emit(
        'locked_seats',
        Object.keys(room).map(Number)
      );
    });

    socket.on('lock_seat', ({ showtimeId: sid, seatId, userId }) => {

      if (!locked.has(sid)) {
        locked.set(sid, {});
      }

      const room = locked.get(sid);

      if (
        room[seatId] &&
        room[seatId].userId !== userId
      ) {
        socket.emit('seat_lock_failed', { seatId });
        return;
      }

      if (room[seatId]?.timer) {
        clearTimeout(room[seatId].timer);
      }

      const timer = setTimeout(() => {

        if (room[seatId]?.userId === userId) {

          delete room[seatId];

          io.to(`st_${sid}`).emit(
            'seat_released',
            seatId
          );
        }

      }, 600000);

      room[seatId] = {
        userId,
        socketId: socket.id,
        timer
      };

      io.to(`st_${sid}`).emit(
        'seat_locked',
        { seatId, userId }
      );
    });

    socket.on('release_seat', ({ showtimeId: sid, seatId, userId }) => {

      const room = locked.get(sid);

      if (room?.[seatId]?.userId === userId) {

        clearTimeout(room[seatId].timer);

        delete room[seatId];

        io.to(`st_${sid}`).emit(
          'seat_released',
          seatId
        );
      }
    });

    socket.on('disconnect', () => {

      const sid = socket.showtimeId;

      if (!sid) return;

      const room = locked.get(sid);

      if (!room) return;

      for (const [seatId, data] of Object.entries(room)) {

        if (data.socketId === socket.id) {

          clearTimeout(data.timer);

          delete room[seatId];

          io.to(`st_${sid}`).emit(
            'seat_released',
            Number(seatId)
          );
        }
      }
    });
  });
};