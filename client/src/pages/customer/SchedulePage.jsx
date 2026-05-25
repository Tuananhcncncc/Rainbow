import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cinemaService, showtimeService } from '../../services/movieService'
import { useBookingStore } from '../../store/bookingStore'
import { useAuthStore } from '../../store/authStore'
import { formatTime, getNext7Days } from '../../utils/format'
import toast from 'react-hot-toast'
import s from './SchedulePage.module.css'

export default function SchedulePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { setShowtime } = useBookingStore()
  const [cinemas, setCinemas] = useState([])
  const [selectedCinema, setSelectedCinema] = useState(location.state?.cinemaId || null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(false)
  const days = getNext7Days()

  useEffect(() => {
    cinemaService.getAll().then(r => {
      setCinemas(r.data.data)
      if (!selectedCinema && r.data.data.length) setSelectedCinema(r.data.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedCinema) return
    setLoading(true)
    showtimeService.getByCinema(selectedCinema, selectedDate)
      .then(r => setShowtimes(r.data.data))
      .finally(() => setLoading(false))
  }, [selectedCinema, selectedDate])

  const grouped = showtimes.reduce((acc, st) => {
    if (!acc[st.title]) acc[st.title] = { ...st, items: [] }
    acc[st.title].items.push(st)
    return acc
  }, {})

  const handleBook = (st) => {
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập'); navigate('/login'); return }
    setShowtime(st)
    navigate(`/booking/${st.id}`)
  }

  return (
    <div className={s.page}>
      <div className="page-container">
        <h1 className={s.title}>Lịch Chiếu</h1>

        {/* Cinema selector */}
        <div className={s.cinemaSelector}>
          {cinemas.map(c => (
            <button key={c.id} className={`${s.cinemaTab} ${selectedCinema === c.id ? s.active : ''}`}
              onClick={() => setSelectedCinema(c.id)}>
              🎭 {c.district}
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Date selector */}
        <div className={s.datePicker}>
          {days.map(d => (
            <button key={d.value} className={`${s.dateBtn} ${selectedDate === d.value ? s.dateActive : ''}`}
              onClick={() => setSelectedDate(d.value)}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Showtimes */}
        {loading ? <div className="spinner" /> : Object.values(grouped).length === 0 ? (
          <div className={s.empty}>Không có lịch chiếu ngày này</div>
        ) : Object.values(grouped).map((g, i) => (
          <div key={i} className={s.movieRow}>
            <div className={s.movieLeft}>
              <img src={g.poster_url || `https://picsum.photos/seed/${i}/80/120`} alt={g.title} />
              <div>
                <div className={s.movieTitle}>{g.title}</div>
                <div className={s.movieMeta}>{g.genre} • {g.duration} phút</div>
                <span className={s.ratingTag}>{g.rating}</span>
              </div>
            </div>
            <div className={s.showtimeGroup}>
              {['2D','3D'].map(fmt => {
                const items = g.items.filter(st => st.format === fmt)
                if (!items.length) return null
                return (
                  <div key={fmt} className={s.fmtGroup}>
                    <span className={s.fmtLabel}>{fmt}</span>
                    <div className={s.times}>
                      {items.map(st => (
                        <button key={st.id} className={s.timeBtn} onClick={() => handleBook(st)}>
                          <b>{formatTime(st.start_time)}</b>
                          <span>{st.language_type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}