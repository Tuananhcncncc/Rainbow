const r = require('express').Router();
const c = require('../controllers/seatComboController');
const { auth, adminOnly } = require('../middlewares/auth');

r.get('/', c.getAllCombos);

r.post('/', auth, adminOnly, c.createCombo);
r.put('/:id', auth, adminOnly, c.updateCombo);
r.delete('/:id', auth, adminOnly, c.deleteCombo);

module.exports = r;