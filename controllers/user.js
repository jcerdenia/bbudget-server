const User = require('../models/user');
const bcrypt = require('bcrypt');

// Primary Sections
module.exports.register = (params) => {
	let newUser = new User({
		firstName: params.firstName,
		lastName: params.lastName,
		email: params.email,
		mobileNo: params.mobileNo,
		password: bcrypt.hashSync(params.password, 10)
	});

	return newUser.save().then((user, error) => {
		return (error) ? false : true
	});
}