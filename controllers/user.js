const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth');
const moment = require('moment');

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

module.exports.registerNew = (params) => {
	return this.emailExists(params)
	.then((emailExists) => (!emailExists) ? this.register(params) : false );
}

module.exports.login = (params) => {
	console.log(`Attempting to log in ${params.email}...`);
	const { email, password } = params;
	
	return User
	.findOne({ email: email })
	.then((user) => {
		if (!user) {
			console.log("No such user.")
			return false;
		}

		console.log(`Got user ${user.firstName} ${user.lastName}.`)
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
				return category.type.toLowerCase() === params.type.toLowerCase();
			})
		}
	});
}

module.exports.getDetails = (params) => {
	console.log("Attempting to retrieve " + params.userId)
	return User
	.findById(params.userId)
	.then((user) => {
		if (user) {
			return {
				email: user.email
			}
		} else {
			return false;
		}
	});
}

module.exports.addRecord = (params) => {
	return User.findById(params.userId)
	.then((user) => {
		let balanceAfterTransaction = 0;
		const transactions = user.transactions;
		
		if (transactions.length !== 0) {
			const balanceBeforeTransaction = transactions[transactions.length - 1].balanceAfterTransaction;
			
			if (params.type.toLowerCase() === 'income') {
				balanceAfterTransaction = balanceBeforeTransaction + params.amount;
			} else {
				balanceAfterTransaction = balanceBeforeTransaction - params.amount;
			}
		} else {
			balanceAfterTransaction = params.amount;
		}

		user.transactions.push({
			categoryName: params.categoryName,
			categoryType: params.categoryType,
			amount: params.amount,
			description: params.description,
			balanceAfterTransaction: balanceAfterTransaction
		});

		return user
		.save()
		.then((user, error) => (error) ? false : true)
	})
}

module.exports.getRecords = (params) => {
	return User
	.findById(params.userId)
	.then((user) => {
		return (user) ? user.transactions : false;
	})
}

module.exports.getRecordsBreakdownByRange = (params) => {
	return User
	.findById(params.userId)
	.then((user) => {
		const summary = user.categories.map((category) => {
			return {
				categoryName: category.name,
				totalAmount: 0
			}
		});

		user.transactions.filter((transaction) => {
			const isSameOrAfter = moment(transaction.dateAdded).isSameOrAfter(params.fromDate, 'day');
			const isSameOrBefore = moment(transaction.dateAdded).isSameOrBefore(params.toDate, 'day');

			if (isSameOrAfter && isSameOrBefore) {
				for (let i = 0; i < summary.length; i++) {
					if (summary[i].categoryName === transaction.categoryName) {
						summary[i].totalAmount += transaction.amount
					}
				}
			}
		})

		return summary
	});
}