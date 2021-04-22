const jwt = require('jsonwebtoken');
const secret = 'BudgetTrackerApp';

module.exports.createAccessToken = (user) => {
	const payload = { id: user._id, email: user.email }
	return jwt.sign(payload, secret, {});
}

module.exports.verify = (req, res, next) => {
	let token = req.headers.authorization;
	if (typeof token !== "undefined") {
		token = token.slice(7, token.length);
		return jwt.verify(token, secret, (error, data) => {
			return (error) ? res.send(error) : next();
		});
	} else {
		return res.send({ auth: "failed" });
	}
}

module.exports.decode = (token) => {
	if (typeof token !== 'undefined') {
		token = token.slice(7, token.length)
		return jwt.verify(token, secret, (error, data) => {
			if (error) return null;
			return jwt.decode(token, { complete: true }).payload;
		});
	} else {
		return null;
	}
}