const jwt = require('jsonwebtoken');
const { db, sql } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Chua dang nhap' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const r = await db('SELECT id,full_name,email,role,is_active FROM users WHERE id=@id',
      { id: { type: sql.Int, value: decoded.id } });
    if (!r.recordset[0]?.is_active)
      return res.status(401).json({ success: false, message: 'Tai khoan khong hop le' });
    req.user = r.recordset[0];
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token khong hop le' });
  }
};

const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next()
    : res.status(403).json({ success: false, message: 'Khong co quyen' });

module.exports = { auth, adminOnly };