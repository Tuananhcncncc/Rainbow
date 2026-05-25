import s from './TrailerModal.module.css'

export default function TrailerModal({ url, title, onClose }) {
  if (!url) return null
  const embedUrl = url.includes('embed') ? url : url.replace('watch?v=', 'embed/')

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.box} onClick={e => e.stopPropagation()}>
        <div className={s.head}>
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className={s.videoWrap}>
          <iframe src={`${embedUrl}?autoplay=1`} title={title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen />
        </div>
      </div>
    </div>
  )
}