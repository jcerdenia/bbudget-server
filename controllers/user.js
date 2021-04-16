const User = require('../models/user');
const bcrypt = require('bcrypt');

// Primary Section

module.exports.register = (params) => {
	let newUser = new User({
		firstName: params.firstName,
		lastName: params.lastName,
		email: params.email,
		mobileNo: params.mobileNo,
		password: bcrypt.hashSync(params.password, 10)
	});

	return newUser
	.save()
	.then((user, error) => (error) ? false : true);
}

module.exports.emailExists = (params) => {
	return User
	.find({ email: params.email })
	.then((result) => result.length > 0 ? true : false);
}