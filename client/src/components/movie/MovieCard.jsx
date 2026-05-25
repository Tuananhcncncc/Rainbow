import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRatingColor } from '../../utils/format'
import TrailerModal from './TrailerModal'
import s from './MovieCard.module.css'

export default function MovieCard({ movie, canBook = true }) {
  const navigate = useNavigate()
  const [trailer, setTrailer] = useState(false)

  return (
    <>
      <div className={s.card}>
        <div className={s.poster} onClick={() => navigate(`/movies/${movie.id}`)}>
          <img src={movie.poster_url || `https://picsum.photos/seed/${movie.id}/300/450`} alt={movie.title} loading="lazy" />
          <div className={s.overlay}>
            <button className={s.trailerBtn} onClick={e => { e.stopPropagation(); setTrailer(true) }}>▶ Trailer</button>
          </div>
          <span className={s.badge} style={{ background: getRatingColor(movie.rating) }}>{movie.rating}</span>
        </div>
        <div className={s.info}>
          <h3 className={s.title} onClick={() => navigate(`/movies/${movie.id}`)}>{movie.title}</h3>
          <p className={s.meta}>{movie.genre}</p>
          <p className={s.meta}>⏱ {movie.duration} phút</p>
          {canBook
            ? <button className={s.bookBtn} onClick={() => navigate(`/movies/${movie.id}`)}>Đặt vé</button>
            : <div className={s.soon}>Sắp chiếu</div>
          }
        </div>
      </div>
      {trailer && <TrailerModal url={movie.trailer_url} title={movie.title} onClose={() => setTrailer(false)} />}
    </>
  )
}