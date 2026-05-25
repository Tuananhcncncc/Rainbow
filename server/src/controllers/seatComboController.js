const { db, sql } = require('../config/db');

// SEATS
exports.getByShowtime = async (req, res) => {
  try {
    console.log('=== getByShowtime called, showtimeId:', req.params.showtimeId);

    // Kiem tra showtime ton tai khong
    const stCheck = await db(
      'SELECT id, room_id FROM showtimes WHERE id = @sid',
      { sid: { type: sql.Int, value: req.params.showtimeId } }
    );
    console.log('Showtime found:', stCheck.recordset);

    if (!stCheck.recordset.length) {
      return res.status(404).json({ success: false, message: 'Khong tim thay suat chieu' });
    }

    const roomId = stCheck.recordset[0].room_id;

    // Kiem tra so ghe trong phong
    const seatCount = await db(
      'SELECT COUNT(*) AS cnt FROM seats WHERE room_id = @rid',
      { rid: { type: sql.Int, value: roomId } }
    );
    console.log('Seats in room', roomId, ':', seatCount.recordset[0].cnt);

    const r = await db(
      `SELECT s.id, s.seat_code, s.seat_type,
              RTRIM(s.row_label) AS row_label,
              s.col_number,
         CASE
           WHEN bs.seat_id IS NOT NULL THEN 'booked'
           ELSE 'available'
         END AS status
       FROM seats s
       JOIN rooms r ON r.id = s.room_id
       JOIN showtimes st ON st.room_id = r.id
       LEFT JOIN booking_seats bs ON bs.seat_id = s.id
         AND bs.booking_id IN (
           SELECT id FROM bookings
           WHERE showtime_id = @sid
             AND status IN ('pending','confirmed')
         )
       WHERE st.id = @sid
         AND s.is_active = 1
       ORDER BY s.row_label, s.col_number`,
      { sid: { type: sql.Int, value: req.params.showtimeId } }
    );

    console.log('Seats returned:', r.recordset.length);
    res.json({ success: true, data: r.recordset });

  } catch (e) {
    console.error('getByShowtime error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// COMBOS
exports.getAllCombos = async (req, res) => {
  try {
    const r = await db('SELECT * FROM combos WHERE is_active=1 ORDER BY price');
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCombo = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const r = await db(
      'INSERT INTO combos(name,description,price) OUTPUT INSERTED.* VALUES(@n,@d,@p)',
      { n:{type:sql.NVarChar,value:name},d:{type:sql.NVarChar,value:description||null},p:{type:sql.Decimal,value:price} });
    res.status(201).json({ success: true, data: r.recordset[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateCombo = async (req, res) => {
  try {
    const { name, description, price, is_active } = req.body;
    await db('UPDATE combos SET name=@n,description=@d,price=@p,is_active=@a WHERE id=@id',
      { id:{type:sql.Int,value:req.params.id},n:{type:sql.NVarChar,value:name},
        d:{type:sql.NVarChar,value:description||null},p:{type:sql.Decimal,value:price},a:{type:sql.Bit,value:is_active??1} });
    res.json({ success: true, message: 'Cap nhat thanh cong' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteCombo = async (req, res) => {
  try {
    await db('UPDATE combos SET is_active=0 WHERE id=@id', { id:{type:sql.Int,value:req.params.id} });
    res.json({ success: true, message: 'Da an combo' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// CINEMAS
exports.getAll = async (req, res) => {
  try {
    const r = await db('SELECT * FROM cinemas WHERE is_active=1 ORDER BY id');
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const r = await db(
      'SELECT c.*,r.id AS room_id,r.name AS room_name,r.total_seats,r.room_type FROM cinemas c LEFT JOIN rooms r ON r.cinema_id=c.id WHERE c.id=@id',
      { id:{type:sql.Int,value:req.params.id} });
    if (!r.recordset.length) return res.status(404).json({ success: false, message: 'Khong tim thay rap' });
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};