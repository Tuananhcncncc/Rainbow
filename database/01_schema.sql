
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'RainbowCinemas')
    CREATE DATABASE RainbowCinemas COLLATE Vietnamese_CI_AS;
GO
USE RainbowCinemas;
GO

-- Xoa bang cu (con truoc cha)
IF OBJECT_ID('payments','U')       IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('booking_combos','U') IS NOT NULL DROP TABLE booking_combos;
IF OBJECT_ID('booking_seats','U')  IS NOT NULL DROP TABLE booking_seats;
IF OBJECT_ID('bookings','U')       IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('combos','U')         IS NOT NULL DROP TABLE combos;
IF OBJECT_ID('seats','U')          IS NOT NULL DROP TABLE seats;
IF OBJECT_ID('showtimes','U')      IS NOT NULL DROP TABLE showtimes;
IF OBJECT_ID('movies','U')         IS NOT NULL DROP TABLE movies;
IF OBJECT_ID('rooms','U')          IS NOT NULL DROP TABLE rooms;
IF OBJECT_ID('cinemas','U')        IS NOT NULL DROP TABLE cinemas;
IF OBJECT_ID('users','U')          IS NOT NULL DROP TABLE users;
GO

CREATE TABLE users (
    id         INT           NOT NULL IDENTITY(1,1),
    full_name  NVARCHAR(100) NOT NULL,
    email      NVARCHAR(150) NOT NULL,
    password   NVARCHAR(255) NOT NULL,
    phone      NVARCHAR(15)  NULL,
    role       NVARCHAR(10)  NOT NULL DEFAULT 'customer'
               CONSTRAINT CK_users_role CHECK (role IN ('customer','admin')),
    is_active  BIT           NOT NULL DEFAULT 1,
    created_at DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_users       PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email)
);
GO

CREATE TABLE cinemas (
    id        INT           NOT NULL IDENTITY(1,1),
    name      NVARCHAR(150) NOT NULL,
    address   NVARCHAR(300) NOT NULL,
    district  NVARCHAR(100) NOT NULL,
    city      NVARCHAR(100) NOT NULL DEFAULT N'Ha Noi',
    phone     NVARCHAR(15)  NULL,
    is_active BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_cinemas PRIMARY KEY (id)
);
GO

CREATE TABLE rooms (
    id          INT          NOT NULL IDENTITY(1,1),
    cinema_id   INT          NOT NULL,
    name        NVARCHAR(50) NOT NULL,
    total_seats INT          NOT NULL DEFAULT 120,
    room_type   NVARCHAR(10) NOT NULL DEFAULT '2D'
                CONSTRAINT CK_rooms_type CHECK (room_type IN ('2D','3D','IMAX')),
    is_active   BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_rooms        PRIMARY KEY (id),
    CONSTRAINT FK_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
);
GO

CREATE TABLE movies (
    id           INT            NOT NULL IDENTITY(1,1),
    title        NVARCHAR(200)  NOT NULL,
    title_en     NVARCHAR(200)  NULL,
    description  NVARCHAR(MAX)  NULL,
    duration     INT            NOT NULL,
    genre        NVARCHAR(200)  NOT NULL,
    director     NVARCHAR(150)  NULL,
    cast_members NVARCHAR(MAX)  NULL,
    rating       NVARCHAR(5)    NOT NULL DEFAULT 'P'
                 CONSTRAINT CK_movies_rating CHECK (rating IN ('P','K','T13','T16','T18')),
    poster_url   NVARCHAR(500)  NULL,
    trailer_url  NVARCHAR(500)  NULL,
    release_date DATE           NOT NULL,
    end_date     DATE           NULL,
    status       NVARCHAR(20)   NOT NULL DEFAULT 'coming_soon'
                 CONSTRAINT CK_movies_status CHECK (status IN ('coming_soon','now_showing','ended')),
    created_at   DATETIME2      NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME2      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_movies PRIMARY KEY (id)
);
GO
CREATE INDEX IX_movies_status  ON movies(status);
CREATE INDEX IX_movies_release ON movies(release_date);
GO

