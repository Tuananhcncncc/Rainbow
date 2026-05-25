const { db, sql } = require('../config/db');

exports.create = async (req, res) => {
  try {
    const { showtime_id, seat_ids, combos: comboItems } = req.body;
    if (!seat_ids?.length) return res.status(400).json({ success: false, message: 'Chua chon ghe' });

    const stR = await db("SELECT price_regular,price_vip FROM showtimes WHERE id=@id AND status='active'",
      { id:{type:sql.Int,value:showtime_id} });
    if (!stR.recordset.length) return res.status(400).json({ success: false, message: 'Suat chieu khong hop le' });
    const st = stR.recordset[0];

    const idList = seat_ids.join(',');
    const bookedR = await db(
      `SELECT seat_id FROM booking_seats WHERE seat_id IN (${idList})
       AND booking_id IN (SELECT id FROM bookings WHERE showtime_id=@sid AND status IN ('pending','confirmed'))`,
      { sid:{type:sql.Int,value:showtime_id} });
    if (bookedR.recordset.length)
      return res.status(400).json({ success: false, message: 'Mot so ghe da bi dat, vui long chon lai' });

    const seatsR = await db(`SELECT id,seat_type FROM seats WHERE id IN (${idList})`);
    const seats = seatsR.recordset;

    let total = 0;
    for (const s of seats) total += s.seat_type === 'vip' ? Number(st.price_vip) : Number(st.price_regular);
    if (comboItems?.length) for (const c of comboItems) total += c.price * c.quantity;

    const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const suffix = Math.random().toString(36).slice(2,8).toUpperCase();
    const code = `RB-${today}-${suffix}`;

    const bR = await db(
      `INSERT INTO bookings(user_id,showtime_id,booking_code,total_amount,status)
       OUTPUT INSERTED.id VALUES(@uid,@sid,@code,@total,'pending')`,
      { uid:{type:sql.Int,value:req.user.id},sid:{type:sql.Int,value:showtime_id},
        code:{type:sql.NVarChar,value:code},total:{type:sql.Decimal,value:total} });
    const bookingId = bR.recordset[0].id;

    for (const s of seats) {
      const price = s.seat_type === 'vip' ? st.price_vip : st.price_regular;
      await db('INSERT INTO booking_seats(booking_id,seat_id,price) VALUES(@bid,@sid,@price)',
        { bid:{type:sql.Int,value:bookingId},sid:{type:sql.Int,value:s.id},price:{type:sql.Decimal,value:price} });
    }

    if (comboItems?.length) {
      for (const c of comboItems) {
        await db('INSERT INTO booking_combos(booking_id,combo_id,quantity,price) VALUES(@bid,@cid,@qty,@price)',
          { bid:{type:sql.Int,value:bookingId},cid:{type:sql.Int,value:c.id},
            qty:{type:sql.Int,value:c.quantity},price:{type:sql.Decimal,value:c.price} });
      }
    }

    res.status(201).json({ success: true, data: { bookingId, booking_code: code, totalAmount: total } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getMyBookings = async (req, res) => {
  try {
    const r = await db(
      `SELECT b.id,b.booking_code,b.total_amount,b.status,b.created_at,
              m.title,m.poster_url,m.rating,
              st.show_date,st.start_time,st.format,st.language_type,
              c.name AS cinema_name,c.district,r.name AS room_name,
              STRING_AGG(s.seat_code,', ') WITHIN GROUP (ORDER BY s.seat_code) AS seats
       FROM bookings b
       JOIN showtimes st ON st.id=b.showtime_id
       JOIN movies m ON m.id=st.movie_id
       JOIN rooms r ON r.id=st.room_id
       JOIN cinemas c ON c.id=r.cinema_id
       LEFT JOIN booking_seats bs ON bs.booking_id=b.id
       LEFT JOIN seats s ON s.id=bs.seat_id
       WHERE b.user_id=@uid
       GROUP BY b.id,b.booking_code,b.total_amount,b.status,b.created_at,
                m.title,m.poster_url,m.rating,st.show_date,st.start_time,
                st.format,st.language_type,c.name,c.district,r.name
       ORDER BY b.created_at DESC`,
      { uid:{type:sql.Int,value:req.user.id} });
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getByCode = async (req, res) => {
  try {
    const r = await db(
      `SELECT b.id,b.booking_code,b.total_amount,b.status,b.created_at,
              u.full_name,u.email,u.phone,
              m.title,m.poster_url,m.rating,m.duration,
              st.show_date,st.start_time,st.end_time,st.format,st.language_type,
              c.name AS cinema_name,c.district,c.address,r.name AS room_name,
              STRING_AGG(s.seat_code,', ') WITHIN GROUP (ORDER BY s.seat_code) AS seats
       FROM bookings b
       JOIN users u ON u.id=b.user_id
       JOIN showtimes st ON st.id=b.showtime_id
       JOIN movies m ON m.id=st.movie_id
       JOIN rooms r ON r.id=st.room_id
       JOIN cinemas c ON c.id=r.cinema_id
       LEFT JOIN booking_seats bs ON bs.booking_id=b.id
       LEFT JOIN seats s ON s.id=bs.seat_id
       WHERE b.booking_code=@code
       GROUP BY b.id,b.booking_code,b.total_amount,b.status,b.created_at,
                u.full_name,u.email,u.phone,m.title,m.poster_url,m.rating,m.duration,
                st.show_date,st.start_time,st.end_time,st.format,st.language_type,
                c.name,c.district,c.address,r.name`,
      { code:{type:sql.NVarChar,value:req.params.code} });
    if (!r.recordset.length) return res.status(404).json({ success: false, message: 'Khong tim thay ve' });
    res.json({ success: true, data: r.recordset[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const { status, date } = req.query;
    let q = `SELECT b.id,b.booking_code,b.total_amount,b.status,b.created_at,
                    u.full_name,u.email,m.title,st.show_date,st.start_time,c.district
             FROM bookings b
             JOIN users u ON u.id=b.user_id
             JOIN showtimes st ON st.id=b.showtime_id
             JOIN movies m ON m.id=st.movie_id
             JOIN rooms r ON r.id=st.room_id
             JOIN cinemas c ON c.id=r.cinema_id WHERE 1=1`;
    const p = {};
    if (status) { q+=' AND b.status=@s'; p.s={type:sql.NVarChar,value:status}; }
    if (date)   { q+=' AND CAST(b.created_at AS DATE)=@d'; p.d={type:sql.Date,value:date}; }
    q+=' ORDER BY b.created_at DESC';
    const r = await db(q, p);
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};