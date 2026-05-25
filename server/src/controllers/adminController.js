const { db, sql } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const [todayR,chartR,topR,recentR,schedR] = await Promise.all([
      db(`SELECT COUNT(DISTINCT b.id) AS total_bookings,ISNULL(SUM(p.amount),0) AS revenue,
                 COUNT(DISTINCT CASE WHEN b.status='cancelled' THEN b.id END) AS cancelled
          FROM bookings b LEFT JOIN payments p ON p.booking_id=b.id AND p.status='success'
          WHERE CAST(b.created_at AS DATE)=CAST(GETDATE() AS DATE)`),
      db(`SELECT CAST(b.created_at AS DATE) AS day,ISNULL(SUM(p.amount),0) AS revenue
          FROM bookings b LEFT JOIN payments p ON p.booking_id=b.id AND p.status='success'
          WHERE b.created_at>=DATEADD(DAY,-6,CAST(GETDATE() AS DATE))
          GROUP BY CAST(b.created_at AS DATE) ORDER BY day`),
      db(`SELECT TOP 5 m.title,m.genre,COUNT(bs.id) AS tickets,ISNULL(SUM(bs.price),0) AS revenue
          FROM movies m JOIN showtimes st ON st.movie_id=m.id
          JOIN bookings b ON b.showtime_id=st.id AND b.status='confirmed'
          JOIN booking_seats bs ON bs.booking_id=b.id
          GROUP BY m.id,m.title,m.genre ORDER BY revenue DESC`),
      db(`SELECT TOP 8 b.booking_code,b.status,b.total_amount,b.created_at,u.full_name,m.title
          FROM bookings b JOIN users u ON u.id=b.user_id
          JOIN showtimes st ON st.id=b.showtime_id JOIN movies m ON m.id=st.movie_id
          ORDER BY b.created_at DESC`),
      db(`SELECT st.start_time,m.title,r.name AS room_name,c.district,r.total_seats,
                 (SELECT COUNT(*) FROM booking_seats bs2 JOIN bookings b2 ON b2.id=bs2.booking_id
                  WHERE b2.showtime_id=st.id AND b2.status IN ('pending','confirmed')) AS booked
          FROM showtimes st JOIN movies m ON m.id=st.movie_id
          JOIN rooms r ON r.id=st.room_id JOIN cinemas c ON c.id=r.cinema_id
          WHERE st.show_date=CAST(GETDATE() AS DATE) AND st.status='active'
          ORDER BY st.start_time`),
    ]);
    res.json({ success:true, data:{
      today:todayR.recordset[0], chart:chartR.recordset,
      topMovies:topR.recordset, recent:recentR.recordset, schedule:schedR.recordset
    }});
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getCustomers = async (req, res) => {
  try {
    const r = await db(
      `SELECT u.id,u.full_name,u.email,u.phone,u.is_active,u.created_at,
              COUNT(b.id) AS total_bookings,ISNULL(SUM(b.total_amount),0) AS total_spent
       FROM users u LEFT JOIN bookings b ON b.user_id=u.id AND b.status='confirmed'
       WHERE u.role='customer'
       GROUP BY u.id,u.full_name,u.email,u.phone,u.is_active,u.created_at
       ORDER BY u.created_at DESC`);
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.toggleCustomer = async (req, res) => {
  try {
    await db("UPDATE users SET is_active=CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=@id AND role='customer'",
      { id:{type:sql.Int,value:req.params.id} });
    res.json({ success: true, message: 'Cap nhat trang thai thanh cong' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};