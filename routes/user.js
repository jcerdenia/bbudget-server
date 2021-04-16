const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Primary Routes

router.post('/register', (req, res) => {
	UserController
	.register(req.body)
	.then((result) => res.send(result));
});

router.post('/email-exists', (req, res) => {
	UserController
	.emailExists(req.body)
	.then((result) => res.send(result));
});

// Secondary Routes

module.exports = router;