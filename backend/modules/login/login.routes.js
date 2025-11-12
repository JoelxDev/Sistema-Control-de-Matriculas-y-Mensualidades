const express = require('express');
const router = express.Router();
const { login, logout, verify } = require('./login.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.post('/login', express.json(), login);
router.post('/logout', logout);
router.get('/verify', requireAuth, verify);
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;