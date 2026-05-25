import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieService, showtimeService } from '../../services/movieService'
import { useBookingStore } from '../../store/bookingStore'
import { useAuthStore } from '../../store/authStore'
import { formatTime, getRatingColor, getNext7Days } from '../../utils/format'
import TrailerModal from '../../components/movie/TrailerModal'
import toast from 'react-hot-toast'
import s from './MovieDetailPage.module.css'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { setShowtime } = useBookingStore()
  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [trailer, setTrailer] = useState(false)
  const days = getNext7Days()

  useEffect(() => {
    movieService.getById(id).then(r => setMovie(r.data.data)).catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (movie?.status === 'now_showing') {
      showtimeService.getByMovie(id, selectedDate).then(r => setShowtimes(r.data.data))
    }
  }, [id, selectedDate, movie])

  const grouped = showtimes.reduce((acc, st) => {
    const key = `${st.cinema_id}-${st.cinema_name}`
    if (!acc[key]) acc[key] = { cinema_name: st.cinema_name, district: st.district, items: [] }
    acc[key].items.push(st)
    return acc
  }, {})

  const handleBook = (st) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt vé')
      navigate('/login', { state: { from: `/movies/${id}` } })
      return
    }
    setShowtime(st)
    navigate(`/booking/${st.id}`)
  }

  if (loading) return <div className="spinner" />
  if (!movie) return null

  return (
    <div className={s.page}>
      {/* Hero backdrop */}
      <div className={s.hero} style={{ backgroundImage: `url(${movie.poster_url || `https://picsum.photos/seed/${movie.id}/1200/600`})` }}>
        <div className={s.heroOverlay} />
        <div className={s.heroContent}>
          <img className={s.poster} src={movie.poster_url || `https://picsum.photos/seed/${movie.id}/300/450`} alt={movie.title} />
          <div className={s.heroInfo}>
            <div className={s.badges}>
              <span className={s.ratingBadge} style={{ background: getRatingColor(movie.rating) }}>{movie.rating}</span>
              <span className={s.formatBadge}>{movie.genre}</span>
            </div>
            <h1 className={s.title}>{movie.title}</h1>
            {movie.title_en && <p className={s.titleEn}>{movie.title_en}</p>}
            <div className={s.meta}>
              <span>⏱ {movie.duration} phút</span>
              <span>🎬 {movie.director}</span>
              <span>📅 {new Date(movie.release_date).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className={s.desc}>{movie.description}</p>
            <div className={s.actions}>
              <button className={s.trailerBtn} onClick={() => setTrailer(true)}>▶ Xem Trailer</button>
              {movie.status === 'now_showing' && (
                <button className={s.bookBtn} onClick={() => {
                  document.getElementById('showtimes-section').scrollIntoView({ behavior: 'smooth' })
                }}>🎟 Đặt vé ngay</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      {movie.status === 'now_showing' && (
        <div className={s.section} id="showtimes-section">
          <div className="page-container">
            <h2 className={s.sectionTitle}>Lịch Chiếu</h2>
            {/* Date picker */}
            <div className={s.datePicker}>
              {days.map(d => (
                <button key={d.value} className={`${s.dateBtn} ${selectedDate === d.value ? s.dateActive : ''}`}
                  onClick={() => setSelectedDate(d.value)}>
                  {d.label}
                </button>
              ))}
            </div>
            {/* Grouped by cinema */}
            {Object.values(grouped).length === 0 ? (
              <div className={s.noShowtime}>Không có suất chiếu ngày này</div>
            ) : Object.values(grouped).map((g, i) => (
              <div key={i} className={s.cinemaGroup}>
                <div className={s.cinemaHeader}>
                  <span className={s.cinemaIcon}>🎭</span>
                  <div>
                    <div className={s.cinemaName}>{g.cinema_name}</div>
                    <div className={s.cinemaDistrict}>📍 {g.district}</div>
                  </div>
                </div>
                <div className={s.timeGrid}>
                  {g.items.map(st => (
                    <button key={st.id} className={s.timeBtn} onClick={() => handleBook(st)}>
                      <span className={s.timeMain}>{formatTime(st.start_time)}</span>
                      <span className={s.timeSub}>{st.format} • {st.language_type}</span>
                      <span className={s.timePrice}>từ {Number(st.price_regular).toLocaleString('vi-VN')}đ</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trailer && <TrailerModal url={movie.trailer_url} title={movie.title} onClose={() => setTrailer(false)} />}
    </div>
  )
}