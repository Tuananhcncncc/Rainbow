const router = require('express').Router()
const c = require('../controllers/movieController')
const { auth, adminOnly } = require('../middlewares/auth')
const tmdb = require('../services/tmdbService')

// ── Public routes ─────────────────────────────────────────────
router.get('/', c.getAll)
router.get('/:id', c.getById)

// ── Admin routes ──────────────────────────────────────────────
router.post('/', auth, adminOnly, c.create)
router.put('/:id', auth, adminOnly, c.update)
router.delete('/:id', auth, adminOnly, c.remove)

// ── TMDB routes (admin only) ──────────────────────────────────

// Tim phim tren TMDB
// GET /api/movies/tmdb/search?q=avengers
router.get('/tmdb/search', auth, adminOnly, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ success: false, message: 'Thieu tham so q' })

    const results = await tmdb.searchMovies(q)
    res.json({
      success: true,
      data: results.slice(0, 6).map(m => ({
        tmdb_id:     m.id,
        title:       m.title,
        title_en:    m.original_title,
        release_date: m.release_date,
        poster_url:  m.poster_path ? `${tmdb.IMAGE_BASE}/w200${m.poster_path}` : null,
        vote:        m.vote_average,
      }))
    })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
})

// Lay chi tiet 1 phim tu TMDB theo tmdb_id
// GET /api/movies/tmdb/detail/550
router.get('/tmdb/detail/:tmdbId', auth, adminOnly, async (req, res) => {
  try {
    const detail = await tmdb.getMovieDetail(req.params.tmdbId)
    res.json({ success: true, data: detail })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
})

// Lay phim dang chieu tu TMDB (cho admin xem)
// GET /api/movies/tmdb/now-playing
router.get('/tmdb/now-playing', auth, adminOnly, async (req, res) => {
  try {
    const results = await tmdb.getNowPlaying()
    res.json({
      success: true,
      data: results.slice(0, 10).map(m => ({
        tmdb_id:      m.id,
        title:        m.title,
        poster_url:   m.poster_path ? `${tmdb.IMAGE_BASE}/w200${m.poster_path}` : null,
        release_date: m.release_date,
        vote:         m.vote_average,
      }))
    })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
})

module.exports = router