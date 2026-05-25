/**
 * Them tai khoan moi vao database
 * Chay: node create-user.js
 */
const sql = require('mssql');

const config = {
  server: 'localhost\\SQLEXPRESS',
  database: 'RainbowCinemas',
  authentication: {
    type: 'default',
    options: {
      userName: 'rainbow_user',  
      password: 'Rainbow@123',
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ── Sua thong tin tai khoan muon tao ──────────────
const newUser = {
  full_name: 'Nguyen Van B',
  email:     'b@gmail.com',
  password:  'matkhau123',   
  phone:     '0912345678',
  role:      'customer',     // 'admin' hoac 'customer'
};
// ─────────────────────────────────────────────────

async function run() {
  let pool;
  try {
    pool = await sql.connect(config);

    // Kiem tra email da ton tai chua
    const check = await pool.request()
      .input('email', sql.NVarChar, newUser.email)
      .query('SELECT id FROM users WHERE email = @email');

    if (check.recordset.length) {
      console.log('Email da ton tai:', newUser.email);
      return;
    }

    // Insert user moi
    await pool.request()
      .input('full_name', sql.NVarChar, newUser.full_name)
      .input('email',     sql.NVarChar, newUser.email)
      .input('password',  sql.NVarChar, newUser.password)
      .input('phone',     sql.NVarChar, newUser.phone)
      .input('role',      sql.NVarChar, newUser.role)
      .query(`
        INSERT INTO users(full_name, email, password, phone, role)
        VALUES(@full_name, @email, @password, @phone, @role)
      `);

    console.log('Tao tai khoan thanh cong!');
    console.log('Email:    ', newUser.email);
    console.log('Password: ', newUser.password);
    console.log('Role:     ', newUser.role);

  } catch (e) {
    console.error('Loi:', e.message);
  } finally {
    if (pool) await pool.close();
  }
}

run();