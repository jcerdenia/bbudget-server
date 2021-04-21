const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth');

/*	Primary Section */

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

module.exports.login = (params) => {
	console.log(params.email);
	const { email, password } = params;
	
	return User
	.findOne({ email })
	.then((user) => {
		if (!user) return false;
		let passwordsMatch = bcrypt.compareSync(password, user.password);
		if (!passwordsMatch) return false;
		return { accessToken: auth.createAccessToken(user) }
	});
}

module.exports.addCategory = (params) => {
	return User
	.findById(params.userId)
	.then((user) => {
		user.categories.push({
			name: params.name,
			type: params.typeName
		});

		return user
		.save()
		.then((user, error) => (error) ? false : true);
	});
}

module.exports.getCategories = (params) => {
	return User
	.findById(params.userId)
	.then((user) => {
		if (typeof params.name === 'undefined') {
			return user.categories;
		} else {
			return user.categories.filter((category) => {
				if (category.type === params.type) {
					return category;
				}
			});
		}
	});
}

module.exports.get = (params) => {
	return User
	.findById(params.userId)
	.then((user) => { email: user.email })
}