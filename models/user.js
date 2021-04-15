const mongoose = require('mongoose');

function createObject(
	type = String, 
	isRequired = true, 
	name = null, 
	defaultValue = null
) {
	if (isRequired) {
		return {
			type: type,
			required: [true, `${name} is required.`]
		}
	} else {
		return {
			type: type,
			default: defaultValue
		}
	}
}

const userSchema = new mongoose.Schema({
	firstName: createObject(name = 'First name'),
	lastName: createObject(name = 'Last name'),
	name: createObject(name = 'Name'),
	email: createObject(name = 'Email address'),
	password: createObject(name = 'Password'),
	mobileNo: createObject(name = 'Mobile no.'),
	categories: [{
		name: createObject(name = 'Category name'),
		type: createObject(name = 'Category type')
	}],
	transactions: [{
		categoryName: createObject(name = 'Category name'), 
		categoryType: createObject(name = 'Category type'),
		amount: createObject(Number, name = 'Amount'),
		description: createObject(isRequired = false),
		balanceAfterTranscation: createObject(Number, name = 'Balance'),
		date: createObject(Date, false, defaultValue = newDate())
	}]
});

module.exports = mongoose.model('user', userSchema);