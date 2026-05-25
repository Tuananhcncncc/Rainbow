const { db, sql } = require('../config/db');

exports.mockPay = async (req, res) => {
  try {
    const { bookingId } = req.body;
    await new Promise(r => setTimeout(r, 1500)); // gia lap delay
    await db("UPDATE bookings SET status='confirmed',updated_at=GETDATE() WHERE id=@id AND user_id=@uid",
      { id:{type:sql.Int,value:bookingId}, uid:{type:sql.Int,value:req.user.id} });
    const bR = await db('SELECT total_amount,booking_code FROM bookings WHERE id=@id',
      { id:{type:sql.Int,value:bookingId} });
    const booking = bR.recordset[0];
    const txId = `MOCK-${Date.now()}`;
    await db("INSERT INTO payments(booking_id,amount,method,status,transaction_id,paid_at) VALUES(@bid,@amt,'mock','success',@tx,GETDATE())",
      { bid:{type:sql.Int,value:bookingId},amt:{type:sql.Decimal,value:booking.total_amount},tx:{type:sql.NVarChar,value:txId} });
    res.json({ success: true, message: 'Thanh toan thanh cong!', data: { transaction_id: txId, booking_code: booking.booking_code } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};