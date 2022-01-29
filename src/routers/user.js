const express = require('express')
const UsersController = require('../controllers/user');
const auth = require('../middleware/auth');
const router = express.Router();


router.post('/users', UsersController.postUser);

router.post('/users/login', UsersController.loginUser);

router.patch('/users', auth, UsersController.updateUser);

router.get('/users', UsersController.getAllUsers);

router.get('/users/search', auth, UsersController.searchUsers);

router.get('/users/:userId', UsersController.getUser);

router.delete('/users', auth, UsersController.deleteUser);

module.exports = router;