CREATE TABLE showtimes (
    id            INT           NOT NULL IDENTITY(1,1),
    movie_id      INT           NOT NULL,
    room_id       INT           NOT NULL,
    show_date     DATE          NOT NULL,
    start_time    TIME          NOT NULL,
    end_time      TIME          NOT NULL,
    format        NVARCHAR(10)  NOT NULL DEFAULT '2D'
                  CONSTRAINT CK_st_format CHECK (format IN ('2D','3D','IMAX')),
    language_type NVARCHAR(20)  NOT NULL DEFAULT N'long tieng',
    price_regular DECIMAL(10,0) NOT NULL DEFAULT 75000,
    price_vip     DECIMAL(10,0) NOT NULL DEFAULT 100000,
    status        NVARCHAR(20)  NOT NULL DEFAULT 'active'
                  CONSTRAINT CK_st_status CHECK (status IN ('active','cancelled','finished')),
    created_at    DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_showtimes    PRIMARY KEY (id),
    CONSTRAINT FK_st_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    CONSTRAINT FK_st_room  FOREIGN KEY (room_id)  REFERENCES rooms(id)
);
GO
CREATE INDEX IX_st_date  ON showtimes(show_date);
CREATE INDEX IX_st_movie ON showtimes(movie_id);
GO

CREATE TABLE seats (
    id         INT           NOT NULL IDENTITY(1,1),
    room_id    INT           NOT NULL,
    row_label  NCHAR(2)      NOT NULL,
    col_number INT           NOT NULL,
    seat_code  NVARCHAR(10)  NOT NULL,
    seat_type  NVARCHAR(10)  NOT NULL DEFAULT 'regular'
               CONSTRAINT CK_seats_type CHECK (seat_type IN ('regular','vip')),
    is_active  BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_seats         PRIMARY KEY (id),
    CONSTRAINT FK_seats_room    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT UQ_seat_per_room UNIQUE (room_id, seat_code)
);
GO

CREATE TABLE bookings (
    id           INT           NOT NULL IDENTITY(1,1),
    user_id      INT           NOT NULL,
    showtime_id  INT           NOT NULL,
    booking_code NVARCHAR(30)  NOT NULL,
    total_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'pending'
                 CONSTRAINT CK_book_status CHECK (status IN ('pending','confirmed','cancelled','refunded')),
    created_at   DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_bookings      PRIMARY KEY (id),
    CONSTRAINT UQ_booking_code  UNIQUE (booking_code),
    CONSTRAINT FK_book_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT FK_book_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);
GO
CREATE INDEX IX_book_user     ON bookings(user_id);
CREATE INDEX IX_book_showtime ON bookings(showtime_id);
GO

CREATE TABLE booking_seats (
    id         INT           NOT NULL IDENTITY(1,1),
    booking_id INT           NOT NULL,
    seat_id    INT           NOT NULL,
    price      DECIMAL(10,0) NOT NULL,
    CONSTRAINT PK_booking_seats PRIMARY KEY (id),
    CONSTRAINT FK_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT FK_bs_seat    FOREIGN KEY (seat_id)    REFERENCES seats(id),
    CONSTRAINT UQ_bs         UNIQUE (booking_id, seat_id)
);
GO

CREATE TABLE combos (
    id          INT           NOT NULL IDENTITY(1,1),
    name        NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    price       DECIMAL(10,0) NOT NULL,
    image_url   NVARCHAR(500) NULL,
    is_active   BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_combos PRIMARY KEY (id)
);
GO

CREATE TABLE booking_combos (
    id         INT           NOT NULL IDENTITY(1,1),
    booking_id INT           NOT NULL,
    combo_id   INT           NOT NULL,
    quantity   INT           NOT NULL DEFAULT 1,
    price      DECIMAL(10,0) NOT NULL,
    CONSTRAINT PK_booking_combos PRIMARY KEY (id),
    CONSTRAINT FK_bc_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT FK_bc_combo   FOREIGN KEY (combo_id)   REFERENCES combos(id)
);
GO

CREATE TABLE payments (
    id             INT           NOT NULL IDENTITY(1,1),
    booking_id     INT           NOT NULL,
    amount         DECIMAL(12,0) NOT NULL,
    method         NVARCHAR(10)  NOT NULL DEFAULT 'mock'
                   CONSTRAINT CK_pay_method CHECK (method IN ('mock','vnpay','momo','cash')),
    status         NVARCHAR(10)  NOT NULL DEFAULT 'pending'
                   CONSTRAINT CK_pay_status CHECK (status IN ('pending','success','failed','refunded')),
    transaction_id NVARCHAR(100) NULL,
    paid_at        DATETIME2     NULL,
    created_at     DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_payments    PRIMARY KEY (id),
    CONSTRAINT FK_pay_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
GO
CREATE INDEX IX_pay_booking ON payments(booking_id);
GO

PRINT 'OK: 11 bang da duoc tao thanh cong!';
GO