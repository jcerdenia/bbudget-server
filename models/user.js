const mongoose = require('mongoose');

function requireObject(name, type = String) {
	return {
		type: String,
		required: [true, `${name} is required.`]
	}
}

function setDefault(type, defaultValue = null) {
	return {
		type: type,
		default: defaultValue
	}
}

const userSchema = new mongoose.Schema({
	firstName: requireObject('First name'),
	lastName: requireObject('Last name'),
	name: requireObject('Name'),
	email: requireObject('Email address'),
	password: requireObject('Password'),
	mobileNo: requireObject('Mobile no.'),
	categories: [{
		name: requireObject('Category name'),
		type: requireObject('Category type')
	}],
	transactions: [{
		categoryName: requireObject('Category name'), 
		type: requireObject('Category type'),
		amount: requireObject('Amount', Number),
		description: setDefault(String),
		balanceAfterTranscation: requireObject('Balance', Number),
		date: setDefault(Date, new Date())
	}]
});

module.exports = mongoose.model('user', userSchema);