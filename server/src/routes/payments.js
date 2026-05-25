const r = require('express').Router();
const { auth } = require('../middlewares/auth');
const { mockPay } = require('../controllers/paymentController');

r.post('/mock', auth, mockPay);

module.exports = r;