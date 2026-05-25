import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '../../store/bookingStore'
import { comboService, bookingService, paymentService } from '../../services/movieService'
import { formatCurrency, formatTime } from '../../utils/format'
import toast from 'react-hot-toast'
import s from './PaymentPage.module.css'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { showtime, selectedSeats, selectedCombos, totalAmount, setCombo, clear } = useBookingStore()
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!showtime || !selectedSeats.length) { navigate('/'); return }
    comboService.getAll().then(r => setCombos(r.data.data))
  }, [])

  const handlePay = async () => {
    setLoading(true)
    try {
      // 1. Tạo booking
      const bRes = await bookingService.create({
        showtime_id: showtime.id,
        seat_ids: selectedSeats.map(s => s.id),
        combos: selectedCombos.map(c => ({ id: c.id, quantity: c.quantity, price: c.price })),
      })
      const { bookingId } = bRes.data.data

      // 2. Thanh toán mock
      toast.loading('Đang xử lý thanh toán...', { id: 'pay' })
      const pRes = await paymentService.mockPay(bookingId)
      toast.success('Thanh toán thành công!', { id: 'pay' })

      clear()
      navigate('/payment/success', { state: { booking_code: pRes.data.data.booking_code } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại', { id: 'pay' })
    } finally {
      setLoading(false)
    }
  }

  if (!showtime) return null

  return (
    <div className={s.page}>
      <div className="page-container">
        <h1 className={s.pageTitle}>Xác Nhận Đặt Vé</h1>
        <div className={s.layout}>
          {/* Left: Combo */}
          <div className={s.left}>
            <div className={s.card}>
              <h2 className={s.cardTitle}>🍿 Thêm Combo</h2>
              <div className={s.comboList}>
                {combos.map(combo => {
                  const sel = selectedCombos.find(c => c.id === combo.id)
                  const qty = sel?.quantity || 0
                  return (
                    <div key={combo.id} className={s.comboItem}>
                      <div className={s.comboInfo}>
                        <div className={s.comboName}>{combo.name}</div>
                        <div className={s.comboDesc}>{combo.description}</div>
                        <div className={s.comboPrice}>{formatCurrency(combo.price)}</div>
                      </div>
                      <div className={s.qtyControl}>
                        <button onClick={() => setCombo(combo, Math.max(0, qty - 1))}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => setCombo(combo, qty + 1)}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className={s.right}>
            <div className={s.card}>
              <h2 className={s.cardTitle}>📋 Thông Tin Đặt Vé</h2>
              <div className={s.summaryRows}>
                <div className={s.row}><span>Phim</span><b>{showtime.title}</b></div>
                <div className={s.row}><span>Rạp</span><b>{showtime.cinema_name}</b></div>
                <div className={s.row}><span>Phòng</span><b>{showtime.room_name}</b></div>
                <div className={s.row}><span>Ngày chiếu</span><b>{new Date(showtime.show_date).toLocaleDateString('vi-VN')}</b></div>
                <div className={s.row}><span>Giờ chiếu</span><b>{formatTime(showtime.start_time)}</b></div>
                <div className={s.row}><span>Định dạng</span><b>{showtime.format} • {showtime.language_type}</b></div>
                <div className={s.row}><span>Ghế ngồi</span><b className={s.seats}>{selectedSeats.map(s => s.seat_code).join(', ')}</b></div>
                <div className={s.row}><span>Loại ghế</span>
                  <b>{selectedSeats.filter(s => s.seat_type === 'vip').length > 0
                    ? `${selectedSeats.filter(s => s.seat_type === 'vip').length} VIP, ${selectedSeats.filter(s => s.seat_type === 'regular').length} Thường`
                    : 'Thường'}</b>
                </div>
              </div>

              {selectedCombos.length > 0 && (
                <div className={s.combosummary}>
                  <div className={s.comboSumTitle}>Combo đã chọn:</div>
                  {selectedCombos.map(c => (
                    <div key={c.id} className={s.comboSumRow}>
                      <span>{c.name} x{c.quantity}</span>
                      <span>{formatCurrency(c.price * c.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={s.totalBox}>
                <span>Tổng cộng</span>
                <b>{formatCurrency(totalAmount)}</b>
              </div>

              <div className={s.payNote}>
                🔒 Thanh toán an toàn — Mô phỏng
              </div>

              <button className={s.payBtn} onClick={handlePay} disabled={loading}>
                {loading ? '⏳ Đang xử lý...' : `💳 Thanh toán ${formatCurrency(totalAmount)}`}
              </button>
              <button className={s.backBtn} onClick={() => navigate(-1)}>← Quay lại chọn ghế</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}