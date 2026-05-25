const r = require('express').Router();
const c = require('../controllers/seatComboController');

r.get('/', c.getAll);
r.get('/:id', c.getById);

module.exports = r;