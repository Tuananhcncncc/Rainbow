const r = require('express').Router();
const c = require('../controllers/adminController');
const { auth, adminOnly } = require('../middlewares/auth');

r.use(auth, adminOnly);

r.get('/dashboard', c.getDashboard);
r.get('/customers', c.getCustomers);
r.patch('/customers/:id/toggle', c.toggleCustomer);

module.exports = r;