const express = require('express');
const router = express.Router();
const { login } = require('./login.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.post('/login', express.json(), login);
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;