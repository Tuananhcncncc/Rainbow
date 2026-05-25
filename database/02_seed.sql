
USE RainbowCinemas;
GO

SET IDENTITY_INSERT users ON;
INSERT INTO users (id, full_name, email, password, phone, role) VALUES
(1, N'Admin Rainbow',  'admin@rainbowcinemas.vn', 'admin123',    '0901234567', 'admin'),
(2, N'Nguyen Van An',  'an@gmail.com',             'user123',     '0912345678', 'customer'),
(3, N'Tran Thi Binh',  'binh@gmail.com',            'user123',     '0923456789', 'customer'),
(4, N'Le Minh Chau',   'chau@gmail.com',            'user123',     '0934567890', 'customer');
SET IDENTITY_INSERT users OFF;
GO

SET IDENTITY_INSERT cinemas ON;
INSERT INTO cinemas (id, name, address, district) VALUES
(1, N'Rainbow Cinemas Thanh Xuan', N'Tang 4, TTTM Hapro, 58 Nguyen Trai', N'Thanh Xuan'),
(2, N'Rainbow Cinemas Hoang Mai',  N'Tang 3, TTTM Big C, 222 Linh Nam',   N'Hoang Mai'),
(3, N'Rainbow Cinemas Dong Da',    N'Tang 5, Vincom, 191 Ba Trieu',        N'Dong Da');
SET IDENTITY_INSERT cinemas OFF;
GO

SET IDENTITY_INSERT rooms ON;
INSERT INTO rooms (id, cinema_id, name, total_seats, room_type) VALUES
(1,1,N'P101',120,'2D'),(2,1,N'P102',100,'2D'),(3,1,N'P103',80,'3D'),
(4,2,N'P201',120,'2D'),(5,2,N'P202',80,'3D'),(6,2,N'P203',60,'3D'),
(7,3,N'P301',120,'2D'),(8,3,N'P302',100,'2D'),(9,3,N'P303',80,'3D');
SET IDENTITY_INSERT rooms OFF;
GO

SET IDENTITY_INSERT movies ON;
INSERT INTO movies
  (id,title,title_en,description,duration,genre,director,rating,
   poster_url,trailer_url,release_date,end_date,status)
VALUES
(1,
 N'Dia Dao: Mat Troi Trong Bong Toi','Tunnel Warfare',
 N'Bo phim lich su hanh dong tai hien cuoc chien trong long dia dao Cu Chi.',
 100,N'Lich su, Hanh dong',N'Bui Thac Chuyen','T13',
 'https://picsum.photos/seed/m1/300/450',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 '2025-04-04','2025-05-30','now_showing'),
(2,
 N'Quat Mo Trung Ma','Exhuma',
 N'Thay phap va nha khao co dieu tra vu khai quat mo bi an.',
 134,N'Kinh di, Huyen bi',N'Jang Jae-hyun','T18',
 'https://picsum.photos/seed/m2/300/450',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 '2025-03-28','2025-05-20','now_showing'),
(3,
 N'Co Gai Nam Ay','The Girl from the Past',
 N'Hanh trinh tim lai ky uc cua mot co gai mat tri nho.',
 110,N'Tam ly, Tinh cam',N'Nguyen Quang Dung','T13',
 'https://picsum.photos/seed/m3/300/450',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 '2025-04-11','2025-05-25','now_showing'),
(4,
 N'Lat Mat 8','Lat Mat 8',
 N'Phan 8 cua series phim hai hanh dong dinh dam nhat Viet Nam.',
 120,N'Hai, Hanh dong',N'Ly Hai','T16',
 'https://picsum.photos/seed/m4/300/450',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 '2025-04-25','2025-06-01','now_showing'),
(5,
 N'Avengers: Doomsday','Avengers: Doomsday',
 N'Cuoc chien cuoi cung cua cac sieu anh hung Marvel.',
 150,N'Hanh dong, Vien tuong',N'Russo Brothers','T13',
 'https://picsum.photos/seed/m5/300/450',
 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 '2025-06-01',NULL,'coming_soon');
SET IDENTITY_INSERT movies OFF;
GO

SET IDENTITY_INSERT showtimes ON;
INSERT INTO showtimes
  (id,movie_id,room_id,show_date,start_time,end_time,
   format,language_type,price_regular,price_vip)
VALUES
(1,1,1,CAST(GETDATE() AS DATE),'10:00','11:40','2D',N'long tieng',75000,100000),
(2,1,1,CAST(GETDATE() AS DATE),'12:45','14:25','2D',N'long tieng',75000,100000),
(3,1,1,CAST(GETDATE() AS DATE),'15:00','16:40','2D',N'long tieng',75000,100000),
(4,1,1,CAST(GETDATE() AS DATE),'18:30','20:10','2D',N'long tieng',85000,110000),
(5,1,1,CAST(GETDATE() AS DATE),'20:30','22:10','2D',N'long tieng',85000,110000),
(6,1,3,CAST(GETDATE() AS DATE),'10:50','12:30','3D',N'long tieng',90000,120000),
(7,1,3,CAST(GETDATE() AS DATE),'14:00','15:40','3D',N'long tieng',90000,120000),
(8,2,2,CAST(GETDATE() AS DATE),'11:00','13:14','2D',N'phu de',70000,95000),
(9,2,2,CAST(GETDATE() AS DATE),'15:30','17:44','2D',N'phu de',70000,95000),
(10,2,2,CAST(GETDATE() AS DATE),'19:00','21:14','2D',N'phu de',80000,105000),
(11,3,4,CAST(GETDATE() AS DATE),'10:00','11:50','2D',N'long tieng',65000,90000),
(12,3,4,CAST(GETDATE() AS DATE),'13:30','15:20','2D',N'long tieng',65000,90000),
(13,3,4,CAST(GETDATE() AS DATE),'17:00','18:50','2D',N'long tieng',75000,100000),
(14,4,7,CAST(GETDATE() AS DATE),'10:00','12:00','2D',N'long tieng',75000,100000),
(15,4,7,CAST(GETDATE() AS DATE),'14:00','16:00','2D',N'long tieng',75000,100000),
(16,4,7,CAST(GETDATE() AS DATE),'19:30','21:30','2D',N'long tieng',85000,110000),
(17,4,5,CAST(GETDATE() AS DATE),'11:00','13:00','3D',N'long tieng',90000,120000),
(18,4,5,CAST(GETDATE() AS DATE),'16:00','18:00','3D',N'long tieng',90000,120000);
SET IDENTITY_INSERT showtimes OFF;
GO

SET IDENTITY_INSERT combos ON;
INSERT INTO combos (id, name, description, price) VALUES
(1,N'Combo Don',     N'1 Bap vua (45oz) + 1 Pepsi (22oz)',                       79000),
(2,N'Combo Doi',     N'2 Bap vua (45oz) + 2 Pepsi (22oz)',                       149000),
(3,N'Combo Gia Dinh',N'2 Bap lon (69oz) + 4 Pepsi (22oz) + 2 Snack Oishi',      245000),
(4,N'Combo Sweet',   N'1 Bap lon (69oz) + 2 Pepsi (22oz)',                       129000),
(5,N'Snack va Nuoc', N'1 Snack Oishi (80g) + 1 Pepsi (22oz)',                     49000);
SET IDENTITY_INSERT combos OFF;
GO

PRINT 'OK: Seed data thanh cong!';
PRINT 'Tai khoan admin: admin@rainbowcinemas.vn / admin123';
PRINT 'Tai khoan user:  an@gmail.com / user123';
GO