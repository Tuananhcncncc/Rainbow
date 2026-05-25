import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { bookingService } from '../../services/movieService'
import { formatCurrency, formatDateShort, formatTime, getStatusLabel, getStatusColor } from '../../utils/format'
import s from './TicketDetailPage.module.css'

export default function TicketDetailPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const ticketUrl = `${window.location.origin}/ticket/${code}`

  useEffect(() => {
    bookingService.getByCode(code)
      .then(r => setTicket(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [code])

  // Nút X: nếu có lịch sử trình duyệt thì back, không thì về trang chủ
  const handleClose = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'linear-gradient(135deg,#0a0a0f,#1a0533)' }}>
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div className={s.page}>
      <div className={s.error}>
        <div>🎭</div>
        <p>Không tìm thấy vé này</p>
        <button onClick={() => navigate('/')} className={s.closeBtn}>Về trang chủ</button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      {/* Nút X góc trên phải */}
      <button className={s.closeBtnFloat} onClick={handleClose} title="Đóng">
        ✕
      </button>

      <div className={s.ticket}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.logoWrap}>
            <div className={s.logoIcon}>R</div>
            <div className={s.logoText}>
              RAINBOW
              <span>CINEMAS</span>
            </div>
          </div>
          <span
            className={s.status}
            style={{
              color: getStatusColor(ticket.status),
              background: `${getStatusColor(ticket.status)}22`
            }}
          >
            {getStatusLabel(ticket.status)}
          </span>
        </div>

        {/* Movie info */}
        <div className={s.movieSection}>
          <img
            src={ticket.poster_url || `https://picsum.photos/seed/1/300/450`}
            alt={ticket.title}
            className={s.poster}
          />
          <div className={s.movieInfo}>
            <h1 className={s.movieTitle}>{ticket.title}</h1>
            <div className={s.infoGrid}>
              <div className={s.infoItem}>
                <span>RẠP CHIẾU</span>
                <b>{ticket.cinema_name}</b>
              </div>
              <div className={s.infoItem}>
                <span>ĐỊA CHỈ</span>
                <b>{ticket.address}</b>
              </div>
              <div className={s.infoItem}>
                <span>PHÒNG</span>
                <b>{ticket.room_name}</b>
              </div>
              <div className={s.infoItem}>
                <span>NGÀY CHIẾU</span>
                <b>{formatDateShort(ticket.show_date)}</b>
              </div>
              <div className={s.infoItem}>
                <span>GIỜ BẮT ĐẦU</span>
                <b>{formatTime(ticket.start_time)}</b>
              </div>
              <div className={s.infoItem}>
                <span>ĐỊNH DẠNG</span>
                <b>{ticket.format} • {ticket.language_type}</b>
              </div>
              <div className={s.infoItem}>
                <span>GHẾ NGỒI</span>
                <b className={s.seats}>{ticket.seats}</b>
              </div>
              <div className={s.infoItem}>
                <span>KHÁCH HÀNG</span>
                <b>{ticket.full_name}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={s.divider}>
          <div className={s.circle} />
          <div className={s.dashes} />
          <div className={s.circle} />
        </div>

        {/* QR + Total */}
        <div className={s.bottom}>
          <div className={s.qrSection}>
            <QRCodeSVG
              value={ticketUrl}
              size={160}
              level="H"
              includeMargin={true}
            />
            <p className={s.qrNote}>Xuất trình QR này tại quầy</p>
          </div>
          <div className={s.codeSection}>
            <div className={s.bookingCode}>{ticket.booking_code}</div>
            <div className={s.totalLabel}>Tổng thanh toán</div>
            <div className={s.totalAmount}>{formatCurrency(ticket.total_amount)}</div>
            <div className={s.purchaseDate}>
              Đặt lúc: {new Date(ticket.created_at).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}