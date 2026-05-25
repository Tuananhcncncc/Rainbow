const { db, sql } = require('../config/db');

exports.getByMovie = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const r = await db(
      `SELECT st.*,r.name AS room_name,c.id AS cinema_id,c.name AS cinema_name,c.district
       FROM showtimes st
       JOIN rooms r ON r.id=st.room_id
       JOIN cinemas c ON c.id=r.cinema_id
       WHERE st.movie_id=@mid AND st.show_date=@date AND st.status='active'
       ORDER BY c.id,st.start_time`,
      { mid:{type:sql.Int,value:req.params.movieId}, date:{type:sql.Date,value:date} });
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getByCinema = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const r = await db(
      `SELECT st.*,m.title,m.poster_url,m.rating,m.duration,m.genre,r.name AS room_name
       FROM showtimes st
       JOIN movies m ON m.id=st.movie_id
       JOIN rooms r ON r.id=st.room_id
       WHERE r.cinema_id=@cid AND st.show_date=@date AND st.status='active' AND m.status='now_showing'
       ORDER BY m.id,st.start_time`,
      { cid:{type:sql.Int,value:req.params.cinemaId}, date:{type:sql.Date,value:date} });
    res.json({ success: true, data: r.recordset });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const r = await db(
      `SELECT st.*,m.title,m.poster_url,m.rating,m.duration,
              r.name AS room_name,c.name AS cinema_name,c.district,c.address
       FROM showtimes st
       JOIN movies m ON m.id=st.movie_id
       JOIN rooms r ON r.id=st.room_id
       JOIN cinemas c ON c.id=r.cinema_id
       WHERE st.id=@id`,
      { id:{type:sql.Int,value:req.params.id} });
    if (!r.recordset.length) return res.status(404).json({ success: false, message: 'Khong tim thay suat chieu' });
    res.json({ success: true, data: r.recordset[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { movie_id,room_id,show_date,start_time,end_time,format,language_type,price_regular,price_vip } = req.body;
    const r = await db(
      `INSERT INTO showtimes(movie_id,room_id,show_date,start_time,end_time,format,language_type,price_regular,price_vip)
       OUTPUT INSERTED.* VALUES(@mid,@rid,@sd,@st,@et,@fmt,@lang,@pr,@pv)`,
      { mid:{type:sql.Int,value:movie_id},rid:{type:sql.Int,value:room_id},
        sd:{type:sql.Date,value:show_date},st:{type:sql.NVarChar,value:start_time},
        et:{type:sql.NVarChar,value:end_time},fmt:{type:sql.NVarChar,value:format||'2D'},
        lang:{type:sql.NVarChar,value:language_type||'long tieng'},
        pr:{type:sql.Decimal,value:price_regular||75000},pv:{type:sql.Decimal,value:price_vip||100000} });
    res.status(201).json({ success: true, data: r.recordset[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db('DELETE FROM showtimes WHERE id=@id', { id:{type:sql.Int,value:req.params.id} });
    res.json({ success: true, message: 'Da xoa suat chieu' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};