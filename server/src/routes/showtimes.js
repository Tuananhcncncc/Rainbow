const r = require('express').Router();
const c = require('../controllers/showtimeController');
const { auth, adminOnly } = require('../middlewares/auth');

r.get('/movie/:movieId', c.getByMovie);
r.get('/cinema/:cinemaId', c.getByCinema);
r.get('/:id', c.getById);

r.post('/', auth, adminOnly, c.create);
r.delete('/:id', auth, adminOnly, c.remove);

module.exports = r;