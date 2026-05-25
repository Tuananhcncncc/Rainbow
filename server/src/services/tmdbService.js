/**
 * TMDB Service
 * Dung de lay thong tin phim tu The Movie Database
 * Dang ky API key tai: https://www.themoviedb.org/settings/api
 */
const https = require('https')
require('dotenv').config()

const TOKEN = process.env.TMDB_TOKEN
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Helper goi API TMDB
const tmdbGet = (path) => new Promise((resolve, reject) => {
  if (!TOKEN) return reject(new Error('TMDB_TOKEN chua duoc cau hinh trong .env'))

  const options = {
    hostname: 'api.themoviedb.org',
    path: `/3${path}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  const req = https.request(options, res => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      try { resolve(JSON.parse(data)) }
      catch (e) { reject(new Error('Khong parse duoc response TMDB')) }
    })
  })
  req.on('error', reject)
  req.end()
})

// Tim phim theo ten
const searchMovies = async (query, language = 'vi-VN') => {
  const encoded = encodeURIComponent(query)
  const data = await tmdbGet(
    `/search/movie?query=${encoded}&language=${language}&page=1&include_adult=false`
  )
  return data.results || []
}

// Lay chi tiet phim theo TMDB ID
const getMovieDetail = async (tmdbId) => {
  const [detail, credits, videos] = await Promise.all([
    tmdbGet(`/movie/${tmdbId}?language=vi-VN`),
    tmdbGet(`/movie/${tmdbId}/credits?language=vi-VN`),
    tmdbGet(`/movie/${tmdbId}/videos?language=vi-VN`),
  ])

  // Lay trailer YouTube
  const trailer = videos.results?.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  )
  const trailerUrl = trailer
    ? `https://www.youtube.com/embed/${trailer.key}`
    : null

  // Dao dien
  const director = credits.crew?.find(c => c.job === 'Director')?.name || null

  // Dien vien (5 nguoi dau)
  const cast = credits.cast?.slice(0, 5).map(c => c.name).join(', ') || null

  // The loai
  const genre = detail.genres?.map(g => g.name).join(', ') || ''

  // Poster va backdrop
  const posterUrl = detail.poster_path
    ? `${IMAGE_BASE}/w500${detail.poster_path}`
    : null

  // Rating -> map sang he thong cua minh
  // TMDB dung adult flag, khong co T13/T16/T18
  // Mac dinh T13, admin tu chinh lai
  const rating = detail.adult ? 'T18' : 'T13'

  return {
    tmdb_id:      detail.id,
    title:        detail.title || detail.original_title,
    title_en:     detail.original_title,
    description:  detail.overview || '',
    duration:     detail.runtime || 90,
    genre,
    director,
    cast_members: cast,
    rating,
    poster_url:   posterUrl,
    trailer_url:  trailerUrl,
    release_date: detail.release_date || new Date().toISOString().split('T')[0],
    tmdb_vote:    detail.vote_average,
  }
}

// Lay danh sach phim dang chieu tai Viet Nam
const getNowPlaying = async () => {
  const data = await tmdbGet('/movie/now_playing?language=vi-VN&region=VN&page=1')
  return data.results || []
}

// Lay danh sach phim sap ra mat
const getUpcoming = async () => {
  const data = await tmdbGet('/movie/upcoming?language=vi-VN&region=VN&page=1')
  return data.results || []
}

module.exports = {
  searchMovies,
  getMovieDetail,
  getNowPlaying,
  getUpcoming,
  IMAGE_BASE,
}