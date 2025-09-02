const express = require('express');
const { register, login, logout, getUserById, updateUserById } = require('../controller/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);

module.exports = router;


