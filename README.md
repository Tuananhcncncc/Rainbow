# 🎬 Rainbow Cinemas

Hệ thống đặt vé xem phim trực tuyến — Movies. Moments. Memories.

![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![SQL Server](https://img.shields.io/badge/SQL_Server-MSSQL-CC2927?style=for-the-badge&logo=microsoft-sql-server)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io)
![TMDB](https://img.shields.io/badge/TMDB-API-01b4e4?style=for-the-badge&logo=themoviedatabase)

---

## Tính năng

### Khách hàng
- Xem danh sách phim đang chiếu / sắp chiếu với banner slider tự động
- Xem trailer YouTube ngay trên web (popup)
- Chọn rạp theo quận, chọn suất chiếu theo ngày
- Chọn ghế ngồi **realtime** — ghế người khác đang chọn tự động khoá (Socket.IO)
- Chọn combo bắp nước
- Thanh toán mô phỏng
- Lịch sử đặt vé cá nhân

### Admin
- Dashboard thống kê doanh thu, top phim, lịch chiếu hôm nay
- Quản lý phim — **tích hợp TMDB**: tìm phim, tự động điền poster, trailer, mô tả, đạo diễn
- Quản lý lịch chiếu (tạo / xoá suất chiếu theo rạp và ngày)
- Quản lý đặt vé (xem toàn bộ, tìm kiếm)
- Quản lý khách hàng (khoá / mở tài khoản)

---

## Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | Microsoft SQL Server (MSSQL) |
| Realtime | Socket.IO |
| Auth | JWT (plain text password) |
| State Management | Zustand |
| Routing | React Router v6 |
| QR Code | qrcode.react |
| HTTP Client | Axios |
| API ngoài | TMDB (The Movie Database) |

---

## Cấu trúc thư mục

```txt
rainbow-cinemas/
├── client/                        # Frontend React + Vite
│   └── src/
│       ├── components/
│       │   ├── navbar/            # Navbar dark theme
│       │   ├── movie/             # MovieCard, TrailerModal
│       │   └── booking/           # SeatMap, ComboSelector
│       ├── pages/
│       │   ├── customer/          # Home, MovieDetail, Booking,
│       │   │                      # Payment, MyTickets, TicketDetail...
│       │   └── admin/             # Dashboard, Movies, Showtimes,
│       │                          # Bookings, Customers
│       ├── services/              # Axios API calls
│       ├── store/                 # Zustand
│       ├── socket/                # Socket.IO client
│       └── utils/                 # format tiền, ngày, giờ
│
├── server/                        # Backend Node.js + Express
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       ├── sockets/
│       ├── services/
│       └── config/
│
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_generate_seats.js
│
├── .env.example
├── .gitignore
└── README.md
```


## Sơ đồ Database

```txt
cinemas
└── rooms
    ├── seats
    └── showtimes
        ├── movies
        └── bookings
            ├── users
            ├── booking_seats
            │   └── seats
            ├── booking_combos
            │   └── combos
            └── payments
```

## Hướng dẫn 

### Bước 1 — Clone repo

### Bước 2 — Tạo Database trên SSMS

Mở SSMS 22 → kết nối `localhost\SQLEXPRESS` (Windows Authentication):   
 File → Open → database/01_schema.sql → F5
✅ Thấy: "11 bang da duoc tao thanh cong"
File → Open → database/02_seed.sql → F5
✅ Thấy: "Seed data thanh cong"

### Bước 3 — Tạo SQL Login

Mở New Query trong SSMS, chạy:

```sql
USE master;
CREATE LOGIN rainbow_user WITH PASSWORD = 'Rainbow@123';
GO
USE RainbowCinemas;
CREATE USER rainbow_user FOR LOGIN rainbow_user;
ALTER ROLE db_owner ADD MEMBER rainbow_user;
GO
```

Bật Mixed Mode Authentication:
- Chuột phải server → Properties → Security
- Chọn SQL Server and Windows Authentication mode → OK
- Chuột phải server →Restart

### Bước 4 — Tạo ghế tự động

```bash
cd database
npm install
node 03_generate_seats.js
# ✅ Tạo ~900 ghế cho 9 phòng chiếu
```

### Bước 5 — Cấu hình Server

```bash
cd server
npm install
```

Tạo file `server/.env`:
copy tôi gửi vào file này nhé



### Bước 6 — Cài đặt Client

```bash
cd client
npm install
```

### Bước 7 — Chạy project

Chạy 2 terminal nhé:

ter1:

```bash
cd server
npm run dev
```

ter2:

```bash
cd client
npm run dev
```

---

## Tài khoản mặc định

| Email | Password | Role |
|-------|----------|------|
| admin@rainbowcinemas.vn | admin123 | Admin |
| an@gmail.com | user123 | Khách hàng |
| binh@gmail.com | user123 | Khách hàng |
| chau@gmail.com | user123 | Khách hàng |

---

## Cụm rạp

| Rạp | Địa chỉ | Phòng |
|-----|---------|-------|
| Rainbow Cinemas Thanh Xuân | 58 Nguyễn Trãi | P101, P102, P103 |
| Rainbow Cinemas Hoàng Mai | 222 Lĩnh Nam | P201, P202, P203 |
| Rainbow Cinemas Đống Đa | 191 Bà Triệu | P301, P302, P303 |

---

## Giá vé

| Loại ghế | 2D | 3D |
|----------|----|----|
| Thường | 75.000đ | 90.000đ |
| VIP (hàng D, E, F) | 100.000đ | 120.000đ |

## API Endpoints

### Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

### Movies
GET    /api/movies
GET    /api/movies/:id
POST   /api/movies          (admin)
PUT    /api/movies/:id      (admin)
DELETE /api/movies/:id      (admin)
GET    /api/movies/tmdb/search?q=...     (admin)
GET    /api/movies/tmdb/detail/:tmdbId   (admin)

### Booking flow
GET  /api/showtimes/movie/:movieId
GET  /api/showtimes/cinema/:cinemaId
GET  /api/seats/showtime/:showtimeId
GET  /api/combos
POST /api/bookings
POST /api/payments/mock
GET  /api/bookings/code/:code    (public - QR scan)

### Admin
GET   /api/admin/dashboard
GET   /api/admin/customers
PATCH /api/admin/customers/:id/toggle

---

## Luồng đặt vé
Trang chủ → Chọn phim → Chọn ngày/suất chiếu
→ Chọn ghế (realtime Socket.IO)
→ Chọn combo bắp nước
→ Thanh toán mock (1.5s delay)
→ Thông báo thành công
→ Xem vé QR tại /ticket/:code  
