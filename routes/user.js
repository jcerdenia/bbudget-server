const express = require('express')
const router = express.Router();
const UserController = require('../controllers/user');
const auth = require('../auth');

router.post('/register', (req, res) => {
	UserController
	.register(req.body)
	.then((result) => res.send(result))
});

router.post('/email-exists', (req, res) => {
	UserController
	.emailExists(req.body)
	.then((result) => res.send(result));
});

router.post('/login', (req, res) => {
	UserController
	.login(req.body)
	.then((result) => res.send(result));
});

// Needs user authentication
router.post('/add-category', auth.verify, (req, res) => {
	req.body.userId = auth.decode(req.headers.authorization).id;
	UserController
	.addCategory(req.body)
	.then((result) => res.send(result));
});

module.exports = router;