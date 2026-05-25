const { db, sql } = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query
    let q = `SELECT id, title, title_en, duration, genre, director,
                    rating, poster_url, trailer_url,
                    release_date, end_date, status, tmdb_id
             FROM movies WHERE 1=1`
    const p = {}
    if (status) { q += ' AND status=@s'; p.s = { type: sql.NVarChar, value: status } }
    if (search) { q += ' AND title LIKE @q'; p.q = { type: sql.NVarChar, value: `%${search}%` } }
    q += ' ORDER BY release_date DESC'
    const r = await db(q, p)
    res.json({ success: true, data: r.recordset })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.getById = async (req, res) => {
  try {
    const r = await db(
      'SELECT * FROM movies WHERE id=@id',
      { id: { type: sql.Int, value: req.params.id } }
    )
    if (!r.recordset.length)
      return res.status(404).json({ success: false, message: 'Khong tim thay phim' })
    res.json({ success: true, data: r.recordset[0] })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.create = async (req, res) => {
  try {
    const {
      title, title_en, description, duration, genre,
      director, cast_members, rating, poster_url,
      trailer_url, release_date, end_date, status,
      tmdb_id  // <- them truong moi
    } = req.body

    const r = await db(
      `INSERT INTO movies(
         title, title_en, description, duration, genre,
         director, cast_members, rating, poster_url,
         trailer_url, release_date, end_date, status, tmdb_id
       )
       OUTPUT INSERTED.*
       VALUES(
         @title, @te, @desc, @dur, @genre,
         @dir, @cast, @rat, @pos,
         @tra, @rel, @end, @sta, @tmdb
       )`,
      {
        title: { type: sql.NVarChar, value: title },
        te:    { type: sql.NVarChar, value: title_en || null },
        desc:  { type: sql.NVarChar, value: description || null },
        dur:   { type: sql.Int,      value: duration },
        genre: { type: sql.NVarChar, value: genre },
        dir:   { type: sql.NVarChar, value: director || null },
        cast:  { type: sql.NVarChar, value: cast_members || null },
        rat:   { type: sql.NVarChar, value: rating || 'P' },
        pos:   { type: sql.NVarChar, value: poster_url || null },
        tra:   { type: sql.NVarChar, value: trailer_url || null },
        rel:   { type: sql.Date,     value: release_date },
        end:   { type: sql.Date,     value: end_date || null },
        sta:   { type: sql.NVarChar, value: status || 'coming_soon' },
        tmdb:  { type: sql.Int,      value: tmdb_id || null },
      }
    )
    res.status(201).json({ success: true, data: r.recordset[0] })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.update = async (req, res) => {
  try {
    const fields = [
      'title', 'title_en', 'description', 'duration', 'genre',
      'director', 'cast_members', 'rating', 'poster_url',
      'trailer_url', 'release_date', 'end_date', 'status', 'tmdb_id'
    ]
    const upd = fields.filter(f => req.body[f] !== undefined)
    if (!upd.length)
      return res.status(400).json({ success: false, message: 'Khong co du lieu' })

    const setStr = upd.map(f => `${f}=@${f}`).join(',')
    const p = { id: { type: sql.Int, value: req.params.id } }
    upd.forEach(f => {
      const val = req.body[f]
      p[f] = f === 'duration' || f === 'tmdb_id'
        ? { type: sql.Int,      value: val }
        : { type: sql.NVarChar, value: val }
    })

    await db(
      `UPDATE movies SET ${setStr}, updated_at=GETDATE() WHERE id=@id`,
      p
    )
    res.json({ success: true, message: 'Cap nhat thanh cong' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.remove = async (req, res) => {
  try {
    await db(
      'DELETE FROM movies WHERE id=@id',
      { id: { type: sql.Int, value: req.params.id } }
    )
    res.json({ success: true, message: 'Da xoa phim' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}