const r = require('express').Router();
const c = require('../controllers/seatComboController');

r.get('/showtime/:showtimeId', c.getByShowtime);

module.exports = r;