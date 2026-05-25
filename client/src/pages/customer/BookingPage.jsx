import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../../store/bookingStore'
import { useAuthStore } from '../../store/authStore'
import { seatService, showtimeService } from '../../services/movieService'
import { formatCurrency, formatTime } from '../../utils/format'
import socket from '../../socket/socket'
import toast from 'react-hot-toast'
import s from './BookingPage.module.css'

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showtime, setShowtime, selectedSeats, toggleSeat, totalAmount } = useBookingStore()
  const [seats, setSeats] = useState([])
  const [lockedByOthers, setLockedByOthers] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [stInfo, setStInfo] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const stRes = await showtimeService.getById(id)
        const st = stRes.data.data
        setStInfo(st)
        if (!showtime || showtime.id !== Number(id)) setShowtime(st)

        const sRes = await seatService.getByShowtime(id)
        setSeats(sRes.data.data)
      } catch (err) {
        toast.error('Không thể tải dữ liệu')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    init()

    socket.connect()
    socket.emit('join_showtime', Number(id))
    socket.on('locked_seats', (ids) => setLockedByOthers(new Set(ids)))
    socket.on('seat_locked', ({ seatId, userId }) => {
      if (userId !== user?.id) setLockedByOthers(prev => new Set([...prev, seatId]))
    })
    socket.on('seat_released', (seatId) => {
      setLockedByOthers(prev => { const n = new Set(prev); n.delete(seatId); return n })
    })

    return () => {
      socket.off('locked_seats')
      socket.off('seat_locked')
      socket.off('seat_released')
      socket.disconnect()
    }
  }, [id])

  const handleToggle = (seat) => {
    if (seat.status === 'booked') return
    if (lockedByOthers.has(seat.id)) {
      toast.error('Ghế này đang được người khác chọn')
      return
    }
    const isSelected = selectedSeats.find(s => s.id === seat.id)
    if (!isSelected && selectedSeats.length >= 8) {
      toast.error('Tối đa 8 ghế mỗi lần đặt')
      return
    }
    toggleSeat(seat)
    if (!isSelected) {
      socket.emit('lock_seat', { showtimeId: Number(id), seatId: seat.id, userId: user?.id })
    } else {
      socket.emit('release_seat', { showtimeId: Number(id), seatId: seat.id, userId: user?.id })
    }
  }

  // Ghế bị lock bởi người khác → hiện như đã đặt (màu đỏ nhạt)
  // Không cần legend riêng cho "người khác chọn"
  const getSeatClass = (seat) => {
    if (seat.status === 'booked')              return s.booked
    if (lockedByOthers.has(seat.id))          return s.booked  // coi như đã đặt
    if (selectedSeats.find(ss => ss.id === seat.id)) return s.selected
    if (seat.seat_type === 'vip')              return s.vip
    return s.available
  }

  const isDisabled = (seat) =>
    seat.status === 'booked' || lockedByOthers.has(seat.id)

  // Group ghế theo hàng
  const rows = {}
  seats.forEach(seat => {
    const row = String(seat.row_label).trim()
    if (!rows[row]) rows[row] = []
    rows[row].push(seat)
  })
  const sortedRows = Object.entries(rows).sort(([a], [b]) => a.localeCompare(b))

  const info = stInfo || showtime

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className={s.page}>
      <div className={s.main}>
        {/* Screen */}
        <div className={s.screen}>
          <div className={s.screenLine} />
          <span>MÀN HÌNH</span>
        </div>

        {seats.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', color:'#ff4d6d' }}>
            Không có dữ liệu ghế. Vui lòng chạy lại generate-seats.js
          </div>
        )}

        {/* Seat Map */}
        <div className={s.seatMap}>
          {sortedRows.map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className={s.row}>
              <span className={s.rowLabel}>{rowLabel}</span>
              <div className={s.rowSeats}>
                {rowSeats
                  .sort((a, b) => a.col_number - b.col_number)
                  .map(seat => (
                    <button
                      key={seat.id}
                      className={`${s.seat} ${getSeatClass(seat)}`}
                      onClick={() => handleToggle(seat)}
                      disabled={isDisabled(seat)}
                      title={`${seat.seat_code} - ${seat.seat_type === 'vip' ? 'VIP' : 'Thường'}`}
                    >
                      <span className={s.seatCode}>{seat.seat_code}</span>
                    </button>
                  ))}
              </div>
              <span className={s.rowLabel}>{rowLabel}</span>
            </div>
          ))}
        </div>

        {/* Legend — chỉ 4 loại, bỏ "người khác chọn" */}
        <div className={s.legend}>
          <div className={s.legendItem}>
            <div className={`${s.legendBox} ${s.available}`} />
            <span>Còn trống</span>
          </div>
          <div className={s.legendItem}>
            <div className={`${s.legendBox} ${s.vip}`} />
            <span>Ghế VIP</span>
          </div>
          <div className={s.legendItem}>
            <div className={`${s.legendBox} ${s.selected}`} />
            <span>Đang chọn</span>
          </div>
          <div className={s.legendItem}>
            <div className={`${s.legendBox} ${s.booked}`} />
            <span>Đã đặt</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={s.sidebar}>
        <div className={s.infoCard}>
          {info?.poster_url && (
            <img
              src={info.poster_url}
              alt={info.title}
              className={s.moviePoster}
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <div className={s.infoBody}>
            <h3 className={s.movieTitle}>{info?.title}</h3>
            <div className={s.infoRows}>
              <div className={s.infoRow}><span>Rạp</span><b>{info?.cinema_name}</b></div>
              <div className={s.infoRow}><span>Phòng</span><b>{info?.room_name}</b></div>
              <div className={s.infoRow}>
                <span>Ngày</span>
                <b>{info?.show_date ? new Date(info.show_date).toLocaleDateString('vi-VN') : ''}</b>
              </div>
              <div className={s.infoRow}>
                <span>Giờ</span>
                <b>{formatTime(info?.start_time)}</b>
              </div>
              <div className={s.infoRow}>
                <span>Định dạng</span>
                <b>{info?.format} • {info?.language_type}</b>
              </div>
              <div className={s.infoRow}>
                <span>Ghế đã chọn</span>
                <b className={s.selectedSeats}>
                  {selectedSeats.length > 0
                    ? selectedSeats.map(s => s.seat_code).join(', ')
                    : '—'}
                </b>
              </div>
              <div className={s.infoRow}>
                <span>Giá ghế thường</span>
                <b>{formatCurrency(info?.price_regular || 0)}</b>
              </div>
              <div className={s.infoRow}>
                <span>Giá ghế VIP</span>
                <b>{formatCurrency(info?.price_vip || 0)}</b>
              </div>
            </div>
            <div className={s.total}>
              <span>Tổng tiền</span>
              <b>{formatCurrency(totalAmount)}</b>
            </div>
            <button
              className={s.nextBtn}
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/payment')}
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}