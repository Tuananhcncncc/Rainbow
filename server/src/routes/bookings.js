const r = require('express').Router();
const c = require('../controllers/bookingController');
const { auth, adminOnly } = require('../middlewares/auth');

r.get('/my', auth, c.getMyBookings);
r.get('/code/:code', c.getByCode);

r.get('/', auth, adminOnly, c.getAll);
r.post('/', auth, c.create);

module.exports = r;