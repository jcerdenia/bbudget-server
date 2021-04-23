const express = require('express')
const router = express.Router();
const UserController = require('../controllers/user');
const auth = require('../auth');

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

// emailExists and register in one method
router.post('/register-new', (req, res) => {
	UserController
	.registerNew(req.body)
	.then((result) => res.send(result));
})

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

router.get('/get-categories', auth.verify, (req, res) => {
	req.body.userId = auth.decode(req.headers.authorization).id;
	UserController
	.getCategories(req.body)
	.then((result) => res.send(result));
});

router.get('/details', auth.verify, (req, res) => {
	req.body.userId = auth.decode(req.headers.authorization).id;
	UserController
	.getDetails(req.body)
	.then((result) => res.send(result));
});

router.post('/add-record', auth.verify, (req, res) => {
	req.body.userId = auth.decode(req.headers.authorization).id;
	UserController
	.addRecord(req.body)
	.then((result) => res.send(result));
})

router.get('/get-records', auth.verify, (req, res) => {
	req.body.userId = auth.decode(req.headers.authorization).id;
	UserController
	.getRecords(req.body)
	.then((result) => res.send(result));
})

module.exports = router;