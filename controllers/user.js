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
	console.log(`Attempting to log in ${params.email}...`);
	const { email, password } = params;
	
	return User
	.findOne({ email: email })
	.then((user) => {
		console.log(`Got user ${user.firstName} ${user.lastName}.`)
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
			type: params.type
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
		if (typeof params.type === 'undefined') {
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

module.exports.addRecord = (params) => {
	return User.findById(params.userId)
	.then((user) => {
		let balanceAfterTransaction = 0
		if (user.transactions.length !== 0) {
			const balanceBeforeTranasction = user.transactions[user.transactions.length - 1].balanceAfterTransaction
			if (params.type === 'Income') {
				balanceAfterTransaction = balanceBeforeTranasction + params.amount
			} else {
				balanceAfterTransaction = balanceBeforeTranasction - params.amount
			}
		} else {
			balanceAfterTransaction = params.amount
		}

		user.transactions.push({
			categoryName: params.categoryName,
			type: params.type,
			amount: params.amount,
			description: params.description,
			balanceAfterTransaction: params.balanceAfterTransaction
		})

		return user
		.save()
		.then((user, err) => {
			return (err) ? false : true;
		})
	})
}