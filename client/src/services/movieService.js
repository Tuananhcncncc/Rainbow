import api from './api'

export const authService = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  me: () => api.get('/auth/me'),
}

export const movieService = {
  getAll: (p) => api.get('/movies', { params: p }),
  getById: (id) => api.get(`/movies/${id}`),
  create: (d) => api.post('/movies', d),
  update: (id, d) => api.put(`/movies/${id}`, d),
  remove: (id) => api.delete(`/movies/${id}`),
  // TMDB
  tmdbSearch: (q) => api.get('/movies/tmdb/search', { params: { q } }),
  tmdbDetail: (tmdbId) => api.get(`/movies/tmdb/detail/${tmdbId}`),
  tmdbNowPlaying: () => api.get('/movies/tmdb/now-playing'),
}

export const showtimeService = {
  getByMovie: (id, date) => api.get(`/showtimes/movie/${id}`, { params: { date } }),
  getByCinema: (id, date) => api.get(`/showtimes/cinema/${id}`, { params: { date } }),
  getById: (id) => api.get(`/showtimes/${id}`),
  create: (d) => api.post('/showtimes', d),
  remove: (id) => api.delete(`/showtimes/${id}`),
}

export const seatService = {
  getByShowtime: (id) => api.get(`/seats/showtime/${id}`),
}

export const comboService = {
  getAll: () => api.get('/combos'),
  create: (d) => api.post('/combos', d),
  update: (id, d) => api.put(`/combos/${id}`, d),
  remove: (id) => api.delete(`/combos/${id}`),
}

export const bookingService = {
  create: (d) => api.post('/bookings', d),
  getMy: () => api.get('/bookings/my'),
  getByCode: (code) => api.get(`/bookings/code/${code}`),
  getAll: (p) => api.get('/bookings', { params: p }),
}

export const paymentService = {
  mockPay: (bookingId) => api.post('/payments/mock', { bookingId }),
}

export const cinemaService = {
  getAll: () => api.get('/cinemas'),
  getById: (id) => api.get(`/cinemas/${id}`),
}

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCustomers: () => api.get('/admin/customers'),
  toggleCustomer: (id) => api.patch(`/admin/customers/${id}/toggle`),
}