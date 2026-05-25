const sql = require('mssql');
require('dotenv').config();

const cfg = {
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_NAME || 'RainbowCinemas',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'rainbow_user',
      password: process.env.DB_PASS || 'Rainbow@123',
    },
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(cfg);
    console.log('Ket noi SQL Server thanh cong!');
  }
  return pool;
};

const db = async (q, params = {}) => {
  const p = await getPool();
  const r = p.request();
  for (const [k, { type, value }] of Object.entries(params))
    r.input(k, type, value);
  return r.query(q);
};

module.exports = { sql, getPool, db };