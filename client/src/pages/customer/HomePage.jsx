import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { movieService, cinemaService } from '../../services/movieService'
import MovieCard from '../../components/movie/MovieCard'
import TrailerModal from '../../components/movie/TrailerModal'
import s from './HomePage.module.css'

// Banner Slider Component
function BannerSlider({ movies }) {
  const [current, setCurrent] = useState(0)
  const [trailer, setTrailer] = useState(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % movies.length)
    }, 4000)
  }

  useEffect(() => {
    if (movies.length > 1) startTimer()
    return () => clearInterval(timerRef.current)
  }, [movies.length])

  const goTo = (i) => { setCurrent(i); startTimer() }
  const prev = () => { setCurrent(i => (i - 1 + movies.length) % movies.length); startTimer() }
  const next = () => { setCurrent(i => (i + 1) % movies.length); startTimer() }

  if (!movies.length) return null
  const movie = movies[current]

  return (
    <div className={s.banner}>
      {/* Background ảnh */}
      <div className={s.bannerBg}
        style={{ backgroundImage: `url(${movie.poster_url || `https://picsum.photos/seed/${movie.id}/1400/700`})` }} />
      <div className={s.bannerOverlay} />

      {/* Nội dung */}
      <div className={s.bannerContent}>
        <div className={s.bannerLeft}>
          <span className={s.bannerRating}>{movie.rating}</span>
          <h1 className={s.bannerTitle}>{movie.title}</h1>
          <p className={s.bannerMeta}>{movie.genre} &nbsp;•&nbsp; ⏱ {movie.duration} phút</p>
          <p className={s.bannerDesc}>{movie.description?.slice(0, 120)}...</p>
          <div className={s.bannerBtns}>
            <button className={s.bannerBook} onClick={() => navigate(`/movies/${movie.id}`)}>
              🎟 Đặt vé ngay
            </button>
            <button className={s.bannerTrailer} onClick={() => setTrailer(movie)}>
              ▶ Xem Trailer
            </button>
          </div>
        </div>

        <div className={s.bannerRight}>
          <img
            src={movie.poster_url || `https://picsum.photos/seed/${movie.id}/300/450`}
            alt={movie.title}
            className={s.bannerPoster}
          />
        </div>
      </div>

      {/* Nút trái phải */}
      {movies.length > 1 && (
        <>
          <button className={`${s.navBtn} ${s.navLeft}`} onClick={prev}>‹</button>
          <button className={`${s.navBtn} ${s.navRight}`} onClick={next}>›</button>
        </>
      )}

      {/* Dots */}
      <div className={s.dots}>
        {movies.map((_, i) => (
          <button key={i} className={`${s.dot} ${i === current ? s.dotActive : ''}`} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* Progress bar */}
      <div className={s.progressWrap}>
        <div
          className={s.progressBar}
          key={current}
          style={{ animationDuration: '4s' }}
        />
      </div>

      {trailer && <TrailerModal url={trailer.trailer_url} title={trailer.title} onClose={() => setTrailer(null)} />}
    </div>
  )
}

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [tab, setTab] = useState('now')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      movieService.getAll({ status: 'now_showing' }),
      movieService.getAll({ status: 'coming_soon' }),
      cinemaService.getAll(),
    ]).then(([n, c, ci]) => {
      setNowShowing(n.data.data)
      setComingSoon(c.data.data)
      setCinemas(ci.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const movies = (tab === 'now' ? nowShowing : comingSoon)
    .filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {/* Banner Slider */}
      <BannerSlider movies={nowShowing} />

      {/* Cinema chips */}
      <div className={s.cinemaBar}>
        <div className="page-container">
          <div className={s.cinemaChips}>
            <span className={s.cinemaLabel}>📍 Cụm rạp:</span>
            {cinemas.map(c => (
              <span key={c.id} className={s.chip}
                onClick={() => window.location.href = `/schedule`}>
                {c.district}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Movie list */}
      <div className={s.section}>
        <div className="page-container">
          <div className={s.toolbar}>
            <div className={s.tabs}>
              <button className={`${s.tab} ${tab === 'now' ? s.active : ''}`} onClick={() => setTab('now')}>
                🎬 Đang chiếu <span>{nowShowing.length}</span>
              </button>
              <button className={`${s.tab} ${tab === 'soon' ? s.active : ''}`} onClick={() => setTab('soon')}>
                🔜 Sắp chiếu <span>{comingSoon.length}</span>
              </button>
            </div>
            <div className={s.search}>
              <span>🔍</span>
              <input
                placeholder="Tìm phim..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? <div className="spinner" /> :
            movies.length === 0
              ? <div className={s.empty}>Không tìm thấy phim nào</div>
              : <div className={s.grid}>
                  {movies.map(m => (
                    <MovieCard key={m.id} movie={m} canBook={tab === 'now'} />
                  ))}
                </div>
          }
        </div>
      </div>
    </div>
  )
}