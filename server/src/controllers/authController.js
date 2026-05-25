const jwt = require('jsonwebtoken');
const { db, sql } = require('../config/db');

const sign = (u) => jwt.sign(
  { id: u.id, role: u.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({
        success: false,
        message: 'Vui long dien du thong tin'
      });

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: 'Mat khau phai co it nhat 6 ky tu'
      });

    // Kiem tra email ton tai
    const ex = await db(
      'SELECT id FROM users WHERE email = @e',
      { e: { type: sql.NVarChar, value: email } }
    );
    if (ex.recordset.length)
      return res.status(400).json({
        success: false,
        message: 'Email da duoc su dung'
      });

    // Luu mat khau thang (plain text)
    const r = await db(
      `INSERT INTO users(full_name, email, password, phone, role)
       OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email, INSERTED.role
       VALUES(@n, @e, @p, @ph, 'customer')`,
      {
        n:  { type: sql.NVarChar, value: full_name },
        e:  { type: sql.NVarChar, value: email },
        p:  { type: sql.NVarChar, value: password },
        ph: { type: sql.NVarChar, value: phone || null },
      }
    );

    const user = r.recordset[0];
    res.status(201).json({
      success: true,
      data: { user, token: sign(user) }
    });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: 'Vui long nhap email va mat khau'
      });

    // Tim user theo email
    const r = await db(
      'SELECT * FROM users WHERE email = @e',
      { e: { type: sql.NVarChar, value: email } }
    );
    const user = r.recordset[0];

    if (!user)
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung'
      });

    if (!user.is_active)
      return res.status(403).json({
        success: false,
        message: 'Tai khoan da bi khoa'
      });

    // So sanh mat khau thang (plain text)
    if (user.password !== password)
      return res.status(401).json({
        success: false,
        message: 'Email hoac mat khau khong dung'
      });

    // Xoa password truoc khi tra ve
    const { password: _, ...safe } = user;
    res.json({
      success: true,
      data: { user: safe, token: sign(safe) }
    });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/auth/me
exports.me = (req, res) => {
  res.json({ success: true, data: req.user });
};