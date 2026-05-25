import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingService } from '../../services/movieService'
import { formatCurrency, formatDateShort, formatTime, getStatusLabel, getStatusColor } from '../../utils/format'
import s from './MyTicketsPage.module.css'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    bookingService.getMy().then(r => setTickets(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  return (
    <div className={s.page}>
      <div className="page-container">
        <h1 className={s.title}>🎟 Vé Của Tôi</h1>
        {tickets.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🎭</div>
            <p>Bạn chưa có vé nào</p>
            <button onClick={() => navigate('/')}>Đặt vé ngay</button>
          </div>
        ) : (
          <div className={s.grid}>
            {tickets.map(t => (
              <div key={t.id} className={s.ticket} onClick={() => navigate(`/ticket/${t.booking_code}`)}>
                <div className={s.ticketLeft}>
                  <img src={t.poster_url || `https://picsum.photos/seed/${t.id}/100/150`} alt={t.title} />
                </div>
                <div className={s.ticketRight}>
                  <div className={s.ticketTitle}>{t.title}</div>
                  <div className={s.ticketMeta}>📍 {t.cinema_name} — {t.room_name}</div>
                  <div className={s.ticketMeta}>📅 {formatDateShort(t.show_date)} • {formatTime(t.start_time)}</div>
                  <div className={s.ticketMeta}>💺 {t.seats}</div>
                  <div className={s.ticketFooter}>
                    <b className={s.amount}>{formatCurrency(t.total_amount)}</b>
                    <span className={s.status} style={{ color: getStatusColor(t.status), background: `${getStatusColor(t.status)}18` }}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>
                  <div className={s.code}>{t.booking_code}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}