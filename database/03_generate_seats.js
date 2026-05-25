/**
 * 03_generate_seats.js
 * Chay: node 03_generate_seats.js
 */
const sql = require('mssql');

// Dung SQL Authentication rainbow_user da tao trong SSMS
const config = {
  server: 'localhost\\SQLEXPRESS',
  database: 'RainbowCinemas',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: 'rainbow_user',
      password: 'Rainbow@123',
    },
  },
};

const layouts = [
  { id:1, name:'P101 Thanh Xuan',    rows:[{r:['A','B','C'],c:12,t:'regular'},{r:['D','E','F'],c:12,t:'vip'},{r:['G','H','I','J'],c:12,t:'regular'}]},
  { id:2, name:'P102 Thanh Xuan',    rows:[{r:['A','B','C'],c:12,t:'regular'},{r:['D','E'],c:12,t:'vip'},{r:['F','G','H'],c:10,t:'regular'}]},
  { id:3, name:'P103 Thanh Xuan 3D', rows:[{r:['A','B'],c:10,t:'regular'},{r:['C','D'],c:10,t:'vip'},{r:['E','F','G'],c:10,t:'regular'}]},
  { id:4, name:'P201 Hoang Mai',     rows:[{r:['A','B','C'],c:12,t:'regular'},{r:['D','E','F'],c:12,t:'vip'},{r:['G','H','I','J'],c:12,t:'regular'}]},
  { id:5, name:'P202 Hoang Mai 3D',  rows:[{r:['A','B'],c:10,t:'regular'},{r:['C','D'],c:10,t:'vip'},{r:['E','F','G'],c:10,t:'regular'}]},
  { id:6, name:'P203 Hoang Mai 3D',  rows:[{r:['A','B'],c:10,t:'regular'},{r:['C','D'],c:10,t:'vip'},{r:['E','F'],c:10,t:'regular'}]},
  { id:7, name:'P301 Dong Da',       rows:[{r:['A','B','C'],c:12,t:'regular'},{r:['D','E','F'],c:12,t:'vip'},{r:['G','H','I','J'],c:12,t:'regular'}]},
  { id:8, name:'P302 Dong Da',       rows:[{r:['A','B','C'],c:12,t:'regular'},{r:['D','E'],c:12,t:'vip'},{r:['F','G','H'],c:10,t:'regular'}]},
  { id:9, name:'P303 Dong Da 3D',    rows:[{r:['A','B'],c:10,t:'regular'},{r:['C','D'],c:10,t:'vip'},{r:['E','F','G'],c:10,t:'regular'}]},
];

async function run() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Ket noi SQL Server thanh cong!\n');

    for (const room of layouts) {
      // Xoa ghe cu
      await pool.request()
        .input('id', sql.Int, room.id)
        .query('DELETE FROM seats WHERE room_id = @id');

      let count = 0;
      for (const g of room.rows) {
        for (const row of g.r) {
          for (let col = 1; col <= g.c; col++) {
            await pool.request()
              .input('room_id',    sql.Int,         room.id)
              .input('row_label',  sql.NChar(2),     row)
              .input('col_number', sql.Int,          col)
              .input('seat_code',  sql.NVarChar(10), `${row}${col}`)
              .input('seat_type',  sql.NVarChar(10), g.t)
              .query(`
                INSERT INTO seats(room_id, row_label, col_number, seat_code, seat_type)
                VALUES(@room_id, @row_label, @col_number, @seat_code, @seat_type)
              `);
            count++;
          }
        }
      }

      // Cap nhat total_seats
      await pool.request()
        .input('c',  sql.Int, count)
        .input('id', sql.Int, room.id)
        .query('UPDATE rooms SET total_seats = @c WHERE id = @id');

      console.log(`  [OK] ${room.name}: ${count} ghe`);
    }

    // Kiem tra ket qua
    const result = await pool.request().query(`
      SELECT r.id, r.name, COUNT(s.id) AS total_seats
      FROM rooms r
      LEFT JOIN seats s ON s.room_id = r.id
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);

    console.log('\nTong ket:');
    result.recordset.forEach(r => {
      console.log(`  Phong ${r.name}: ${r.total_seats} ghe`);
    });

    console.log('\nHoan tat! Da tao ghe cho 9 phong.');

  } catch (e) {
    console.error('Loi:', e.message);
    console.error('Chi tiet:', e);
  } finally {
    if (pool) await pool.close();
  }
}

run();