const express = require('express');
const router = express.Router();
const { register, login, logout, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/usersController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/', getUsers);
router.get('/:userId', getUserById);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router; 